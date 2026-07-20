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
function write(path, content) { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, content); }
function json(path) { return JSON.parse(readFileSync(path, "utf8")); }
function git(cwd, args) { return execFileSync("git", args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }); }

const manifest = json(join(repoRoot, "plugins/agent-harness/.codex-plugin/plugin.json"));
assert(Array.isArray(manifest.interface.defaultPrompt), "interface.defaultPrompt must be a string array");
assert(manifest.interface.defaultPrompt.length > 0 && manifest.interface.defaultPrompt.every((item) => typeof item === "string"), "defaultPrompt items must be strings");

const marketplace = json(join(repoRoot, ".agents/plugins/marketplace.json"));
assert(marketplace.name === "agent-harness-local", "marketplace must have a unique local identity");
assert(marketplace.plugins.length === 1 && marketplace.plugins[0].name === manifest.name, "marketplace entry must match plugin manifest");
const deployHelper = readFileSync(join(repoRoot, "tools/deploy-local-plugin.mjs"), "utf8");
assert(deployHelper.includes("marketplaceManifest") && deployHelper.includes("different root; refusing"), "deploy helper must derive and strictly validate marketplace name/root metadata");

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
assert(executeMetadata.includes("long-running controller work") && executeMetadata.includes("existing durable Harness state") && executeMetadata.includes("bounded postflight sync") && executeMetadata.includes("ordinary clear work use Codex directly"), "execute implicit metadata must cover controller, durable, and tracked postflight work only");
const nativeBridge = readFileSync(join(repoRoot, "plugins/agent-harness/references/codex-native-execution.md"), "utf8");
for (const marker of ["codex-direct", "codex-direct-postflight", "durable-harness", "create_goal", "update_plan"]) {
  assert(nativeBridge.includes(marker), `Codex-native bridge must include ${marker}`);
}

