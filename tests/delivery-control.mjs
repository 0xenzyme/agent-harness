import test from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(root, "plugins/agent-harness/scripts/agent-harness.mjs");
const env = { ...process.env, AGENT_HARNESS_LANG: "en", LANG: "C", LC_ALL: "C", LC_MESSAGES: "C" };
const write = (path, text) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); };
const read = (project, ref) => readFileSync(join(project, ref), "utf8");
const text = value => typeof value === "string" ? value : JSON.stringify(value);
function call(project, words, ok = true) {
  const result = spawnSync(process.execPath, [cli, ...words, "--cwd", project, "--json"], { cwd: root, env, encoding: "utf8" });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  assert.equal(result.status === 0, ok, `${words.join(" ")}\n${output}`);
  try { return JSON.parse(result.stdout); } catch { return output; }
}
function fixture({ task = "Deliver parser", spec = "# Spec: Parser\n\nStatus: accepted\n" } = {}) {
  const project = mkdtempSync(join(tmpdir(), "harness-delivery-"));
  call(project, ["init", "--contract", "adapter"]);
  const config = JSON.parse(read(project, ".harness/config.json"));
  config.gates.requiredForCompletion = [];
  config.paths.runs = ".harness/runs";
  config.checkpoint = { defaultPolicy: "enforced" };
  config.artifactPolicy.runs = "tracked";
  config.artifactPolicy.retention = { completedDays: 30 };
  write(join(project, ".harness/config.json"), JSON.stringify(config));
  write(join(project, "harness/tasks.md"), `# Tasks\n\n## Now\n\n- [ ] P1 ${task}\n\n## Done\n`);
  write(join(project, "harness/specs/parser.md"), spec);
  call(project, ["goal", "create", "--task", task, "--spec", "harness/specs/parser.md", "--work-mode", "local"]);
  const generated = readdirSync(join(project, "harness/goals")).find(name => name.endsWith(".md"));
  const goal = `harness/goals/${generated}`;
  write(join(project, goal), read(project, goal).replace("Status: active.", `Status: active.\nExecution Plan: ${goal}.plan.json`).replace("## Spec Acceptance Checklist", "## Spec Acceptance Checklist\n\n- Item: parser-output\n  - Acceptance: Parser returns the expected number.\n  - Evidence: TBD\n  - Status: pending\n  - Unblocker: N/A"));
  const ref = acceptance(goal, "parser-output");
  const plan = { version: 1, target: { kind: "goal", path: goal }, goals: [{ id: "parser", path: goal, dependsOn: [], tasks: [
    { id: "implement", dependsOn: [], type: "implementation", ownership: { read: ["src"], write: ["src"] }, acceptance: [ref], verification: [{ id: "unit", command: "node --test tests/parser.test.mjs" }] }
  ] }] };
  write(join(project, `${goal}.plan.json`), JSON.stringify(plan));
  return { project, goal, ref, plan };
}
const acceptance = (path, item, section = "Spec Acceptance Checklist") => ({ path, section, item });
function satisfy(project, ref, evidence = "src/parser.mjs; unit: 4 tests passed") {
  const label = ref.item.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(`(- Item: \`?${label}\`?[^\\n]*\\n  - Acceptance: [^\\n]+\\n  - Evidence: )\`?TBD\`?(\\n  - Status: )\`?pending\`?`);
  const original = read(project, ref.path);
  const updated = original.replace(pattern, `$1${evidence}$2satisfied`);
  assert.notEqual(updated, original, `acceptance item must be pending: ${ref.item}`);
  write(join(project, ref.path), updated);
}

