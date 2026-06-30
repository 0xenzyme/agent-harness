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

function completeReadyDagNodes(cwd, runRelPath, label = "smoke") {
  for (let guard = 0; guard < 20; guard += 1) {
    const status = JSON.parse(run(["run", "status", "--cwd", cwd, "--run", runRelPath, "--json"]));
    const dag = status.executionDag;
    if (!dag?.enforced || dag.allNodesCompleted) {
      return;
    }
    assert(dag.readyNodes.length > 0, `No ready DAG nodes for ${runRelPath}`);
    for (const node of dag.readyNodes) {
      run([
        "run",
        "node",
        "record",
        "--cwd",
        cwd,
        "--run",
        runRelPath,
        "--node",
        node,
        "--phase",
        "completed",
        "--summary",
        `${label} completed ${node}`,
        "--verification",
        `${label} verification for ${node}`
      ]);
    }
  }
  throw new Error(`DAG did not complete within guard limit: ${runRelPath}`);
}

function collectFiles(dir, predicate) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(path, predicate));
    } else if (entry.isFile() && predicate(path)) {
      files.push(path);
    }
  }
  return files;
}

function assertIncludes(value, needle, message) {
  assert(value.includes(needle), message || `Expected output to include ${needle}`);
}

function assertExcludes(value, needle, message) {
  assert(!value.includes(needle), message || `Expected output not to include ${needle}`);
}

function skillDoc(skillName) {
  return readFileSync(join(repoRoot, "plugins/agent-harness/skills", skillName, "SKILL.md"), "utf8");
}

function frontmatterDescription(doc) {
  return doc.match(/^description:\s*(.*)$/m)?.[1] || "";
}

