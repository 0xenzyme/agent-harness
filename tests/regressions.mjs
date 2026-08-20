#!/usr/bin/env node

import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(repoRoot, "plugins/agent-harness/scripts/agent-harness.mjs");
const env = { ...process.env, AGENT_HARNESS_LANG: "en", LANG: "C", LC_ALL: "C", LC_MESSAGES: "C" };

function run(args, cwd) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    env,
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function fails(args, cwd) {
  try {
    run(args, cwd);
  } catch (error) {
    return `${error.stdout || ""}${error.stderr || ""}`;
  }
  throw new Error(`Expected failure: ${args.join(" ")}`);
}

function assert(value, message) {
  if (!value) throw new Error(message);
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function json(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function goalName(project, fragment = "") {
  return readdirSync(join(project, "harness/goals"))
    .find((name) => name.endsWith(".md") && (!fragment || name.includes(fragment)));
}

function prepare(project, goalRel) {
  run(["run", "prepare", "--cwd", project, "--goal", goalRel]);
  const names = readdirSync(join(project, ".harness/runs")).filter((name) => !name.startsWith("."));
  assert(names.length > 0, "run prepare must create a Run directory");
  const name = names.sort().at(-1);
  return `.harness/runs/${name}`;
}

function recordReadyNodes(project, runRel) {
  let status = JSON.parse(run(["run", "status", "--cwd", project, "--run", runRel, "--json"]));
  while (!status.executionDag.allNodesCompleted) {
    assert(status.executionDag.readyNodes.length > 0, "prepared DAG must expose a ready node");
    for (const node of status.executionDag.readyNodes) {
      run(["run", "node", "record", "--cwd", project, "--run", runRel, "--node", node, "--phase", "completed", "--summary", "regression node", "--verification", "regression verification"]);
    }
    status = JSON.parse(run(["run", "status", "--cwd", project, "--run", runRel, "--json"]));
  }
}

function synchronizeGoal(project, goalRel, runRel) {
  const goalPath = join(project, goalRel);
  const content = readFileSync(goalPath, "utf8")
    .replace("- Accepted-state records: `TBD`", "- Accepted-state records: `harness/tasks.md` and this Goal were synchronized.")
    .replace("- Run evidence: `TBD`", `- Run evidence: \`${runRel}\` records the completed DAG and verification.`)
    .replace("- Bounded status update: `TBD`", "- Bounded status update: `harness/status.md` reflects the accepted result.");
  writeFileSync(goalPath, content);
}

function createProject(prefix, taskTitles = ["Regression task"]) {
  const project = mkdtempSync(join(tmpdir(), `${prefix}-`));
  run(["init", "--cwd", project, "--contract", "fixed"]);
  write(join(project, "harness/tasks.md"), `# Tasks\n\n## Now\n\n${taskTitles.map((title) => `- [ ] ${title}`).join("\n")}\n`);
  return project;
}

function createGoal(project, title) {
  run(["goal", "create", "--cwd", project, "--task", title, "--allow-no-spec", "--work-mode", "local"]);
  const name = goalName(project, title.toLowerCase().replace(/\s+/g, "-"));
  assert(name, `goal create must create ${title}`);
  return `harness/goals/${name}`;
}

function runAsync(args, cwd) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [cli, ...args], {
      cwd: repoRoot,
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (code) => resolvePromise({ code, stdout, stderr }));
  });
}