test("legacy plans are read without hashing and later source edits never reopen completion", () => {
  const { project, goal, ref, plan } = fixture();
  try {
    plan.goals[0].tasks[0].verification[0].inputs = ["src", "tests"];
    plan.goals[0].tasks[0].verification[0].exclude = ["src/generated"];
    write(join(project, `${goal}.plan.json`), JSON.stringify(plan));
    assert.equal(call(project, ["plan", "validate", "--plan", `${goal}.plan.json`]).ok, true);
    assert.equal(call(project, ["execute", "next", "--goal", goal]).action, "execute-node");
    write(join(project, "src/parser.mjs"), "export const parse = Number;\n");
    satisfy(project, ref);
    assert.equal(call(project, ["execute", "next", "--goal", goal]).action, "complete-goal");
    assert.match(text(call(project, ["goal", "complete", "--goal", goal, "--verification", "npm test passed"], false)), /result for unit/);
    const completed = call(project, ["goal", "complete", "--goal", goal, "--verification", "unit: node --test tests/parser.test.mjs: 4 passed; no uncovered required scope"]);
    assert.deepEqual(completed.writes.sort(), [goal, "harness/status.md", "harness/tasks.md"].sort());
    assert.equal(existsSync(join(project, ".harness/runs")), false);
    assert.match(read(project, "harness/tasks.md"), /- \[x\] P1 Deliver parser/);
    for (const source of ["changed once", "changed twice", "uncommitted rapid iteration"]) {
      write(join(project, "src/parser.mjs"), `// ${source}\n`);
      const next = call(project, ["execute", "next", "--goal", goal]);
      assert.equal(next.action, "done");
      assert.equal("currentVerification" in next, false);
      assert.equal("evidenceScope" in next, false);
      assert.equal("changedInputs" in next, false);
      assert.equal(call(project, ["goal", "validate", "--goal", goal]).ok, true);
    }
    const before = read(project, goal);
    assert.equal(call(project, ["goal", "complete", "--goal", goal, "--verification", "irrelevant later edit"]).idempotent, true);
    assert.equal(read(project, goal), before);
    assert.match(text(call(project, ["run", "prepare", "--goal", goal], false)), /retired|host owns session/i);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("Milestone completion checks dependencies and records only verification summaries", () => {
  const first = fixture(), { project, goal, ref } = first;
  try {
    const milestone = "harness/milestones/stage.md";
    write(join(project, goal), read(project, goal).replace(`Execution Plan: ${goal}.plan.json`, `Execution Plan: ${milestone}.plan.json`));
    write(join(project, milestone), `# Milestone: Stage\n\nExecution Plan: ${milestone}.plan.json\nStatus: active.\n\n## Goal List\n\n| Goal | Status | Priority | Doc | Depends on | Gate |\n| --- | --- | --- | --- | --- | --- |\n| Parser | active | P1 | ${goal} | none | integration |\n\n## Milestone Completion Map\n\n- Item: delivered\n  - Acceptance: Whole parser works.\n  - Evidence: TBD\n  - Status: pending\n  - Unblocker: N/A\n`);
    const plan = { version: 1, target: { kind: "milestone", path: milestone }, goals: [{ ...first.plan.goals[0], milestoneItem: acceptance(milestone, "delivered", "Milestone Completion Map") }], verification: [{ id: "integration", command: "node --test tests/integration.test.mjs" }] };
    write(join(project, `${milestone}.plan.json`), JSON.stringify(plan));
    satisfy(project, ref);
    call(project, ["goal", "complete", "--goal", goal, "--verification", "unit: passed"]);
    assert.equal(call(project, ["execute", "next", "--milestone", milestone]).action, "complete-milestone");
    assert.match(text(call(project, ["milestone", "complete", "--milestone", milestone, "--verification", "unit: passed"], false)), /integration/);
    call(project, ["milestone", "complete", "--milestone", milestone, "--verification", "integration: 8 passed; whole target checked"]);
    assert.equal(call(project, ["execute", "next", "--milestone", milestone]).action, "done");
    assert.equal(call(project, ["milestone", "complete", "--milestone", milestone, "--verification", "integration: later edit"]).idempotent, true);
    const milestoneText = read(project, milestone);
    assert.doesNotMatch(milestoneText, /Completion Evidence Hash|evidenceScope|currentVerification|sha256/);
    assert.equal(existsSync(join(project, `${milestone}.completion.json`)), false);
    assert.equal(existsSync(join(project, ".harness/runs")), false);
    const config = JSON.parse(read(project, ".harness/config.json"));
    config.artifactPolicy.tasks.keepDone = 0;
    write(join(project, ".harness/config.json"), JSON.stringify(config));
    write(join(project, "harness/tasks-archive.md"), `# Archive\n\n- [x] P1 Deliver parser\n  - Doc: ${goal}\n`);
    write(join(project, "harness/tasks.md"), "# Tasks\n\n## Now\n\n## Done\n");
    assert.equal(call(project, ["execute", "next", "--milestone", milestone]).action, "done");
    write(join(project, "harness/tasks-archive.md"), "# Archive\n\n- [x] P1 Deliver parser\n  - Doc: harness/goals/unrelated.md\n");
    assert.match(text(call(project, ["execute", "next", "--milestone", milestone])), /Doc.*identify|Archived task/i);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("plans enforce acceptance coverage, dependencies and containment", () => {
  const { project, goal, ref, plan } = fixture();
  try {
    plan.goals[0].tasks[0].dependsOn = ["missing"];
    write(join(project, `${goal}.plan.json`), JSON.stringify(plan));
    assert.match(text(call(project, ["plan", "validate", "--plan", `${goal}.plan.json`], false)), /unknown dependency/);
    plan.goals[0].tasks[0].dependsOn = [];
    plan.goals[0].tasks[0].acceptance[0] = { ...ref, item: "not-declared" };
    write(join(project, `${goal}.plan.json`), JSON.stringify(plan));
    assert.match(text(call(project, ["plan", "validate", "--plan", `${goal}.plan.json`], false)), /resolve exactly once|Acceptance mapping is missing/);
    plan.goals[0].tasks[0].acceptance = [{ ...ref, path: "../outside.md" }];
    write(join(project, `${goal}.plan.json`), JSON.stringify(plan));
    assert.match(text(call(project, ["plan", "validate", "--plan", `${goal}.plan.json`], false)), /outside|escape|path/i);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("Milestone plans cover every listed Goal and completion item", () => {
  const first = fixture(), { project, goal } = first;
  try {
    const milestone = "harness/milestones/incomplete.md";
    write(join(project, goal), read(project, goal).replace(`Execution Plan: ${goal}.plan.json`, `Execution Plan: ${milestone}.plan.json`));
    write(join(project, milestone), `# Milestone: Incomplete\n\nExecution Plan: ${milestone}.plan.json\nStatus: active.\n\n## Goal List\n\n| Goal | Status | Priority | Doc | Depends on | Gate |\n| --- | --- | --- | --- | --- | --- |\n| Parser | active | P1 | ${goal} | none | integration |\n| Missing | active | P1 | harness/goals/missing.md | Parser | integration |\n\n## Milestone Completion Map\n\n- Item: delivered\n  - Acceptance: Complete all.\n  - Evidence: TBD\n  - Status: pending\n  - Unblocker: N/A\n`);
    const plan = { version: 1, target: { kind: "milestone", path: milestone }, goals: [{ ...first.plan.goals[0], milestoneItem: acceptance(milestone, "delivered", "Milestone Completion Map") }], verification: [{ id: "integration", command: "node --test" }] };
    write(join(project, `${milestone}.plan.json`), JSON.stringify(plan));
    assert.match(text(call(project, ["plan", "validate", "--plan", `${milestone}.plan.json`], false)), /Goal List.*exactly once/);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("new initialization and Goal templates have no Run or checkpoint contract", () => {
  const { project, goal } = fixture();
  try {
    const config = JSON.parse(read(project, ".harness/config.json"));
    config.checkpoint = { defaultPolicy: "enforced", adapterDimensions: { old: ["values"] } };
    write(join(project, ".harness/config.json"), JSON.stringify(config));
    assert.equal(call(project, ["config", "validate"]).ok, true, "legacy checkpoint fields remain readable but ignored");
    assert.equal("runs" in call(project, ["config", "inspect"]).paths, false);
    assert.doesNotMatch(read(project, goal), /Checkpoint Policy|run prepare|Run evidence|DAG/);
    const schema = JSON.parse(readFileSync(join(root, "plugins/agent-harness/schemas/execution-plan.schema.json"), "utf8"));
    assert.equal("inputs" in schema.$defs.check.properties, false);
    assert.equal(existsSync(join(root, "plugins/agent-harness/schemas/candidate-evidence.schema.json")), false);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

const phasingSpec = `# Spec: M5

Status: accepted

## Implementation Phasing

### M5-S0

- Source-spec acceptance and implementation slice.

### M5-D1

- Parent-stage delivery and integration.
`;
function stageFixture(task = "Complete M5") {
  return fixture({ task, spec: phasingSpec });
}
function writeStageMap(project, goal, labels) {
  const items = labels.map(label => `- Item: \`${label}\`
  - Acceptance: Complete and verify ${label}.
  - Evidence: TBD
  - Status: pending
  - Unblocker: N/A`).join("\n");
  const replacement = labels.length ? `## Milestone Completion Map\n\n${items}\n\n` : "";
  const original = read(project, goal);
  const updated = original.replace(/## Milestone Completion Map[\s\S]*?(?=## State Sync Notes)/, replacement);
  assert.notEqual(updated, original, "parent-stage fixture must start with its generated map");
  write(join(project, goal), updated);
}
function setPlanAcceptance(project, goal, plan, refs) {
  plan.goals[0].tasks[0].acceptance = refs;
  write(join(project, `${goal}.plan.json`), JSON.stringify(plan));
}
function assertCompletionRejectedWithoutWrites(project, goal, pattern, verification = "unit: 4 passed") {
  const refs = [goal, "harness/tasks.md", "harness/status.md"];
  const before = refs.map(ref => read(project, ref));
  assert.match(text(call(project, ["goal", "complete", "--goal", goal, "--verification", verification], false)), pattern);
  assert.deepEqual(refs.map(ref => read(project, ref)), before);
  assert.match(read(project, goal), /^Status: active\./m);
  assert.match(read(project, "harness/tasks.md"), /- \[ \]/);
}

test("planned parent stages reject missing, incomplete and local-only completion maps without advancing state", () => {
  for (const scenario of [
    { name: "missing map", labels: [], satisfyLocal: false },
    { name: "incomplete map", labels: ["M5-S0"], satisfyLocal: false },
    { name: "local-only map", labels: ["M5-S0"], satisfyLocal: true },
    { name: "Chinese parent title", task: "完成 M5", labels: ["M5-S0"], satisfyLocal: true },
    { name: "parent title with leaf reference in body", task: "Complete M5", acceptance: "Ship M5-S0 first.", labels: ["M5-S0"], satisfyLocal: true }
  ]) {
    const { project, goal, ref, plan } = stageFixture(scenario.task);
    try {
      if (scenario.acceptance) write(join(project, goal), read(project, goal).replace("- Define concrete acceptance before implementation.", `- ${scenario.acceptance}`));
      const stageRef = acceptance(goal, "M5-S0", "Milestone Completion Map");
      writeStageMap(project, goal, scenario.labels);
      setPlanAcceptance(project, goal, plan, scenario.labels.length ? [ref, stageRef] : [ref]);
      if (scenario.satisfyLocal) {
        satisfy(project, ref);
        satisfy(project, stageRef);
      }
      const pattern = /Milestone Completion Map|required item.*M5-D1/;
      assert.match(text(call(project, ["plan", "validate", "--plan", `${goal}.plan.json`], false)), pattern, scenario.name);
      assertCompletionRejectedWithoutWrites(project, goal, pattern);
    } finally { rmSync(project, { recursive: true, force: true }); }
  }
});

test("planned parent stage completes only after every required stage outcome is accepted", () => {
  const { project, goal, ref, plan } = stageFixture();
  try {
    const stageRefs = ["M5-S0", "M5-D1"].map(label => acceptance(goal, label, "Milestone Completion Map"));
    setPlanAcceptance(project, goal, plan, [ref, ...stageRefs]);
    for (const item of [ref, ...stageRefs]) satisfy(project, item);
    assert.equal(call(project, ["plan", "validate", "--plan", `${goal}.plan.json`]).ok, true);
    call(project, ["goal", "complete", "--goal", goal, "--verification", "unit: 4 passed"]);
    assert.match(read(project, "harness/tasks.md"), /- \[x\] P1 Complete M5/);
    assert.match(read(project, goal), /^Status: completed\./m);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("planned leaf-stage slices keep their existing local completion contract", () => {
  for (const task of ["Implement M5-S0", "Complete M5-S0", "Finish M5-D1", "M5-S0 complete", "完成 M5-S0"]) {
    const { project, goal, ref } = stageFixture(task);
    try {
      assert.doesNotMatch(read(project, goal), /## Milestone Completion Map/, task);
      assert.equal(call(project, ["plan", "validate", "--plan", `${goal}.plan.json`]).ok, true, task);
      satisfy(project, ref);
      call(project, ["goal", "complete", "--goal", goal, "--verification", "unit: 4 passed"]);
      assert.ok(read(project, "harness/tasks.md").includes(`- [x] P1 ${task}`), task);
    } finally { rmSync(project, { recursive: true, force: true }); }
  }
});

const sourceAcceptanceSpec = `# Spec: Parser

Status: accepted

## Spec Acceptance Checklist

- Item: number-output
  - Acceptance: Parser returns the expected number.
  - Evidence: TBD
  - Status: pending
  - Unblocker: N/A
- Item: error-handling
  - Acceptance: Invalid input produces a useful error.
  - Evidence: TBD
  - Status: pending
  - Unblocker: N/A
`;
function sourceAcceptanceFixture() {
  const first = fixture({ spec: sourceAcceptanceSpec });
  const { project, goal } = first;
  const localRef = acceptance(goal, "local-delivery", "Milestone Completion Map");
  const localMap = `## Milestone Completion Map

- Item: local-delivery
  - Acceptance: Local implementation is delivered.
  - Evidence: TBD
  - Status: pending
  - Unblocker: N/A

`;
  const original = read(project, goal);
  const updated = original
    .replace(/- Item: parser-output\n  - Acceptance: [^\n]+\n  - Evidence: TBD\n  - Status: pending\n  - Unblocker: N\/A\n/, "")
    .replace("## State Sync Notes", `${localMap}## State Sync Notes`);
  assert.notEqual(updated, original);
  write(join(project, goal), updated);
  const specRefs = ["number-output", "error-handling"].map(item => acceptance("harness/specs/parser.md", item));
  return { ...first, localRef, specRefs };
}

test("source Spec acceptance cannot disappear behind an empty Goal checklist", () => {
  for (const scenario of [
    { name: "no Spec mappings", mapped: 0, satisfied: 0, validPlan: false },
    { name: "one Spec mapping", mapped: 1, satisfied: 1, validPlan: false },
    { name: "complete mappings with pending acceptance", mapped: 2, satisfied: 0, validPlan: true }
  ]) {
    const { project, goal, plan, localRef, specRefs } = sourceAcceptanceFixture();
    try {
      setPlanAcceptance(project, goal, plan, [localRef, ...specRefs.slice(0, scenario.mapped)]);
      satisfy(project, localRef);
      for (const ref of specRefs.slice(0, scenario.satisfied)) satisfy(project, ref);
      const validation = call(project, ["plan", "validate", "--plan", `${goal}.plan.json`], scenario.validPlan);
      assert.equal(validation.ok, scenario.validPlan, scenario.name);
      const pattern = scenario.validPlan ? /Acceptance is not satisfied/ : /Acceptance mapping is missing/;
      assertCompletionRejectedWithoutWrites(project, goal, pattern);
    } finally { rmSync(project, { recursive: true, force: true }); }
  }
});

test("fully mapped and satisfied Spec and Goal acceptance completes normally", () => {
  const { project, goal, plan, localRef, specRefs } = sourceAcceptanceFixture();
  try {
    setPlanAcceptance(project, goal, plan, [localRef, ...specRefs]);
    for (const ref of [localRef, ...specRefs]) satisfy(project, ref);
    assert.equal(call(project, ["plan", "validate", "--plan", `${goal}.plan.json`]).ok, true);
    call(project, ["goal", "complete", "--goal", goal, "--verification", "unit: 4 passed"]);
    assert.match(read(project, "harness/tasks.md"), /- \[x\] P1 Deliver parser/);
    assert.match(read(project, goal), /^Status: completed\./m);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("completion verification requires an exact id and concrete result for every declared check", () => {
  const { project, goal, ref, plan } = fixture();
  try {
    plan.goals[0].tasks[0].verification.push({ id: "integration", command: "node --test tests/integration.test.mjs" });
    write(join(project, `${goal}.plan.json`), JSON.stringify(plan));
    satisfy(project, ref);
    assert.equal(call(project, ["plan", "validate", "--plan", `${goal}.plan.json`]).ok, true);
    for (const scenario of [
      { summary: "unit", id: "unit" },
      { summary: "unit-integration: 4 passed; integration: 2 passed", id: "unit" },
      { summary: "preunit: 4 passed; integration: 2 passed", id: "unit" },
      { summary: "unit: ; integration: 2 passed", id: "unit" },
      { summary: "unit: pending; integration: 2 passed", id: "unit" },
      { summary: "unit: unit; integration: 2 passed", id: "unit" },
      { summary: "unit: 4 passed; integration: integration", id: "integration" },
      { summary: "unit: 4 passed", id: "integration" }
    ]) {
      assertCompletionRejectedWithoutWrites(project, goal, new RegExp(`result for ${scenario.id}`), scenario.summary);
    }
    call(project, ["goal", "complete", "--goal", goal, "--verification", "unit: node --test tests/parser.test.mjs: 4 passed; integration: 2 passed; no uncovered required scope"]);
    assert.match(read(project, "harness/tasks.md"), /- \[x\] P1 Deliver parser/);
  } finally { rmSync(project, { recursive: true, force: true }); }
});
