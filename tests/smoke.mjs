#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(repoRoot, "plugins/agent-harness/scripts/agent-harness.mjs");
const deterministicEnv = { ...process.env, AGENT_HARNESS_LANG: "en", LANG: "C", LC_ALL: "C", LC_MESSAGES: "C" };

function run(args, options = {}) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env: { ...deterministicEnv, ...(options.env || {}) },
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function fails(args) {
  try { run(args); } catch (error) { return `${error.stdout || ""}${error.stderr || ""}`; }
  throw new Error(`Expected failure: ${args.join(" ")}`);
}

function assert(value, message) { if (!value) throw new Error(message); }
function samePath(actual, expected) {
  return String(actual || "").replaceAll("\\", "/") === String(expected || "").replaceAll("\\", "/");
}
function write(path, content) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, content); }
function json(path) { return JSON.parse(readFileSync(path, "utf8")); }
const manifest = json(join(repoRoot, "plugins/agent-harness/.codex-plugin/plugin.json"));
assert(Array.isArray(manifest.interface.defaultPrompt), "interface.defaultPrompt must be a string array");
assert(manifest.interface.defaultPrompt.length > 0 && manifest.interface.defaultPrompt.every((item) => typeof item === "string"), "defaultPrompt items must be strings");

const marketplace = json(join(repoRoot, ".agents/plugins/marketplace.json"));
assert(marketplace.name === "agent-harness-local", "marketplace must have a unique local identity");
assert(marketplace.plugins.length === 1 && marketplace.plugins[0].name === manifest.name, "marketplace entry must match plugin manifest");
const deployHelper = readFileSync(join(repoRoot, "tools/deploy-local-plugin.mjs"), "utf8");
assert(deployHelper.includes("marketplaceManifest") && deployHelper.includes("different root; refusing"), "deploy helper must derive and strictly validate marketplace name/root metadata");
assert(deployHelper.includes("marketplaceRootFromList"), "deploy helper must compare marketplace roots exactly, not as path substrings");

const suites = readFileSync(join(repoRoot, "scripts/test-suites.mjs"), "utf8");
assert(!suites.includes("npm.cmd"), "test:all must not spawn npm.cmd");
assert(suites.includes("AGENT_HARNESS_LANG: \"en\""), "suite locale must be deterministic");
assert(!existsSync(join(repoRoot, "plugins/agent-harness/templates/codex-agents/harness_explorer.toml")), "explorer template must be removed");
assert(!existsSync(join(repoRoot, "plugins/agent-harness/templates/codex-agents/harness_implementer.toml")), "implementer template must be removed");
const reviewer = readFileSync(join(repoRoot, "plugins/agent-harness/templates/codex-agents/harness_reviewer.toml"), "utf8");
assert(reviewer.includes('sandbox_mode = "read-only"') && !reviewer.includes("model =") && !reviewer.includes("model_reasoning_effort"), "reviewer must be optional read-only and inherit model/effort");
for (const skill of ["intake"]) {
  const policy = readFileSync(join(repoRoot, `plugins/agent-harness/skills/${skill}/agents/openai.yaml`), "utf8");
  assert(policy.includes("allow_implicit_invocation: false"), `${skill} implicit invocation must be disabled`);
}
for (const skill of ["init", "execute"]) {
  const policy = readFileSync(join(repoRoot, `plugins/agent-harness/skills/${skill}/agents/openai.yaml`), "utf8");
  assert(policy.includes("allow_implicit_invocation: true"), `${skill} must retain narrowly described implicit invocation`);
}
const initMetadata = readFileSync(join(repoRoot, "plugins/agent-harness/skills/init/agents/openai.yaml"), "utf8");
assert(initMetadata.includes("Set up, import, or repair") && !initMetadata.includes("audit"), "init implicit metadata must stay limited to setup/import/repair");
const executeMetadata = readFileSync(join(repoRoot, "plugins/agent-harness/skills/execute/agents/openai.yaml"), "utf8");
assert(executeMetadata.includes("long-running controller work") && executeMetadata.includes("existing durable Harness state") && executeMetadata.includes("bounded postflight sync") && executeMetadata.includes("ordinary clear work use the current host directly"), "execute metadata must route accepted delivery and bounded postflight work");
const hostBridge = readFileSync(join(repoRoot, "plugins/agent-harness/references/host-execution.md"), "utf8");
for (const marker of ["host-direct", "host-direct-postflight", "durable-harness"]) {
  assert(hostBridge.includes(marker), `Host execution bridge must include ${marker}`);
}

