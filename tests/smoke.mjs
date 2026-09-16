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
function markManagedRun(project, runRel, goalPath) {
  const statusPath = join(project, runRel, "status.json");
  const status = json(statusPath);
  status.runDir = runRel;
  status.manifest = "manifest.json";
  status.manifestVersion = 1;
  writeFileSync(statusPath, JSON.stringify(status, null, 2) + "\n");
  write(join(project, runRel, "manifest.json"), JSON.stringify({
    manifestVersion: 1,
    runDir: runRel,
    goalPath,
    goalContractHash: "fixture-goal-contract",
    dag: { sha256: "fixture-dag", projection: {} }
  }, null, 2) + "\n");
}

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
assert(executeMetadata.includes("long-running controller work") && executeMetadata.includes("existing durable Harness state") && executeMetadata.includes("bounded postflight sync") && executeMetadata.includes("ordinary clear work use the current host directly"), "execute implicit metadata must cover controller, durable, and tracked postflight work only");
const hostBridge = readFileSync(join(repoRoot, "plugins/agent-harness/references/host-execution.md"), "utf8");
for (const marker of ["host-direct", "host-direct-postflight", "durable-harness"]) {
  assert(hostBridge.includes(marker), `Host execution bridge must include ${marker}`);
}

const temp = mkdtempSync(join(tmpdir(), "agent-harness-smoke-"));
const outside = mkdtempSync(join(tmpdir(), "agent-harness-outside-"));
try {
  run(["init", "--cwd", temp, "--contract", "adapter"]);
  const inspect = JSON.parse(run(["config", "inspect", "--cwd", temp, "--json"]));
  assert(inspect.paths.runs === ".harness/runs", "adapter paths must resolve canonically");
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
  assert(maintenanceText.includes("Harness state:") && !maintenanceText.includes("Git:"), "text maintenance must render without a Git payload");
  const maintenanceRecordText = run(["maintain", "tasks", "--cwd", temp, "--record"]);
  assert(maintenanceRecordText.includes("Record:") && maintenanceRecordText.includes("statusWritten=yes"), "recorded text maintenance must complete after writing the bounded snapshot");
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

  assert(canonicalConfig.worktree?.defaultPolicy === "ask" && !canonicalConfig.workMode, "canonical config must write worktree, not legacy workMode");
  assert(canonicalConfig.artifactPolicy?.retention && canonicalConfig.artifactPolicy?.tasks, "canonical config must declare bounded artifact lifecycle defaults");
  assert(!canonicalConfig.loops && !canonicalConfig.lifecycle && !canonicalConfig.gates?.enabled && !canonicalConfig.gates?.optional, "removed config fields must not be emitted");

  const noArtifactPolicy = structuredClone(canonicalConfig);
  delete noArtifactPolicy.artifactPolicy;
  writeFileSync(configPath, `${JSON.stringify(noArtifactPolicy, null, 2)}\n`);
  const legacyArtifactInspection = JSON.parse(run(["artifacts", "inspect", "--cwd", temp, "--json"]));
  assert(legacyArtifactInspection.policy.source === "default" && legacyArtifactInspection.policy.runs === "tracked" && legacyArtifactInspection.writesFiles === false, "projects without artifactPolicy must retain read-only tracked-compatible defaults");
  const invalidArtifactPolicy = structuredClone(canonicalConfig);
  invalidArtifactPolicy.artifactPolicy.retention.completedDays = -1;
  writeFileSync(configPath, `${JSON.stringify(invalidArtifactPolicy, null, 2)}\n`);
  assert(/completedDays|minimum|invalid/i.test(fails(["config", "validate", "--cwd", temp, "--json"])), "artifact retention schema must reject negative days");
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
      runs: "local-only",
      durableEvidence: ["harness/status.md", "harness/goals"],
      retention: { completedDays: 0, blockedDays: 0, keepLatest: 0 },
      status: { maxLines: 20 },
      tasks: { archive: "harness/tasks-archive.md", keepDone: 1 }
    };
    writeFileSync(artifactConfigPath, `${JSON.stringify(artifactConfig, null, 2)}\n`);
    write(join(artifactProject, "harness/tasks.md"), "# Tasks\n\n## Now\n\n- [ ] Active task\n\n- [x] Older done\n  - Status: done\n\n## Done\n\n- [x] Recent done\n  - Status: done\n");
    write(join(artifactProject, "harness/status.md"), `# Status\n\n${Array.from({ length: 25 }, (_, index) => `line ${index}`).join("\n")}\n`);
    const completedRun = ".harness/runs/20260101-000000-completed";
    const activeRun = ".harness/runs/20260102-000000-active";
    const unsafeRun = ".harness/runs/20260103-000000-missing-durable-sync";
    const escapedGoalRun = ".harness/runs/20260104-000000-goal-outside-root";
    const legacyBlockedRun = ".harness/runs/20260105-000000-legacy-blocked";
    const missingStatusRun = ".harness/runs/20260106-000000-missing-status";
    const legacyRunFile = ".harness/runs/legacy-run.md";
    write(join(artifactProject, completedRun, "status.json"), `${JSON.stringify({ phase: "completed", goalPath: "harness/goals/completed.md", updatedAt: "2026-01-01T00:00:00.000Z" }, null, 2)}\n`);
    write(join(artifactProject, completedRun, "proof.txt"), "proof\n");
    write(join(artifactProject, activeRun, "status.json"), `${JSON.stringify({ phase: "running", goalPath: "harness/goals/active.md", updatedAt: "2026-01-02T00:00:00.000Z" }, null, 2)}\n`);
    write(join(artifactProject, unsafeRun, "status.json"), `${JSON.stringify({ phase: "completed", goalPath: "harness/goals/unsafe.md", updatedAt: "2026-01-03T00:00:00.000Z" }, null, 2)}\n`);
    write(join(artifactProject, escapedGoalRun, "status.json"), `${JSON.stringify({ phase: "completed", goalPath: "harness/status.md", updatedAt: "2026-01-04T00:00:00.000Z" }, null, 2)}\n`);
    write(join(artifactProject, legacyBlockedRun, "status.json"), `${JSON.stringify({ status: "blocked", updatedAt: "2026-01-05T00:00:00.000Z" }, null, 2)}\n`);
    write(join(artifactProject, missingStatusRun, "proof.txt"), "legacy proof\n");
    write(join(artifactProject, legacyRunFile), "# Legacy Run\n");
    write(join(artifactProject, "harness/goals/unsafe.md"), `# Unsafe\n\nRun: \`${unsafeRun}\`\n`);
    write(join(artifactProject, "harness/goals/completed.md"), `# Completed\n\nRun: \`${completedRun}\`\n\n## State Sync Notes\n\n- Durable conclusion retained.\n`);
    markManagedRun(artifactProject, completedRun, "harness/goals/completed.md");
    markManagedRun(artifactProject, unsafeRun, "harness/goals/unsafe.md");
    markManagedRun(artifactProject, escapedGoalRun, "harness/status.md");
    const inspection = JSON.parse(run(["artifacts", "inspect", "--cwd", artifactProject, "--json"]));
    assert(inspection.writesFiles === false && inspection.status.overLimit, "artifact inspection must be read-only and report bounded-status overflow");
    assert(inspection.runs.active === 1 && inspection.runs.terminal === 4 && inspection.runs.unmanaged === 2, "artifact inspection must separate operational active, terminal, and unmanaged Runs");
    assert(inspection.runs.active + inspection.runs.terminal + inspection.runs.unmanaged === inspection.runs.entries, "Run lifecycle classifications must cover every inspected entry exactly once");
    assert(inspection.runs.items.find((item) => samePath(item.runDir, legacyBlockedRun))?.classification === "terminal", "legacy status fields must preserve a known terminal Run state");
    assert(inspection.runs.items.find((item) => samePath(item.runDir, missingStatusRun))?.classification === "unmanaged", "missing-status directories must not inflate operational active counts");
    assert(inspection.runs.items.find((item) => samePath(item.runDir, legacyRunFile))?.classification === "unmanaged", "legacy Run files must not inflate operational active counts");
    assert(inspection.tasks.issues.some((issue) => issue.kind === "terminal-task-in-active-section"), "artifact inspection must report terminal tasks in active sections");
    assert(inspection.references.files.some((file) => samePath(file, "harness/goals/completed.md")), "artifact inspection must scan configured durable evidence roots for Run references");
    const tasksBefore = readFileSync(join(artifactProject, "harness/tasks.md"), "utf8");
    const compactPreview = JSON.parse(run(["artifacts", "compact", "--cwd", artifactProject, "--json"]));
    assert(compactPreview.compact.candidates.length === 1 && !existsSync(join(artifactProject, "harness/tasks-archive.md")), "compact preview must be read-only and retain the configured recent Done window");
    assert(readFileSync(join(artifactProject, "harness/tasks.md"), "utf8") === tasksBefore, "compact preview must not rewrite the task index");
    const compactRecord = JSON.parse(run(["artifacts", "compact", "--cwd", artifactProject, "--record", "--json"]));
    assert(compactRecord.compact.archived === 1 && compactRecord.compact.archiveWritten && compactRecord.compact.taskIndexWritten, "compact record must archive before replacing the active index");
    assert(readFileSync(join(artifactProject, "harness/tasks-archive.md"), "utf8").includes("Older done"), "task archive must retain the exact displaced record");
    assert(!readFileSync(join(artifactProject, "harness/tasks.md"), "utf8").includes("Older done"), "active task index must drop archived records");
    const prefixRun = ".harness/runs/20260107-000000-completed-a";
    write(join(artifactProject, prefixRun, "status.json"), `${JSON.stringify({ phase: "completed", goalPath: "harness/goals/prefix.md", updatedAt: "2026-01-07T00:00:00.000Z" }, null, 2)}\n`);
    write(join(artifactProject, "harness/goals/prefix.md"), "# Prefix\n\nRun: `.harness/runs/20260107-000000-completed-ab`\n\n## State Sync Notes\n\n- Evidence: retained for review.\n");
    markManagedRun(artifactProject, prefixRun, "harness/goals/prefix.md");
    const prunePreview = JSON.parse(run(["artifacts", "prune", "--cwd", artifactProject, "--json"]));
    assert(prunePreview.prune.mode === "preview" && prunePreview.prune.candidates.some((item) => samePath(item.runDir, completedRun)), "prune preview must identify evidence-safe terminal Runs");
    assert(prunePreview.prune.retained.some((item) => samePath(item.runDir, unsafeRun) && item.reasons.some((reason) => /State Sync Notes/.test(reason))), "prune preview must refuse terminal Runs without durable State Sync Notes");
    assert(prunePreview.prune.retained.some((item) => samePath(item.runDir, escapedGoalRun) && item.reasons.some((reason) => /Run Goal path/.test(reason))), "prune preview must reject Goal evidence outside the configured Goals root");
    assert(prunePreview.prune.retained.some((item) => samePath(item.runDir, prefixRun) && item.reasons.some((reason) => /does not reference this Run/.test(reason))), "prune must compare exact Run references instead of path prefixes");
    assert(existsSync(join(artifactProject, completedRun)), "prune preview must not delete candidates");
    const trackedPolicy = json(artifactConfigPath);
    trackedPolicy.artifactPolicy.runs = "tracked";
    writeFileSync(artifactConfigPath, `${JSON.stringify(trackedPolicy, null, 2)}\n`);
    assert(/local-only/.test(fails(["artifacts", "prune", "--cwd", artifactProject, "--apply", "--json"])), "prune --apply must refuse tracked Run policy");
    assert(existsSync(join(artifactProject, completedRun)), "tracked-policy refusal must produce zero deletion");
    trackedPolicy.artifactPolicy.runs = "local-only";
    writeFileSync(artifactConfigPath, `${JSON.stringify(trackedPolicy, null, 2)}\n`);
    const pruneApply = JSON.parse(run(["artifacts", "prune", "--cwd", artifactProject, "--apply", "--json"]));
    assert(pruneApply.prune.deleted.some((runDir) => samePath(runDir, completedRun)) && !existsSync(join(artifactProject, completedRun)), "prune --apply must delete only eligible terminal Runs");
    assert(existsSync(join(artifactProject, activeRun)), "prune --apply must preserve active Runs");
    assert(existsSync(join(artifactProject, unsafeRun)), "prune --apply must preserve terminal Runs without durable evidence");
    assert(existsSync(join(artifactProject, escapedGoalRun)), "prune --apply must preserve Runs whose Goal escapes the configured root");
    assert(existsSync(join(artifactProject, prefixRun)), "prune --apply must preserve a Run whose Goal only references a longer path prefix");
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
  assert(generatedGoal.includes("These gates apply only to durable Goal/Run completion"), "generated Goal gates must declare durable-only scope");
  assert(generatedGoal.includes("## State Sync Notes") && generatedGoal.includes("Accepted-state records: `TBD`"), "generated Goals must include an explicit State Sync Notes contract");
  writeFileSync(generatedGoalPath, generatedGoal.replace(/## State Sync Notes[\s\S]*?## Spec Acceptance Checklist/, "## Spec Acceptance Checklist"));
  assert(/State Sync Notes|required section/i.test(fails(["goal", "validate", "--cwd", runProject, "--goal", goalRel, "--json"])), "goal validation must require the State Sync Notes section");
  writeFileSync(generatedGoalPath, generatedGoal);
  assert(!generatedGoal.includes("## Delivery State"), "generated Goals must use accepted state and evidence without a Delivery State section");
  const legacyGoal = generatedGoal.replace("## Execution DAG", `## Delivery State

- Delivery intent: \`legacy\`
- Target delivery state: \`pushed\`
- Push authorized: \`yes\`

## Execution DAG`);
  writeFileSync(generatedGoalPath, legacyGoal);
  const legacyGoalValidation = JSON.parse(run(["goal", "validate", "--cwd", runProject, "--goal", goalRel, "--json"]));
  assert(legacyGoalValidation.ok && !("deliveryPolicy" in legacyGoalValidation.goal), "legacy Goal delivery sections must remain readable but stay outside current validation output");
  writeFileSync(generatedGoalPath, legacyGoal.replace(
    /## Scope\r?\n[\s\S]*?\r?\n## Non-Goals/,
    "## Scope\n\n- Implement the accepted behavior.\n- Preserve compatibility.\n- Add regression coverage.\n- Update durable evidence.\n\n## Non-Goals"
  ));
  run(["run", "prepare", "--cwd", runProject, "--goal", goalRel]);
  const runName = readdirSync(join(runProject, ".harness/runs")).find((name) => !name.startsWith("."));
  const runRel = `.harness/runs/${runName}`;
  const status = json(join(runProject, runRel, "status.json"));
  for (const field of ["deliveryState", "deliveryPolicy", "startHead", "startBranch", "startUpstream", "startDirtyState"]) {
    assert(!(field in status), `new Run status must omit legacy field ${field}`);
  }
  assert(status.executionDag.readyNodes.length > 0, "DAG must record readyNodes");
  assert(JSON.stringify(status.executionDag.parallelLayers) === JSON.stringify([["execution"], ["verification"]]), "medium durable DAG must keep only execution and verification boundaries");
  const runStatusPath = join(runProject, runRel, "status.json");
  const legacyStatus = {
    ...status,
    deliveryState: { state: "pushed", workingTreeDirty: "no", commit: "legacy", push: "origin/main" },
    deliveryPolicy: { target: "pushed", pushAuthorized: "yes" },
    startHead: "legacy-head",
    startBranch: "legacy-branch",
    startUpstream: "origin/legacy-branch",
    startDirtyState: { dirty: "no", digest: "legacy-digest" }
  };
  writeFileSync(runStatusPath, `${JSON.stringify(legacyStatus, null, 2)}\n`);
  const legacyRead = JSON.parse(run(["run", "status", "--cwd", runProject, "--run", runRel, "--json"]));
  assert(!("deliveryState" in legacyRead) && !("deliveryPolicy" in legacyRead), "legacy Run delivery fields must remain readable but stay outside current output");
  let currentRunStatus = legacyRead;
  while (!currentRunStatus.executionDag.allNodesCompleted) {
    const readyNodes = currentRunStatus.executionDag.readyNodes;
    assert(readyNodes.length > 0, "durable DAG must make progress while incomplete");
    for (const node of readyNodes) {
      assert(currentRunStatus.executionDag.nodeStatus[node].ownership, "DAG snapshot must record ownership");
      run(["run", "node", "record", "--cwd", runProject, "--run", runRel, "--node", node, "--phase", "completed", "--summary", "candidate", "--verification", "node check"]);
    }
    currentRunStatus = JSON.parse(run(["run", "status", "--cwd", runProject, "--run", runRel, "--json"]));
  }
  assert(currentRunStatus.executionDag.nodeStatus.execution.verification === "node check", "normal DAG node recording must retain verification evidence");

  const syncReadyGoal = readFileSync(generatedGoalPath, "utf8")
    .replace("- Accepted-state records: `TBD`", "- Accepted-state records: `harness/tasks.md` and this Goal were synchronized.")
    .replace("- Run evidence: `TBD`", `- Run evidence: \`${runRel}\` records the completed DAG and verification.`)
    .replace("- Bounded status update: `TBD`", "- Bounded status update: `harness/status.md` reflects the accepted result.");
  writeFileSync(generatedGoalPath, syncReadyGoal);
  const recorded = JSON.parse(run(["run", "record", "--cwd", runProject, "--run", runRel, "--phase", "completed", "--summary", "validated", "--verification", "smoke passed", "--json"]));
  assert(!("deliveryState" in recorded) && !("deliveryPolicy" in recorded), "completed Run output must omit legacy delivery fields");
  const migratedStatus = json(runStatusPath);
  for (const field of ["deliveryState", "deliveryPolicy", "startHead", "startBranch", "startUpstream", "startDirtyState"]) {
    assert(!(field in migratedStatus), `recording a legacy Run must remove ignored field ${field}`);
  }

  const originalRunStatus = readFileSync(runStatusPath, "utf8");
  const outsideGoalStatus = JSON.parse(originalRunStatus);
  outsideGoalStatus.goalPath = "README.md";
  const tamperedGoalStatus = `${JSON.stringify(outsideGoalStatus, null, 2)}\n`;
  writeFileSync(runStatusPath, tamperedGoalStatus);
  const goalLogsBefore = readdirSync(join(runProject, runRel, "logs")).length;
  assert(/Run Goal path.*inside|Run Goal path|Completed Runs cannot move back/i.test(fails(["run", "record", "--cwd", runProject, "--run", runRel, "--phase", "blocked", "--summary", "tampered goal"])), "run record must reject a completed Run transition and preserve its Goal boundary");
  assert(readFileSync(runStatusPath, "utf8") === tamperedGoalStatus && readdirSync(join(runProject, runRel, "logs")).length === goalLogsBefore, "rejected Run Goal containment must produce zero command writes");
  writeFileSync(runStatusPath, originalRunStatus);

  assert(/inside|Run directory/i.test(fails(["run", "status", "--cwd", runProject, "--run", outside, "--json"])), "external Run arguments must fail");
  assert(/inside|Run directory/i.test(fails(["run", "status", "--cwd", runProject, "--run", "../outside-run", "--json"])), "Run traversal arguments must fail");
  assert(/inside|Goal path/i.test(fails(["goal", "validate", "--cwd", runProject, "--goal", join(outside, "goal.md"), "--json"])), "absolute external Goal references must fail");

  const dagPath = join(runProject, runRel, "dag.json");
  const dag = json(dagPath);
  dag.nodes[0].result = "../../../../outside-result.md";
  writeFileSync(dagPath, `${JSON.stringify(dag, null, 2)}\n`);
  const externalResult = join(runProject, "outside-result.md");
  assert(/relative|inside|Artifact|result/i.test(fails(["run", "node", "record", "--cwd", runProject, "--run", runRel, "--node", dag.nodes[0].id, "--phase", "completed", "--summary", "bad", "--verification", "bad"])), "malicious DAG artifact path must fail");
  assert(!existsSync(externalResult), "malicious DAG must produce zero external writes");
  dag.nodes[0].result = `agents/${dag.nodes[0].id}/result.md`;
  dag.nodes[0].status = "../../../../outside-status.json";
  writeFileSync(dagPath, `${JSON.stringify(dag, null, 2)}\n`);
  assert(/relative|inside|Artifact|status/i.test(fails(["run", "node", "record", "--cwd", runProject, "--run", runRel, "--node", dag.nodes[0].id, "--phase", "completed", "--summary", "bad", "--verification", "bad"])), "malicious DAG status path must fail");
  assert(!existsSync(join(runProject, "outside-status.json")), "malicious DAG status must produce zero external writes");

  run(["init", "--cwd", specContainmentProject, "--contract", "adapter"]);
  write(join(specContainmentProject, "harness/tasks.md"), "# Goals\n\n## Now\n\n- [ ] Spec containment guard\n");
  write(join(specContainmentProject, "harness/specs/accepted.md"), "# Spec: Guard\n\nStatus: accepted\n");
  run(["goal", "create", "--cwd", specContainmentProject, "--task", "Spec containment guard", "--spec", "harness/specs/accepted.md", "--work-mode", "local"]);
  const specGoalName = readdirSync(join(specContainmentProject, "harness/goals")).find((name) => name.endsWith(".md"));
  const specGoalRel = `harness/goals/${specGoalName}`;
  run(["run", "prepare", "--cwd", specContainmentProject, "--goal", specGoalRel]);
  const specRunName = readdirSync(join(specContainmentProject, ".harness/runs")).find((name) => !name.startsWith("."));
  const specRunRel = `.harness/runs/${specRunName}`;
  write(join(specContainmentProject, "harness/tasks.md"), "# Goals\n\n## Now\n\n- [ ] Spec containment guard\n- [ ] Adapter no spec prepare\n");
  run(["goal", "create", "--cwd", specContainmentProject, "--task", "Adapter no spec prepare", "--allow-no-spec", "--work-mode", "local"]);
  const noSpecGoalName = readdirSync(join(specContainmentProject, "harness/goals")).find((name) => name.includes("adapter-no-spec-prepare"));
  assert(noSpecGoalName, "adapter --allow-no-spec must create a Goal");
  const noSpecGoalRel = `harness/goals/${noSpecGoalName}`;
  run(["run", "prepare", "--cwd", specContainmentProject, "--goal", noSpecGoalRel]);
  const noSpecRunName = readdirSync(join(specContainmentProject, ".harness/runs")).find((name) => name !== specRunName && !name.startsWith("."));
  assert(noSpecRunName, "adapter --allow-no-spec Goal must prepare a Run without a spec path error");
  const specGoalPath = join(specContainmentProject, specGoalRel);
  const validSpecGoal = readFileSync(specGoalPath, "utf8");
  write(join(specContainmentProject, "other/spec.md"), "# Spec: Outside configured root\n\nStatus: accepted\n");
  writeFileSync(specGoalPath, validSpecGoal.replace(/^Spec:\s+.*$/m, "Spec: other/spec.md"));
  const specStatusPath = join(specContainmentProject, specRunRel, "status.json");
  const specStatusBefore = readFileSync(specStatusPath, "utf8");
  const specLogsBefore = readdirSync(join(specContainmentProject, specRunRel, "logs")).length;
  assert(/Goal Spec path.*inside|Goal Spec path/i.test(fails(["run", "record", "--cwd", specContainmentProject, "--run", specRunRel, "--phase", "blocked", "--summary", "tampered spec"])), "run record must reject a project-internal Spec outside configured specs root");
  assert(readFileSync(specStatusPath, "utf8") === specStatusBefore && readdirSync(join(specContainmentProject, specRunRel, "logs")).length === specLogsBefore, "rejected Goal Spec containment must produce zero Run writes");

  const guardProject = mkdtempSync(join(tmpdir(), "agent-harness-completion-guards-"));
  try {
    run(["init", "--cwd", guardProject, "--contract", "fixed"]);
    write(join(guardProject, "harness/tasks.md"), "# Tasks\n\n## Now\n\n- [ ] Completion guard\n");
    run(["goal", "create", "--cwd", guardProject, "--task", "Completion guard", "--allow-no-spec", "--work-mode", "local"]);
    const guardGoalName = readdirSync(join(guardProject, "harness/goals")).find((name) => name.endsWith(".md"));
    const guardGoalRel = `harness/goals/${guardGoalName}`;
    run(["run", "prepare", "--cwd", guardProject, "--goal", guardGoalRel]);
    const guardRunName = readdirSync(join(guardProject, ".harness/runs")).find((name) => !name.startsWith("."));
    const guardRunRel = `.harness/runs/${guardRunName}`;
    const guardRunDir = join(guardProject, guardRunRel);
    const guardStatusPath = join(guardRunDir, "status.json");
    const guardDagPath = join(guardRunDir, "dag.json");
    const guardGoalPath = join(guardProject, guardGoalRel);
    const guardStatusBefore = readFileSync(guardStatusPath, "utf8");
    const guardDagBefore = readFileSync(guardDagPath, "utf8");
    const guardGoalBefore = readFileSync(guardGoalPath, "utf8");
    const guardLogsDir = join(guardRunDir, "logs");
    rmSync(guardDagPath);
    assert(/execution DAG|dag.json/i.test(fails(["run", "record", "--cwd", guardProject, "--run", guardRunRel, "--phase", "completed", "--summary", "missing dag", "--verification", "guard"])), "completed Run must fail closed when dag.json is missing");
    assert(readFileSync(guardStatusPath, "utf8") === guardStatusBefore && readdirSync(guardLogsDir).length === 0, "missing DAG completion rejection must produce zero writes");
    writeFileSync(guardDagPath, guardDagBefore);
    let guardProgress = JSON.parse(run(["run", "status", "--cwd", guardProject, "--run", guardRunRel, "--json"]));
    while (!guardProgress.executionDag.allNodesCompleted) {
      const ready = guardProgress.executionDag.readyNodes;
      assert(ready.length > 0, "completion guard DAG must expose a ready node while completing the fixture");
      for (const nodeId of ready) {
        run(["run", "node", "record", "--cwd", guardProject, "--run", guardRunRel, "--node", nodeId, "--phase", "completed", "--summary", "fixture node", "--verification", "fixture verification"]);
      }
      guardProgress = JSON.parse(run(["run", "status", "--cwd", guardProject, "--run", guardRunRel, "--json"]));
    }
    const guardCompletedStatusBefore = readFileSync(guardStatusPath, "utf8");
    rmSync(guardGoalPath);
    assert(/readable Goal|Goal/i.test(fails(["run", "record", "--cwd", guardProject, "--run", guardRunRel, "--phase", "completed", "--summary", "missing goal", "--verification", "guard"])), "completed Run must fail closed when its Goal is missing");
    assert(readFileSync(guardStatusPath, "utf8") === guardCompletedStatusBefore && readdirSync(guardLogsDir).length === 0, "missing Goal completion rejection must produce zero writes");
    writeFileSync(guardGoalPath, guardGoalBefore);

    run(["run", "prepare", "--cwd", guardProject, "--goal", guardGoalRel]);
    const blockedRunName = readdirSync(join(guardProject, ".harness/runs")).find((name) => name !== guardRunName && !name.startsWith("."));
    const blockedRunRel = `.harness/runs/${blockedRunName}`;
    const blockedRunDir = join(guardProject, blockedRunRel);
    const blockedDag = json(join(blockedRunDir, "dag.json"));
    const firstGuardNode = blockedDag.nodes[0];
    const blockedStatus = json(join(blockedRunDir, "status.json"));
    assert(blockedStatus.executionDag.enforced === false || blockedStatus.executionDag.enforced === true, "completion guard Run must expose DAG enforcement state");
    run(["run", "node", "record", "--cwd", guardProject, "--run", blockedRunRel, "--node", firstGuardNode.id, "--phase", "blocked", "--summary", "blocked node"]);
    const blockedLogOne = JSON.parse(run(["run", "record", "--cwd", guardProject, "--run", blockedRunRel, "--phase", "blocked", "--summary", "blocked one", "--json"]));
    const blockedLogTwo = JSON.parse(run(["run", "record", "--cwd", guardProject, "--run", blockedRunRel, "--phase", "blocked", "--summary", "blocked two", "--json"]));
    assert(blockedLogOne.log !== blockedLogTwo.log && existsSync(join(guardProject, blockedLogOne.log)) && existsSync(join(guardProject, blockedLogTwo.log)), "same-second Run records must use unique log paths");
    assert(/every execution DAG node|blocked/i.test(fails(["run", "record", "--cwd", guardProject, "--run", blockedRunRel, "--phase", "completed", "--summary", "blocked dag", "--verification", "guard"])), "completed Run must reject blocked nodes even for advisory DAGs");
    run(["run", "node", "record", "--cwd", guardProject, "--run", blockedRunRel, "--node", firstGuardNode.id, "--phase", "completed", "--summary", "unblocked node", "--verification", "node guard"]);
    const nodeStatusPath = join(blockedRunDir, firstGuardNode.status);
    const nodeStatusBefore = readFileSync(nodeStatusPath, "utf8");
    assert(/Completed DAG node|completed Run/i.test(fails(["run", "node", "record", "--cwd", guardProject, "--run", blockedRunRel, "--node", firstGuardNode.id, "--phase", "blocked", "--summary", "regression"])), "completed DAG nodes must not transition back to blocked");
    assert(readFileSync(nodeStatusPath, "utf8") === nodeStatusBefore, "terminal DAG transition rejection must produce zero node writes");
  } finally { rmSync(guardProject, { recursive: true, force: true }); }

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