const temp = mkdtempSync(join(tmpdir(), "agent-harness-smoke-"));
const outside = mkdtempSync(join(tmpdir(), "agent-harness-outside-"));
try {
  run(["init", "--cwd", temp, "--contract", "adapter"]);
  const inspect = JSON.parse(run(["config", "inspect", "--cwd", temp, "--json"]));
  assert(inspect.paths.runs === ".harness/runs", "adapter paths must resolve canonically");
  const validation = JSON.parse(run(["config", "validate", "--cwd", temp, "--json"]));
  assert(validation.ok, "canonical adapter config must validate");
  const intakePreview = JSON.parse(run(["intake", "idea", "--cwd", temp, "--idea", "Add import audit", "--json"]));
  assert(intakePreview.writesFiles === false, "intake preview must be read-only");
  assert(/table-based task index/.test(fails(["intake", "idea", "--cwd", temp, "--idea", "Add import audit", "--record", "--json"])), "unsupported table Goal indexes must refuse automatic intake writes");
  const maintenance = JSON.parse(run(["maintain", "tasks", "--cwd", temp, "--json"]));
  assert(maintenance.writesFiles === false, "maintenance preview must be read-only");
  const orientation = JSON.parse(run(["orient", "next", "--cwd", temp, "--json"]));
  assert(orientation.contract === "adapter", "orientation must preserve adapter contract state");
  const activation = run(["activation", "snippet", "--cwd", temp]);
  assert(activation.includes("Agent Harness"), "activation preview must remain available and read-only");
  const worktree = JSON.parse(run(["worktree", "recommend", "--cwd", temp, "--json"]));
  assert(["local", "worktree", "ask"].includes(worktree.recommendation), "worktree recommendation must return a canonical policy");

  const configPath = join(temp, ".harness/config.json");
  const canonicalConfig = json(configPath);
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
    assert(json(join(legacy, ".harness/config.json")).paths.taskIndex === "todolist.md", "config import must write canonical adapter paths");
  } finally { rmSync(legacy, { recursive: true, force: true }); }

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
    write(join(artifactProject, completedRun, "status.json"), `${JSON.stringify({ phase: "completed", goalPath: "harness/goals/completed.md", updatedAt: "2026-01-01T00:00:00.000Z" }, null, 2)}\n`);
    write(join(artifactProject, completedRun, "proof.txt"), "proof\n");
    write(join(artifactProject, activeRun, "status.json"), `${JSON.stringify({ phase: "running", goalPath: "harness/goals/active.md", updatedAt: "2026-01-02T00:00:00.000Z" }, null, 2)}\n`);
    write(join(artifactProject, unsafeRun, "status.json"), `${JSON.stringify({ phase: "completed", goalPath: "harness/goals/unsafe.md", updatedAt: "2026-01-03T00:00:00.000Z" }, null, 2)}\n`);
    write(join(artifactProject, escapedGoalRun, "status.json"), `${JSON.stringify({ phase: "completed", goalPath: "harness/status.md", updatedAt: "2026-01-04T00:00:00.000Z" }, null, 2)}\n`);
    write(join(artifactProject, "harness/goals/unsafe.md"), `# Unsafe\n\nRun: \`${unsafeRun}\`\n`);
    write(join(artifactProject, "harness/goals/completed.md"), `# Completed\n\nRun: \`${completedRun}\`\n\n## State Sync Notes\n\n- Durable conclusion retained.\n`);
    const inspection = JSON.parse(run(["artifacts", "inspect", "--cwd", artifactProject, "--json"]));
    assert(inspection.writesFiles === false && inspection.status.overLimit, "artifact inspection must be read-only and report bounded-status overflow");
    assert(inspection.tasks.issues.some((issue) => issue.kind === "terminal-task-in-active-section"), "artifact inspection must report terminal tasks in active sections");
    const tasksBefore = readFileSync(join(artifactProject, "harness/tasks.md"), "utf8");
    const compactPreview = JSON.parse(run(["artifacts", "compact", "--cwd", artifactProject, "--json"]));
    assert(compactPreview.compact.candidates.length === 1 && !existsSync(join(artifactProject, "harness/tasks-archive.md")), "compact preview must be read-only and retain the configured recent Done window");
    assert(readFileSync(join(artifactProject, "harness/tasks.md"), "utf8") === tasksBefore, "compact preview must not rewrite the task index");
    const compactRecord = JSON.parse(run(["artifacts", "compact", "--cwd", artifactProject, "--record", "--json"]));
    assert(compactRecord.compact.archived === 1 && compactRecord.compact.archiveWritten && compactRecord.compact.taskIndexWritten, "compact record must archive before replacing the active index");
    assert(readFileSync(join(artifactProject, "harness/tasks-archive.md"), "utf8").includes("Older done"), "task archive must retain the exact displaced record");
    assert(!readFileSync(join(artifactProject, "harness/tasks.md"), "utf8").includes("Older done"), "active task index must drop archived records");
    const prunePreview = JSON.parse(run(["artifacts", "prune", "--cwd", artifactProject, "--json"]));
    assert(prunePreview.prune.mode === "preview" && prunePreview.prune.candidates.some((item) => item.runDir === completedRun), "prune preview must identify evidence-safe terminal Runs");
    assert(prunePreview.prune.retained.some((item) => item.runDir === unsafeRun && item.reasons.some((reason) => /State Sync Notes/.test(reason))), "prune preview must refuse terminal Runs without durable State Sync Notes");
    assert(prunePreview.prune.retained.some((item) => item.runDir === escapedGoalRun && item.reasons.some((reason) => /Run Goal path/.test(reason))), "prune preview must reject Goal evidence outside the configured Goals root");
    assert(existsSync(join(artifactProject, completedRun)), "prune preview must not delete candidates");
    const trackedPolicy = json(artifactConfigPath);
    trackedPolicy.artifactPolicy.runs = "tracked";
    writeFileSync(artifactConfigPath, `${JSON.stringify(trackedPolicy, null, 2)}\n`);
    assert(/local-only/.test(fails(["artifacts", "prune", "--cwd", artifactProject, "--apply", "--json"])), "prune --apply must refuse tracked Run policy");
    assert(existsSync(join(artifactProject, completedRun)), "tracked-policy refusal must produce zero deletion");
    trackedPolicy.artifactPolicy.runs = "local-only";
    writeFileSync(artifactConfigPath, `${JSON.stringify(trackedPolicy, null, 2)}\n`);
    const pruneApply = JSON.parse(run(["artifacts", "prune", "--cwd", artifactProject, "--apply", "--json"]));
    assert(pruneApply.prune.deleted.includes(completedRun) && !existsSync(join(artifactProject, completedRun)), "prune --apply must delete only eligible terminal Runs");
    assert(existsSync(join(artifactProject, activeRun)), "prune --apply must preserve active Runs");
    assert(existsSync(join(artifactProject, unsafeRun)), "prune --apply must preserve terminal Runs without durable evidence");
    assert(existsSync(join(artifactProject, escapedGoalRun)), "prune --apply must preserve Runs whose Goal escapes the configured root");
  } finally { rmSync(artifactProject, { recursive: true, force: true }); }

} finally {
}