function timestamp(date = new Date()) {
  const stamp = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}${stamp(date.getMonth() + 1)}${stamp(date.getDate())}-${stamp(date.getHours())}${stamp(date.getMinutes())}${stamp(date.getSeconds())}`;
}

const projects = [];
try {
  const empty = mkdtempSync(join(tmpdir(), "agent-harness-doctor-"));
  projects.push(empty);
  assert(/missing/i.test(fails(["doctor", "--cwd", empty], empty)), "doctor must report missing required paths");

  const configProject = createProject("agent-harness-config");
  projects.push(configProject);
  const configPath = join(configProject, ".harness/config.json");
  const config = json(configPath);
  config.artifactPolicy.durableEvidence = ["../outside-evidence"];
  config.artifactPolicy.tasks.archive = "../outside-archive.md";
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  assert(/durableEvidence|archive|repo-relative|\.\./i.test(fails(["config", "validate", "--cwd", configProject, "--json"], configProject)), "artifact policy paths must be validated lexically");

  const lifecycleProject = createProject("agent-harness-lifecycle", ["Fake completion"]);
  projects.push(lifecycleProject);
  const lifecycleConfigPath = join(lifecycleProject, ".harness/config.json");
  const lifecycleConfig = json(lifecycleConfigPath);
  lifecycleConfig.artifactPolicy.runs = "local-only";
  lifecycleConfig.artifactPolicy.retention.completedDays = 0;
  lifecycleConfig.artifactPolicy.retention.keepLatest = 0;
  writeFileSync(lifecycleConfigPath, `${JSON.stringify(lifecycleConfig, null, 2)}\n`);
  const fakeRunRel = ".harness/runs/20260101-000000-fake";
  write(join(lifecycleProject, `${fakeRunRel}/status.json`), JSON.stringify({
    phase: "completed",
    goalPath: "harness/goals/fake.md",
    updatedAt: "2026-01-01T00:00:00.000Z"
  }, null, 2) + "\n");
  write(join(lifecycleProject, "harness/goals/fake.md"), "# Fake\n\n- [ ] Fake completion\n\n## State Sync Notes\n\n- Run evidence exists.\n");
  const maintenance = JSON.parse(run(["maintain", "tasks", "--cwd", lifecycleProject, "--record", "--json"], lifecycleProject));
  assert(!maintenance.proposed.actions.some((action) => action.kind === "task-completion"), "status-only completed Runs must not move Tasks to Done");
  assert(readFileSync(join(lifecycleProject, "harness/tasks.md"), "utf8").includes("- [ ] Fake completion"), "status-only completed Runs must preserve active Tasks");
  JSON.parse(run(["artifacts", "prune", "--cwd", lifecycleProject, "--apply", "--json"], lifecycleProject));
  assert(existsSync(join(lifecycleProject, fakeRunRel)), "status-only completed Runs must not be auto-pruned");

  const runProject = createProject("agent-harness-contract", ["Contract guard"]);
  projects.push(runProject);
  const goalRel = createGoal(runProject, "Contract guard");
  const runRel = prepare(runProject, goalRel);
  const runDir = join(runProject, runRel);
  const statusBefore = readFileSync(join(runDir, "status.json"), "utf8");
  const dagPath = join(runDir, "dag.json");
  const dagBefore = readFileSync(dagPath, "utf8");
  const dag = json(dagPath);
  dag.nodes[0].result = "dag.json";
  writeFileSync(dagPath, JSON.stringify(dag, null, 2) + "\n");
  assert(/reserved|changed|contract|dag/i.test(fails(["run", "node", "record", "--cwd", runProject, "--run", runRel, "--node", dag.nodes[0].id, "--phase", "completed", "--summary", "bad", "--verification", "bad"], runProject)), "forged DAG artifact paths must fail closed");
  assert(readFileSync(join(runDir, "status.json"), "utf8") === statusBefore, "rejected DAG mutation must not write Run status");
  writeFileSync(dagPath, dagBefore);
  const manifestPath = join(runDir, "manifest.json");
  const manifestBefore = readFileSync(manifestPath, "utf8");
  rmSync(manifestPath);
  assert(/manifest|prepared Run/i.test(fails(["run", "node", "record", "--cwd", runProject, "--run", runRel, "--node", dag.nodes[0].id, "--phase", "blocked", "--summary", "blocked"], runProject)), "missing prepared manifest must block node recording");
  writeFileSync(manifestPath, manifestBefore);
  const forgedStatus = json(join(runDir, "status.json"));
  forgedStatus.phase = "completed";
  forgedStatus.verificationSummary = "forged completion";
  writeFileSync(join(runDir, "status.json"), JSON.stringify(forgedStatus, null, 2) + "\n");
  const forgedMaintenance = JSON.parse(run(["maintain", "tasks", "--cwd", runProject, "--json"], runProject));
  assert(!forgedMaintenance.proposed.actions.some((action) => action.kind === "task-completion"), "forged completed status must not drive Task completion without DAG evidence");
  writeFileSync(join(runDir, "status.json"), statusBefore);

  const evidenceProject = createProject("agent-harness-evidence");
  projects.push(evidenceProject);
  const evidenceGoal = createGoal(evidenceProject, "Regression task");
  const evidenceRun = prepare(evidenceProject, evidenceGoal);
  const evidenceStatusBefore = readFileSync(join(evidenceProject, evidenceRun, "status.json"), "utf8");
  const nodeId = json(join(evidenceProject, evidenceRun, "dag.json")).nodes[0].id;
  assert(/verification|concrete|missing/i.test(fails(["run", "node", "record", "--cwd", evidenceProject, "--run", evidenceRun, "--node", nodeId, "--phase", "completed", "--summary", "node", "--verification", " "], evidenceProject)), "whitespace node verification must be rejected");
  assert(readFileSync(join(evidenceProject, evidenceRun, "status.json"), "utf8") === evidenceStatusBefore, "rejected placeholder evidence must not write status");
  assert(/verification|concrete|missing/i.test(fails(["run", "record", "--cwd", evidenceProject, "--run", evidenceRun, "--phase", "completed", "--summary", "run", "--verification", "TBD."], evidenceProject)), "punctuated placeholder Run verification must be rejected");

  const blockedProject = createProject("agent-harness-blocked");
  projects.push(blockedProject);
  const blockedGoal = createGoal(blockedProject, "Regression task");
  const blockedRun = prepare(blockedProject, blockedGoal);
  recordReadyNodes(blockedProject, blockedRun);
  synchronizeGoal(blockedProject, blockedGoal, blockedRun);
  const blockedGoalPath = join(blockedProject, blockedGoal);
  const blockedGoalContent = readFileSync(blockedGoalPath, "utf8");
  writeFileSync(blockedGoalPath, blockedGoalContent.replace(/^Status: .*$/m, "Status: blocked."));
  const blockedValidation = JSON.parse(run(["goal", "validate", "--cwd", blockedProject, "--goal", blockedGoal, "--json"], blockedProject));
  assert(blockedValidation.goal.status === "blocked.", "Goal validation metadata must preserve the blocked status");
  writeFileSync(blockedGoalPath, blockedGoalContent.replace(/^Status: .*$/m, "Status: unknown."));
  assert(/Status must use/i.test(fails(["goal", "validate", "--cwd", blockedProject, "--goal", blockedGoal, "--json"], blockedProject)), "Goal validation must reject unknown status values");
  writeFileSync(blockedGoalPath, blockedGoalContent.replace(/^Status: .*$/m, "Status: blocked."));
  assert(/blocked|Goal Status/i.test(fails(["run", "record", "--cwd", blockedProject, "--run", blockedRun, "--phase", "completed", "--summary", "blocked goal", "--verification", "verified"], blockedProject)), "blocked Goal status must not complete a Run");
  writeFileSync(blockedGoalPath, blockedGoalContent);

  const concurrencyProject = createProject("agent-harness-concurrency");
  projects.push(concurrencyProject);
  const concurrencyGoal = createGoal(concurrencyProject, "Regression task");
  const concurrencyRun = prepare(concurrencyProject, concurrencyGoal);
  const concurrent = await Promise.all(Array.from({ length: 10 }, (_, index) => runAsync([
    "run", "record", "--cwd", concurrencyProject, "--run", concurrencyRun,
    "--phase", "blocked", "--summary", `parallel ${index}`
  ], concurrencyProject)));
  assert(concurrent.every((result) => result.code === 0), `concurrent Run records must all succeed: ${concurrent.map((result) => result.stderr).join(" | ")}`);
  const concurrentStatus = json(join(concurrencyProject, concurrencyRun, "status.json"));
  assert(concurrentStatus.phase === "blocked", "concurrent Run records must leave valid terminal status");
  assert(JSON.parse(readFileSync(join(concurrencyProject, concurrencyRun, "status.json"), "utf8")).phase === "blocked", "concurrent status JSON must remain parseable");
  assert(readdirSync(join(concurrencyProject, concurrencyRun, "logs")).filter((name) => name.endsWith(".md")).length === 10, "concurrent Run records must retain every unique log");

  const symlinkProject = createProject("agent-harness-log-link");
  projects.push(symlinkProject);
  const symlinkGoal = createGoal(symlinkProject, "Regression task");
  const symlinkRun = prepare(symlinkProject, symlinkGoal);
  const symlinkLogs = join(symlinkProject, symlinkRun, "logs");
  const outsideTarget = join(tmpdir(), `agent-harness-log-target-${Date.now()}.md`);
  writeFileSync(outsideTarget, "outside\n");
  try {
    for (let offset = 0; offset < 4; offset += 1) {
      const candidate = join(symlinkLogs, `${timestamp(new Date(Date.now() + offset * 1000))}-blocked.md`);
      try { symlinkSync(outsideTarget, candidate); } catch { /* platform may disallow symlinks; containment tests cover this path */ }
    }
    const beforeOutside = readFileSync(outsideTarget, "utf8");
    const result = runAsync(["run", "record", "--cwd", symlinkProject, "--run", symlinkRun, "--phase", "blocked", "--summary", "symlink guard"], symlinkProject);
    const outcome = await result;
    assert(readFileSync(outsideTarget, "utf8") === beforeOutside, "Run log recording must never write through an external symlink");
    if (outcome.code !== 0) assert(/symlink|log|path/i.test(outcome.stderr), "symlink log rejection should identify the protected path");
  } finally {
    rmSync(outsideTarget, { force: true });
  }

  const maintenanceProject = createProject("agent-harness-maintenance", ["First completion", "Second completion"]);
  projects.push(maintenanceProject);
  for (const title of ["First completion", "Second completion"]) {
    const goal = createGoal(maintenanceProject, title);
    const runRelForTask = prepare(maintenanceProject, goal);
    recordReadyNodes(maintenanceProject, runRelForTask);
    synchronizeGoal(maintenanceProject, goal, runRelForTask);
    run(["run", "record", "--cwd", maintenanceProject, "--run", runRelForTask, "--phase", "completed", "--summary", "complete", "--verification", "verified"], maintenanceProject);
  }
  run(["maintain", "tasks", "--cwd", maintenanceProject, "--record", "--json"], maintenanceProject);
  const maintenanceTasks = readFileSync(join(maintenanceProject, "harness/tasks.md"), "utf8");
  assert(maintenanceTasks.includes("- [x] First completion") && maintenanceTasks.includes("- [x] Second completion"), "maintenance must move multiple completed Tasks despite line shifts");

  const referenceProject = createProject("agent-harness-reference");
  projects.push(referenceProject);
  write(join(referenceProject, "harness/goals/backslash.md"), "# Backslash\n\nRun: `.harness\\\\runs\\\\windows-reference`\n");
  const referenceInspection = JSON.parse(run(["artifacts", "inspect", "--cwd", referenceProject, "--json"], referenceProject));
  assert(referenceInspection.references.references.some((value) => value.includes(".harness/runs/windows-reference")), "artifact reference scanning must normalize Windows separators");
} finally {
  for (const project of projects) rmSync(project, { recursive: true, force: true });
}

console.log("Regression checks passed.");