const temp = mkdtempSync(join(tmpdir(), "agent-harness-smoke-"));
const outside = mkdtempSync(join(tmpdir(), "agent-harness-outside-"));
try {
  run(["init", "--cwd", temp, "--contract", "adapter"]);
  const inspect = JSON.parse(run(["config", "inspect", "--cwd", temp, "--json"]));
  assert(!("runs" in inspect.paths), "adapter delivery paths must omit Run storage");
  assert(inspect.paths.ideaInbox === "harness/intake.md", "adapter init must configure an idea inbox");
  assert(existsSync(join(temp, "harness/intake.md")), "adapter init must create the configured idea inbox");
  const configPath = join(temp, ".harness/config.json");
  const canonicalConfig = json(configPath);
  const validation = JSON.parse(run(["config", "validate", "--cwd", temp, "--json"]));
  assert(validation.ok, "canonical adapter config must validate");
  const intakePreview = JSON.parse(run(["intake", "idea", "--cwd", temp, "--idea", "Add import audit", "--json"]));
  assert(intakePreview.writesFiles === false, "intake preview must be read-only");
  assert(intakePreview.record.target === "idea-inbox" && intakePreview.record.path === "harness/intake.md", "adapter intake must select the configured idea inbox");
  assert(intakePreview.record.supported, "the generated idea inbox must be recordable");
  const taskIndexBeforeIntake = readFileSync(join(temp, "harness/tasks.md"), "utf8");
  const intakeRecord = JSON.parse(run(["intake", "idea", "--cwd", temp, "--idea", "Add import audit", "--record", "--json"]));
  assert(intakeRecord.writesFiles && intakeRecord.record.written, "explicit intake record must write the idea inbox");
  assert(readFileSync(join(temp, "harness/intake.md"), "utf8").includes("Add import audit"), "recorded intake must preserve the raw idea in the inbox");
  assert(readFileSync(join(temp, "harness/tasks.md"), "utf8") === taskIndexBeforeIntake, "idea inbox recording must leave the Goal index unchanged");

  const tableFallbackConfig = structuredClone(canonicalConfig);
  delete tableFallbackConfig.paths.ideaInbox;
  writeFileSync(configPath, `${JSON.stringify(tableFallbackConfig, null, 2)}\n`);
  assert(/table-based task index/.test(fails(["intake", "idea", "--cwd", temp, "--idea", "Add table fallback", "--record", "--json"])), "table Goal indexes must still refuse automatic writes without an idea inbox");
  writeFileSync(configPath, `${JSON.stringify(canonicalConfig, null, 2)}\n`);
  write(join(temp, "harness/intake.md"), "# Intake Inbox\n\n## Now\n\n## Next\n\n## Later\n");
  const maintenance = JSON.parse(run(["maintain", "tasks", "--cwd", temp, "--json"]));
  assert(maintenance.writesFiles === false, "maintenance preview must be read-only");
  assert(!("git" in maintenance), "maintenance must derive state from Harness artifacts without a Git snapshot");
  const maintenanceText = run(["maintain", "tasks", "--cwd", temp]);
  assert(maintenanceText.includes("host owns execution history") && !maintenanceText.includes("Git:"), "maintenance must leave execution history to the host");
  const maintenanceRecordText = run(["maintain", "tasks", "--cwd", temp, "--record"]);
  assert(maintenanceRecordText.includes("harness/status.md"), "recorded maintenance must update the bounded status");
  const orientation = JSON.parse(run(["orient", "next", "--cwd", temp, "--json"]));
  assert(orientation.contract === "adapter", "orientation must preserve adapter contract state");
  const activation = run(["activation", "snippet", "--cwd", temp]);
  assert(activation.includes("Agent Harness"), "activation preview must remain available and read-only");
  const worktree = JSON.parse(run(["worktree", "recommend", "--cwd", temp, "--json"]));
  assert(["local", "worktree", "ask"].includes(worktree.recommendation), "worktree recommendation must return a canonical policy");
  assert(!("git" in worktree), "worktree recommendation must follow configured policy without checkout-state telemetry");
  const skillPreview = JSON.parse(run(["skills", "install", "--cwd", temp, "--dry-run", "--json"]));
  assert(skillPreview.ok && skillPreview.target === ".agents/skills/", "skills install preview must target .agents/skills/");
  assert(skillPreview.writes.some((item) => item.path === ".agents/skills/execute" && item.action === "would-copy"), "skills install must plan the four public skills");
  run(["skills", "install", "--cwd", temp]);
  assert(existsSync(join(temp, ".agents/skills/execute/SKILL.md")), "skills install must copy execute into .agents/skills");
  assert(existsSync(join(temp, ".agents/references/host-execution.md")), "skills install must copy protocol references beside skills");
  const configBeforeUninstall = readFileSync(join(temp, ".harness/config.json"), "utf8");
  const tasksBeforeUninstall = readFileSync(join(temp, "harness/tasks.md"), "utf8");
  const intakeBeforeUninstall = readFileSync(join(temp, "harness/intake.md"), "utf8");
  write(join(temp, ".agents/skills/custom/SKILL.md"), "---\nname: custom\ndescription: local helper\n---\n\n# Custom\n");
  write(join(temp, ".agents/skills/orient/SKILL.md"), "---\nname: orient\ndescription: local notes\n---\n\n# Other Orient\n");
  write(join(temp, ".agents/references/user-note.md"), "keep me\n");
  write(join(temp, ".agents/references/host-capabilities.md"), "local reference notes\n");
  const uninstallPreview = JSON.parse(run(["skills", "uninstall", "--cwd", temp, "--dry-run", "--json"]));
  assert(uninstallPreview.ok && uninstallPreview.preservesProjectData === true, "skills uninstall preview must preserve project data");
  assert(uninstallPreview.untouched.includes("harness/") && uninstallPreview.untouched.includes(".harness/"), "skills uninstall must declare project data roots untouched");
  assert(uninstallPreview.removals.some((item) => item.path === ".agents/skills/execute" && item.action === "would-remove"), "skills uninstall must plan removal of installed Harness skills");
  assert(uninstallPreview.removals.some((item) => item.path === ".agents/skills/orient" && item.action === "skip-foreign"), "skills uninstall must keep a same-named foreign skill");
  assert(uninstallPreview.removals.some((item) => item.path === ".agents/references/host-execution.md" && item.action === "would-remove"), "skills uninstall must plan removal of byte-identical references");
  assert(uninstallPreview.removals.some((item) => item.path === ".agents/references/host-capabilities.md" && item.action === "skip-preserved"), "skills uninstall must keep a changed reference");
  assert(uninstallPreview.removals.every((item) => !item.path.startsWith("harness/") && !item.path.startsWith(".harness/")), "skills uninstall plan must not name project data");
  assert(existsSync(join(temp, ".agents/skills/execute/SKILL.md")), "skills uninstall preview must not delete skills");
  run(["skills", "uninstall", "--cwd", temp]);
  assert(!existsSync(join(temp, ".agents/skills/execute")), "skills uninstall must remove the installed execute skill");
  assert(!existsSync(join(temp, ".agents/skills/intake")), "skills uninstall must remove the installed intake skill");
  assert(!existsSync(join(temp, ".agents/skills/init")), "skills uninstall must remove the installed init skill");
  assert(existsSync(join(temp, ".agents/skills/orient/SKILL.md")), "skills uninstall must leave a foreign orient skill");
  assert(existsSync(join(temp, ".agents/skills/custom/SKILL.md")), "skills uninstall must leave unrelated skills");
  assert(!existsSync(join(temp, ".agents/references/host-execution.md")), "skills uninstall must remove byte-identical protocol references");
  assert(readFileSync(join(temp, ".agents/references/host-capabilities.md"), "utf8") === "local reference notes\n", "skills uninstall must leave changed references");
  assert(readFileSync(join(temp, ".agents/references/user-note.md"), "utf8") === "keep me\n", "skills uninstall must leave extra reference files");
  assert(readFileSync(join(temp, ".harness/config.json"), "utf8") === configBeforeUninstall, "skills uninstall must leave config data");
  assert(readFileSync(join(temp, "harness/tasks.md"), "utf8") === tasksBeforeUninstall, "skills uninstall must leave the Goal index");
  assert(readFileSync(join(temp, "harness/intake.md"), "utf8") === intakeBeforeUninstall, "skills uninstall must leave intake data");
  const uninstallAgain = JSON.parse(run(["skills", "uninstall", "--cwd", temp, "--json"]));
  assert(uninstallAgain.ok && uninstallAgain.removals.every((item) => item.action !== "would-remove" || item.path === ".agents/skills/execute" || item.path === ".agents/skills/intake" || item.path === ".agents/skills/init"), "repeated skills uninstall must not plan removal of preserved files");
  assert(uninstallAgain.removals.filter((item) => item.action === "would-remove").every((item) => !existsSync(join(temp, item.path))), "repeated skills uninstall preview must not target files that are still present");
  assert(existsSync(join(temp, ".agents/skills/custom/SKILL.md")), "repeated skills uninstall must still leave unrelated skills");
  assert(readFileSync(join(temp, ".harness/config.json"), "utf8") === configBeforeUninstall, "repeated skills uninstall must leave config data");

  assert(canonicalConfig.worktree?.defaultPolicy === "ask" && !canonicalConfig.workMode, "canonical config must write worktree, not legacy workMode");
  assert(canonicalConfig.artifactPolicy?.tasks && !canonicalConfig.artifactPolicy?.retention && !canonicalConfig.checkpoint, "canonical config must bound delivery state without Run retention or checkpoints");
  assert(!canonicalConfig.loops && !canonicalConfig.lifecycle && !canonicalConfig.gates?.enabled && !canonicalConfig.gates?.optional, "removed config fields must not be emitted");

  const noArtifactPolicy = structuredClone(canonicalConfig);
  delete noArtifactPolicy.artifactPolicy;
  writeFileSync(configPath, `${JSON.stringify(noArtifactPolicy, null, 2)}\n`);
  const inspection = JSON.parse(run(["artifacts", "inspect", "--cwd", temp, "--json"]));
  assert(inspection.ok && inspection.writes.length === 0 && !("runs" in inspection), "artifact inspection must inspect bounded delivery state without Run telemetry");
  writeFileSync(configPath, `${JSON.stringify(canonicalConfig, null, 2)}\n`);

  for (const bad of ["../escape", resolve(outside, "absolute")]) {
    const payload = structuredClone(canonicalConfig);
    payload.paths.status = bad;
    writeFileSync(configPath, `${JSON.stringify(payload, null, 2)}\n`);
    const error = fails(["init", "--cwd", temp, "--contract", "adapter", "--force"]);
    assert(/relative|inside|path|\.\./i.test(error), `unsafe configured path must fail: ${bad}`);
    assert(!existsSync(join(outside, "absolute")), "absolute-path rejection must produce zero external writes");
  }

  const unsafeInbox = structuredClone(canonicalConfig);
  unsafeInbox.paths.ideaInbox = "../escape-inbox";
  writeFileSync(configPath, `${JSON.stringify(unsafeInbox, null, 2)}\n`);
  assert(/relative|inside|path|\.\./i.test(fails(["config", "validate", "--cwd", temp, "--json"])), "unsafe idea inbox path must fail validation");
  writeFileSync(configPath, `${JSON.stringify(canonicalConfig, null, 2)}\n`);

  const conflict = structuredClone(canonicalConfig);
  conflict.workMode = { defaultPolicy: "local" };
  conflict.worktree = { defaultPolicy: "worktree" };
  writeFileSync(configPath, `${JSON.stringify(conflict, null, 2)}\n`);
  assert(/Conflicting config aliases/.test(fails(["worktree", "recommend", "--cwd", temp, "--json"])), "conflicting legacy aliases must fail");
  const gateConflict = structuredClone(canonicalConfig);
  gateConflict.gates.enabled = ["legacy-only"];
  writeFileSync(configPath, `${JSON.stringify(gateConflict, null, 2)}\n`);
  assert(/gates\.requiredForCompletion.*gates\.enabled/.test(fails(["config", "validate", "--cwd", temp, "--json"])), "conflicting gate aliases must fail validation");
  writeFileSync(configPath, `${JSON.stringify(canonicalConfig, null, 2)}\n`);

  const legacy = mkdtempSync(join(tmpdir(), "agent-harness-import-"));
  try {
    write(join(legacy, "harness/README.md"), "# Adapter\n");
    write(join(legacy, "todolist.md"), "# Goals\n\n## Now\n");
    const importPreview = JSON.parse(run(["config", "import", "--cwd", legacy, "--task-index", "todolist.md", "--dry-run", "--json"]));
    assert(importPreview.paths.taskIndex === "todolist.md" && !existsSync(join(legacy, ".harness/config.json")), "config import dry-run must preserve an existing Goal index without writes");
    run(["config", "import", "--cwd", legacy, "--task-index", "todolist.md", "--json"]);
    const importedConfig = json(join(legacy, ".harness/config.json"));
    assert(importedConfig.paths.taskIndex === "todolist.md" && importedConfig.paths.ideaInbox === "harness/intake.md", "config import must write canonical adapter paths including the idea inbox");
    assert(existsSync(join(legacy, "harness/intake.md")), "config import must create the configured idea inbox");
  } finally { rmSync(legacy, { recursive: true, force: true }); }

  const fixedOptions = mkdtempSync(join(tmpdir(), "agent-harness-fixed-options-"));
  try {
    run(["init", "--cwd", fixedOptions, "--contract", "fixed", "--task-index", "docs/tasks.md", "--idea-inbox", "docs/intake.md"]);
    const fixedOptionsConfig = JSON.parse(run(["config", "inspect", "--cwd", fixedOptions, "--json"]));
    assert(fixedOptionsConfig.paths.taskIndex === "docs/tasks.md" && fixedOptionsConfig.paths.ideaInbox === "docs/intake.md", "fixed init must persist task-index and idea-inbox overrides");
    assert(existsSync(join(fixedOptions, "docs/tasks.md")) && existsSync(join(fixedOptions, "docs/intake.md")), "fixed init must create overridden task and inbox files");
  } finally { rmSync(fixedOptions, { recursive: true, force: true }); }

  const invalidExisting = mkdtempSync(join(tmpdir(), "agent-harness-invalid-config-"));
  try {
    write(join(invalidExisting, ".harness/config.json"), `${JSON.stringify({
      contract: "fixed",
      projectName: 42,
      paths: {
        tasks: "harness/tasks.md",
        status: "harness/status.md",
        goals: "harness/goals",
        runs: ".harness/runs"
      }
    }, null, 2)}\n`);
    assert(/Harness config is invalid|projectName.*string/i.test(fails(["init", "--cwd", invalidExisting, "--contract", "fixed", "--force"])), "init must fully validate an existing config before writes");
    assert(!existsSync(join(invalidExisting, "harness/tasks.md")) && !existsSync(join(invalidExisting, "harness/status.md")), "invalid existing config must produce zero init writes");
  } finally { rmSync(invalidExisting, { recursive: true, force: true }); }

  const artifactProject = mkdtempSync(join(tmpdir(), "agent-harness-artifacts-"));
  try {
    run(["init", "--cwd", artifactProject, "--contract", "fixed"]);
    const artifactConfigPath = join(artifactProject, ".harness/config.json");
    const artifactConfig = json(artifactConfigPath);
    artifactConfig.artifactPolicy = {
      durableEvidence: ["harness/status.md", "harness/goals"],
      status: { maxLines: 20 },
      tasks: { archive: "harness/tasks-archive.md", keepDone: 1 }
    };
    writeFileSync(artifactConfigPath, `${JSON.stringify(artifactConfig, null, 2)}\n`);
    write(join(artifactProject, "harness/tasks.md"), "# Tasks\n\n## Now\n\n- [ ] Active task\n\n- [x] Older done\n  - Status: done\n\n## Done\n\n- [x] Recent done\n  - Status: done\n");
    write(join(artifactProject, "harness/status.md"), `# Status\n\n${Array.from({ length: 25 }, (_, index) => `line ${index}`).join("\n")}\n`);
    const inspection = JSON.parse(run(["artifacts", "inspect", "--cwd", artifactProject, "--json"]));
    assert(inspection.ok === false && inspection.statusLines > inspection.maxStatusLines && inspection.writes.length === 0, "artifact inspection must report bounded-status overflow without writes");
    const tasksBefore = readFileSync(join(artifactProject, "harness/tasks.md"), "utf8");
    const compactPreview = JSON.parse(run(["artifacts", "compact", "--cwd", artifactProject, "--json"]));
    assert(compactPreview.candidates.length === 1 && !existsSync(join(artifactProject, "harness/tasks-archive.md")), "compact preview must retain the configured recent Done window without writes");
    assert(readFileSync(join(artifactProject, "harness/tasks.md"), "utf8") === tasksBefore, "compact preview must not rewrite the task index");
    const compactRecord = JSON.parse(run(["artifacts", "compact", "--cwd", artifactProject, "--record", "--json"]));
    assert(compactRecord.candidates.length === 1 && compactRecord.writes.includes("harness/tasks-archive.md") && compactRecord.writes.includes("harness/tasks.md"), "compact record must archive before replacing the active index");
    assert(readFileSync(join(artifactProject, "harness/tasks-archive.md"), "utf8").includes("Older done"), "task archive must retain the exact displaced record");
    assert(!readFileSync(join(artifactProject, "harness/tasks.md"), "utf8").includes("Older done"), "active task index must drop archived records");
  } finally { rmSync(artifactProject, { recursive: true, force: true }); }

} finally {
}

