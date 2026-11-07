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
function fixture() {
  const project = mkdtempSync(join(tmpdir(), "harness-delivery-"));
  call(project, ["init", "--contract", "adapter"]);
  const config = JSON.parse(read(project, ".harness/config.json"));
  config.gates.requiredForCompletion = [];
  config.paths.runs = ".harness/runs";
  config.checkpoint = { defaultPolicy: "enforced" };
  config.artifactPolicy.runs = "tracked";
  config.artifactPolicy.retention = { completedDays: 30 };
  write(join(project, ".harness/config.json"), JSON.stringify(config));
  write(join(project, "harness/tasks.md"), "# Tasks\n\n## Now\n\n- [ ] P1 Deliver parser\n\n## Done\n");
  write(join(project, "harness/specs/parser.md"), "# Spec: Parser\n\nStatus: accepted\n");
  call(project, ["goal", "create", "--task", "Deliver parser", "--spec", "harness/specs/parser.md", "--work-mode", "local"]);
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
  write(join(project, ref.path), read(project, ref.path).replace(/(- Item: [^\n]+\n  - Acceptance: [^\n]+\n  - Evidence: )TBD(\n  - Status: )pending/, `$1${evidence}$2satisfied`));
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