const pluginManifest = readJson(join(repoRoot, "plugins/agent-harness/.codex-plugin/plugin.json"));
const packageManifest = readJson(join(repoRoot, "package.json"));
assert(pluginManifest.name === "harness", "plugin manifest should expose the short harness plugin name");
assert(
  pluginManifest.version === packageManifest.version,
  "plugin manifest version should stay aligned with package.json"
);
assertIncludes(pluginManifest.description, "可复用", "plugin description should include zh-CN/en bilingual fallback");
assertIncludes(
  pluginManifest.interface.shortDescription,
  "adapter 驱动",
  "plugin short description should include zh-CN/en bilingual fallback"
);
assert(
  pluginManifest.hooks === undefined,
  "agent-harness plugin manifest should stay hook-free until conditional bootstrap has validation and runtime coverage"
);
for (const skillName of ["orient", "execute", "intake", "init"]) {
  assert(
    existsSync(join(repoRoot, "plugins/agent-harness/skills", skillName, "SKILL.md")),
    `short workflow skill should exist: ${skillName}`
  );
}
const shippedSkills = readdirSync(join(repoRoot, "plugins/agent-harness/skills"), { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();
assert(
  JSON.stringify(shippedSkills) === JSON.stringify(["execute", "init", "intake", "orient"]),
  `plugin should ship only the four workflow skills; found ${shippedSkills.join(", ")}`
);
for (const legacySkillName of ["harness-adapter", "harness-goal", "harness-init", "harness-run", "harness-tasks"]) {
  assert(
    !existsSync(join(repoRoot, "plugins/agent-harness/skills", legacySkillName, "SKILL.md")),
    `legacy wrapper skill should not be shipped: ${legacySkillName}`
  );
}
const workflowSkillDocs = {
  init: skillDoc("init"),
  orient: skillDoc("orient"),
  intake: skillDoc("intake"),
  execute: skillDoc("execute")
};
const expectedSkillReferences = {
  init: ["adoption-boundary.md", "migration-safety.md"],
  orient: ["route-decision.md", "read-only-boundary.md"],
  intake: ["capture-boundary.md", "promotion-rules.md"],
  execute: ["routing-boundaries.md", "execution-roles.md", "completion-evidence.md"]
};
for (const [skillName, referenceFiles] of Object.entries(expectedSkillReferences)) {
  const referencesDir = join(repoRoot, "plugins/agent-harness/skills", skillName, "references");
  assert(existsSync(referencesDir), `${skillName} should ship local references instead of a thin single-file skill`);
  for (const referenceFile of referenceFiles) {
    const referencePath = join(referencesDir, referenceFile);
    assert(existsSync(referencePath), `${skillName} should include references/${referenceFile}`);
    assertIncludes(
      workflowSkillDocs[skillName],
      `references/${referenceFile}`,
      `${skillName} SKILL.md should link references/${referenceFile}`
    );
    const referenceContent = readFileSync(referencePath, "utf8");
    assertIncludes(referenceContent, "Use this reference", `${skillName}/${referenceFile} should state when to load it`);
  }
}
const workflowSkillDescriptions = Object.fromEntries(
  Object.entries(workflowSkillDocs).map(([name, doc]) => [name, frontmatterDescription(doc)])
);
const taskRoutingReference = readFileSync(join(repoRoot, "plugins/agent-harness/references/task-routing.md"), "utf8");
const orientRouteDecisionReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/skills/orient/references/route-decision.md"),
  "utf8"
);
const controllerCommunicationReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/references/controller-communication.md"),
  "utf8"
);
const executionRolesReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/skills/execute/references/execution-roles.md"),
  "utf8"
);
const intakePromotionReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/skills/intake/references/promotion-rules.md"),
  "utf8"
);
assertIncludes(
  workflowSkillDescriptions.execute,
  "Use only when scope, role, verification, completion conditions, and pause conditions are accepted",
  "execute description should require accepted execution boundaries before routing"
);
assertIncludes(
  workflowSkillDescriptions.execute,
  "Do not use for read-only orientation",
  "execute description should exclude read-only orientation"
);
assertIncludes(
  workflowSkillDescriptions.execute,
  "unconfirmed specs/goals",
  "execute description should exclude unconfirmed specs/goals"
);
assertIncludes(
  workflowSkillDescriptions.init,
  "Do not use for read-only orientation",
  "init description should not steal read-only orientation"
);
assertIncludes(
  workflowSkillDescriptions.orient,
  "Do not use for harness adoption/init/import",
  "orient description should not steal setup/adoption work"
);
assertIncludes(
  workflowSkillDescriptions.intake,
  "Do not use for read-only orientation",
  "intake description should not steal orientation"
);
assertIncludes(
  workflowSkillDocs.execute,
  "do not infer `mixed` from low-risk local work alone",
  "execute should not self-authorize mixed execution from low risk alone"
);
assertIncludes(
  taskRoutingReference,
  "Do not infer `mixed` from low-risk local work alone",
  "task-routing should not self-authorize mixed execution from low risk alone"
);
assertExcludes(
  taskRoutingReference,
  "low-risk and local enough",
  "task-routing should not allow low-risk local work to grant mixed execution"
);
assertIncludes(
  workflowSkillDocs.execute,
  "If any of these are missing, route to",
  "execute should route or pause when execution boundaries are missing"
);
assertExcludes(
  workflowSkillDocs.execute,
  "affects risk, cost, or product direction, pause and ask",
  "execute should not make missing execution boundaries conditional on risk judgment"
);
assertIncludes(
  executionRolesReference,
  "Pause before editing when role, conversation route, execution context lock,",
  "execution role reference should pause when role or authority boundaries are missing"
);
assertExcludes(
  executionRolesReference,
  "and the choice affects risk, cost, product",
  "execution role reference should not make missing boundaries conditional on risk judgment"
);
assertIncludes(
  intakePromotionReference,
  "If any item is missing, route to",
  "intake promotion should not route to execution with missing boundaries"
);
assertExcludes(
  intakePromotionReference,
  "If any item affects risk",
  "intake promotion should not make missing execution boundaries conditional on risk judgment"
);
assertIncludes(
  workflowSkillDocs.execute,
  "../../references/task-routing.md",
  "execute should route ambiguous work through the task-routing reference"
);
assertIncludes(
  workflowSkillDocs.orient,
  "../../references/task-routing.md",
  "orient should route ambiguous work through the task-routing reference"
);
assertIncludes(
  workflowSkillDocs.orient,
  "conversation-confirmed state",
  "orient should reconcile newer active-thread decisions before recommending stale artifacts"
);
assertIncludes(
  orientRouteDecisionReference,
  "Stale artifact check",
  "orient route decisions should report stale artifact reconciliation"
);
assertIncludes(
  taskRoutingReference,
  "Conversation Vs Artifact State",
  "task-routing should define precedence for active-thread decisions over stale artifacts"
);
assertIncludes(
  controllerCommunicationReference,
  "Supersedes",
  "controller packets should record which older plan a revised decision replaces"
);
const designPrincipleFiles = [
  "docs/project-contract.md",
  "plugins/agent-harness/references/adapter-harness.md",
  "plugins/agent-harness/references/task-routing.md",
  "plugins/agent-harness/references/gate-results.md",
  "plugins/agent-harness/templates/spec.md",
  "plugins/agent-harness/templates/goal.md",
  "plugins/agent-harness/skills/orient/SKILL.md",
  "plugins/agent-harness/skills/execute/SKILL.md"
];
for (const file of designPrincipleFiles) {
  const content = readFileSync(join(repoRoot, file), "utf8");
  assert(
    /evidence|route|competition|project-neutral|packaging/i.test(content),
    `${file} should carry design principle language`
  );
}
const schemaPath = join(repoRoot, "plugins/agent-harness/schemas/config.schema.json");
assert(existsSync(schemaPath), "config schema should be packaged with the plugin");
const configSchema = readJson(schemaPath);
assert(configSchema.properties.contract.enum.includes("fixed"), "config schema should include fixed contract");
assert(configSchema.properties.contract.enum.includes("adapter"), "config schema should include adapter contract");
assert(
  configSchema.properties.gates.properties.requiredForCompletion.type === "array",
  "config schema should support adapter-required completion gates"
);
assert(
  configSchema.properties.gates.properties.blocking.type === "array",
  "config schema should support blocking gates"
);
const examplesDoc = readFileSync(join(repoRoot, "docs/examples/downstream-project-shapes.md"), "utf8");
for (const needle of ["New Adapter Project", "Existing Adapter Project", "Non-Harness Project", "Messy Realistic Project"]) {
  assertIncludes(examplesDoc, needle, "downstream project shape examples should cover representative shapes");
}
const evalDoc = readFileSync(join(repoRoot, "evals/README.md"), "utf8");
for (const needle of ["new-project", "legacy-project", "non-harness-project", "messy-realistic", "Semi-Automatic Scoring"]) {
  assertIncludes(evalDoc, needle, "eval blueprint should cover required fixture and scoring shape");
}
const neutralFiles = [
  join(repoRoot, "README.md"),
  join(repoRoot, "README.zh-CN.md"),
  ...collectFiles(join(repoRoot, "docs"), (path) => path.endsWith(".md")),
  ...collectFiles(join(repoRoot, "evals"), (path) => path.endsWith(".md")),
  ...collectFiles(join(repoRoot, "plugins/agent-harness"), (path) => /\.(md|json|mjs)$/.test(path))
];
for (const file of neutralFiles) {
  const content = readFileSync(file, "utf8");
  assert(!/~\/project|\/Users\//i.test(content), `${file} should not expose local paths`);
  const relativeFile = file.startsWith(repoRoot) ? file.slice(repoRoot.length + 1) : file;
  const allowsB3ehiveAttribution = ["README.md", "README.zh-CN.md"].includes(relativeFile);
  if (!allowsB3ehiveAttribution) {
    assert(!/b3ehive/i.test(content), `${file} should stay project-neutral`);
  }
}
const rootReadme = readFileSync(join(repoRoot, "README.md"), "utf8");
const rootReadmeZh = readFileSync(join(repoRoot, "README.zh-CN.md"), "utf8");
const cliDoc = readFileSync(join(repoRoot, "docs/cli.md"), "utf8");
const cliDocZh = readFileSync(join(repoRoot, "docs/cli.zh-CN.md"), "utf8");
assertIncludes(rootReadme, "## Use With A Coding Agent", "README should present a coding-agent-first entry path");
assertIncludes(rootReadme, "docs/cli.md", "README should link to the detailed CLI reference");
assertIncludes(rootReadmeZh, "docs/cli.zh-CN.md", "zh-CN README should link to the detailed CLI reference");
assertExcludes(rootReadme, "## First Commands", "README should not lead with terminal-first commands");
assertExcludes(rootReadme, "## Command Language", "README should keep CLI language details in docs");
assertExcludes(rootReadmeZh, "## Command Language", "zh-CN README should keep CLI language details in docs");
assertExcludes(
  rootReadme,
  "node plugins/agent-harness/scripts/agent-harness.mjs",
  "README should not carry the detailed CLI command catalog"
);
assertExcludes(
  rootReadmeZh,
  "node plugins/agent-harness/scripts/agent-harness.mjs",
  "zh-CN README should not carry the detailed CLI command catalog"
);
assertIncludes(rootReadme, "They are not installed as", "README should explain source adapter artifacts are not installed plugin content");
assertIncludes(cliDoc, "--gate-evidence", "CLI reference should document gate-only run evidence");
assertIncludes(cliDocZh, "--gate-evidence", "zh-CN CLI reference should document gate-only run evidence");
assertIncludes(cliDoc, "run node record", "CLI reference should document DAG node result recording");
assertIncludes(cliDocZh, "run node record", "zh-CN CLI reference should document DAG node result recording");
const projectContractDoc = readFileSync(join(repoRoot, "docs/project-contract.md"), "utf8");
for (const needle of ["## Conversation Reconciliation Rules", "## Execution Role Rules", "`gate-only`", "`implementer`", "`mixed`", "## Conversation Route And Execution Context Lock", "## Delivery State Gate", "## Agent-Neutral Delegation Rules", "`dag.json`"]) {
  assertIncludes(projectContractDoc, needle, "project contract should document execution roles");
}
const executeSkillDoc = readFileSync(join(repoRoot, "plugins/agent-harness/skills/execute/SKILL.md"), "utf8");
for (const needle of ["gate-only", "implementer", "mixed", "main control", "Execution Context Lock", "Delivery State", "--gate-evidence", "run node record"]) {
  assertIncludes(executeSkillDoc, needle, "execute skill should route control/gate requests by execution role");
}
const goalTemplateDoc = readFileSync(join(repoRoot, "plugins/agent-harness/templates/goal.md"), "utf8");
assertIncludes(goalTemplateDoc, "## Execution Role", "goal template should include an execution role section");
assertIncludes(goalTemplateDoc, "## Conversation Route", "goal template should include conversation route section");
assertIncludes(goalTemplateDoc, "## Execution Context Lock", "goal template should include execution context lock section");
assertIncludes(goalTemplateDoc, "## Delivery State", "goal template should include delivery state section");
const cliSource = readFileSync(cli, "utf8");
assertIncludes(cliSource, "## Execution Role", "goal generator should include an execution role section");
assertIncludes(cliSource, "## Conversation Route", "goal generator should include conversation route section");
assertIncludes(cliSource, "deliveryState", "run status should expose delivery state");
assertIncludes(cliSource, "deliveryPolicy", "run status should expose delivery target policy");
assertIncludes(cliSource, "Delivery target gate failed", "run record should enforce delivery target");
assertIncludes(cliSource, "gate-evidence", "run record should expose gate evidence input");
assertIncludes(cliSource, "dag.json", "run prepare should expose execution DAG artifacts");

const suiteDir = mkdtempSync(join(tmpdir(), "agent-harness-smoke-"));

try {
  const fixed = join(suiteDir, "fixed");
  mkdirSync(fixed, { recursive: true });
  run(["init", "--cwd", fixed]);
  assert(existsSync(join(fixed, "harness/tasks.md")), "fixed init should create harness/tasks.md");
  assert(existsSync(join(fixed, ".harness/config.json")), "fixed init should create config");
  assert(existsSync(join(fixed, "harness/status.md")), "fixed init should create status");
  assertIncludes(run(["doctor", "--cwd", fixed]), "Harness contract: fixed", "fixed doctor should report fixed mode");
  assertIncludes(run(["config", "validate", "--cwd", fixed]), "Result: ok", "fixed config should validate");
  assert(JSON.parse(run(["config", "validate", "--cwd", fixed, "--json"])).ok === true, "fixed config validation json should pass");
  write(join(fixed, "harness/specs/fixed.md"), "# Fixed Spec\n\nStatus: accepted\n");
  run(["goal", "create", "--cwd", fixed, "--task", "Define the next concrete task", "--spec", "harness/specs/fixed.md"]);
  const fixedGoal = latestFile(join(fixed, "harness/goals"));
  const fixedGoalValidation = JSON.parse(run(["goal", "validate", "--cwd", fixed, "--goal", fixedGoal, "--json"]));
  assert(fixedGoalValidation.ok === true, "fixed goal with confirmed spec should validate");
  run(["run", "prepare", "--cwd", fixed, "--goal", fixedGoal]);
  assert(readdirSync(join(fixed, ".harness/runs")).length > 0, "fixed run packet should use fixed runs dir");
  const fixedRun = readdirSync(join(fixed, ".harness/runs")).sort().at(-1);
  const fixedRunStatus = readJson(join(fixed, ".harness/runs", fixedRun, "status.json"));
  assert(fixedRunStatus.executionRole === "implementer", "run prepare should record generated goal execution role");
  run([
    "run",
    "record",
    "--cwd",
    fixed,
    "--run",
    join(".harness/runs", fixedRun),
    "--phase",
    "completed",
    "--summary",
    "fixed run completed",
    "--verification",
    "fixed smoke verification passed"
  ]);
  const fixedStatusBeforeMaintain = readFileSync(join(fixed, "harness/status.md"), "utf8");
  const fixedMaintainPreview = JSON.parse(run(["maintain", "tasks", "--cwd", fixed, "--json"]));
  assert(fixedMaintainPreview.writesFiles === false, "maintain preview should not write files");
  assert(
    fixedMaintainPreview.proposed.actions.some((action) => action.kind === "task-completion"),
    "maintain should propose exact completed-run task completion"
  );
  assert(
    readFileSync(join(fixed, "harness/status.md"), "utf8") === fixedStatusBeforeMaintain,
    "maintain preview should leave status unchanged"
  );
  const fixedMaintainRecord = JSON.parse(run(["maintain", "tasks", "--cwd", fixed, "--record", "--json"]));
  assert(fixedMaintainRecord.writesFiles === true, "maintain record should write files");
  assert(fixedMaintainRecord.record.statusWritten === true, "maintain record should write status snapshot");
  assert(fixedMaintainRecord.record.taskIndexWritten === true, "maintain record should update exact markdown task completion");
  assertIncludes(
    readFileSync(join(fixed, "harness/tasks.md"), "utf8"),
    "- [x] P1 Define the next concrete task",
    "maintain record should move exact completed task to Done"
  );
  assertIncludes(
    readFileSync(join(fixed, "harness/status.md"), "utf8"),
    "## Maintenance Snapshot",
    "maintain record should append status maintenance snapshot"
  );
  const fixedRecordIntake = JSON.parse(run([
    "intake",
    "idea",
    "--cwd",
    fixed,
    "--idea",
    "Add user-facing import wizard",
    "--priority",
    "P1",
    "--section",
    "Now",
    "--record",
    "--json"
  ]));
  assert(fixedRecordIntake.writesFiles === true, "intake record should write markdown task index");
  assert(fixedRecordIntake.record.written === true, "intake record should report written=true");
  assertIncludes(
    readFileSync(join(fixed, "harness/tasks.md"), "utf8"),
    "- [ ] P1 Add user-facing import wizard",
    "intake record should append markdown task entry"
  );

  const adapter = join(suiteDir, "adapter-default");
  mkdirSync(adapter, { recursive: true });
  run(["init", "--cwd", adapter, "--contract", "adapter"]);
  assert(existsSync(join(adapter, "harness/tasks.md")), "adapter default init should create harness/tasks.md");
  assert(existsSync(join(adapter, "harness/README.md")), "adapter default init should create adapter docs");
  assert(existsSync(join(adapter, "harness/mental-models/README.md")), "adapter default init should create mental model index");
  assert(existsSync(join(adapter, "harness/mental-models/01-user-scenario.md")), "adapter default init should create user/scenario model");
  assert(existsSync(join(adapter, "harness/mental-models/02-work-unit.md")), "adapter default init should create work unit model");
  assert(existsSync(join(adapter, "harness/mental-models/03-control-loop-handoff.md")), "adapter default init should create control loop model");
  assert(existsSync(join(adapter, "harness/mental-models/04-ownership-boundary.md")), "adapter default init should create ownership model");
  write(join(adapter, "harness/specs/default.md"), "# Spec\n\nStatus: accepted\n");
  const adapterInspect = JSON.parse(run(["config", "inspect", "--cwd", adapter, "--json"]));
  assert(adapterInspect.contract === "adapter", "adapter inspect should report adapter contract");
  assert(adapterInspect.paths.taskIndex === "harness/tasks.md", "adapter default task index should be harness/tasks.md");
  assert(adapterInspect.configValidation.ok === true, "adapter inspect should include config validation");
  assert(JSON.parse(run(["config", "validate", "--cwd", adapter, "--json"])).ok === true, "adapter default config should validate");
  const adapterActivation = run(["activation", "snippet", "--cwd", adapter]);
  assertIncludes(adapterActivation, "Agent Harness activation snippet", "activation snippet should print heading");
  assertIncludes(adapterActivation, "harness/tasks.md", "activation snippet should include default task index");
  assertIncludes(adapterActivation, "harness/status.md", "activation snippet should include default status");
  assert(!existsSync(join(adapter, "AGENTS.md")), "activation snippet should not write AGENTS.md");
  const adapterOrient = run(["orient", "next", "--cwd", adapter]);
  assertIncludes(adapterOrient, "Agent Harness orientation", "orient next should print heading");
  assertIncludes(adapterOrient, "Define the next concrete task", "orient next should include default ready task");
  assertIncludes(adapterOrient, "This command is read-only", "orient next should report read-only behavior");
  const adapterOrientJson = JSON.parse(run(["orient", "next", "--cwd", adapter, "--json"]));
  assert(adapterOrientJson.tasks.ready[0].title === "Define the next concrete task", "orient json should expose ready task");
  assert(adapterOrientJson.recommendation.title === "Define the next concrete task", "orient json should recommend ready task");
  const adapterTasksBeforeIntake = readFileSync(join(adapter, "harness/tasks.md"), "utf8");
  const adapterIntakePreview = JSON.parse(run([
    "intake",
    "idea",
    "--cwd",
    adapter,
    "--idea",
    "Add user-facing import wizard",
    "--json"
  ]));
  assert(adapterIntakePreview.writesFiles === false, "intake preview should not write files");
  assert(adapterIntakePreview.suggested.title === "Add user-facing import wizard", "intake should suggest title from idea");
  assert(
    readFileSync(join(adapter, "harness/tasks.md"), "utf8") === adapterTasksBeforeIntake,
    "intake preview should leave task index unchanged"
  );
  const adapterDuplicateIntake = JSON.parse(run([
    "intake",
    "idea",
    "--cwd",
    adapter,
    "--idea",
    "Define the next concrete task",
    "--json"
  ]));
  assert(
    ["duplicate", "related"].includes(adapterDuplicateIntake.suggested.classification),
    "intake should detect duplicate or related tasks"
  );
  assertIncludes(
    runFails(["intake", "idea", "--cwd", adapter, "--idea", "Add table-backed intake record", "--record"]),
    "Refusing to record into table-based task index",
    "intake record should refuse default adapter table task index"
  );
  const adapterDryRun = run([
    "goal",
    "create",
    "--cwd",
    adapter,
    "--task",
    "Define the next concrete task",
    "--spec",
    "harness/specs/default.md",
    "--dry-run"
  ]);
  assertIncludes(adapterDryRun, "harness/README.md", "adapter goal should reference adapter docs");
  assertExcludes(
    adapterDryRun,
    "plugins/agent-harness/references/",
    "adapter goal should not reference plugin source paths"
  );

  const custom = join(suiteDir, "adapter-custom");
  mkdirSync(custom, { recursive: true });
  write(join(custom, ".harness/config.json"), `${JSON.stringify({
    contract: "adapter",
    projectName: "custom",
    adapter: {
      docs: "harness/README.md",
      machineReadable: ".harness/config.json",
      preflight: ["Confirm paid provider calls before execution."],
      stateSync: ["Update todolist.md and custom/status.md after completion."]
    },
    paths: {
      taskIndex: "todolist.md",
      status: "custom/status.md",
      specs: "harness/specs",
      goals: "custom/goals",
      milestones: "harness/milestones",
      runs: "custom/runs",
      gateRecords: "custom/runs",
      deferredRegister: "harness/milestones",
      mentalModels: "harness/mental-models",
      mentalModelIndex: "harness/mental-models/README.md"
    },
    language: {
      default: "auto"
    },
    workMode: {
      defaultPolicy: "ask"
    }
  }, null, 2)}\n`);
  write(join(custom, "harness/README.md"), "# Harness Adapter\n");
  write(join(custom, "custom/status.md"), "# Status\n");
  write(join(custom, "harness/specs/custom.md"), "# Custom Spec\n\nStatus: accepted\n");
  write(join(custom, "harness/goals/context.md"), "# Linked Context\n");
  mkdirSync(join(custom, "harness/milestones"), { recursive: true });
  mkdirSync(join(custom, "custom/runs"), { recursive: true });
  write(join(custom, "todolist.md"), `# Todo List

| Task | Type | Status | Priority | Doc |
| --- | --- | --- | --- | --- |
| Ship custom path behavior | dev | todo | P1 | [harness/specs/custom.md](harness/specs/custom.md) / [harness/goals/context.md](harness/goals/context.md) |
| Wait for upstream decision | dev | blocked | P2 |  |
`);
  const customActivation = run(["activation", "snippet", "--cwd", custom]);
  assertIncludes(customActivation, "todolist.md", "custom activation should include custom task index");
  assertIncludes(customActivation, "custom/status.md", "custom activation should include custom status file");
  assert(!existsSync(join(custom, "AGENTS.md")), "custom activation snippet should not write AGENTS.md");
  assert(JSON.parse(run(["config", "validate", "--cwd", custom, "--json"])).ok === true, "custom adapter config should validate");
  const customActivationJson = JSON.parse(run(["activation", "snippet", "--cwd", custom, "--json"]));
  assert(customActivationJson.writesFiles === false, "activation json should report writesFiles=false");
  assertIncludes(customActivationJson.snippet, "todolist.md", "activation json snippet should include custom task index");
  const customOrient = run(["orient", "next", "--cwd", custom]);
  assertIncludes(customOrient, "Ship custom path behavior", "custom orient should include ready custom task");
  assertIncludes(customOrient, "Wait for upstream decision", "custom orient should include blocked custom task");
  const customOrientJson = JSON.parse(run(["orient", "next", "--cwd", custom, "--json"]));
  assert(customOrientJson.paths.taskIndex === "todolist.md", "orient json should use custom task index");
  assert(customOrientJson.recommendation.title === "Ship custom path behavior", "orient json should recommend custom ready task");
  assert(customOrientJson.tasks.blocked[0].title === "Wait for upstream decision", "orient json should expose blocked tasks");
  assertIncludes(
    runFails(["intake", "idea", "--cwd", custom, "--idea", "Add table-backed intake record", "--record"]),
    "Refusing to record into table-based task index",
    "intake record should refuse table-based task indexes"
  );
  const customGoalDryRun = run([
    "goal",
    "create",
    "--cwd",
    custom,
    "--task",
    "Ship custom path behavior",
    "--spec",
    "harness/specs/custom.md",
    "--dry-run"
  ]);
  assertIncludes(customGoalDryRun, "`todolist.md`", "custom goal should include custom task index");
  assertIncludes(customGoalDryRun, "`custom/status.md`", "custom goal should include custom status file");
  assertIncludes(customGoalDryRun, "`harness/goals/context.md`", "custom goal should include linked Doc path");
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
    "harness/specs/custom.md"
  ]);
  const customGoal = latestFile(join(custom, "custom/goals"));
  const customGoalList = JSON.parse(run(["goal", "list", "--cwd", custom, "--json"]));
  assert(customGoalList.goals.length === 1, "goal list should include generated custom goal");
  assert(customGoalList.goals[0].valid === true, "goal list should expose validation state");
  const customGoalInspect = JSON.parse(run(["goal", "inspect", "--cwd", custom, "--goal", customGoal, "--json"]));
  assert(customGoalInspect.spec === "harness/specs/custom.md", "goal inspect should expose referenced spec");
  assert(customGoalInspect.executionRole === "implementer", "goal inspect should expose generated execution role");
  assert(customGoalInspect.conversationRoute === "current-thread", "goal inspect should expose generated conversation route");
  assert(customGoalInspect.validation.ok === true, "goal inspect should include validation result");
  const customGoalValidate = JSON.parse(run(["goal", "validate", "--cwd", custom, "--goal", customGoal, "--json"]));
  assert(customGoalValidate.ok === true, "goal validate should pass for generated custom goal");
  assert(customGoalValidate.goal.executionRole === "implementer", "goal validate should expose execution role");
  assert(customGoalValidate.goal.conversationRoute === "current-thread", "goal validate should expose conversation route");
  assert(customGoalValidate.goal.executionContextLock.executionCwd === custom, "goal validate should expose execution cwd lock");
  assert(customGoalValidate.goal.deliveryPolicy.target === "validated-local", "goal validate should expose delivery target");
  run(["run", "prepare", "--cwd", custom, "--goal", customGoal]);
  const customRuns = readdirSync(join(custom, "custom/runs")).sort();
  assert(customRuns.length > 0, "adapter run packet should use custom runs dir");
  const customRunStatus = readJson(join(custom, "custom/runs", customRuns[0], "status.json"));
  assert(customRunStatus.harnessContract === "adapter", "run status should record adapter mode");
  assert(customRunStatus.executionRole === "implementer", "run status should record execution role");
  assert(customRunStatus.conversationRoute === "current-thread", "run status should record conversation route");
  assert(customRunStatus.executionContextLock.executionCwd === custom, "run status should record execution cwd lock");
  assert(customRunStatus.deliveryState.state, "run status should record delivery state");
  assert(customRunStatus.deliveryPolicy.target === "validated-local", "run status should record delivery target");
  const customRunStatusJson = JSON.parse(run(["run", "status", "--cwd", custom, "--run", join("custom/runs", customRuns[0]), "--json"]));
  assert(customRunStatusJson.deliveryState.state === customRunStatus.deliveryState.state, "run status json should expose delivery state");
  assert(customRunStatusJson.deliveryPolicy.target === "validated-local", "run status json should expose delivery target");
  assertIncludes(
    runFails([
      "run",
      "record",
      "--cwd",
      custom,
      "--run",
      join("custom/runs", customRuns[0]),
      "--phase",
      "completed",
      "--summary",
      "missing verification"
    ]),
    "Completed runs require --verification",
    "completed run record should require verification evidence"
  );
  const committedTargetGoal = readFileSync(customGoal, "utf8")
    .replace("Target delivery state: `validated-local`", "Target delivery state: `committed`")
    .replace("Commit authorized: `no`", "Commit authorized: `yes`");
  write(join(custom, "custom/goals/committed-target.md"), committedTargetGoal);
  const committedTargetValidate = JSON.parse(run(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/committed-target.md", "--json"]));
  assert(committedTargetValidate.ok === true, "committed delivery target with commit authorization should validate");
  run(["run", "prepare", "--cwd", custom, "--goal", "custom/goals/committed-target.md"]);
  const committedTargetRun = readdirSync(join(custom, "custom/runs")).filter((name) => name.endsWith("-committed-target")).sort().at(-1);
  assert(committedTargetRun, "committed target run should be prepared");
  completeReadyDagNodes(custom, join("custom/runs", committedTargetRun), "committed-target");
  assertIncludes(
    runFails([
      "run",
      "record",
      "--cwd",
      custom,
      "--run",
      join("custom/runs", committedTargetRun),
      "--phase",
      "completed",
      "--summary",
      "verified but not delivered",
      "--verification",
      "verification passed"
    ]),
    "Delivery target gate failed",
    "completed run record should reject delivery state below target"
  );
  completeReadyDagNodes(custom, join("custom/runs", customRuns[0]), "custom");
  const completedRecord = JSON.parse(run([
    "run",
    "record",
    "--cwd",
    custom,
    "--run",
    join("custom/runs", customRuns[0]),
    "--phase",
    "completed",
    "--summary",
    "custom run completed",
    "--verification",
    "smoke verification passed",
    "--json"
  ]));
  assert(completedRecord.phase === "completed", "run record should report completed phase");
  assert(completedRecord.deliveryState.state, "run record should report delivery state");
  assert(existsSync(join(custom, completedRecord.log)), "run record should write completed log");
  const completedRunStatus = readJson(join(custom, "custom/runs", customRuns[0], "status.json"));
  assert(completedRunStatus.phase === "completed", "run record should update status phase");
  assert(completedRunStatus.summary === "custom run completed", "run record should update summary");
  assert(completedRunStatus.verificationSummary === "smoke verification passed", "run record should update verification summary");
  assert(completedRunStatus.deliveryState.state, "run record should persist delivery state");
  assertIncludes(
    readFileSync(join(custom, completedRecord.log), "utf8"),
    "## Delivery State",
    "run record log should include delivery-state proof"
  );
  const customMaintainRecord = JSON.parse(run(["maintain", "tasks", "--cwd", custom, "--record", "--json"]));
  assert(customMaintainRecord.paths.taskIndex === "todolist.md", "maintain should use custom task index");
  assert(customMaintainRecord.paths.status === "custom/status.md", "maintain should use custom status path");
  assert(customMaintainRecord.paths.runs === "custom/runs", "maintain should use custom runs path");
  assert(customMaintainRecord.record.statusWritten === true, "maintain should write custom status snapshot");
  assert(customMaintainRecord.record.taskIndexRefused === true, "maintain should refuse unsafe table task-index completion writes");
  assertIncludes(
    readFileSync(join(custom, "custom/status.md"), "utf8"),
    "custom/runs",
    "maintain status snapshot should mention custom runs path"
  );
  run(["run", "prepare", "--cwd", custom, "--goal", customGoal]);
  const blockedRun = readdirSync(join(custom, "custom/runs")).sort().at(-1);
  const blockedRecord = JSON.parse(run([
    "run",
    "record",
    "--cwd",
    custom,
    "--run",
    join("custom/runs", blockedRun),
    "--phase",
    "blocked",
    "--summary",
    "custom run blocked",
    "--json"
  ]));
  assert(blockedRecord.phase === "blocked", "run record should report blocked phase");
  assert(existsSync(join(custom, blockedRecord.log)), "run record should write blocked log");

  const largeDagGoal = `# Goal: Large DAG Work

Spec: harness/specs/custom.md
Status: Ready for execution from confirmed spec.

## Source Task
- \`todolist.md\`: \`P1 Ship custom path behavior\`

## Read First
1. \`AGENTS.md\`
2. \`todolist.md\`
3. \`harness/README.md\`
4. \`.harness/config.json\`
5. \`custom/status.md\`
6. \`harness/specs/custom.md\`
7. \`harness/goals/context.md\`
8. \`docs/project-contract.md\`
9. \`plugins/agent-harness/references/task-routing.md\`
10. \`plugins/agent-harness/references/controller-communication.md\`
11. \`plugins/agent-harness/skills/execute/SKILL.md\`
12. \`plugins/agent-harness/templates/goal.md\`
13. \`tests/smoke.mjs\`

## Work Mode Recommendation
Use \`worktree\`.

## Execution Role
Use \`implementer\`.

## Conversation Route
Use \`remote-control-worktree\`.

## Execution Context Lock
- Conversation lane: \`control-thread\`
- Controller thread: \`thread-large-dag-smoke\`
- Execution cwd: \`${custom}\`
- Execution branch: \`smoke-worktree\`
- Execution slot: \`custom\`
- Remote-control worktree: \`yes\`

## Delivery State
- Target delivery state: \`validated-local\`
- Commit authorized: \`no\`
- Push authorized: \`no\`
- PR authorized: \`no\`
- Merge authorized: \`no\`
- Release authorized: \`no\`

## Scope
- Update CLI behavior.
- Update DAG artifacts.
- Update node prompts.
- Update run status.
- Update run record gates.
- Update docs.
- Update skills.
- Update templates.
- Update smoke tests.
- Preserve adapter paths.

## Non-Goals
- Do not push, deploy, publish, or open a PR.

## Verification
Manual verification evidence only.

## Completion Conditions
- DAG nodes are complete.

## Pause Conditions
- Pause on spec conflicts or newer instructions.
- Pause for credentials or paid APIs.
- Pause for destructive or production actions.
- Pause for product direction.
`;
  write(join(custom, "custom/goals/large-dag.md"), largeDagGoal);
  run(["run", "prepare", "--cwd", custom, "--goal", "custom/goals/large-dag.md"]);
  const largeDagRun = readdirSync(join(custom, "custom/runs")).filter((name) => name.endsWith("-large-dag")).sort().at(-1);
  const largeDagRunRel = join("custom/runs", largeDagRun);
  const largeDagRunDir = join(custom, largeDagRunRel);
  const largeDagStatus = readJson(join(largeDagRunDir, "status.json"));
  assert(largeDagStatus.taskSize === "large", "large DAG fixture should classify as large");
  assert(largeDagStatus.conversationRoute === "remote-control-worktree", "worktree run should record remote-control route");
  assert(largeDagStatus.executionContextLock.remoteControlWorktree === "yes", "worktree run should record remote-control lock");
  assert(largeDagStatus.deliveryState.state, "worktree run should record delivery state");
  assert(largeDagStatus.executionDag.enforced === true, "large DAG run should enforce node completion before run completion");
  assert(existsSync(join(largeDagRunDir, "dag.json")), "run prepare should write machine-readable DAG");
  assert(existsSync(join(largeDagRunDir, "dag.md")), "run prepare should write human-readable DAG");
  assert(existsSync(join(largeDagRunDir, "agents/explorer/prompt.md")), "run prepare should write explorer prompt");
  assert(existsSync(join(largeDagRunDir, "agents/cli-contract-worker/prompt.md")), "run prepare should write parallel worker prompt");
  const largeDagStatusJson = JSON.parse(run(["run", "status", "--cwd", custom, "--run", largeDagRunRel, "--json"]));
  assert(
    JSON.stringify(largeDagStatusJson.executionDag.readyNodes) === JSON.stringify(["explorer"]),
    "large DAG should initially expose only explorer as ready"
  );
  assertIncludes(
    runFails([
      "run",
      "record",
      "--cwd",
      custom,
      "--run",
      largeDagRunRel,
      "--phase",
      "completed",
      "--summary",
      "premature completion",
      "--verification",
      "verification passed"
    ]),
    "Completed DAG runs require every execution DAG node",
    "large DAG run completion should wait for all DAG nodes"
  );
  assertIncludes(
    runFails([
      "run",
      "node",
      "record",
      "--cwd",
      custom,
      "--run",
      largeDagRunRel,
      "--node",
      "cli-contract-worker",
      "--phase",
      "completed",
      "--summary",
      "worker tried to finish early",
      "--verification",
      "worker verification"
    ]),
    "cannot complete before dependencies",
    "DAG node record should enforce dependencies"
  );
  const explorerNode = JSON.parse(run([
    "run",
    "node",
    "record",
    "--cwd",
    custom,
    "--run",
    largeDagRunRel,
    "--node",
    "explorer",
    "--phase",
    "completed",
    "--summary",
    "explorer mapped ownership",
    "--verification",
    "read-only review completed",
    "--thread",
    "thread-explorer",
    "--surface",
    "codex-app-create-thread",
    "--json"
  ]));
  assert(
    JSON.stringify(explorerNode.readyNodes) === JSON.stringify(["cli-contract-worker", "docs-skill-worker"]),
    "DAG should release independent workers in parallel after explorer"
  );
  run([
    "run",
    "node",
    "record",
    "--cwd",
    custom,
    "--run",
    largeDagRunRel,
    "--node",
    "cli-contract-worker",
    "--phase",
    "completed",
    "--summary",
    "CLI worker completed",
    "--verification",
    "CLI smoke passed"
  ]);
  run([
    "run",
    "node",
    "record",
    "--cwd",
    custom,
    "--run",
    largeDagRunRel,
    "--node",
    "docs-skill-worker",
    "--phase",
    "completed",
    "--summary",
    "Docs worker completed",
    "--verification",
    "Docs smoke passed"
  ]);
  const workerDagStatus = JSON.parse(run(["run", "status", "--cwd", custom, "--run", largeDagRunRel, "--json"]));
  assert(
    JSON.stringify(workerDagStatus.executionDag.readyNodes) === JSON.stringify(["verification"]),
    "DAG should release verification after both parallel workers complete"
  );
  run([
    "run",
    "node",
    "record",
    "--cwd",
    custom,
    "--run",
    largeDagRunRel,
    "--node",
    "verification",
    "--phase",
    "completed",
    "--summary",
    "verification completed",
    "--verification",
    "all DAG checks passed"
  ]);
  const finalDagStatus = JSON.parse(run(["run", "status", "--cwd", custom, "--run", largeDagRunRel, "--json"]));
  assert(finalDagStatus.executionDag.allNodesCompleted === true, "DAG should report all nodes completed");
  const completedDagRecord = JSON.parse(run([
    "run",
    "record",
    "--cwd",
    custom,
    "--run",
    largeDagRunRel,
    "--phase",
    "completed",
    "--summary",
    "large DAG run accepted",
    "--verification",
    "all DAG checks passed",
    "--json"
  ]));
  assert(completedDagRecord.phase === "completed", "completed DAG run should record after all nodes complete");

  const invalidGoalDir = join(custom, "custom/goals");
  write(join(invalidGoalDir, "missing-spec.md"), `# Goal: Missing Spec

Spec: harness/specs/missing.md
Status: Ready for execution from confirmed spec.

## Source Task
- test

## Read First
1. \`harness/specs/missing.md\`

## Work Mode Recommendation
Use \`local\`.

## Scope
- test

## Non-Goals
- test

## Verification
Manual verification evidence only.

## Completion Conditions
- test

## Pause Conditions
- Pause on spec conflicts or newer instructions.
- Pause for credentials or paid APIs.
- Pause for destructive or production actions.
- Pause for product direction.
`);
  assertIncludes(
    runFails(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/missing-spec.md", "--json"]),
    "\"ok\": false",
    "missing spec should fail validation"
  );
  write(join(custom, "harness/specs/draft.md"), "# Draft Spec\n\nStatus: draft\n");
  write(join(invalidGoalDir, "draft-spec.md"), readFileSync(join(invalidGoalDir, "missing-spec.md"), "utf8").replace("harness/specs/missing.md", "harness/specs/draft.md"));
  assertIncludes(
    runFails(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/draft-spec.md", "--json"]),
    "Spec status is not confirmed",
    "draft spec should fail validation"
  );
  write(join(invalidGoalDir, "invalid-work-mode.md"), readFileSync(customGoal, "utf8").replace("Use `ask`", "Use `invalid`"));
  assertIncludes(
    runFails(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/invalid-work-mode.md", "--json"]),
    "Work Mode Recommendation",
    "invalid work mode should fail validation"
  );
  write(
    join(invalidGoalDir, "delivery-target-missing-auth.md"),
    readFileSync(customGoal, "utf8").replace("Target delivery state: `validated-local`", "Target delivery state: `PR-open`")
  );
  assertIncludes(
    runFails(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/delivery-target-missing-auth.md", "--json"]),
    "Delivery State target PR-open requires Commit authorized: yes",
    "delivery target beyond local should require matching authorization"
  );
  const worktreeMissingContextGoal = readFileSync(customGoal, "utf8")
    .replace("Use `ask`", "Use `worktree`")
    .replace(/## Conversation Route[\s\S]*?## Execution DAG/, "## Execution DAG");
  write(join(invalidGoalDir, "worktree-missing-context.md"), worktreeMissingContextGoal);
  assertIncludes(
    runFails(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/worktree-missing-context.md", "--json"]),
    "Worktree goals require a Conversation Route section",
    "worktree goals should require conversation route and execution context lock"
  );
  write(join(invalidGoalDir, "invalid-execution-role.md"), readFileSync(customGoal, "utf8").replace("Use `implementer`", "Use `observer`"));
  assertIncludes(
    runFails(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/invalid-execution-role.md", "--json"]),
    "Execution Role",
    "invalid execution role should fail validation"
  );
  write(join(invalidGoalDir, "gate-only.md"), readFileSync(customGoal, "utf8").replace("Use `implementer`", "Use `gate-only`"));
  const gateOnlyGoal = join("custom/goals", "gate-only.md");
  const gateOnlyValidate = JSON.parse(run(["goal", "validate", "--cwd", custom, "--goal", gateOnlyGoal, "--json"]));
  assert(gateOnlyValidate.ok === true, "gate-only goal should validate");
  run(["run", "prepare", "--cwd", custom, "--goal", gateOnlyGoal]);
  const gateOnlyRun = readdirSync(join(custom, "custom/runs")).filter((name) => name.endsWith("-gate-only")).sort().at(-1);
  assert(gateOnlyRun, "gate-only run should be prepared");
  assert(
    readJson(join(custom, "custom/runs", gateOnlyRun, "status.json")).executionRole === "gate-only",
    "gate-only run status should record execution role"
  );
  assertIncludes(
    runFails([
      "run",
      "record",
      "--cwd",
      custom,
      "--run",
      join("custom/runs", gateOnlyRun),
      "--phase",
      "completed",
      "--summary",
      "gate-only missing evidence",
      "--verification",
      "verification passed"
    ]),
    "Completed gate-only runs require --gate-evidence",
    "gate-only completion should require gate evidence"
  );
  completeReadyDagNodes(custom, join("custom/runs", gateOnlyRun), "gate-only");
  const gateOnlyRecord = JSON.parse(run([
    "run",
    "record",
    "--cwd",
    custom,
    "--run",
    join("custom/runs", gateOnlyRun),
    "--phase",
    "completed",
    "--summary",
    "gate-only accepted",
    "--verification",
    "verification passed",
    "--gate-evidence",
    "Reviewed implementer output and accepted run evidence",
    "--json"
  ]));
  assert(gateOnlyRecord.gateEvidence.includes("Reviewed implementer output"), "gate-only record should expose gate evidence");
  write(join(custom, "harness/specs/batch.md"), "# Batch Spec\n\nStatus: accepted\n\n## Goal\n\nComplete multiple source tasks as one batch.\n");
  const batchGoalBase = `# Goal: Batch Source Tasks

Spec: harness/specs/batch.md
Status: Ready for execution from confirmed spec.

## Source Task
- \`todolist.md\`: \`P1 Complete multiple source tasks\`

## Read First
1. \`harness/specs/batch.md\`

## Work Mode Recommendation
Use \`local\`.

## Execution Role
Use \`implementer\`.

## Scope
- Complete multiple source tasks as one batch.

## Non-Goals
- Do not push, deploy, publish, or open a PR.

## Verification
Manual verification evidence only.

## Completion Conditions
- Every source task acceptance is satisfied.

## Pause Conditions
- Pause on spec conflicts or newer instructions.
- Pause for credentials or paid APIs.
- Pause for destructive or production actions.
- Pause for product direction.
`;
  write(join(invalidGoalDir, "batch-missing-map.md"), batchGoalBase);
  assertIncludes(
    runFails(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/batch-missing-map.md", "--json"]),
    "Source Task Acceptance Map",
    "batch goals should require source task acceptance map"
  );
  const pendingMap = `## Source Task Acceptance Map

- Task: \`Move README CLI details\`
  - Acceptance: \`Root README keeps only a short CLI reference.\`
  - Evidence: \`TBD\`
  - Status: \`pending\`
  - Unblocker: \`N/A\`
- Task: \`Clarify packaging boundary\`
  - Acceptance: \`Docs explain source adapter artifacts are not installed plugin content.\`
  - Evidence: \`TBD\`
  - Status: \`pending\`
  - Unblocker: \`N/A\`

`;
  write(join(invalidGoalDir, "batch-pending-map.md"), batchGoalBase.replace("## Scope", `${pendingMap}## Scope`));
  const pendingBatchValidate = JSON.parse(run(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/batch-pending-map.md", "--json"]));
  assert(pendingBatchValidate.ok === true, "pending batch acceptance map should validate before execution");
  assert(pendingBatchValidate.goal.acceptanceMap.required === true, "batch goal should report acceptance map requirement");
  assert(pendingBatchValidate.goal.acceptanceMap.itemCount === 2, "batch goal should expose acceptance map item count");
  run(["run", "prepare", "--cwd", custom, "--goal", "custom/goals/batch-pending-map.md"]);
  const pendingBatchRun = readdirSync(join(custom, "custom/runs")).filter((name) => name.endsWith("-batch-pending-map")).sort().at(-1);
  assert(pendingBatchRun, "pending batch run should be prepared");
  const pendingBatchRunStatus = readJson(join(custom, "custom/runs", pendingBatchRun, "status.json"));
  assert(pendingBatchRunStatus.acceptanceMapRequired === true, "run status should record required acceptance map");
  assert(pendingBatchRunStatus.acceptanceMapItemCount === 2, "run status should record acceptance map item count");
  assertIncludes(
    runFails([
      "run",
      "record",
      "--cwd",
      custom,
      "--run",
      join("custom/runs", pendingBatchRun),
      "--phase",
      "completed",
      "--summary",
      "batch completed without satisfied map",
      "--verification",
      "verification passed"
    ]),
    "Completed batch runs require Source Task Acceptance Map item",
    "completed batch run should require every acceptance map item to be satisfied"
  );
  const satisfiedMap = pendingMap
    .replaceAll("`TBD`", "`Verified by smoke fixture evidence`")
    .replaceAll("`pending`", "`satisfied`");
  write(join(invalidGoalDir, "batch-satisfied-map.md"), batchGoalBase.replace("## Scope", `${satisfiedMap}## Scope`));
  run(["run", "prepare", "--cwd", custom, "--goal", "custom/goals/batch-satisfied-map.md"]);
  const satisfiedBatchRun = readdirSync(join(custom, "custom/runs")).filter((name) => name.endsWith("-batch-satisfied-map")).sort().at(-1);
  const satisfiedBatchRecord = JSON.parse(run([
    "run",
    "record",
    "--cwd",
    custom,
    "--run",
    join("custom/runs", satisfiedBatchRun),
    "--phase",
    "completed",
    "--summary",
    "batch accepted with per-source evidence",
    "--verification",
    "verification passed",
    "--json"
  ]));
  assert(satisfiedBatchRecord.phase === "completed", "satisfied batch run should record completion");
  write(join(invalidGoalDir, "missing-section.md"), readFileSync(customGoal, "utf8").replace("## Completion Conditions", "## Completion Conditions Removed"));
  assertIncludes(
    runFails(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/missing-section.md", "--json"]),
    "Missing required section",
    "missing required section should fail validation"
  );
  assertIncludes(
    runFails(["run", "prepare", "--cwd", custom, "--goal", "custom/goals/missing-spec.md"]),
    "Goal validation failed",
    "run prepare should reject invalid goals"
  );

  const gated = join(suiteDir, "adapter-gated");
  mkdirSync(gated, { recursive: true });
  write(join(gated, ".harness/config.json"), `${JSON.stringify({
    contract: "adapter",
    projectName: "gated",
    adapter: {
      docs: "harness/README.md",
      machineReadable: ".harness/config.json"
    },
    paths: {
      taskIndex: "harness/tasks.md",
      status: "harness/status.md",
      specs: "harness/specs",
      goals: "harness/goals",
      milestones: "harness/milestones",
      runs: ".harness/runs",
      gateRecords: ".harness/runs",
      deferredRegister: "harness/milestones",
      mentalModels: "harness/mental-models",
      mentalModelIndex: "harness/mental-models/README.md"
    },
    gates: {
      enabled: ["spec", "execution", "integration", "content-quality", "source-coverage"],
      requiredForCompletion: ["content-quality"],
      blocking: ["source-coverage"],
      optional: []
    }
  }, null, 2)}\n`);
  write(join(gated, "harness/README.md"), "# Gated Adapter\n");
  write(join(gated, "harness/status.md"), "# Status\n");
  write(join(gated, "harness/specs/gated.md"), "# Gated Spec\n\nStatus: accepted\n");
  mkdirSync(join(gated, "harness/milestones"), { recursive: true });
  write(join(gated, "harness/tasks.md"), `# Tasks

## Now

- [ ] P1 Publish gated artifact.
  - Acceptance: Technical verification and adapter gates pass.
`);
  assert(JSON.parse(run(["config", "validate", "--cwd", gated, "--json"])).ok === true, "gated adapter config should validate");
  run([
    "goal",
    "create",
    "--cwd",
    gated,
    "--task",
    "Publish gated artifact",
    "--spec",
    "harness/specs/gated.md",
    "--work-mode",
    "local"
  ]);
  const gatedGoal = latestFile(join(gated, "harness/goals"));
  const gatedGoalContent = readFileSync(gatedGoal, "utf8");
  assertIncludes(gatedGoalContent, "Gate: `content-quality`", "generated goal should include required completion gate");
  assertIncludes(gatedGoalContent, "Gate: `source-coverage`", "generated goal should include blocking gate");
  const gatedGoalValidate = JSON.parse(run(["goal", "validate", "--cwd", gated, "--goal", gatedGoal, "--json"]));
  assert(gatedGoalValidate.ok === true, "pending required gate evidence should validate before execution");
  assert(gatedGoalValidate.goal.requiredGateEvidence.itemCount === 2, "goal validate should expose required gate evidence item count");
  run(["run", "prepare", "--cwd", gated, "--goal", gatedGoal]);
  const gatedRun = readdirSync(join(gated, ".harness/runs")).filter((name) => name.endsWith("-publish-gated-artifact")).sort().at(-1);
  const gatedRunStatus = readJson(join(gated, ".harness/runs", gatedRun, "status.json"));
  assert(
    JSON.stringify(gatedRunStatus.requiredGates) === JSON.stringify(["content-quality", "source-coverage"]),
    "run status should record adapter-required gates"
  );
  completeReadyDagNodes(gated, join(".harness/runs", gatedRun), "gated");
  assertIncludes(
    runFails([
      "run",
      "record",
      "--cwd",
      gated,
      "--run",
      join(".harness/runs", gatedRun),
      "--phase",
      "completed",
      "--summary",
      "technical verification passed but gates are pending",
      "--verification",
      "npm test passed"
    ]),
    "Required Gate Evidence validation failed",
    "completed run should reject pending adapter-required gate evidence"
  );
  const checklistItem = `- Item: \`Product acceptance checklist\`
  - Acceptance: \`Domain gate evidence must be reviewed before completion.\`
  - Evidence: \`TBD\`
  - Status: \`pending\`
  - Unblocker: \`N/A\`

`;
  write(gatedGoal, gatedGoalContent.replace("## Required Gate Evidence", `${checklistItem}## Required Gate Evidence`));
  run(["run", "prepare", "--cwd", gated, "--goal", gatedGoal]);
  const checklistRun = readdirSync(join(gated, ".harness/runs")).filter((name) => name.endsWith("-publish-gated-artifact")).sort().at(-1);
  completeReadyDagNodes(gated, join(".harness/runs", checklistRun), "checklist");
  assertIncludes(
    runFails([
      "run",
      "record",
      "--cwd",
      gated,
      "--run",
      join(".harness/runs", checklistRun),
      "--phase",
      "completed",
      "--summary",
      "technical verification passed but checklist is pending",
      "--verification",
      "npm test passed"
    ]),
    "Spec Acceptance Checklist validation failed",
    "completed run should reject pending spec acceptance checklist evidence"
  );
  write(gatedGoal, readFileSync(gatedGoal, "utf8")
    .replaceAll("`TBD`", "`Reviewed fixture gate evidence`")
    .replaceAll("`pending`", "`satisfied`"));
  run(["run", "prepare", "--cwd", gated, "--goal", gatedGoal]);
  const acceptedGatedRun = readdirSync(join(gated, ".harness/runs")).filter((name) => name.endsWith("-publish-gated-artifact")).sort().at(-1);
  completeReadyDagNodes(gated, join(".harness/runs", acceptedGatedRun), "accepted-gated");
  const acceptedGatedRecord = JSON.parse(run([
    "run",
    "record",
    "--cwd",
    gated,
    "--run",
    join(".harness/runs", acceptedGatedRun),
    "--phase",
    "completed",
    "--summary",
    "gated run accepted",
    "--verification",
    "npm test passed",
    "--json"
  ]));
  assert(acceptedGatedRecord.phase === "completed", "satisfied checklist and gate evidence should allow completion");

  const configuredInit = join(suiteDir, "configured-init-custom");
  mkdirSync(configuredInit, { recursive: true });
  write(join(configuredInit, ".harness/config.json"), `${JSON.stringify({
    contract: "adapter",
    projectName: "configured-init-custom",
    adapter: {
      docs: "project/harness.md",
      machineReadable: ".harness/config.json"
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
      mentalModels: "project/mental-models",
      mentalModelIndex: "project/mental-models/README.md"
    }
  }, null, 2)}\n`);
  run(["init", "--cwd", configuredInit, "--contract", "adapter"]);
  assertIncludes(run(["config", "validate", "--cwd", configuredInit]), "Result: ok", "configured init config should validate");
  assert(existsSync(join(configuredInit, "todo/custom.md")), "init should create configured task index");
  assert(existsSync(join(configuredInit, "state/status.md")), "init should create configured status file");
  assert(existsSync(join(configuredInit, "project/harness.md")), "init should create configured adapter docs");
  assert(existsSync(join(configuredInit, "project/specs")), "init should create configured specs dir");
  assert(existsSync(join(configuredInit, "project/goals")), "init should create configured goals dir");
  assert(existsSync(join(configuredInit, "project/milestones")), "init should create configured milestones dir");
  assert(existsSync(join(configuredInit, "runs")), "init should create configured runs dir");
  assert(existsSync(join(configuredInit, "project/mental-models/README.md")), "init should create configured mental model index");
  assert(existsSync(join(configuredInit, "project/mental-models/01-user-scenario.md")), "init should create configured user/scenario model");
  assert(existsSync(join(configuredInit, "project/mental-models/02-work-unit.md")), "init should create configured work unit model");
  assert(existsSync(join(configuredInit, "project/mental-models/03-control-loop-handoff.md")), "init should create configured control loop model");
  assert(existsSync(join(configuredInit, "project/mental-models/04-ownership-boundary.md")), "init should create configured ownership model");
  assert(!existsSync(join(configuredInit, "harness/tasks.md")), "init should not create default harness/tasks.md with existing custom config");
  assert(!existsSync(join(configuredInit, "harness/status.md")), "init should not create default status with existing custom config");
  assert(!existsSync(join(configuredInit, "harness/README.md")), "init should not create default adapter with existing custom config");
  assertIncludes(run(["doctor", "--cwd", configuredInit]), "Harness files: ok", "configured init should pass doctor");
  assertIncludes(
    runFails(["init", "--cwd", configuredInit, "--contract", "fixed"]),
    "Existing .harness/config.json is adapter; requested init contract is fixed",
    "init should fail on conflicting requested contract"
  );

  const malformed = join(suiteDir, "malformed-config");
  mkdirSync(join(malformed, ".harness"), { recursive: true });
  write(join(malformed, ".harness/config.json"), "{bad json");
  assertIncludes(
    runFails(["config", "validate", "--cwd", malformed, "--json"]),
    "\"ok\": false",
    "malformed config validate should fail clearly"
  );
  assertIncludes(
    runFails(["doctor", "--cwd", malformed]),
    "Could not parse .harness/config.json",
    "malformed config should fail clearly"
  );

  const invalidSchema = join(suiteDir, "invalid-schema-config");
  mkdirSync(join(invalidSchema, ".harness"), { recursive: true });
  write(join(invalidSchema, ".harness/config.json"), `${JSON.stringify({
    contract: "adapter",
    projectName: "invalid-schema-config",
    adapter: {
      docs: "/absolute/harness.md",
      machineReadable: ".harness/config.json"
    },
    paths: {
      taskIndex: "harness/tasks.md",
      status: "harness/status.md",
      specs: "harness/specs",
      goals: "harness/goals",
      milestones: "harness/milestones",
      runs: ".harness/runs"
    },
    workMode: {
      defaultPolicy: "teleport"
    }
  }, null, 2)}\n`);
  const invalidSchemaOutput = runFails(["config", "validate", "--cwd", invalidSchema, "--json"]);
  assertIncludes(invalidSchemaOutput, "\"ok\": false", "invalid schema config should fail json validation");
  assertIncludes(invalidSchemaOutput, "$.workMode.defaultPolicy must be one of", "invalid schema config should report enum errors");
  assertIncludes(invalidSchemaOutput, "$.adapter.docs must be a non-empty repo-relative path", "invalid schema config should reject absolute adapter path");
  assertIncludes(
    runFails(["doctor", "--cwd", invalidSchema]),
    "Config schema: failed",
    "doctor should report schema validation failure"
  );

  const optional = join(suiteDir, "missing-optional");
  mkdirSync(optional, { recursive: true });
  run(["init", "--cwd", optional, "--contract", "adapter"]);
  rmSync(join(optional, "harness/mental-models/README.md"), { force: true });
  const optionalDoctor = run(["doctor", "--cwd", optional]);
  assertIncludes(optionalDoctor, "Optional harness paths:", "doctor should report optional paths without failing");

  const discovered = join(suiteDir, "adapter-discovered");
  mkdirSync(discovered, { recursive: true });
  write(join(discovered, "harness/README.md"), "# Harness Adapter\n");
  write(join(discovered, "harness/specs/spec.md"), "# Spec\n");
  write(join(discovered, "harness/goals/goal.md"), "# Goal\n");
  mkdirSync(join(discovered, "harness/milestones"), { recursive: true });
  write(join(discovered, "todolist.md"), `# Todo List

| Task | Type | Status | Priority | Doc |
| --- | --- | --- | --- | --- |
| Existing adapter task | docs | goal-ready | P1 | [harness/specs/spec.md](harness/specs/spec.md) |
`);
  const discoveredDoctor = run(["doctor", "--cwd", discovered]);
  assertIncludes(discoveredDoctor, "Harness contract: adapter", "adapter project should be discovered as adapter");
  assertIncludes(discoveredDoctor, "Config source: discovered", "discovered project should report discovered config source");
  assertExcludes(discoveredDoctor, "tasks.md", "discovered project should not require default tasks.md");
  const discoveredInspect = JSON.parse(run(["config", "inspect", "--cwd", discovered, "--json"]));
  assert(discoveredInspect.paths.taskIndex === "todolist.md", "discovered task index should be todolist.md");
  const dryRunImport = JSON.parse(run(["config", "import", "--cwd", discovered, "--dry-run", "--json"]));
  assert(dryRunImport.dryRun === true, "import dry-run should report dryRun=true");
  assert(!existsSync(join(discovered, ".harness/config.json")), "import dry-run should not create config");
  assert(!existsSync(join(discovered, ".harness")), "import dry-run should not create .harness directory");
  const imported = JSON.parse(run(["config", "import", "--cwd", discovered, "--json"]));
  assert(imported.paths.taskIndex === "todolist.md", "import should preserve todolist.md task index");
  assert(existsSync(join(discovered, ".harness/config.json")), "import should create config");
  assert(existsSync(join(discovered, "harness/status.md")), "import should create configured status file");
  assert(existsSync(join(discovered, ".harness/runs")), "import should create configured runs dir");
  assert(existsSync(join(discovered, "harness/mental-models/README.md")), "import should create mental model index");
  assert(existsSync(join(discovered, "harness/mental-models/01-user-scenario.md")), "import should create user/scenario model");
  assert(existsSync(join(discovered, "harness/mental-models/02-work-unit.md")), "import should create work unit model");
  assert(existsSync(join(discovered, "harness/mental-models/03-control-loop-handoff.md")), "import should create control loop model");
  assert(existsSync(join(discovered, "harness/mental-models/04-ownership-boundary.md")), "import should create ownership model");
  assert(!existsSync(join(discovered, "harness/tasks.md")), "import should not create a second task index");
  assertIncludes(run(["doctor", "--cwd", discovered]), "Harness files: ok", "imported project should still pass doctor");

  const initExisting = join(suiteDir, "adapter-init-existing");
  mkdirSync(initExisting, { recursive: true });
  write(join(initExisting, "harness/README.md"), "# Harness Adapter\n");
  write(join(initExisting, "todolist.md"), "# Todo List\n");
  run(["init", "--cwd", initExisting, "--contract", "adapter"]);
  const initExistingConfig = readJson(join(initExisting, ".harness/config.json"));
  assert(initExistingConfig.paths.taskIndex === "todolist.md", "init should preserve existing todolist.md");
  assert(!existsSync(join(initExisting, "harness/tasks.md")), "init should not create harness/tasks.md when todolist.md already exists");

  const existingConfigPath = join(suiteDir, "existing-config-path");
  mkdirSync(existingConfigPath, { recursive: true });
  write(join(existingConfigPath, ".agent-harness/config.json"), `${JSON.stringify({
    contract: "fixed",
    projectName: "existing-config-path",
    paths: {
      tasks: "tasks.md",
      status: ".agent-harness/status.md",
      goals: ".agent-harness/goals",
      runs: ".agent-harness/runs"
    }
  }, null, 2)}\n`);
  write(join(existingConfigPath, "tasks.md"), "# Tasks\n");
  write(join(existingConfigPath, ".agent-harness/status.md"), "# Status\n");
  mkdirSync(join(existingConfigPath, ".agent-harness/goals"), { recursive: true });
  mkdirSync(join(existingConfigPath, ".agent-harness/runs"), { recursive: true });
  assertIncludes(run(["doctor", "--cwd", existingConfigPath]), "Harness files: ok", "existing config path should remain readable");

  console.log("Smoke tests passed.");
} finally {
  rmSync(suiteDir, { recursive: true, force: true });
}
