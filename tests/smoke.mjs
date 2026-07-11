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
const publicFocusOption = ["--", "focus"].join("");
const generatedContextFocusNeedle = "Normalize user intent to `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec` before choosing context focus";
const generatedExecuteFocusNeedle = "For execution, use the `execute` focus preset";
const generatedDegradedProvenanceNeedle = "When worker delegation falls back or the planned worker surface is unavailable or skipped";

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
assert(
  pluginManifest.interface.defaultPrompt.length <= 128,
  "plugin defaultPrompt should stay within the 128-character ingestion limit"
);
assert(
  packageManifest.scripts["deploy:local-plugin"] === "node tools/deploy-local-plugin.mjs",
  "package.json should expose the local plugin cache deploy script"
);
assert(
  packageManifest.scripts["test:protocol"] === "node scripts/test-suites.mjs protocol",
  "package.json should expose the protocol suite"
);
assert(
  packageManifest.scripts["test:presentation"] === "node scripts/test-suites.mjs presentation",
  "package.json should expose the presentation suite"
);
assert(
  packageManifest.scripts["test:all"] === "node scripts/test-suites.mjs all",
  "package.json should expose the aggregate local test route"
);
const deployLocalPluginScriptPath = join(repoRoot, "tools/deploy-local-plugin.mjs");
assert(existsSync(deployLocalPluginScriptPath), "local plugin deploy script should exist");
const deployLocalPluginScript = readFileSync(deployLocalPluginScriptPath, "utf8");
for (const needle of [
  "validate:plugin",
  "test:smoke",
  "codex",
  "plugin",
  "remove",
  "add",
  "pluginSelector",
  "personal",
  "User-Facing Summary",
  "Worker Runner Contract"
]) {
  assertIncludes(deployLocalPluginScript, needle, "local plugin deploy script should validate, reinstall, and verify cache sentinels");
}
const testSuitesScriptPath = join(repoRoot, "scripts/test-suites.mjs");
assert(existsSync(testSuitesScriptPath), "suite routing script should exist");
const testSuitesScript = readFileSync(testSuitesScriptPath, "utf8");
for (const needle of [
  "protocol",
  "presentation",
  "smoke",
  "plugin",
  "test:presentation",
  "test:smoke",
  "validate:plugin",
  "harness-rule:gate-only-controller",
  "harness-rule:terminology-boundary",
  "harness-rule:local-delivery-ceiling",
  "harness-rule:worker-surface-default",
  "harness-rule:child-controller-boundary",
  "harness-rule:degraded-execution-provenance",
  "harness-rule:controller-cancellation-boundary",
  "harness-rule:bounded-status-snapshot",
  "harness-rule:need-user-digest",
  "harness-rule:project-neutral-core",
  "harness-rule:state-sync-evidence",
  "harness-rule:level-0-fast-path",
  "harness-rule:context-focus-routing",
  "harness-rule:cybernetic-stability",
  "harness-rule:intent-setpoint-selection",
  "harness-rule:sensor-freshness",
  "harness-rule:measurement-snapshot",
  "harness-rule:remaining-gap",
  "harness-rule:feedback-quality",
  "harness-rule:stability-saturation"
]) {
  assertIncludes(testSuitesScript, needle, "suite routing script should map protocol, smoke, plugin, and rule-anchor checks");
}
const capabilityMatrix = readFileSync(join(repoRoot, "docs/HARNESSES.md"), "utf8");
for (const needle of [
  "Agent Harness Capability Matrix",
  "Runtime And Control Surfaces",
  "Suite Routing",
  "harness-rule:gate-only-controller",
  "harness-rule:terminology-boundary",
  "harness-rule:local-delivery-ceiling",
  "harness-rule:worker-surface-default",
  "harness-rule:child-controller-boundary",
  "harness-rule:degraded-execution-provenance",
  "harness-rule:controller-cancellation-boundary",
  "harness-rule:need-user-digest",
  "harness-rule:project-neutral-core",
  "harness-rule:state-sync-evidence",
  "harness-rule:level-0-fast-path",
  "harness-rule:context-focus-routing",
  "harness-rule:cybernetic-stability",
  "harness-rule:intent-setpoint-selection",
  "harness-rule:sensor-freshness",
  "harness-rule:measurement-snapshot",
  "harness-rule:remaining-gap",
  "harness-rule:feedback-quality",
  "harness-rule:stability-saturation",
  "npm run test:presentation",
  "npm run test:protocol",
  "npm run test:all"
]) {
  assertIncludes(capabilityMatrix, needle, "capability matrix should cover rule anchors, surfaces, and suite routing");
}
for (const [file, needle] of [
  ["README.md", "docs/assets/readme/adapter-model.svg"],
  ["README.md", "docs/assets/readme/adapter-artifact-map.svg"],
  ["README.md", "docs/assets/readme/adapter-execution-model.svg"],
  ["README.md", "## Use With A Coding Agent"],
  ["README.md", "docs/github-presentation.md"],
  ["README.md", "CHANGELOG.md"],
  ["README.md", "docs/releases/v0.6.0.md"],
  ["README.md", "docs/cybernetic-stability.md"],
  ["README.zh-CN.md", "docs/assets/readme/adapter-model.svg"],
  ["README.zh-CN.md", "docs/assets/readme/adapter-artifact-map.svg"],
  ["README.zh-CN.md", "docs/assets/readme/adapter-execution-model.svg"],
  ["README.zh-CN.md", "## 在项目中怎么用"],
  ["docs/github-presentation.md", "codex-plugin"],
  ["CHANGELOG.md", "## 0.6.0 - 2026-07-09"],
  ["docs/releases/v0.6.0.md", "Agent Harness v0.6.0"],
  ["docs/cybernetic-stability.md", "Cybernetic Stability Model"],
  ["docs/cybernetic-stability.md", "sensor freshness"],
  ["docs/cybernetic-stability.md", "measurement snapshot"],
  ["docs/cybernetic-stability.md", "remaining gap"],
  ["docs/cybernetic-stability.md", "feedback quality"],
  ["docs/cybernetic-stability.md", "stability/saturation"],
  ["docs/assets/github/social-preview.svg", "Agent Harness"],
  ["LICENSE", "MIT License"]
]) {
  assertIncludes(readFileSync(join(repoRoot, file), "utf8"), needle, `${file} should preserve GitHub presentation surface`);
}
const adapterModelDiagram = readFileSync(join(repoRoot, "docs/assets/readme/adapter-model.svg"), "utf8");
const adapterExecutionDiagram = readFileSync(join(repoRoot, "docs/assets/readme/adapter-execution-model.svg"), "utf8");
const adapterArtifactMapDiagram = readFileSync(join(repoRoot, "docs/assets/readme/adapter-artifact-map.svg"), "utf8");
for (const needle of ["Roadmap", "Milestone", "Goal", "Tasks", "Run", "Evidence"]) {
  assertIncludes(adapterModelDiagram, needle, "adapter model diagram should expose the current terminology hierarchy");
}
assertIncludes(
  adapterModelDiagram,
  "Roadmap -&gt; Milestone -&gt; Goal -&gt; Task -&gt; Run",
  "adapter model diagram should show the current terminology chain"
);
assertExcludes(
  adapterModelDiagram,
  "tasks, specs, goals, runs",
  "adapter model diagram should not preserve the old task-first artifact phrase"
);
for (const needle of ["Roadmap", "Milestone", "Goal", "Tasks", "Run", "Verify", "Gate", "Sync"]) {
  assertIncludes(adapterExecutionDiagram, needle, "adapter execution diagram should expose the current execution terminology");
}
assertIncludes(adapterExecutionDiagram, "Specs constrain Goals before execution", "execution diagram should place Spec constraints before execution");
assertIncludes(adapterArtifactMapDiagram, ".harness/config.json", "artifact map should use the configured Harness path");
assertExcludes(adapterArtifactMapDiagram, ".agent-harness/config.json", "artifact map should not use the obsolete config path");
for (const [file, needle] of [
  ["README.md", "docs/HARNESSES.md"],
  ["README.zh-CN.md", "docs/HARNESSES.md"],
  ["docs/install.md", "HARNESSES.md"],
  ["docs/install.zh-CN.md", "HARNESSES.md"],
  ["docs/cli.md", "HARNESSES.md"],
  ["docs/cli.zh-CN.md", "HARNESSES.md"],
  ["docs/project-contract.md", "HARNESSES.md"]
]) {
  assertIncludes(readFileSync(join(repoRoot, file), "utf8"), needle, `${file} should link the capability matrix`);
}
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
  orient: ["route-decision.md", "read-only-boundary.md", "user-facing-summary.md"],
  intake: ["capture-boundary.md", "promotion-rules.md"],
  execute: [
    "routing-boundaries.md",
    "execution-roles.md",
    "completion-evidence.md",
    "adversarial-acceptance.md",
    "user-facing-closeout.md"
  ]
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
const routeEntryMappingReference = readFileSync(join(repoRoot, "plugins/agent-harness/references/route-entry-mapping.md"), "utf8");
const projectContractReference = readFileSync(join(repoRoot, "docs/project-contract.md"), "utf8");
const firstPrinciplesScopeReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/references/first-principles-scope.md"),
  "utf8"
);
const workerRunnerContractReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/references/worker-runner-contract.md"),
  "utf8"
);
const workerPromptTemplate = readFileSync(
  join(repoRoot, "plugins/agent-harness/templates/worker-prompt.md"),
  "utf8"
);
const goalTemplateDoc = readFileSync(join(repoRoot, "plugins/agent-harness/templates/goal.md"), "utf8");
const orientRouteDecisionReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/skills/orient/references/route-decision.md"),
  "utf8"
);
const controllerCommunicationReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/references/controller-communication.md"),
  "utf8"
);
const gateResultsReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/references/gate-results.md"),
  "utf8"
);
const executionRolesReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/skills/execute/references/execution-roles.md"),
  "utf8"
);
const adversarialAcceptanceReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/skills/execute/references/adversarial-acceptance.md"),
  "utf8"
);
const userFacingCloseoutReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/skills/execute/references/user-facing-closeout.md"),
  "utf8"
);
const adoptionBoundaryReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/skills/init/references/adoption-boundary.md"),
  "utf8"
);
const intakePromotionReference = readFileSync(
  join(repoRoot, "plugins/agent-harness/skills/intake/references/promotion-rules.md"),
  "utf8"
);
for (const [route, entry] of [
  ["`shape`", "`harness:orient`"],
  ["`goal`", "`harness:execute`"],
  ["`competition`", "`harness:orient`"],
  ["`ask`", "Ask the smallest blocking question"]
]) {
  assertIncludes(routeEntryMappingReference, route, `route mapping should include ${route}`);
  assertIncludes(routeEntryMappingReference, entry, `route mapping should map ${route} to ${entry}`);
}
for (const [skillName, description] of Object.entries(workflowSkillDescriptions)) {
  assert(description.length > 0, `${skillName} description should not be empty`);
  assert(description.length <= 300, `${skillName} description should stay within the 300-character discovery budget`);
}
assertIncludes(workflowSkillDescriptions.execute, "authorized Agent Harness work", "execute should require authorization");
assertIncludes(workflowSkillDescriptions.execute, "ambiguous direction", "execute should exclude ambiguous direction");
assertIncludes(workflowSkillDescriptions.init, "not status routing", "init should not steal orientation");
assertIncludes(workflowSkillDescriptions.orient, "without mutation", "orient should remain read-only");
assertIncludes(workflowSkillDescriptions.intake, "without implementation", "intake should not execute work");
assertIncludes(
  workflowSkillDocs.execute.replace(/\s+/g, " "),
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
assertIncludes(workflowSkillDocs.execute, "Confirm scope, non-goals, verification", "execute should confirm boundaries before editing");
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
assertIncludes(intakePromotionReference, "If an item is missing", "intake promotion should not execute with missing boundaries");
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
  workflowSkillDocs.execute,
  "../../references/first-principles-scope.md",
  "execute should load first-principles scope before ambiguous execution"
);
assertIncludes(
  workflowSkillDocs.execute,
  "../../references/worker-runner-contract.md",
  "execute should load worker runner contract before worker launch or acceptance"
);
assertIncludes(
  workflowSkillDocs.execute,
  "../../references/controller-communication.md",
  "execute should load controller communication packets before worker handoff or acceptance"
);
assertIncludes(
  workflowSkillDocs.execute,
  "../../references/gate-results.md",
  "execute should load gate result rules before accepting gate or integration state"
);
assertIncludes(
  workflowSkillDocs.execute,
  "references/adversarial-acceptance.md",
  "execute should adversarially review completion before accepting state"
);
assertIncludes(
  workflowSkillDocs.execute,
  "references/user-facing-closeout.md",
  "execute should compress execution evidence into a user-facing closeout"
);
assertIncludes(
  workflowSkillDocs.execute,
  "Need user: None",
  "execute closeout guidance should state when no user action is needed"
);
assertIncludes(
  userFacingCloseoutReference,
  "Need user: <concrete decision, manual verification, authorization, external",
  "user-facing closeout should include a Need user line"
);
assertIncludes(
  userFacingCloseoutReference,
  "Remaining: <missing verification, delivery pending, follow-up, blocker, or",
  "user-facing closeout should separate Remaining from Need user"
);
assertIncludes(
  userFacingCloseoutReference,
  "Do not ask broad confirmation questions",
  "user-facing closeout should avoid routine confirmation questions"
);
assertIncludes(
  taskRoutingReference,
  "First-Principles Scope",
  "task-routing should expose the first-principles scope check"
);
assertIncludes(
  firstPrinciplesScopeReference,
  "Use this reference before routing ambiguous work",
  "first-principles scope reference should state when to load it"
);
assertIncludes(
  firstPrinciplesScopeReference,
  "route to `intake`, `shape`, `goal`, state sync, or\n`ask` before execution",
  "first-principles scope should route unclear work away from execution"
);
assertIncludes(
  workerRunnerContractReference,
  "Use this reference before launching, prompting, recording, or accepting",
  "worker runner contract should state when to load it"
);
assertIncludes(
  workerRunnerContractReference,
  "A worker is an execution surface that\nreturns candidate evidence to the controller",
  "worker runner contract should define worker output as candidate evidence"
);
assertIncludes(
  workerRunnerContractReference,
  "Do not update accepted task, status, goal, run, gate, or release state",
  "worker runner contract should forbid workers from mutating accepted state"
);
assertIncludes(
  workerRunnerContractReference,
  "Treat State Sync Notes as part of task Done",
  "worker runner contract should make state-sync notes part of task completion"
);
assertIncludes(
  workerPromptTemplate,
  "You are an execution worker for one DAG node",
  "worker prompt template should constrain worker identity"
);
assertIncludes(
  workerPromptTemplate,
  "Return candidate evidence only",
  "worker prompt template should prevent worker self-acceptance"
);
assertIncludes(
  workerPromptTemplate,
  "Include `State Sync Notes` as part of task Done",
  "worker prompt template should require state-sync notes without granting accepted-state authority"
);
assertIncludes(
  workerPromptTemplate,
  "Need user: None",
  "worker prompt template should tell workers how to report no user need"
);
assertIncludes(
  readFileSync(join(repoRoot, "plugins/agent-harness/templates/status.md"), "utf8"),
  "bounded current-state\nsnapshot, not an append-only history log",
  "status template should define status as a bounded snapshot"
);
assertIncludes(
  adversarialAcceptanceReference,
  "Try to reject completion before accepting it",
  "adversarial acceptance should force a rejection pass before completion"
);
assertIncludes(
  adversarialAcceptanceReference,
  "If any check fails, do not mark the task, goal, run, or gate complete",
  "adversarial acceptance should block completion when evidence is missing"
);
assertIncludes(
  workflowSkillDocs.init,
  "Audit, doctor, and activation-preview requests are read-only by default",
  "init should keep setup audit and activation preview read-only by default"
);
assertIncludes(
  adoptionBoundaryReference,
  "activation-preview requests as read-only",
  "adoption boundary should keep audit and activation-preview requests read-only by default"
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
assertIncludes(
  controllerCommunicationReference,
  "Worker Runner Contract",
  "controller communication should link worker runner contract"
);
assertIncludes(
  controllerCommunicationReference,
  "templates/worker-prompt.md",
  "controller communication should point worker launches at the prompt template"
);
assertIncludes(
  controllerCommunicationReference,
  "Accepted-state owner",
  "controller communication should declare accepted-state ownership for child controller handoff"
);
assertIncludes(
  controllerCommunicationReference,
  "Parent return channel",
  "controller communication should define parent return channel for child controllers"
);
assertIncludes(
  controllerCommunicationReference,
  "Need user:",
  "controller packets should carry concrete user needs"
);
assertIncludes(
  controllerCommunicationReference,
  "Need user: None",
  "controller packets should state when no user action is needed"
);
assertIncludes(
  taskRoutingReference,
  "child-controller",
  "task-routing should distinguish child controllers from execution workers"
);
assertIncludes(
  taskRoutingReference,
  "Roadmap -> Milestone -> Goal -> Task -> Run",
  "task-routing should define the formal user-facing terminology hierarchy"
);
assertIncludes(
  taskRoutingReference,
  "用 harness 做这个任务",
  "task-routing should normalize Chinese task phrasing to Goal"
);
assertIncludes(
  taskRoutingReference,
  "`P0` / `P1` / `P2` / `P3` -> `Priority`",
  "task-routing should separate priority labels from task and milestone names"
);
assertIncludes(
  taskRoutingReference,
  "`Stage` was renamed to `Milestone`",
  "task-routing should keep Stage only as a migration alias"
);
for (const [value, needle, message] of [
  [capabilityMatrix, "harness-rule:context-focus-routing", "capability matrix should expose the context-focus routing anchor"],
  [capabilityMatrix, "context focus", "capability matrix should name context-focus routing"],
  [
    projectContractReference,
    "remains an internal design reference only",
    "project contract should keep EnvContext internal"
  ],
  [
    projectContractReference,
    "First normalize user intent to `Milestone`",
    "project contract should order intent normalization before context focus"
  ],
  [
    projectContractReference,
    "then choose the smallest useful context focus",
    "project contract should select context focus after intent normalization"
  ],
  [
    taskRoutingReference,
    "normalize intent before choosing context",
    "task-routing should normalize intent before focus selection"
  ],
  [
    taskRoutingReference,
    "First map the request to `Milestone`, `Goal`, `Task`, `Run`,",
    "task-routing should enumerate the stable intent targets"
  ],
  [taskRoutingReference, "`Priority`, or `Spec`; then select the focus preset", "task-routing should enumerate priority and spec intent targets"],
  [workerPromptTemplate, "harness-rule:context-focus-routing", "worker prompt template should carry context-focus routing"]
]) {
  assertIncludes(value, needle, message);
}
for (const [value, needle, message] of [
  [capabilityMatrix, "harness-rule:degraded-execution-provenance", "capability matrix should expose degraded execution provenance"],
  [projectContractReference, "skips `codex-cli-subagent`", "project contract should describe worker-surface degradation"],
  [workerRunnerContractReference, "candidate-evidence boundary, and verification evidence", "worker runner contract should require degraded provenance fields"],
  [controllerCommunicationReference, "Silent fallback is not accepted completion evidence", "controller communication should reject silent fallback"],
  [workflowSkillDocs.execute, "harness-rule:degraded-execution-provenance", "execute should expose degraded execution provenance"],
  [workerPromptTemplate, "degraded execution provenance when applicable", "worker prompt should return degraded provenance when applicable"]
]) {
  assertIncludes(value, needle, message);
}
for (const [value, needle, message] of [
  [capabilityMatrix, "harness-rule:controller-cancellation-boundary", "capability matrix should expose controller cancellation boundary"],
  [projectContractReference, "cooperative control-plane", "project contract should reject runtime kill guarantees"],
  [workerRunnerContractReference, "runtime kill guarantees", "worker runner contract should define cooperative cancellation"],
  [controllerCommunicationReference, "Cancellation / Supersession Notice", "controller communication should include cancellation notice packet"],
  [gateResultsReference, "late output", "gate results should require late output handling"],
  [taskRoutingReference, "quarantine late worker output", "task routing should describe cancellation quarantine"],
  [workflowSkillDocs.execute, "harness-rule:controller-cancellation-boundary", "execute should expose controller cancellation boundary"],
  [workerPromptTemplate, "late candidate evidence", "worker prompt should classify late output as candidate evidence"]
]) {
  assertIncludes(value, needle, message);
}
for (const [value, needle, message] of [
  [capabilityMatrix, "harness-rule:cybernetic-stability", "capability matrix should expose cybernetic stability"],
  [capabilityMatrix, "harness-rule:intent-setpoint-selection", "capability matrix should expose intent/setpoint selection"],
  [capabilityMatrix, "harness-rule:sensor-freshness", "capability matrix should expose sensor freshness"],
  [capabilityMatrix, "harness-rule:measurement-snapshot", "capability matrix should expose measurement snapshots"],
  [capabilityMatrix, "harness-rule:remaining-gap", "capability matrix should expose remaining gap"],
  [capabilityMatrix, "harness-rule:feedback-quality", "capability matrix should expose feedback quality"],
  [capabilityMatrix, "harness-rule:stability-saturation", "capability matrix should expose stability/saturation"],
  [projectContractReference, "target, observed state, evidence, conflicts or stale artifacts", "project contract should define the measurement snapshot shape"],
  [taskRoutingReference, "Cybernetic Stability Routing", "task-routing should include cybernetic stability routing"],
  [taskRoutingReference, "If no gap shrank, route to verification", "task-routing should require re-route when no gap shrinks"],
  [taskRoutingReference, "advisory feedback as completion evidence", "task-routing should reject completion with weak stability evidence"],
  [goalTemplateDoc, "## Cybernetic Stability", "goal template should include cybernetic stability"],
  [workerPromptTemplate, "gap closed, remaining gap", "worker prompt should return gap evidence"]
]) {
  assertIncludes(value, needle, message);
}
for (const [value, needle, message] of [
  [capabilityMatrix, "harness-rule:level-0-fast-path", "capability matrix should expose the Level 0 Fast Path anchor"],
  [capabilityMatrix, "Level 0 Fast Path", "capability matrix should name the Level 0 Fast Path policy"],
  [taskRoutingReference, "harness-rule:level-0-fast-path", "task-routing should expose the Level 0 Fast Path anchor"],
  [
    taskRoutingReference,
    "direct execution requires `implementer` or explicitly accepted `mixed`",
    "task-routing should require implementer or explicit mixed for Level 0 direct execution"
  ],
  [
    taskRoutingReference,
    "skip spec/goal/run/worker",
    "task-routing should define the Level 0 ceremony skip boundary"
  ],
  [
    taskRoutingReference,
    "existing Harness Goal/Run",
    "task-routing should not let Level 0 bypass existing Harness state sync"
  ],
  [
    taskRoutingReference,
    "adapter-required gate",
    "task-routing should not let Level 0 bypass adapter-required gates"
  ],
  [taskRoutingReference, "Delivery State", "task-routing should keep Delivery State required for Level 0"],
  [taskRoutingReference, "Need user", "task-routing should keep Need user closeout required for Level 0"],
  [taskRoutingReference, "Remaining", "task-routing should keep Remaining closeout required for Level 0"],
  [workflowSkillDocs.execute, "harness-rule:level-0-fast-path", "execute should expose the Level 0 Fast Path anchor"],
  [
    workflowSkillDocs.execute,
    "gate-only` cannot use Level 0",
    "execute should forbid gate-only controllers from using Level 0 to edit"
  ],
  [
    taskRoutingReference,
    "direct execution requires `implementer` or explicitly accepted `mixed`",
    "execute should require implementer or explicit mixed for Level 0 direct execution"
  ]
]) {
  assertIncludes(value, needle, message);
}
assertIncludes(
  readFileSync(join(repoRoot, "docs/project-contract.md"), "utf8"),
  "Run is not a Codex\n  thread, session, worker, or worktree identity",
  "project contract should keep Run separate from thread/session identity"
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
const adapterLanguageReference = readFileSync(join(repoRoot, "plugins/agent-harness/references/adapter-harness.md"), "utf8");
const adapterTemplateDoc = readFileSync(join(repoRoot, "plugins/agent-harness/templates/adapter.md"), "utf8");
assertExcludes(rootReadme, "docs/assets/github/social-preview.svg", "README should reserve the social preview for GitHub metadata");
assertExcludes(rootReadmeZh, "docs/assets/github/social-preview.svg", "zh-CN README should reserve the social preview for GitHub metadata");
const cliDoc = readFileSync(join(repoRoot, "docs/cli.md"), "utf8");
const cliDocZh = readFileSync(join(repoRoot, "docs/cli.zh-CN.md"), "utf8");
const packageDoc = readFileSync(join(repoRoot, "package.json"), "utf8");
const deterministicEvalRunner = readFileSync(join(repoRoot, "evals/run-agent-harness-eval.mjs"), "utf8");
const liveEvalRunner = readFileSync(join(repoRoot, "evals/run-live-skill-activation.mjs"), "utf8");
assertExcludes(cliDoc, publicFocusOption, "CLI reference should not expose a public focus option");
assertExcludes(cliDocZh, publicFocusOption, "zh-CN CLI reference should not expose a public focus option");
assertExcludes(JSON.stringify(configSchema), publicFocusOption, "config schema should not expose a focus option or field");
assertIncludes(rootReadme, "## Use With A Coding Agent", "README should present a coding-agent-first entry path");
assertIncludes(rootReadme, "language.default", "README should explain adapter-owned language configuration");
assertIncludes(rootReadme, "Deterministic artifacts", "README should disclose the generated-artifact language boundary");
assertIncludes(rootReadmeZh, "当前边界", "zh-CN README should disclose the generated-artifact language boundary");
assertIncludes(adapterLanguageReference, "supported human-facing CLI messages only", "adapter reference should not overstate artifact localization");
assertIncludes(adapterTemplateDoc, "## Language Policy", "adapter template should capture project language policy");
assertIncludes(
  configSchema.properties.language.description,
  "not generated artifact bodies",
  "config schema should document the current language boundary"
);
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
assertIncludes(rootReadme, "does not run a model", "README should distinguish deterministic eval from live activation");
assertIncludes(packageDoc, '"test:eval:live"', "package should expose the opt-in live activation evaluator");
assertIncludes(deterministicEvalRunner, "Model activation measured: no", "deterministic eval should disclaim model activation");
assertIncludes(liveEvalRunner, "AGENT_HARNESS_LIVE_EVAL", "live eval should require explicit opt-in");
assertIncludes(liveEvalRunner, "runtimeReportedModels", "live eval should record runtime model evidence");
assertIncludes(liveEvalRunner, "refusing to claim GPT-5.6", "live eval should reject missing runtime model evidence");
assertIncludes(cliDoc, "--gate-evidence", "CLI reference should document gate-only run evidence");
assertIncludes(cliDocZh, "--gate-evidence", "zh-CN CLI reference should document gate-only run evidence");
assertIncludes(cliDoc, "--allow-no-spec", "CLI reference should document explicit spec-less goals");
assertIncludes(cliDocZh, "--allow-no-spec", "zh-CN CLI reference should document explicit spec-less goals");
assertIncludes(cliDoc, "run node record", "CLI reference should document DAG node result recording");
assertIncludes(cliDocZh, "run node record", "zh-CN CLI reference should document DAG node result recording");
const projectContractDoc = readFileSync(join(repoRoot, "docs/project-contract.md"), "utf8");
for (const needle of ["## Conversation Reconciliation Rules", "## Execution Role Rules", "`gate-only`", "`implementer`", "`mixed`", "## Conversation Route And Execution Context Lock", "## Spec-Less Goal Policy", "`--allow-no-spec`", "table-based task indexes", "## Delivery State Gate", "## Agent-Neutral Delegation Rules", "`dag.json`"]) {
  assertIncludes(projectContractDoc, needle, "project contract should document execution roles");
}
const executeSkillDoc = readFileSync(join(repoRoot, "plugins/agent-harness/skills/execute/SKILL.md"), "utf8");
for (const needle of ["gate-only", "implementer", "mixed", "main control", "worker subagent by default", "Execution Context Lock", "Delivery State", "--gate-evidence", "run node record"]) {
  assertIncludes(executeSkillDoc, needle, "execute skill should route control/gate requests by execution role");
}
assertIncludes(goalTemplateDoc, "## Execution Role", "goal template should include an execution role section");
assertIncludes(goalTemplateDoc, "## Conversation Route", "goal template should include conversation route section");
assertIncludes(goalTemplateDoc, "## Execution Context Lock", "goal template should include execution context lock section");
assertIncludes(goalTemplateDoc, "## Delivery State", "goal template should include delivery state section");
assertIncludes(goalTemplateDoc, "Target delivery state: `validated-local`", "goal template should default to local validation");
assertIncludes(goalTemplateDoc, "grants no commit,", "goal template should deny delivery authority by default");
assertExcludes(
  goalTemplateDoc,
  "gate-passing implementation work is committed and integrated",
  "goal template should not contradict its local-only delivery default"
);
assertIncludes(goalTemplateDoc, "harness-rule:context-focus-routing", "goal template should include context-focus routing guidance");
const cliSource = readFileSync(cli, "utf8");
assertIncludes(cliSource, "## Execution Role", "goal generator should include an execution role section");
assertIncludes(cliSource, "## Conversation Route", "goal generator should include conversation route section");
assertIncludes(cliSource, "harness-rule:level-0-fast-path", "CLI generator should include the Level 0 Fast Path protocol anchor");
assertIncludes(cliSource, "harness-rule:context-focus-routing", "CLI generator should include the Context Focus Routing protocol anchor");
assertIncludes(
  cliSource,
  "direct execution requires \\`implementer\\` or explicitly accepted \\`mixed\\`",
  "CLI generator should preserve the Level 0 role boundary"
);
assertExcludes(cliSource, publicFocusOption, "CLI source should not expose a public focus option");
assertExcludes(run(["--help"]), publicFocusOption, "CLI help should not expose a public focus option");
assertIncludes(cliSource, "deliveryState", "run status should expose delivery state");
assertIncludes(cliSource, "deliveryPolicy", "run status should expose delivery target policy");
assertIncludes(cliSource, "Delivery target gate failed", "run record should enforce delivery target");
assertIncludes(cliSource, "defaultWorkerSurface", "run status should expose default worker surface");
assertIncludes(cliSource, "codex-cli-subagent", "run prepare should default workers to subagents");
assertIncludes(cliSource, "gate-evidence", "run record should expose gate evidence input");
assertIncludes(cliSource, "dag.json", "run prepare should expose execution DAG artifacts");
assertIncludes(cliSource, "allow-no-spec", "goal create should expose explicit spec-less goal input");
assertIncludes(cliSource, "Spec Policy", "goal generator should persist spec-less policy");

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
  const fixedGoalContent = readFileSync(fixedGoal, "utf8");
  assertIncludes(fixedGoalContent, "harness-rule:context-focus-routing", "generated goal should preserve the context-focus routing anchor");
  assertIncludes(fixedGoalContent, generatedContextFocusNeedle, "generated goal should normalize intent before context focus");
  assertIncludes(fixedGoalContent, generatedExecuteFocusNeedle, "generated goal should include execute focus guidance");
  const fixedGoalValidation = JSON.parse(run(["goal", "validate", "--cwd", fixed, "--goal", fixedGoal, "--json"]));
  assert(fixedGoalValidation.ok === true, "fixed goal with confirmed spec should validate");
  run(["run", "prepare", "--cwd", fixed, "--goal", fixedGoal]);
  assert(readdirSync(join(fixed, ".harness/runs")).length > 0, "fixed run packet should use fixed runs dir");
  const fixedRun = readdirSync(join(fixed, ".harness/runs")).sort().at(-1);
  const fixedRunStatus = readJson(join(fixed, ".harness/runs", fixedRun, "status.json"));
  assert(fixedRunStatus.executionRole === "implementer", "run prepare should record generated goal execution role");
  const fixedRunMarkdown = readFileSync(join(fixed, ".harness/runs", fixedRun, "run.md"), "utf8");
  const fixedPromptMarkdown = readFileSync(join(fixed, ".harness/runs", fixedRun, "prompt.md"), "utf8");
  const fixedDagMarkdown = readFileSync(join(fixed, ".harness/runs", fixedRun, "dag.md"), "utf8");
  assertIncludes(fixedRunMarkdown, "Need user: None", "run packet should tell agents how to close with no user need");
  assertIncludes(fixedRunMarkdown, "Remaining: None", "run packet should tell agents how to close with no remaining work");
  assertIncludes(
    fixedRunMarkdown,
    "harness-rule:level-0-fast-path",
    "generated run packet should preserve the Level 0 Fast Path boundary"
  );
  assertIncludes(
    fixedRunMarkdown,
    "direct execution requires `implementer` or explicitly accepted `mixed`",
    "generated run packet should preserve the Level 0 role boundary"
  );
  assertIncludes(
    fixedRunMarkdown,
    "harness-rule:context-focus-routing",
    "generated run packet should preserve the context-focus routing anchor"
  );
  assertIncludes(fixedRunMarkdown, generatedContextFocusNeedle, "generated run packet should normalize intent before context focus");
  assertIncludes(fixedRunMarkdown, generatedExecuteFocusNeedle, "generated run packet should include execute focus guidance");
  assertIncludes(fixedRunMarkdown, "harness-rule:degraded-execution-provenance", "generated run packet should preserve degraded provenance guidance");
  assertIncludes(fixedRunMarkdown, generatedDegradedProvenanceNeedle, "generated run packet should describe worker fallback provenance");
  assertIncludes(
    fixedRunMarkdown,
    "harness-rule:controller-cancellation-boundary",
    "generated run packet should preserve controller cancellation boundary"
  );
  assertIncludes(
    fixedDagMarkdown,
    "late outputs remain candidate evidence",
    "generated DAG should describe late worker output quarantine"
  );
  assertIncludes(fixedPromptMarkdown, "Need user: None", "execution prompt should tell agents how to close with no user need");
  assertIncludes(fixedPromptMarkdown, "Remaining: None", "execution prompt should tell agents how to close with no remaining work");
  assertIncludes(
    fixedPromptMarkdown,
    "gate-only` cannot use Level 0",
    "execution prompt should prevent gate-only Level 0 implementation"
  );
  assertIncludes(
    fixedPromptMarkdown,
    "harness-rule:context-focus-routing",
    "execution prompt should preserve the context-focus routing anchor"
  );
  assertIncludes(fixedPromptMarkdown, generatedContextFocusNeedle, "execution prompt should normalize intent before context focus");
  assertIncludes(fixedPromptMarkdown, generatedDegradedProvenanceNeedle, "execution prompt should describe worker fallback provenance");
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
    "fixed smoke verification passed",
    "--integration-ref",
    "fixed-smoke-mainline"
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
    "maintain record should write status maintenance snapshot"
  );
  run(["maintain", "tasks", "--cwd", fixed, "--record", "--json"]);
  const fixedStatusAfterSecondMaintain = readFileSync(join(fixed, "harness/status.md"), "utf8");
  assert(
    (fixedStatusAfterSecondMaintain.match(/^## Maintenance Snapshot$/gm) || []).length === 1,
    "maintain record should replace the bounded status snapshot instead of appending duplicates"
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
  assert(adapterOrientJson.recommendation.route === "shape", "P1 todo without spec should route to shaping");
  assert(adapterOrientJson.recommendation.goalCommand === "", "P1 todo without spec should not recommend unusable goal create");
  assertIncludes(
    run(["orient", "next", "--cwd", adapter]),
    "not recommended until spec or accepted scope is confirmed",
    "orient text should avoid unusable goal create for missing-spec task"
  );
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
  write(join(adapter, "harness/specs/ready.md"), "# Ready Spec\n\nStatus: accepted\n");
  write(join(adapter, "harness/goals/existing.md"), "# Existing Goal\n");
  write(join(adapter, "harness/tasks.md"), `# Project Tasks

| Task | Type | Status | Priority | Doc |
| --- | --- | --- | --- | --- |
| Ship from accepted spec | development | spec-ready | P1 | [harness/specs/ready.md](harness/specs/ready.md) |
`);
  const specReadyOrient = JSON.parse(run(["orient", "next", "--cwd", adapter, "--json"]));
  assert(specReadyOrient.recommendation.route === "goal", "spec-ready with spec should route to goal creation");
  assertIncludes(specReadyOrient.recommendation.goalCommand, "--spec \"harness/specs/ready.md\"", "spec-ready recommendation should include spec path");
  write(join(adapter, "harness/tasks.md"), `# Project Tasks

| Task | Type | Status | Priority | Doc |
| --- | --- | --- | --- | --- |
| Continue accepted goal | development | goal-ready | P1 | [harness/goals/existing.md](harness/goals/existing.md) |
`);
  const goalReadyOrient = JSON.parse(run(["orient", "next", "--cwd", adapter, "--json"]));
  assert(goalReadyOrient.recommendation.route === "goal-ready", "goal-ready should route to existing goal handling");
  assertIncludes(goalReadyOrient.recommendation.goalCommand, "goal validate", "goal-ready recommendation should validate existing goal");
  assertIncludes(goalReadyOrient.recommendation.goalCommand, "run prepare", "goal-ready recommendation should prepare a run after validation");
  write(join(adapter, "harness/tasks.md"), `# Project Tasks

| Task | Type | Status | Priority | Doc |
| --- | --- | --- | --- | --- |
| Finished work | development | done | P1 |  |
`);
  const completedOrient = JSON.parse(run(["orient", "next", "--cwd", adapter, "--json"]));
  assert(completedOrient.tasks.total === 1, "orient should still report parsed completed tasks");
  assert(
    completedOrient.recommendation.reason === "all parsed tasks are completed or closed",
    "orient should distinguish an all-completed task index from a parse failure"
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
  assertIncludes(
    runFails(["goal", "create", "--cwd", custom, "--task", "Ship custom path behavior", "--dry-run"]),
    "requires --spec <spec-path> unless --allow-no-spec",
    "adapter goal create should remain strict without explicit spec-less flag"
  );
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
  assert(customGoalValidate.goal.deliveryPolicy.target === "validated-local", "goal validate should default to local validation");
  assert(customGoalValidate.goal.deliveryPolicy.deliveryIntent === "local-validation", "goal validate should default to local delivery intent");
  assert(customGoalValidate.goal.deliveryPolicy.commitAuthorized === "no", "goal generation must not invent commit authorization");
  assert(customGoalValidate.goal.deliveryPolicy.pushAuthorized === "no", "goal generation must not invent push authorization");
  assert(customGoalValidate.goal.deliveryPolicy.integrationAuthorized === "no", "goal generation must not invent integration authorization");
  run(["run", "prepare", "--cwd", custom, "--goal", customGoal]);
  const customRuns = readdirSync(join(custom, "custom/runs")).sort();
  assert(customRuns.length > 0, "adapter run packet should use custom runs dir");
  const customRunStatus = readJson(join(custom, "custom/runs", customRuns[0], "status.json"));
  assert(customRunStatus.harnessContract === "adapter", "run status should record adapter mode");
  assert(customRunStatus.executionRole === "implementer", "run status should record execution role");
  assert(customRunStatus.conversationRoute === "current-thread", "run status should record conversation route");
  assert(customRunStatus.executionContextLock.executionCwd === custom, "run status should record execution cwd lock");
  assert(customRunStatus.deliveryState.state, "run status should record delivery state");
  assert(customRunStatus.deliveryPolicy.target === "validated-local", "run status should record local delivery target");
  const customRunStatusJson = JSON.parse(run(["run", "status", "--cwd", custom, "--run", join("custom/runs", customRuns[0]), "--json"]));
  assert(customRunStatusJson.deliveryState.state === customRunStatus.deliveryState.state, "run status json should expose delivery state");
  assert(customRunStatusJson.deliveryPolicy.target === "validated-local", "run status json should expose local delivery target");
  run(["run", "prepare", "--cwd", custom, "--goal", customGoal]);
  const runningWorkerRun = readdirSync(join(custom, "custom/runs")).sort().at(-1);
  const runningWorkerRunRel = join("custom/runs", runningWorkerRun);
  const runningWorkerStatus = JSON.parse(run(["run", "status", "--cwd", custom, "--run", runningWorkerRunRel, "--json"]));
  const runningWorkerNode = runningWorkerStatus.executionDag.readyNodes[0];
  write(
    join(custom, runningWorkerRunRel, "agents", runningWorkerNode, "status.json"),
    `${JSON.stringify(
      {
        node: runningWorkerNode,
        phase: "running",
        thread: "worker-thread",
        surface: "codex-cli-subagent",
        summary: "active worker still running"
      },
      null,
      2
    )}\n`
  );
  assertIncludes(
    runFails([
      "run",
      "record",
      "--cwd",
      custom,
      "--run",
      runningWorkerRunRel,
      "--phase",
      "completed",
      "--summary",
      "should not complete with active worker",
      "--verification",
      "verification passed",
      "--integration-ref",
      "smoke-mainline"
    ]),
    "active worker nodes to be resolved before acceptance",
    "completed run record should reject unresolved running worker nodes"
  );
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
    "--integration-ref",
    "smoke-mainline",
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

  const specLess = join(suiteDir, "adapter-spec-less");
  mkdirSync(specLess, { recursive: true });
  run(["init", "--cwd", specLess, "--contract", "adapter"]);
  write(join(specLess, "harness/tasks.md"), `# Project Tasks

| Task | Type | Status | Priority | Doc |
| --- | --- | --- | --- | --- |
| Execute accepted scope without spec | development | goal-ready | P1 |  |
`);
  assertIncludes(
    runFails(["goal", "create", "--cwd", specLess, "--task", "Execute accepted scope without spec"]),
    "requires --spec <spec-path> unless --allow-no-spec",
    "adapter goal create should reject missing spec by default"
  );
  const specLessDryRun = run([
    "goal",
    "create",
    "--cwd",
    specLess,
    "--task",
    "Execute accepted scope without spec",
    "--allow-no-spec",
    "--dry-run"
  ]);
  assertIncludes(specLessDryRun, "Spec Policy: allow-no-spec", "spec-less goal dry-run should persist explicit policy");
  assertIncludes(specLessDryRun, "## Delivery State", "spec-less goal should include delivery state");
  run([
    "goal",
    "create",
    "--cwd",
    specLess,
    "--task",
    "Execute accepted scope without spec",
    "--allow-no-spec"
  ]);
  const specLessGoal = latestFile(join(specLess, "harness/goals"));
  const specLessValidation = JSON.parse(run(["goal", "validate", "--cwd", specLess, "--goal", specLessGoal, "--json"]));
  assert(specLessValidation.ok === true, "explicit spec-less goal should validate");
  assert(specLessValidation.goal.specPolicy === "allow-no-spec", "goal validate should expose spec-less policy");
  write(join(specLess, "harness/goals/spec-less-missing-policy.md"), readFileSync(specLessGoal, "utf8").replace("Spec Policy: allow-no-spec\n", ""));
  assertIncludes(
    runFails(["goal", "validate", "--cwd", specLess, "--goal", "harness/goals/spec-less-missing-policy.md", "--json"]),
    "unless Spec Policy is allow-no-spec",
    "spec-less goal without explicit policy should fail validation"
  );
  run(["run", "prepare", "--cwd", specLess, "--goal", specLessGoal]);
  const specLessRun = readdirSync(join(specLess, ".harness/runs")).filter((name) => name.endsWith("-execute-accepted-scope-without-spec")).sort().at(-1);
  assert(specLessRun, "spec-less run should be prepared");
  assertIncludes(
    readFileSync(join(specLess, ".harness/runs", specLessRun, "run.md"), "utf8"),
    "none (allow-no-spec)",
    "spec-less run packet should not pretend a spec exists"
  );
  assertExcludes(
    readFileSync(join(specLess, ".harness/runs", specLessRun, "prompt.md"), "utf8"),
    "and `TBD` before making edits",
    "spec-less run prompt should not ask workers to read TBD"
  );

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
- Do not release, deploy, publish, or execute delivery above the goal policy.

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
  assert(largeDagStatus.executionDag.defaultWorkerSurface === "codex-cli-subagent", "large DAG should default worker surface to subagent");
  assert(JSON.stringify(largeDagStatus.executionDag.preferredSurfaces) === JSON.stringify(["codex-cli-subagent"]), "large DAG should prefer only subagent by default");
  assert(largeDagStatus.executionDag.enforced === true, "large DAG run should enforce node completion before run completion");
  assert(existsSync(join(largeDagRunDir, "dag.json")), "run prepare should write machine-readable DAG");
  assert(existsSync(join(largeDagRunDir, "dag.md")), "run prepare should write human-readable DAG");
  assert(existsSync(join(largeDagRunDir, "agents/explorer/prompt.md")), "run prepare should write explorer prompt");
  assert(existsSync(join(largeDagRunDir, "agents/cli-contract-worker/prompt.md")), "run prepare should write parallel worker prompt");
  const cliWorkerPrompt = readFileSync(join(largeDagRunDir, "agents/cli-contract-worker/prompt.md"), "utf8");
  assertIncludes(
    cliWorkerPrompt,
    "plugins/agent-harness/references/worker-runner-contract.md",
    "generated worker prompts should load the worker runner contract"
  );
  assertIncludes(
    cliWorkerPrompt,
    "Your output is candidate evidence only",
    "generated worker prompts should prevent worker self-acceptance"
  );
  assertIncludes(
    cliWorkerPrompt,
    "Do not update accepted task, status, goal, run, gate, integration, release, or ship state",
    "generated worker prompts should forbid accepted-state mutation"
  );
  assertIncludes(
    cliWorkerPrompt,
    "Return State Sync Notes as part of task Done",
    "generated worker prompts should require state-sync notes"
  );
  assertIncludes(
    cliWorkerPrompt,
    "harness-rule:context-focus-routing",
    "generated worker prompts should preserve the context-focus routing anchor"
  );
  assertIncludes(cliWorkerPrompt, generatedContextFocusNeedle, "generated worker prompts should normalize intent before context focus");
  assertIncludes(cliWorkerPrompt, generatedExecuteFocusNeedle, "generated worker prompts should include execute focus guidance");
  assertIncludes(cliWorkerPrompt, generatedDegradedProvenanceNeedle, "generated worker prompts should include degraded provenance guidance");
  assertIncludes(cliWorkerPrompt, "harness-rule:bounded-status-snapshot", "generated worker prompts should include bounded status guidance");
  assertIncludes(cliWorkerPrompt, "Delivery state:", "worker result packet should report delivery state");
  assertIncludes(cliWorkerPrompt, "State Sync Notes:", "worker result packet should report state-sync notes");
  assertIncludes(cliWorkerPrompt, "Working tree dirty:", "worker result packet should report dirty state");
  assertIncludes(cliWorkerPrompt, "Need user:", "worker result packet should report concrete user needs");
  assertIncludes(cliWorkerPrompt, "Remaining:", "worker result packet should report remaining follow-up separately");
  assertIncludes(cliWorkerPrompt, "Degraded provenance:", "worker result packet should report degraded provenance");
  const largeDagStatusJson = JSON.parse(run(["run", "status", "--cwd", custom, "--run", largeDagRunRel, "--json"]));
  assert(
    JSON.stringify(largeDagStatusJson.executionDag.readyNodes) === JSON.stringify(["explorer"]),
    "large DAG should initially expose only explorer as ready"
  );
  assert(largeDagStatusJson.executionDag.defaultWorkerSurface === "codex-cli-subagent", "run status json should expose subagent default worker surface");
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
    "subagent-explorer",
    "--surface",
    "codex-cli-subagent",
    "--json"
  ]));
  assert(
    JSON.stringify(explorerNode.readyNodes) === JSON.stringify(["cli-contract-worker"]),
    "DAG should default to one launchable worker after explorer"
  );
  const postExplorerStatus = JSON.parse(run(["run", "status", "--cwd", custom, "--run", largeDagRunRel, "--json"]));
  assert(
    JSON.stringify(postExplorerStatus.executionDag.parallelCandidates) === JSON.stringify(["cli-contract-worker", "docs-skill-worker"]),
    "DAG should expose parallel candidates without authorizing concurrent launch"
  );
  run([
    "run", "node", "record", "--cwd", custom, "--run", largeDagRunRel,
    "--node", "cli-contract-worker", "--phase", "running",
    "--summary", "CLI worker launched sequentially"
  ]);
  assertIncludes(
    runFails([
      "run", "node", "record", "--cwd", custom, "--run", largeDagRunRel,
      "--node", "docs-skill-worker", "--phase", "running",
      "--summary", "unsafe concurrent writer"
    ]),
    "requires --isolation-evidence",
    "DAG should reject a second running writer without isolation evidence"
  );
  run([
    "run", "node", "record", "--cwd", custom, "--run", largeDagRunRel,
    "--node", "docs-skill-worker", "--phase", "running",
    "--summary", "Docs worker launched in isolated worktree",
    "--thread", "docs-worker-thread",
    "--surface", "codex-cli-subagent",
    "--isolation-evidence", "separate locked worktree /tmp/docs-worker"
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
    workerDagStatus.executionDag.nodeStatus["docs-skill-worker"].thread === "docs-worker-thread",
    "completed DAG node should preserve its launch thread provenance"
  );
  assert(
    workerDagStatus.executionDag.nodeStatus["docs-skill-worker"].surface === "codex-cli-subagent",
    "completed DAG node should preserve its worker surface provenance"
  );
  assert(
    workerDagStatus.executionDag.nodeStatus["docs-skill-worker"].isolationEvidence === "separate locked worktree /tmp/docs-worker",
    "completed DAG node should preserve its parallel isolation evidence"
  );
  assert(
    JSON.stringify(workerDagStatus.executionDag.readyNodes) === JSON.stringify(["verification"]),
    "DAG should release verification after both isolated workers complete"
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
    "Delivery State target review-open requires Review authorized: yes",
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
  const gateOnlyStatus = readJson(join(custom, "custom/runs", gateOnlyRun, "status.json"));
  assert(
    gateOnlyStatus.executionRole === "gate-only",
    "gate-only run status should record execution role"
  );
  assert(gateOnlyStatus.executionDag.defaultWorkerSurface === "codex-cli-subagent", "gate-only run should default to subagent worker surface");
  assert(
    !Object.keys(gateOnlyStatus.executionDag.nodeStatus).includes("main-agent"),
    "gate-only run should not prepare a current-thread main-agent implementation node"
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
    "--integration-ref",
    "gate-only-smoke-mainline",
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

## Delivery State
- Delivery intent: \`integrate-after-gates\`
- Target delivery state: \`integrated\`
- Commit authorized: \`yes\`
- Push authorized: \`yes\`
- Review authorized: \`no\`
- Integration authorized: \`yes\`
- Release authorized: \`no\`

## Scope
- Complete multiple source tasks as one batch.

## Non-Goals
- Do not release, deploy, publish, or execute delivery above the goal policy.

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
    "--integration-ref",
    "batch-smoke-mainline",
    "--json"
  ]));
  assert(satisfiedBatchRecord.phase === "completed", "satisfied batch run should record completion");

  write(join(custom, "harness/specs/m5.md"), `# M5 Spec

Status: accepted

## Implementation Phasing

### M5-S0: Product Spec

Accepted product source.

### M5-D1: Diagnosis Read Model

Future implementation goal.

### M5-D2: Actions And Briefs

Future implementation goal.
`);
  write(join(custom, "todolist.md"), `${readFileSync(join(custom, "todolist.md"), "utf8").trimEnd()}
| M5 Diagnosis, Actions, Briefs, And Reports | dev | todo | P1 | [harness/specs/m5.md](harness/specs/m5.md) |
`);
  const generatedStageGoal = run([
    "goal",
    "create",
    "--cwd",
    custom,
    "--task",
    "M5 Diagnosis",
    "--spec",
    "harness/specs/m5.md",
    "--dry-run"
  ]);
  assertIncludes(generatedStageGoal, "## Milestone Completion Map", "parent milestone goal creation should include a milestone completion map");
  assertIncludes(generatedStageGoal, "M5-D1: Diagnosis Read Model", "generated milestone map should include implementation phasing items");
  const stageGoalBase = `# Goal: M5 Diagnosis, Actions, Briefs, And Reports

Spec: harness/specs/m5.md
Status: Ready for execution from confirmed spec.

## Source Task
- \`todolist.md\`: \`P1 M5 Diagnosis, Actions, Briefs, And Reports\`

## Read First
1. \`harness/specs/m5.md\`

## Work Mode Recommendation
Use \`local\`.

## Execution Role
Use \`implementer\`.

## Delivery State
- Delivery intent: \`integrate-after-gates\`
- Target delivery state: \`integrated\`
- Commit authorized: \`yes\`
- Push authorized: \`yes\`
- Review authorized: \`no\`
- Integration authorized: \`yes\`
- Release authorized: \`no\`

## Scope
- Complete M5 as the parent roadmap milestone.

## Non-Goals
- Do not release, deploy, publish, or execute delivery above the goal policy.

## Verification
Manual verification evidence only.

## Completion Conditions
- M5 is complete.

## Pause Conditions
- Pause on spec conflicts or newer instructions.
- Pause for credentials or paid APIs.
- Pause for destructive or production actions.
- Pause for product direction.
`;
  write(join(invalidGoalDir, "stage-missing-map.md"), stageGoalBase);
  assertIncludes(
    runFails(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/stage-missing-map.md", "--json"]),
    "Milestone Completion Map",
    "parent milestone goals should require a milestone completion map"
  );
  const pendingStageMap = `## Milestone Completion Map

- Item: \`M5-S0: Product Spec\`
  - Acceptance: \`M5 product source spec is accepted.\`
  - Evidence: \`Accepted spec fixture evidence\`
  - Status: \`satisfied\`
  - Unblocker: \`N/A\`
- Item: \`M5-D1: Diagnosis Read Model\`
  - Acceptance: \`Diagnosis read model is implemented and verified.\`
  - Evidence: \`TBD\`
  - Status: \`pending\`
  - Unblocker: \`N/A\`
- Item: \`M5-D2: Actions And Briefs\`
  - Acceptance: \`Actions and briefs are implemented and verified.\`
  - Evidence: \`TBD\`
  - Status: \`pending\`
  - Unblocker: \`N/A\`

`;
  write(join(invalidGoalDir, "stage-pending-map.md"), stageGoalBase.replace("## Scope", `${pendingStageMap}## Scope`));
  const pendingStageValidate = JSON.parse(run(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/stage-pending-map.md", "--json"]));
  assert(pendingStageValidate.ok === true, "pending milestone completion map should validate before execution");
  assert(pendingStageValidate.goal.milestoneCompletionMap.required === true, "parent milestone goal should report milestone map requirement");
  assert(pendingStageValidate.goal.milestoneCompletionMap.itemCount === 3, "milestone map should expose item count");
  assert(pendingStageValidate.goal.milestoneCompletionMap.requiredLabels.length === 3, "milestone map should expose implementation phasing labels");
  assert(pendingStageValidate.goal.stageCompletionMap.required === true, "legacy stage map alias should remain available in validation output");
  const legacyStageMap = pendingStageMap.replace("## Milestone Completion Map", "## Stage Completion Map");
  write(join(invalidGoalDir, "stage-legacy-map.md"), stageGoalBase.replace("## Scope", `${legacyStageMap}## Scope`));
  const legacyStageValidate = JSON.parse(run(["goal", "validate", "--cwd", custom, "--goal", "custom/goals/stage-legacy-map.md", "--json"]));
  assert(legacyStageValidate.ok === true, "legacy Stage Completion Map should remain readable as compatibility input");
  run(["run", "prepare", "--cwd", custom, "--goal", "custom/goals/stage-pending-map.md"]);
  const pendingStageRun = readdirSync(join(custom, "custom/runs")).filter((name) => name.endsWith("-stage-pending-map")).sort().at(-1);
  assert(pendingStageRun, "pending stage run should be prepared");
  const pendingStageRunStatus = readJson(join(custom, "custom/runs", pendingStageRun, "status.json"));
  assert(pendingStageRunStatus.milestoneCompletionMapRequired === true, "run status should record required milestone completion map");
  assert(pendingStageRunStatus.milestoneCompletionMapItemCount === 3, "run status should record milestone completion map item count");
  assert(pendingStageRunStatus.stageCompletionMapRequired === true, "legacy run status alias should record required milestone completion map");
  assertIncludes(
    runFails([
      "run",
      "record",
      "--cwd",
      custom,
      "--run",
      join("custom/runs", pendingStageRun),
      "--phase",
      "completed",
      "--summary",
      "milestone completed with pending D items",
      "--verification",
      "verification passed"
    ]),
    "Milestone Completion Map validation failed",
    "completed parent milestone run should reject pending milestone map items"
  );
  const satisfiedStageMap = pendingStageMap
    .replaceAll("`TBD`", "`Verified by stage fixture evidence`")
    .replaceAll("`pending`", "`satisfied`");
  write(join(invalidGoalDir, "stage-satisfied-map.md"), stageGoalBase.replace("## Scope", `${satisfiedStageMap}## Scope`));
  run(["run", "prepare", "--cwd", custom, "--goal", "custom/goals/stage-satisfied-map.md"]);
  const satisfiedStageRun = readdirSync(join(custom, "custom/runs")).filter((name) => name.endsWith("-stage-satisfied-map")).sort().at(-1);
  const satisfiedStageRecord = JSON.parse(run([
    "run",
    "record",
    "--cwd",
    custom,
    "--run",
    join("custom/runs", satisfiedStageRun),
    "--phase",
    "completed",
    "--summary",
    "milestone accepted with all D items",
    "--verification",
    "verification passed",
    "--integration-ref",
    "milestone-smoke-mainline",
    "--json"
  ]));
  assert(satisfiedStageRecord.phase === "completed", "satisfied milestone map should allow parent milestone completion");

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
    "--integration-ref",
    "gated-smoke-mainline",
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

  const importCustomPaths = join(suiteDir, "adapter-import-custom-paths");
  mkdirSync(importCustomPaths, { recursive: true });
  write(join(importCustomPaths, "harness/README.md"), "# Harness Adapter\n");
  write(join(importCustomPaths, "todolist.md"), `# Todo List

| Task | Type | Status | Priority | Doc |
| --- | --- | --- | --- | --- |
| Preserve existing adapter paths | docs | todo | P1 |  |
`);
  write(join(importCustomPaths, "docs/mental-model.md"), "# Existing Mental Model\n");
  mkdirSync(join(importCustomPaths, "docs/milestones"), { recursive: true });
  const importOverrideArgs = [
    "config",
    "import",
    "--cwd",
    importCustomPaths,
    "--task-index",
    "todolist.md",
    "--status",
    "docs/status.md",
    "--specs",
    "docs/specs",
    "--goals",
    "docs/goals",
    "--milestones",
    "docs/milestones",
    "--runs",
    ".harness/runs",
    "--gate-records",
    "docs/gates",
    "--deferred-register",
    "docs/milestones",
    "--mental-model",
    "docs/mental-model.md",
    "--mental-model-index",
    "docs/mental-model.md",
    "--mental-models",
    "docs/mental-models"
  ];
  const importOverridesDryRun = JSON.parse(run([...importOverrideArgs, "--dry-run", "--json"]));
  assert(importOverridesDryRun.dryRun === true, "override import dry-run should report dryRun=true");
  assert(importOverridesDryRun.proposedConfig.paths.taskIndex === "todolist.md", "override import should preserve todolist task index");
  assert(importOverridesDryRun.proposedConfig.paths.status === "docs/status.md", "override import should include custom status path");
  assert(importOverridesDryRun.proposedConfig.paths.milestones === "docs/milestones", "override import should include custom milestones path");
  assert(importOverridesDryRun.proposedConfig.paths.deferredRegister === "docs/milestones", "override import should include custom deferred register path");
  assert(importOverridesDryRun.proposedConfig.paths.mentalModel === "docs/mental-model.md", "override import should include single mental model path");
  assert(importOverridesDryRun.proposedConfig.paths.mentalModelIndex === "docs/mental-model.md", "override import should include custom mental model index");
  assert(importOverridesDryRun.proposedConfig.paths.mentalModels === "docs/mental-models", "override import should include custom mental models dir");
  assert(!existsSync(join(importCustomPaths, ".harness/config.json")), "override import dry-run should not write config");
  const importedOverrides = JSON.parse(run([...importOverrideArgs, "--json"]));
  assert(importedOverrides.paths.taskIndex === "todolist.md", "override import should preserve task index on write");
  assert(existsSync(join(importCustomPaths, ".harness/config.json")), "override import should write config");
  assert(existsSync(join(importCustomPaths, "docs/status.md")), "override import should create custom status");
  assert(existsSync(join(importCustomPaths, "docs/specs")), "override import should create custom specs dir");
  assert(existsSync(join(importCustomPaths, "docs/goals")), "override import should create custom goals dir");
  assert(existsSync(join(importCustomPaths, "docs/mental-models/01-user-scenario.md")), "override import should create custom mental model artifacts");
  assert(!existsSync(join(importCustomPaths, "harness/tasks.md")), "override import should not create a second task index");
  assert(!existsSync(join(importCustomPaths, "harness/mental-models")), "override import should not create default mental model dir");
  assertIncludes(readFileSync(join(importCustomPaths, "docs/mental-model.md"), "utf8"), "Existing Mental Model", "override import should not overwrite existing mental model file");

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
