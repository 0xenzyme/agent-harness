#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(repoRoot, "plugins/agent-harness/scripts/agent-harness.mjs");

function run(args) {
  return execFileSync(process.execPath, [cli, ...args], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

function runFails(args) {
  try {
    run(args);
  } catch (error) {
    return `${error.stdout || ""}${error.stderr || ""}`;
  }
  throw new Error(`Expected command to fail: ${args.join(" ")}`);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function latestFile(dir) {
  const files = readdirSync(dir).filter((file) => file.endsWith(".md")).sort();
  assert(files.length > 0, `No markdown files found in ${dir}`);
  return join(dir, files[files.length - 1]);
}

function assertIncludes(value, needle, message) {
  assert(value.includes(needle), message || `Expected output to include ${needle}`);
}

function assertExcludes(value, needle, message) {
  assert(!value.includes(needle), message || `Expected output not to include ${needle}`);
}

const suiteDir = mkdtempSync(join(tmpdir(), "agent-harness-smoke-"));

try {
  const fixed = join(suiteDir, "fixed");
  mkdirSync(fixed, { recursive: true });
  run(["init", "--cwd", fixed]);
  assert(existsSync(join(fixed, "tasks.md")), "fixed init should create tasks.md");
  assert(existsSync(join(fixed, ".agent-harness/config.json")), "fixed init should create config");
  assert(existsSync(join(fixed, ".agent-harness/status.md")), "fixed init should create status");
  assertIncludes(run(["doctor", "--cwd", fixed]), "Harness contract: fixed", "fixed doctor should report fixed mode");
  run(["goal", "create", "--cwd", fixed, "--task", "Define the next concrete task"]);
  const fixedGoal = latestFile(join(fixed, ".agent-harness/goals"));
  run(["run", "prepare", "--cwd", fixed, "--goal", fixedGoal]);
  assert(readdirSync(join(fixed, ".agent-harness/runs")).length > 0, "fixed run packet should use fixed runs dir");

  const adapter = join(suiteDir, "adapter-default");
  mkdirSync(adapter, { recursive: true });
  run(["init", "--cwd", adapter, "--contract", "adapter"]);
  assert(existsSync(join(adapter, "tasks.md")), "adapter default init should create tasks.md");
  assert(existsSync(join(adapter, "docs/harness/README.md")), "adapter default init should create adapter docs");
  write(join(adapter, "docs/specs/default.md"), "# Spec\n");
  const adapterInspect = JSON.parse(run(["config", "inspect", "--cwd", adapter, "--json"]));
  assert(adapterInspect.contract === "adapter", "adapter inspect should report adapter contract");
  assert(adapterInspect.paths.taskIndex === "tasks.md", "adapter default task index should be tasks.md");
  const adapterDryRun = run([
    "goal",
    "create",
    "--cwd",
    adapter,
    "--task",
    "Define the next concrete task",
    "--spec",
    "docs/specs/default.md",
    "--dry-run"
  ]);
  assertIncludes(adapterDryRun, "docs/harness/README.md", "adapter goal should reference adapter docs");
  assertExcludes(
    adapterDryRun,
    "plugins/agent-harness/references/",
    "adapter goal should not reference plugin source paths"
  );

  const custom = join(suiteDir, "adapter-custom");
  mkdirSync(custom, { recursive: true });
  write(join(custom, ".agent-harness/config.json"), `${JSON.stringify({
    contract: "adapter",
    projectName: "custom",
    adapter: {
      docs: "docs/harness/README.md",
      machineReadable: ".agent-harness/config.json",
      preflight: ["Confirm paid provider calls before execution."],
      stateSync: ["Update todolist.md and custom/status.md after completion."]
    },
    paths: {
      taskIndex: "todolist.md",
      status: "custom/status.md",
      specs: "docs/specs",
      goals: "custom/goals",
      milestones: "docs/milestones",
      runs: "custom/runs",
      gateRecords: "custom/runs",
      deferredRegister: "docs/milestones",
      mentalModel: "docs/mental-model.md"
    },
    language: {
      default: "auto"
    },
    workMode: {
      defaultPolicy: "ask"
    }
  }, null, 2)}\n`);
  write(join(custom, "docs/harness/README.md"), "# Harness Adapter\n");
  write(join(custom, "custom/status.md"), "# Status\n");
  write(join(custom, "docs/specs/custom.md"), "# Custom Spec\n");
  write(join(custom, "docs/goals/context.md"), "# Linked Context\n");
  mkdirSync(join(custom, "docs/milestones"), { recursive: true });
  mkdirSync(join(custom, "custom/runs"), { recursive: true });
  write(join(custom, "todolist.md"), `# Todo List

| Task | Type | Status | Priority | Doc |
| --- | --- | --- | --- | --- |
| Ship custom path behavior | dev | todo | P1 | [docs/specs/custom.md](docs/specs/custom.md) / [docs/goals/context.md](docs/goals/context.md) |
`);
  const customGoalDryRun = run([
    "goal",
    "create",
    "--cwd",
    custom,
    "--task",
    "Ship custom path behavior",
    "--spec",
    "docs/specs/custom.md",
    "--dry-run"
  ]);
  assertIncludes(customGoalDryRun, "`todolist.md`", "custom goal should include custom task index");
  assertIncludes(customGoalDryRun, "`custom/status.md`", "custom goal should include custom status file");
  assertIncludes(customGoalDryRun, "`docs/goals/context.md`", "custom goal should include linked Doc path");
  assertIncludes(customGoalDryRun, "Confirm paid provider calls", "custom goal should include adapter preflight");
  assertIncludes(customGoalDryRun, "Update todolist.md", "custom goal should include adapter state sync");
  assertExcludes(customGoalDryRun, "plugins/agent-harness/references/", "custom goal should not include plugin source paths");
  run([
    "goal",
    "create",
    "--cwd",
    custom,
    "--task",
    "Ship custom path behavior",
    "--spec",
    "docs/specs/custom.md"
  ]);
  const customGoal = latestFile(join(custom, "custom/goals"));
  run(["run", "prepare", "--cwd", custom, "--goal", customGoal]);
  const customRuns = readdirSync(join(custom, "custom/runs"));
  assert(customRuns.length > 0, "adapter run packet should use custom runs dir");
  const customRunStatus = readJson(join(custom, "custom/runs", customRuns[0], "status.json"));
  assert(customRunStatus.harnessContract === "adapter", "run status should record adapter mode");

  const configuredInit = join(suiteDir, "configured-init-custom");
  mkdirSync(configuredInit, { recursive: true });
  write(join(configuredInit, ".agent-harness/config.json"), `${JSON.stringify({
    contract: "adapter",
    projectName: "configured-init-custom",
    adapter: {
      docs: "project/harness.md",
      machineReadable: ".agent-harness/config.json"
    },
    paths: {
      taskIndex: "todo/custom.md",
      status: "state/status.md",
      specs: "project/specs",
      goals: "project/goals",
      milestones: "project/milestones",
      runs: "runs",
      gateRecords: "runs",
      deferredRegister: "project/milestones",
      mentalModel: "project/mental-model.md"
    }
  }, null, 2)}\n`);
  run(["init", "--cwd", configuredInit, "--contract", "adapter"]);
  assert(existsSync(join(configuredInit, "todo/custom.md")), "init should create configured task index");
  assert(existsSync(join(configuredInit, "state/status.md")), "init should create configured status file");
  assert(existsSync(join(configuredInit, "project/harness.md")), "init should create configured adapter docs");
  assert(existsSync(join(configuredInit, "project/specs")), "init should create configured specs dir");
  assert(existsSync(join(configuredInit, "project/goals")), "init should create configured goals dir");
  assert(existsSync(join(configuredInit, "project/milestones")), "init should create configured milestones dir");
  assert(existsSync(join(configuredInit, "runs")), "init should create configured runs dir");
  assert(!existsSync(join(configuredInit, "tasks.md")), "init should not create default tasks.md with existing custom config");
  assert(!existsSync(join(configuredInit, ".agent-harness/status.md")), "init should not create default status with existing custom config");
  assert(!existsSync(join(configuredInit, "docs/harness/README.md")), "init should not create default adapter with existing custom config");
  assertIncludes(run(["doctor", "--cwd", configuredInit]), "Harness files: ok", "configured init should pass doctor");
  assertIncludes(
    runFails(["init", "--cwd", configuredInit, "--contract", "fixed"]),
    "Existing .agent-harness/config.json is adapter; requested init contract is fixed",
    "init should fail on conflicting requested contract"
  );

  const malformed = join(suiteDir, "malformed-config");
  mkdirSync(join(malformed, ".agent-harness"), { recursive: true });
  write(join(malformed, ".agent-harness/config.json"), "{bad json");
  assertIncludes(
    runFails(["doctor", "--cwd", malformed]),
    "Could not parse .agent-harness/config.json",
    "malformed config should fail clearly"
  );

  const optional = join(suiteDir, "missing-optional");
  mkdirSync(optional, { recursive: true });
  run(["init", "--cwd", optional, "--contract", "adapter"]);
  rmSync(join(optional, "docs/mental-model.md"), { force: true });
  const optionalDoctor = run(["doctor", "--cwd", optional]);
  assertIncludes(optionalDoctor, "Optional harness paths:", "doctor should report optional paths without failing");

  const discovered = join(suiteDir, "adapter-discovered");
  mkdirSync(discovered, { recursive: true });
  write(join(discovered, "docs/harness/README.md"), "# Harness Adapter\n");
  write(join(discovered, "docs/specs/spec.md"), "# Spec\n");
  write(join(discovered, "docs/goals/goal.md"), "# Goal\n");
  mkdirSync(join(discovered, "docs/milestones"), { recursive: true });
  write(join(discovered, "todolist.md"), `# Todo List

| Task | Type | Status | Priority | Doc |
| --- | --- | --- | --- | --- |
| Existing adapter task | docs | goal-ready | P1 | [docs/specs/spec.md](docs/specs/spec.md) |
`);
  const discoveredDoctor = run(["doctor", "--cwd", discovered]);
  assertIncludes(discoveredDoctor, "Harness contract: adapter", "adapter project should be discovered as adapter");
  assertIncludes(discoveredDoctor, "Config source: discovered", "discovered project should report discovered config source");
  assertExcludes(discoveredDoctor, "tasks.md", "discovered project should not require default tasks.md");
  const discoveredInspect = JSON.parse(run(["config", "inspect", "--cwd", discovered, "--json"]));
  assert(discoveredInspect.paths.taskIndex === "todolist.md", "discovered task index should be todolist.md");
  const dryRunImport = JSON.parse(run(["config", "import", "--cwd", discovered, "--dry-run", "--json"]));
  assert(dryRunImport.dryRun === true, "import dry-run should report dryRun=true");
  assert(!existsSync(join(discovered, ".agent-harness/config.json")), "import dry-run should not create config");
  assert(!existsSync(join(discovered, ".agent-harness")), "import dry-run should not create .agent-harness directory");
  const imported = JSON.parse(run(["config", "import", "--cwd", discovered, "--json"]));
  assert(imported.paths.taskIndex === "todolist.md", "import should preserve todolist.md task index");
  assert(existsSync(join(discovered, ".agent-harness/config.json")), "import should create config");
  assert(existsSync(join(discovered, ".agent-harness/status.md")), "import should create configured status file");
  assert(existsSync(join(discovered, ".agent-harness/runs")), "import should create configured runs dir");
  assert(!existsSync(join(discovered, "tasks.md")), "import should not create a second task index");
  assertIncludes(run(["doctor", "--cwd", discovered]), "Harness files: ok", "imported project should still pass doctor");

  const initExisting = join(suiteDir, "adapter-init-existing");
  mkdirSync(initExisting, { recursive: true });
  write(join(initExisting, "docs/harness/README.md"), "# Harness Adapter\n");
  write(join(initExisting, "todolist.md"), "# Todo List\n");
  run(["init", "--cwd", initExisting, "--contract", "adapter"]);
  const initExistingConfig = readJson(join(initExisting, ".agent-harness/config.json"));
  assert(initExistingConfig.paths.taskIndex === "todolist.md", "init should preserve existing todolist.md");
  assert(!existsSync(join(initExisting, "tasks.md")), "init should not create tasks.md when todolist.md already exists");

  console.log("Smoke tests passed.");
} finally {
  rmSync(suiteDir, { recursive: true, force: true });
}