const runProject = mkdtempSync(join(tmpdir(), "agent-harness-run-"));
const specContainmentProject = mkdtempSync(join(tmpdir(), "agent-harness-spec-containment-"));
try {
  run(["init", "--cwd", runProject, "--contract", "fixed"]);
  write(join(runProject, "harness/tasks.md"), "# Tasks\n\n## Now\n\n- [ ] Smoke durable run\n");
  run(["intake", "idea", "--cwd", runProject, "--idea", "Add fixed intake", "--record", "--json"]);
  assert(readFileSync(join(runProject, "harness/tasks.md"), "utf8").includes("Add fixed intake"), "explicit intake record must update a supported configured Goal index");
  run(["goal", "create", "--cwd", runProject, "--task", "Smoke durable run", "--allow-no-spec", "--work-mode", "local"]);
  const goalName = readdirSync(join(runProject, "harness/goals")).find((name) => name.endsWith(".md"));
  const goalRel = `harness/goals/${goalName}`;
  const generatedGoalPath = join(runProject, goalRel);
  const generatedGoal = readFileSync(generatedGoalPath, "utf8");
  assert(generatedGoal.includes("## Host Execution"), "generated durable Goals must bind to host execution");
  assert(!generatedGoal.includes("## Codex-Native Execution"), "generated durable Goals must not write Codex-Native Execution");
  assert(generatedGoal.includes("These gates apply only to Goal completion"), "generated Goal gates must declare durable-only scope");
  assert(generatedGoal.includes("## State Sync Notes") && generatedGoal.includes("Accepted-state records: `TBD`"), "generated Goals must include an explicit State Sync Notes contract");
  writeFileSync(generatedGoalPath, generatedGoal.replace(/## State Sync Notes[\s\S]*?## Spec Acceptance Checklist/, "## Spec Acceptance Checklist"));
  assert(/State Sync Notes|required section/i.test(fails(["goal", "validate", "--cwd", runProject, "--goal", goalRel, "--json"])), "goal validation must require the State Sync Notes section");
  writeFileSync(generatedGoalPath, generatedGoal);
  assert(!generatedGoal.includes("## Delivery State"), "generated Goals must use accepted state and evidence without a Delivery State section");
  const legacyGoal = generatedGoal.replace("## Execution orchestration", `## Delivery State

- Delivery intent: \`legacy\`
- Target delivery state: \`pushed\`
- Push authorized: \`yes\`

## Execution orchestration`);
  writeFileSync(generatedGoalPath, legacyGoal);
  const legacyGoalValidation = JSON.parse(run(["goal", "validate", "--cwd", runProject, "--goal", goalRel, "--json"]));
  assert(legacyGoalValidation.ok && !("deliveryPolicy" in legacyGoalValidation.goal), "legacy Goal delivery sections must remain readable but stay outside current validation output");
  writeFileSync(generatedGoalPath, legacyGoal.replace(
    /## Scope\r?\n[\s\S]*?\r?\n## Non-Goals/,
    "## Scope\n\n- Implement the accepted behavior.\n- Preserve compatibility.\n- Add regression coverage.\n- Update durable evidence.\n\n## Non-Goals"
  ));
  assert(/retired|host owns session/i.test(fails(["run", "prepare", "--cwd", runProject, "--goal", goalRel])), "Run preparation must stay retired");
  assert(!existsSync(join(runProject, ".harness/runs")), "Goal creation must not create Runs");
  assert(/inside|Goal path/i.test(fails(["goal", "validate", "--cwd", runProject, "--goal", join(outside, "goal.md"), "--json"])), "external Goals must fail");
  assert(/inside|Goal path|relative path/i.test(fails(["goal", "complete", "--cwd", runProject, "--goal", "../outside", "--verification", "test: passed"])), "Goal completion must reject traversal");

  run(["init", "--cwd", specContainmentProject, "--contract", "adapter"]);
  write(join(specContainmentProject, "harness/tasks.md"), "# Goals\n\n## Now\n\n- [ ] Spec containment guard\n- [ ] No spec goal\n");
  write(join(specContainmentProject, "harness/specs/accepted.md"), "# Spec: Guard\n\nStatus: accepted\n");
  run(["goal", "create", "--cwd", specContainmentProject, "--task", "Spec containment guard", "--spec", "harness/specs/accepted.md", "--work-mode", "local"]);
  run(["goal", "create", "--cwd", specContainmentProject, "--task", "No spec goal", "--allow-no-spec", "--work-mode", "local"]);
  const specGoalName = readdirSync(join(specContainmentProject, "harness/goals")).find(name => name.includes("spec-containment") && name.endsWith(".md"));
  const noSpecGoalName = readdirSync(join(specContainmentProject, "harness/goals")).find(name => name.includes("no-spec") && name.endsWith(".md"));
  const specGoalRel = "harness/goals/" + specGoalName;
  const noSpecGoalRel = "harness/goals/" + noSpecGoalName;
  assert(JSON.parse(run(["goal", "validate", "--cwd", specContainmentProject, "--goal", noSpecGoalRel, "--json"])).ok, "allow-no-spec Goal must validate without a Run");
  const specGoalPath = join(specContainmentProject, specGoalRel);
  writeFileSync(specGoalPath, readFileSync(specGoalPath, "utf8").replace(/^Spec:\s+.*$/m, "Spec: other/spec.md"));
  assert(/Spec.*inside|Spec path/i.test(fails(["goal", "validate", "--cwd", specContainmentProject, "--goal", specGoalRel, "--json"])), "Spec outside its configured root must fail");
  writeFileSync(generatedGoalPath, readFileSync(generatedGoalPath, "utf8").replace(/^Status: .*$/m, "Status: unknown."));
  assert(/Status must use/i.test(fails(["goal", "validate", "--cwd", runProject, "--goal", goalRel, "--json"])), "unknown Goal status must fail");

  const zhDoctor = run(["doctor", "--cwd", runProject, "--lang", "zh-CN"], { env: { LANG: "zh_CN.UTF-8", LC_ALL: "zh_CN.UTF-8" } });
  assert(zhDoctor.includes("项目") || zhDoctor.includes("状态"), "zh-CN smoke must exercise localized display");
  assert(!/git status|git root/i.test(zhDoctor), "doctor must report Harness health without checkout-state telemetry");
  JSON.parse(run(["config", "inspect", "--cwd", runProject, "--json"], { env: { LANG: "zh_CN.UTF-8", LC_ALL: "zh_CN.UTF-8" } }));

  {
    const symlinkProject = mkdtempSync(join(tmpdir(), "agent-harness-link-"));
    try {
      mkdirSync(join(symlinkProject, ".harness"), { recursive: true });
      symlinkSync(outside, join(symlinkProject, "escape"), process.platform === "win32" ? "junction" : "dir");
      write(join(symlinkProject, ".harness/config.json"), `${JSON.stringify({ contract: "fixed", paths: { tasks: "harness/tasks.md", status: "escape/status.md", goals: "harness/goals", runs: ".harness/runs" } }, null, 2)}\n`);
      assert(/symlink|outside|escape/i.test(fails(["init", "--cwd", symlinkProject, "--contract", "fixed"])), "existing-parent symlink escape must fail");
      assert(!existsSync(join(outside, "status.md")), "symlink rejection must produce zero external writes");
      const danglingTarget = join(outside, "dangling-target");
      mkdirSync(danglingTarget, { recursive: true });
      symlinkSync(danglingTarget, join(symlinkProject, "dangling"), process.platform === "win32" ? "junction" : "dir");
      rmSync(danglingTarget, { recursive: true, force: true });
      write(join(symlinkProject, ".harness/config.json"), `${JSON.stringify({ contract: "fixed", paths: { tasks: "harness/tasks.md", status: "dangling/status.md", goals: "harness/goals", runs: ".harness/runs" } }, null, 2)}\n`);
      assert(/symlink|unresolved|outside/i.test(fails(["init", "--cwd", symlinkProject, "--contract", "fixed"])), "dangling symlink paths must fail containment before writes");
      write(join(outside, "tasks.md"), "# External task content\n\n## Now\n\n- [ ] Must not leak\n");
      write(join(symlinkProject, "harness/status.md"), "# Status\n");
      write(join(symlinkProject, "harness/goals/.keep"), "");
      write(join(symlinkProject, ".harness/config.json"), `${JSON.stringify({ contract: "fixed", paths: { tasks: "escape/tasks.md", status: "harness/status.md", goals: "harness/goals", runs: ".harness/runs" } }, null, 2)}\n`);
      const symlinkConfigValidation = JSON.parse(run(["config", "validate", "--cwd", symlinkProject, "--json"]));
      assert(symlinkConfigValidation.ok, "schema-only config validation should remain independent from filesystem containment");
      assert(/symlink|outside|escapes|inside/i.test(fails(["orient", "next", "--cwd", symlinkProject, "--json"])), "orientation must reject configured read paths that resolve through an existing symlink");
      assert(/symlink|outside|escapes|inside/i.test(fails(["maintain", "tasks", "--cwd", symlinkProject, "--json"])), "maintenance must reject configured read paths that resolve through an existing symlink");
    } finally { rmSync(symlinkProject, { recursive: true, force: true }); }
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
  rmSync(runProject, { recursive: true, force: true });
  rmSync(specContainmentProject, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
}

console.log("Smoke checks passed.");