const runProject = mkdtempSync(join(tmpdir(), "agent-harness-run-"));
const bareRemote = mkdtempSync(join(tmpdir(), "agent-harness-remote-"));
const branchMismatchProject = mkdtempSync(join(tmpdir(), "agent-harness-branch-mismatch-"));
const specContainmentProject = mkdtempSync(join(tmpdir(), "agent-harness-spec-containment-"));
try {
  git(bareRemote, ["init", "--bare"]);
  git(runProject, ["init"]);
  git(runProject, ["config", "user.email", "smoke@example.invalid"]);
  git(runProject, ["config", "user.name", "Smoke"]);
  write(join(runProject, "README.md"), "# Smoke\n");
  git(runProject, ["add", "README.md"]);
  git(runProject, ["commit", "-m", "initial"]);
  git(runProject, ["remote", "add", "origin", bareRemote]);
  git(runProject, ["push", "-u", "origin", "HEAD"]);
  run(["init", "--cwd", runProject, "--contract", "fixed"]);
  write(join(runProject, "harness/tasks.md"), "# Tasks\n\n## Now\n\n- [ ] Smoke durable run\n");
  run(["intake", "idea", "--cwd", runProject, "--idea", "Add fixed intake", "--record", "--json"]);
  assert(readFileSync(join(runProject, "harness/tasks.md"), "utf8").includes("Add fixed intake"), "explicit intake record must update a supported configured Goal index");
  run(["goal", "create", "--cwd", runProject, "--task", "Smoke durable run", "--allow-no-spec", "--work-mode", "local"]);
  const goalName = readdirSync(join(runProject, "harness/goals")).find((name) => name.endsWith(".md"));
  const goalRel = `harness/goals/${goalName}`;
  const generatedGoalPath = join(runProject, goalRel);
  const generatedGoal = readFileSync(generatedGoalPath, "utf8");
  assert(generatedGoal.includes("## Codex-Native Execution"), "generated durable Goals must bind to Codex-native execution");
  assert(generatedGoal.includes("These gates apply only to durable Goal/Run completion"), "generated Goal gates must declare durable-only scope");
  writeFileSync(generatedGoalPath, generatedGoal.replace(
    /## Scope\r?\n[\s\S]*?\r?\n## Non-Goals/,
    "## Scope\n\n- Implement the accepted behavior.\n- Preserve compatibility.\n- Add regression coverage.\n- Update durable evidence.\n\n## Non-Goals"
  ));
  run(["run", "prepare", "--cwd", runProject, "--goal", goalRel]);
  const runName = readdirSync(join(runProject, ".harness/runs")).find((name) => !name.startsWith("."));
  const runRel = `.harness/runs/${runName}`;
  const status = json(join(runProject, runRel, "status.json"));
  for (const field of ["startHead", "startBranch", "startUpstream", "startDirtyState"]) assert(field in status, `Run status must record ${field}`);
  assert(typeof status.startDirtyState.digest === "string", "startDirtyState must include a comparable digest");
  assert(status.executionDag.readyNodes.length > 0, "DAG must record readyNodes");
  assert(JSON.stringify(status.executionDag.parallelLayers) === JSON.stringify([["execution"], ["verification"]]), "medium durable DAG must keep only execution and verification boundaries");
  let currentRunStatus = status;
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

  const recorded = JSON.parse(run(["run", "record", "--cwd", runProject, "--run", runRel, "--phase", "completed", "--summary", "validated", "--verification", "smoke passed", "--json"]));
  assert(recorded.deliveryState.state === "validated-local", "clean upstream history must not count as this Run's push");
  assert(recorded.deliveryState.push === "none" && recorded.deliveryState.commit === "none", "Run-scoped delivery must require a Run delta or explicit evidence");

  const runStatusPath = join(runProject, runRel, "status.json");
  const originalRunStatus = readFileSync(runStatusPath, "utf8");
  const outsideGoalStatus = JSON.parse(originalRunStatus);
  outsideGoalStatus.goalPath = "README.md";
  const tamperedGoalStatus = `${JSON.stringify(outsideGoalStatus, null, 2)}\n`;
  writeFileSync(runStatusPath, tamperedGoalStatus);
  const goalLogsBefore = readdirSync(join(runProject, runRel, "logs")).length;
  assert(/Run Goal path.*inside|Run Goal path/i.test(fails(["run", "record", "--cwd", runProject, "--run", runRel, "--phase", "blocked", "--summary", "tampered goal"])), "run record must reject a project-internal Goal outside configured goals root");
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

  git(branchMismatchProject, ["init"]);
  git(branchMismatchProject, ["config", "user.email", "smoke@example.invalid"]);
  git(branchMismatchProject, ["config", "user.name", "Smoke"]);
  write(join(branchMismatchProject, "README.md"), "# Branch mismatch\n");
  git(branchMismatchProject, ["add", "README.md"]);
  git(branchMismatchProject, ["commit", "-m", "initial"]);
  run(["init", "--cwd", branchMismatchProject, "--contract", "fixed"]);
  write(join(branchMismatchProject, "harness/tasks.md"), "# Tasks\n\n## Now\n\n- [ ] Branch delivery guard\n");
  run(["goal", "create", "--cwd", branchMismatchProject, "--task", "Branch delivery guard", "--allow-no-spec", "--work-mode", "local"]);
  const mismatchGoal = readdirSync(join(branchMismatchProject, "harness/goals")).find((name) => name.endsWith(".md"));
  run(["run", "prepare", "--cwd", branchMismatchProject, "--goal", `harness/goals/${mismatchGoal}`]);
  const mismatchRun = readdirSync(join(branchMismatchProject, ".harness/runs")).find((name) => !name.startsWith("."));
  git(branchMismatchProject, ["switch", "-c", "other-branch"]);
  write(join(branchMismatchProject, "branch-change.txt"), "different branch\n");
  git(branchMismatchProject, ["add", "."]);
  git(branchMismatchProject, ["commit", "-m", "different branch commit"]);
  const mismatchRecord = JSON.parse(run(["run", "record", "--cwd", branchMismatchProject, "--run", `.harness/runs/${mismatchRun}`, "--phase", "completed", "--summary", "validated on another branch", "--verification", "smoke passed", "--json"]));
  assert(mismatchRecord.deliveryState.state === "validated-local" && mismatchRecord.deliveryState.commit === "none" && mismatchRecord.deliveryState.push === "none", "branch mismatch must not promote a Run to committed or pushed");
  assert(mismatchRecord.deliveryState.runDelta.branchMatches === false, "Run delta must expose branch mismatch evidence");

  run(["init", "--cwd", specContainmentProject, "--contract", "adapter"]);
  write(join(specContainmentProject, "harness/tasks.md"), "# Goals\n\n## Now\n\n- [ ] Spec containment guard\n");
  write(join(specContainmentProject, "harness/specs/accepted.md"), "# Spec: Guard\n\nStatus: accepted\n");
  run(["goal", "create", "--cwd", specContainmentProject, "--task", "Spec containment guard", "--spec", "harness/specs/accepted.md", "--work-mode", "local"]);
  const specGoalName = readdirSync(join(specContainmentProject, "harness/goals")).find((name) => name.endsWith(".md"));
  const specGoalRel = `harness/goals/${specGoalName}`;
  run(["run", "prepare", "--cwd", specContainmentProject, "--goal", specGoalRel]);
  const specRunName = readdirSync(join(specContainmentProject, ".harness/runs")).find((name) => !name.startsWith("."));
  const specRunRel = `.harness/runs/${specRunName}`;
  const specGoalPath = join(specContainmentProject, specGoalRel);
  const validSpecGoal = readFileSync(specGoalPath, "utf8");
  write(join(specContainmentProject, "other/spec.md"), "# Spec: Outside configured root\n\nStatus: accepted\n");
  writeFileSync(specGoalPath, validSpecGoal.replace(/^Spec:\s+.*$/m, "Spec: other/spec.md"));
  const specStatusPath = join(specContainmentProject, specRunRel, "status.json");
  const specStatusBefore = readFileSync(specStatusPath, "utf8");
  const specLogsBefore = readdirSync(join(specContainmentProject, specRunRel, "logs")).length;
  assert(/Goal Spec path.*inside|Goal Spec path/i.test(fails(["run", "record", "--cwd", specContainmentProject, "--run", specRunRel, "--phase", "blocked", "--summary", "tampered spec"])), "run record must reject a project-internal Spec outside configured specs root");
  assert(readFileSync(specStatusPath, "utf8") === specStatusBefore && readdirSync(join(specContainmentProject, specRunRel, "logs")).length === specLogsBefore, "rejected Goal Spec containment must produce zero Run writes");

  const zhDoctor = run(["doctor", "--cwd", runProject, "--lang", "zh-CN"], { env: { LANG: "zh_CN.UTF-8", LC_ALL: "zh_CN.UTF-8" } });
  assert(zhDoctor.includes("项目") || zhDoctor.includes("状态"), "zh-CN smoke must exercise localized display");
  JSON.parse(run(["config", "inspect", "--cwd", runProject, "--json"], { env: { LANG: "zh_CN.UTF-8", LC_ALL: "zh_CN.UTF-8" } }));

  {
    const symlinkProject = mkdtempSync(join(tmpdir(), "agent-harness-link-"));
    try {
      mkdirSync(join(symlinkProject, ".harness"), { recursive: true });
      symlinkSync(outside, join(symlinkProject, "escape"), process.platform === "win32" ? "junction" : "dir");
      write(join(symlinkProject, ".harness/config.json"), `${JSON.stringify({ contract: "fixed", paths: { tasks: "harness/tasks.md", status: "escape/status.md", goals: "harness/goals", runs: ".harness/runs" } }, null, 2)}\n`);
      assert(/symlink|outside|escape/i.test(fails(["init", "--cwd", symlinkProject, "--contract", "fixed"])), "existing-parent symlink escape must fail");
      assert(!existsSync(join(outside, "status.md")), "symlink rejection must produce zero external writes");
    } finally { rmSync(symlinkProject, { recursive: true, force: true }); }
  }
} finally {
  rmSync(temp, { recursive: true, force: true });
  rmSync(runProject, { recursive: true, force: true });
  rmSync(bareRemote, { recursive: true, force: true });
  rmSync(branchMismatchProject, { recursive: true, force: true });
  rmSync(specContainmentProject, { recursive: true, force: true });
  rmSync(outside, { recursive: true, force: true });
}

console.log("Smoke checks passed.");
