#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(root, "plugins/agent-harness/scripts/agent-harness.mjs");
const sha = (value) => createHash("sha256").update(value).digest("hex");
const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const write = (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, value); };
const rel = (project, ref) => join(project, ref);
const planRef = "harness/milestones/arithmetic.md.plan.json";
const milestoneRef = "harness/milestones/arithmetic.md";

function call(project, words, { ok = true } = {}) {
  const args = [...words, "--cwd", project, "--json"];
  const result = spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: "utf8", timeout: 30_000 });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  if (ok) assert.equal(result.status, 0, `${args.join(" ")}\n${output}`);
  else assert.notEqual(result.status, 0, `Expected failure: ${args.join(" ")}\n${output}`);
  try { return JSON.parse(result.stdout); } catch { return output; }
}
function fail(project, words, pattern) {
  const result = call(project, words, { ok: false });
  assert.match(typeof result === "string" ? result : JSON.stringify(result), pattern);
  return result;
}
function savePlan(project, plan) { write(rel(project, planRef), `${JSON.stringify(plan, null, 2)}\n`); }
function revision(project, run) { return json(rel(project, `${run}/checkpoint.json`)).revision; }
function runDirs(project) { return readdirSync(rel(project, ".harness/runs")).filter((name) => existsSync(rel(project, `.harness/runs/${name}/status.json`))).map((name) => `.harness/runs/${name}`); }
function checkpointArgs(project, run) { return ["--expected-revision", String(revision(project, run))]; }

function fixture({ contract = "adapter" } = {}) {
  const project = mkdtempSync(join(tmpdir(), "harness-planned-test-"));
  call(project, ["init", "--contract", contract]);
  const configPath = rel(project, ".harness/config.json");
  const config = json(configPath);
  if (contract === "adapter") config.gates.requiredForCompletion = [];
  else config.paths.specs = "notes/specs";
  write(configPath, `${JSON.stringify(config, null, 2)}\n`);
  write(rel(project, "harness/tasks.md"), "# Tasks\n\n## Now\n\n- [ ] P1 Parse input\n- [ ] P1 Format result\n\n## Done\n");
  write(rel(project, "src/parse.mjs"), "export const parse = () => { throw new Error('not implemented'); };\n");
  write(rel(project, "src/format.mjs"), "export const format = () => { throw new Error('not implemented'); };\n");
  write(rel(project, "test/integration.test.mjs"), "import test from 'node:test'; import assert from 'node:assert/strict'; import { parse } from '../src/parse.mjs'; import { format } from '../src/format.mjs'; test('stage', () => assert.equal(format(parse('5')), 'sum=5'));\n");
  const goals = [];
  for (const [title, id] of [["Parse input", "parse"], ["Format result", "format"]]) {
    const spec = `${contract === "fixed" ? "notes/specs" : "harness/specs"}/${id}.md`;
    write(rel(project, spec), `# Spec: ${title}\n\nStatus: accepted\n\n## Acceptance Criteria\n\n- ${title} behaves as described by the integration test.\n`);
    call(project, ["goal", "create", "--task", title, "--spec", spec, "--work-mode", "local", "--checkpoint-policy", "enforced", "--checkpoint-stages", '["implementation","verification","state-sync"]']);
    const name = readdirSync(rel(project, "harness/goals")).find((entry) => entry.includes(id) && entry.endsWith(".md"));
    assert(name, `Generated ${id} Goal`);
    const path = `harness/goals/${name}`;
    let text = readFileSync(rel(project, path), "utf8");
    text = text.replace(/^(# Goal: .+)$/m, `$1\n\nExecution Plan: ${planRef}`);
    const labels = id === "parse" ? ["parse-behavior", "parse-verification"] : ["format-behavior"];
    const map = labels.map((label) => `- Item: ${label}\n  - Acceptance: ${title} ${label} passes the integration test.\n  - Evidence: TBD\n  - Status: pending\n  - Unblocker: N/A`).join("\n");
    text = text.replace(/## Spec Acceptance Checklist\n[\s\S]*?\n## Required Gate Evidence/, `## Spec Acceptance Checklist\n\n${map}\n\n## Required Gate Evidence`);
    write(rel(project, path), text);
    goals.push(path);
  }
  write(rel(project, milestoneRef), `# Milestone: Arithmetic\n\nExecution Plan: ${planRef}\nStatus: active.\n\n## Objective\n\n- Parse and format a value.\n\n## Goal List\n\n| Goal | Status | Priority | Doc | Depends on | Gate |\n| --- | --- | --- | --- | --- | --- |\n| Parse | active | P1 | ${goals[0]} | none | integration |\n| Format | pending | P1 | ${goals[1]} | Parse | integration |\n\n## Milestone Completion Map\n\n- Item: parse-delivered\n  - Acceptance: Parse Goal is verified and synchronized.\n  - Evidence: TBD\n  - Status: pending\n  - Unblocker: N/A\n- Item: format-delivered\n  - Acceptance: Format Goal is verified and synchronized.\n  - Evidence: TBD\n  - Status: pending\n  - Unblocker: N/A\n\n## State Sync Notes\n\n- Pending.\n`);
  const check = (id, kind) => ({ id, command: `node --test test/${kind}.test.mjs`, inputs: kind === "parse" ? ["src/parse.mjs", "test/parse.test.mjs"] : ["src/parse.mjs", "src/format.mjs", "test/format.test.mjs"] });
  const acceptance = (goal, item) => ({ path: goal, section: "Spec Acceptance Checklist", item });
  const task = (id, type, owner, item, deps = []) => ({ id, label: id, dependsOn: deps, type, ownership: { read: ["src", "test"], write: owner ? [owner] : [] }, acceptance: [item], verification: [check(`${id}-check`, id.startsWith("parse") ? "parse" : "format")] });
  const plan = { version: 1, target: { kind: "milestone", path: milestoneRef }, goals: [
    { id: "parse", path: goals[0], dependsOn: [], milestoneItem: { path: milestoneRef, section: "Milestone Completion Map", item: "parse-delivered" }, tasks: [task("parse-code", "implementation", "src/parse.mjs", acceptance(goals[0], "parse-behavior")), task("parse-check", "verification", "", acceptance(goals[0], "parse-verification"), ["parse-code"]) ] },
    { id: "format", path: goals[1], dependsOn: ["parse"], milestoneItem: { path: milestoneRef, section: "Milestone Completion Map", item: "format-delivered" }, tasks: [task("format-code", "implementation", "src/format.mjs", acceptance(goals[1], "format-behavior"))] }
  ], verification: [{ id: "stage-check", command: "node --test test/integration.test.mjs", inputs: ["src/parse.mjs", "src/format.mjs", "test/integration.test.mjs"] }] };
  write(rel(project, "test/parse.test.mjs"), "import test from 'node:test'; import assert from 'node:assert/strict'; import { parse } from '../src/parse.mjs'; test('parse', () => assert.equal(parse('5'), 5));\n");
  write(rel(project, "test/format.test.mjs"), "import test from 'node:test'; import assert from 'node:assert/strict'; import { parse } from '../src/parse.mjs'; import { format } from '../src/format.mjs'; test('format', () => assert.equal(format(parse('5')), 'sum=5'));\n");
  savePlan(project, plan);
  return { project, goals, plan };
}

function prepared(project, goal) {
  const before = new Set(runDirs(project));
  call(project, ["run", "prepare", "--goal", goal, "--plan", planRef]);
  const added = runDirs(project).filter((run) => !before.has(run));
  assert.equal(added.length, 1, "One new planned Run");
  assert.equal(json(rel(project, `${added[0]}/manifest.json`)).manifestVersion, 2);
  return added[0];
}

function receipt(project, run, node, { forcedExitCode, stableFailureLog = "", needUser = null, remaining = [], changedFiles } = {}) {
  const inputs = call(project, ["run", "node", "inputs", "--run", run, "--node", node]).checks;
  assert.equal(inputs.length, 1);
  const command = inputs[0].command;
  const commandArgs = command.split(" ");
  assert.equal(commandArgs[0], "node");
  const observed = spawnSync(process.execPath, commandArgs.slice(1), { cwd: project, encoding: "utf8", timeout: 30_000 });
  const actualCode = observed.status ?? 1;
  const logRef = `${run}/logs/${node}-${Date.now()}-${Math.random().toString(36).slice(2)}.log`;
  const logText = stableFailureLog || `${observed.stdout || ""}${observed.stderr || ""}${forcedExitCode === undefined ? "" : "\nControlled repair probe: controller requests a fix despite passing source check.\n"}`;
  write(rel(project, logRef), logText);
  const target = json(rel(project, `${run}/manifest.json`)).executionPlan.target;
  const goal = json(rel(project, `${run}/status.json`)).goalPath;
  const payload = { version: 1, target, goal, run, node, summary: `Observed ${node} result`, stateSyncNotes: "Controller will synchronize accepted state after verification.", changedFiles: changedFiles ?? (node.endsWith("code") ? [node === "format-code" ? "src/format.mjs" : "src/parse.mjs"] : []), risks: [], remaining, needUser,
    executor: { status: "completed", observedAt: new Date().toISOString(), observedSource: "deterministic test process" },
    checks: inputs.map((item) => ({ id: item.id, command: item.command, inputs: item.inputs, exitCode: forcedExitCode ?? actualCode, observedAt: new Date().toISOString(), log: logRef, logHash: sha(readFileSync(rel(project, logRef))) })) };
  const ref = `${run}/agents/${node}/candidate.json`;
  write(rel(project, ref), `${JSON.stringify(payload, null, 2)}\n`);
  return ref;
}

function review(project, run, node, evidence, decision = "accepted", extra = []) {
  return call(project, ["run", "node", "review", "--run", run, "--node", node, "--evidence", evidence, "--decision", decision, ...checkpointArgs(project, run), ...extra]);
}

function singleFixture() {
  const result = fixture();
  const goal = result.goals[0], ref = `${goal}.plan.json`;
  write(rel(result.project, goal), readFileSync(rel(result.project, goal), "utf8").replace(`Execution Plan: ${planRef}`, `Execution Plan: ${ref}`));
  const plan = { version: 1, target: { kind: "goal", path: goal }, goals: [{ ...result.plan.goals[0], milestoneItem: undefined }] };
  write(rel(result.project, ref), JSON.stringify(plan));
  return { ...result, goal, ref, plan };
}

function completeSingle({ project, goal, ref }) {
  call(project, ["run", "prepare", "--goal", goal, "--plan", ref]);
  const run = runDirs(project)[0];
  write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text);\n");
  for (const node of ["parse-code", "parse-check"]) review(project, run, node, receipt(project, run, node));
  call(project, ["goal", "complete", "--goal", goal, "--run", run, ...checkpointArgs(project, run)]);
  return run;
}

test("tracked completion survives Git-only checkout, archive and later source changes", () => {
  const f = singleFixture(), { project, goal } = f;
  const checkout = mkdtempSync(join(tmpdir(), "harness-portable-checkout-"));
  try {
    assert.equal(spawnSync("git", ["init"], { cwd: project }).status, 0);
    write(rel(project, ".gitignore"), "*.log\nsrc/.data/\n");
    write(rel(project, "src/.data/runtime"), "local binary\n");
    for (const task of f.plan.goals[0].tasks) task.verification[0] = { ...task.verification[0], inputs: ["src", "test/parse.test.mjs"], exclude: ["src/.data"] };
    write(rel(project, f.ref), JSON.stringify(f.plan));
    const run = completeSingle(f);
    assert.equal(spawnSync("git", ["add", "."], { cwd: project }).status, 0);
    const diff = spawnSync("git", ["diff", "--cached", "--check", "--", `${run}/evidence`], { cwd: project, encoding: "utf8" });
    assert.equal(diff.status, 0, diff.stdout + diff.stderr);
    const files = spawnSync("git", ["ls-files", "-z"], { cwd: project, encoding: "utf8" }).stdout.split("\0").filter(Boolean);
    for (const file of files) { mkdirSync(dirname(rel(checkout, file)), { recursive: true }); cpSync(rel(project, file), rel(checkout, file)); }
    assert.equal(existsSync(rel(checkout, "src/.data/runtime")), false);
    assert.equal(call(checkout, ["run", "validate", "--run", run]).ok, true);
    const config = json(rel(checkout, ".harness/config.json"));
    config.artifactPolicy = { tasks: { archive: "harness/archive.md", keepDone: 0 } };
    write(rel(checkout, ".harness/config.json"), JSON.stringify(config));
    const index = readFileSync(rel(checkout, "harness/tasks.md"), "utf8");
    write(rel(checkout, "harness/archive.md"), `# Archive\n\n- [x] P1 Parse input\n  - Doc: ${goal}\n`);
    write(rel(checkout, "harness/tasks.md"), index.replace(/^- \[x\] P1 Parse input\n/m, ""));
    assert.equal(call(checkout, ["goal", "validate", "--goal", goal]).ok, true);
    write(rel(checkout, "src/parse.mjs"), "export const parse = (text) => Number(text.trim());\n");
    const next = call(checkout, ["orient", "next", "--goal", goal]);
    assert.equal(next.action, "done");
    assert.equal(next.evidenceScope, "historical");
    assert.equal(next.currentVerification.status, "changed");
    assert(next.currentVerification.changedInputs.includes("src"));
    assert.equal(call(checkout, ["run", "validate", "--run", run]).currentVerification.status, "changed");
    assert.equal(call(checkout, ["goal", "validate", "--goal", goal]).currentVerification.status, "changed");
    const archive = readFileSync(rel(checkout, "harness/archive.md"), "utf8");
    write(rel(checkout, "harness/archive.md"), archive.replace(goal, `${goal}.unrelated`));
    fail(checkout, ["goal", "validate", "--goal", goal], /Archived task|Goal/i);
    write(rel(checkout, "harness/archive.md"), archive.replace(goal, "harness/goals/unrelated.md"));
    fail(checkout, ["goal", "validate", "--goal", goal], /Archived task|Goal/i);
    write(rel(checkout, "harness/archive.md"), `${archive}\n- [x] P1 Parse input\n`);
    fail(checkout, ["goal", "validate", "--goal", goal], /index.*synchronized/i);
    write(rel(checkout, "harness/archive.md"), archive);
    write(rel(checkout, `${run}/evidence/completion.json`), "{}\n");
    fail(checkout, ["run", "validate", "--run", run], /snapshot.*changed/i);
  } finally { rmSync(project, { recursive: true, force: true }); rmSync(checkout, { recursive: true, force: true }); }
});

test("ignored inputs require explicit exclusions and active evidence stays fresh", () => {
  const f = singleFixture(), { project, goal, ref, plan } = f;
  try {
    spawnSync("git", ["init"], { cwd: project });
    write(rel(project, ".gitignore"), "src/.data/\n");
    write(rel(project, "src/.data/runtime"), "local binary\n");
    for (const task of plan.goals[0].tasks) task.verification[0].inputs = ["src"];
    write(rel(project, ref), JSON.stringify(plan));
    call(project, ["run", "prepare", "--goal", goal, "--plan", ref]);
    const run = runDirs(project)[0];
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text);\n");
    const candidate = receipt(project, run, "parse-code");
    fail(project, ["run", "node", "review", "--run", run, "--node", "parse-code", "--evidence", candidate, "--decision", "accepted", ...checkpointArgs(project, run)], /Git-ignored files/);
    assert.equal(spawnSync("git", ["add", "--force", "src/.data/runtime"], { cwd: project }).status, 0);
    assert.equal(review(project, run, "parse-code", candidate).decision, "accepted", "Explicitly tracked fixtures remain verification inputs even under an ignore pattern");
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text.trim());\n");
    assert.equal(call(project, ["execute", "next", "--goal", goal]).action, "verify-node", "Active accepted nodes still require current source hashes");
    const invalid = structuredClone(plan); invalid.goals[0].tasks[0].verification[0].exclude = ["src"];
    write(rel(project, ref), JSON.stringify(invalid));
    fail(project, ["plan", "validate", "--plan", ref], /whole input|descendants/);
    invalid.goals[0].tasks[0].verification[0].exclude = ["../outside"];
    write(rel(project, ref), JSON.stringify(invalid));
    fail(project, ["plan", "validate", "--plan", ref], /outside|escape|path/i);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("legacy sealing requires original sources and preserves old receipts", () => {
  const f = singleFixture(), { project, goal } = f;
  try {
    const run = completeSingle(f), statusPath = rel(project, `${run}/status.json`);
    const status = json(statusPath); delete status.completionEvidence;
    write(statusPath, JSON.stringify(status));
    const accepted = rel(project, `${run}/agents/parse-code/reviews/1.json`), original = readFileSync(accepted);
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text.trim());\n");
    fail(project, ["run", "seal", "--run", run, ...checkpointArgs(project, run)], /originally verified|changed/i);
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text);\n");
    const before = revision(project, run);
    call(project, ["run", "seal", "--run", run, ...checkpointArgs(project, run), "--dry-run"]);
    assert.equal(revision(project, run), before);
    call(project, ["run", "seal", "--run", run, ...checkpointArgs(project, run)]);
    assert.deepEqual(readFileSync(accepted), original);
    assert.equal(call(project, ["run", "seal", "--run", run, ...checkpointArgs(project, run)]).idempotent, true);
    const nodeStatus = json(rel(project, `${run}/agents/parse-code/status.json`));
    const log = Object.values(nodeStatus.review.logs)[0];
    write(rel(project, log), "tampered log\n");
    fail(project, ["goal", "validate", "--goal", goal], /log missing or changed/i);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("legacy Milestone sealing preserves stage logs and reports later drift separately", () => {
  const { project, goals } = fixture();
  try {
    const run1 = prepared(project, goals[0]);
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text);\n");
    for (const node of ["parse-code", "parse-check"]) review(project, run1, node, receipt(project, run1, node));
    call(project, ["goal", "complete", "--goal", goals[0], "--run", run1, ...checkpointArgs(project, run1)]);
    const run2 = prepared(project, goals[1]);
    write(rel(project, "src/format.mjs"), "export const format = (value) => `sum=${value}`;\n");
    review(project, run2, "format-code", receipt(project, run2, "format-code"));
    call(project, ["goal", "complete", "--goal", goals[1], "--run", run2, ...checkpointArgs(project, run2)]);
    const check = call(project, ["plan", "inputs", "--plan", planRef]).checks[0];
    const result = spawnSync(process.execPath, check.command.split(" ").slice(1), { cwd: project, encoding: "utf8" });
    assert.equal(result.status, 0);
    const log = `${run2}/logs/stage.log`, candidate = `${run2}/stage.json`;
    const logText = `Command: ${check.command}\nExit: ${result.status}\n${result.stdout || ""}${result.stderr || ""}`;
    write(rel(project, log), logText);
    write(rel(project, candidate), JSON.stringify({ version: 1, target: { kind: "milestone", path: milestoneRef }, stateSyncNotes: "Both Goals and stage passed current checks.", checks: [{ ...check, exitCode: 0, observedAt: new Date().toISOString(), log, logHash: sha(logText) }] }));
    call(project, ["milestone", "complete", "--milestone", milestoneRef, "--evidence", candidate, ...checkpointArgs(project, run2)]);
    for (const run of [run1, run2]) {
      const file = rel(project, `${run}/status.json`), value = json(file); delete value.completionEvidence; write(file, JSON.stringify(value));
    }
    const stageRef = `${milestoneRef}.completion.json`, legacy = json(rel(project, stageRef)); delete legacy.durableLogs;
    const raw = JSON.stringify(legacy);
    write(rel(project, stageRef), raw);
    write(rel(project, milestoneRef), readFileSync(rel(project, milestoneRef), "utf8").replace(/^Completion Evidence Hash:.*$/m, `Completion Evidence Hash: ${sha(raw)}`));
    for (const run of [run1, run2]) call(project, ["run", "seal", "--run", run, ...checkpointArgs(project, run)]);
    assert.equal(readFileSync(rel(project, stageRef), "utf8"), raw, "Migration preserves the original stage receipt");
    rmSync(rel(project, log));
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text.trim());\n");
    const next = call(project, ["execute", "next", "--milestone", milestoneRef]);
    assert.equal(next.action, "done");
    assert.equal(next.evidenceScope, "historical");
    assert.equal(next.currentVerification.status, "changed");
    const stageRevision = revision(project, run2);
    assert.equal(call(project, ["milestone", "complete", "--milestone", milestoneRef, "--evidence", stageRef, ...checkpointArgs(project, run2)]).idempotent, true);
    assert.equal(revision(project, run2), stageRevision);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("plan validation rejects unmapped, duplicate, cyclic and escaping graphs", () => {
  const { project, plan } = fixture();
  try {
    assert.equal(call(project, ["plan", "validate", "--plan", planRef]).ok, true);
    const invalid = (mutate, pattern) => { const copy = structuredClone(plan); mutate(copy); savePlan(project, copy); fail(project, ["plan", "validate", "--plan", planRef], pattern); };
    invalid((copy) => { copy.goals[0].tasks.pop(); }, /mapping|unmapped|missing/i);
    invalid((copy) => { copy.goals[1].id = "parse"; }, /duplicate/i);
    invalid((copy) => { copy.goals[0].dependsOn = ["format"]; }, /cycle/i);
    invalid((copy) => { copy.goals[1].dependsOn = ["missing-goal"]; }, /unknown|missing/i);
    invalid((copy) => { copy.goals[0].tasks[1].id = "parse-code"; }, /duplicate/i);
    invalid((copy) => { copy.goals[0].tasks[0].dependsOn = ["parse-check"]; }, /cycle/i);
    invalid((copy) => { copy.goals[0].tasks[1].dependsOn = ["missing-task"]; }, /unknown|missing/i);
    invalid((copy) => { copy.goals[0].path = "../outside.md"; }, /outside|escape|inside|path/i);
    savePlan(project, plan);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("Milestone Goal List requires every Goal and binds declarative fields", () => {
  const { project, goals } = fixture();
  try {
    const milestonePath = rel(project, milestoneRef);
    const original = readFileSync(milestonePath, "utf8");
    const extraGoal = "harness/goals/extra.md";
    write(rel(project, extraGoal), readFileSync(rel(project, goals[1]), "utf8").replace("# Goal: Format result", "# Goal: Extra required work"));
    write(milestonePath, original.replace(`| Format | pending | P1 | ${goals[1]} | Parse | integration |`, `| Format | pending | P1 | ${goals[1]} | Parse | integration |\n| Extra | pending | P1 | ${extraGoal} | none | audit |`));
    fail(project, ["plan", "validate", "--plan", planRef], /every required Goal|Goal List|cover/i);
    write(milestonePath, original);
    const run = prepared(project, goals[0]);
    const changed = original.replace(`| Parse | active | P1 | ${goals[0]} | none | integration |`, `| Parse | active | P2 | ${goals[0]} | none | audit |`);
    write(milestonePath, changed);
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).action, "replan");
    fail(project, ["run", "validate", "--run", run], /changed|contract|plan|hash|Goal List/i);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("blocked Goal cannot be launched or prepared", () => {
  const { project, goals, plan } = fixture();
  try {
    const goalPath = rel(project, goals[0]);
    write(goalPath, readFileSync(goalPath, "utf8").replace("Status: active.", "Status: blocked."));
    const next = call(project, ["execute", "next", "--milestone", milestoneRef]);
    assert.notEqual(next.action, "prepare-run");
    assert.notEqual(next.action, "run-node");
    fail(project, ["run", "prepare", "--goal", goals[0], "--plan", planRef], /blocked|recover/i);
    plan.goals[1].dependsOn = [];
    savePlan(project, plan);
    const milestonePath = rel(project, milestoneRef);
    write(milestonePath, readFileSync(milestonePath, "utf8").replace(`| Format | pending | P1 | ${goals[1]} | Parse | integration |`, `| Format | pending | P1 | ${goals[1]} | none | integration |`));
    const independent = call(project, ["execute", "next", "--milestone", milestoneRef]);
    assert.equal(independent.action, "prepare-run");
    assert.equal(independent.goal, goals[1]);
    assert.equal(prepared(project, goals[1]).startsWith(".harness/runs/"), true);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("candidate logs stay inside their bound Run and identify the recorded executor", () => {
  const { project, goals } = fixture();
  try {
    const run = prepared(project, goals[0]);
    call(project, ["run", "node", "record", "--run", run, "--node", "parse-code", "--phase", "running", "--summary", "worker dispatched", "--thread", "worker-1", "--executor-state", "running", ...checkpointArgs(project, run)]);
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text);\n");
    const candidate = receipt(project, run, "parse-code");
    const original = json(rel(project, candidate));
    const foreignLog = ".harness/runs/foreign/logs/check.log";
    write(rel(project, foreignLog), readFileSync(rel(project, original.checks[0].log)));
    write(rel(project, candidate), `${JSON.stringify({ ...original, executor: { ...original.executor, thread: "worker-1" }, checks: [{ ...original.checks[0], log: foreignLog }] }, null, 2)}\n`);
    fail(project, ["run", "node", "review", "--run", run, "--node", "parse-code", "--evidence", candidate, "--decision", "accepted", ...checkpointArgs(project, run)], /bound Run|Verification logs/i);
    write(rel(project, candidate), `${JSON.stringify({ ...original, executor: { ...original.executor, thread: "worker-2" } }, null, 2)}\n`);
    fail(project, ["run", "node", "review", "--run", run, "--node", "parse-code", "--evidence", candidate, "--decision", "accepted", ...checkpointArgs(project, run)], /executor identity|thread/i);
    write(rel(project, candidate), `${JSON.stringify({ ...original, executor: { ...original.executor, thread: "worker-1" } }, null, 2)}\n`);
    assert.equal(review(project, run, "parse-code", candidate).decision, "accepted");
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("single Goal target has a real next action and rejects unassigned target checks", () => {
  const { project, goals, plan } = fixture();
  try {
    const singleRef = `${goals[0]}.plan.json`;
    const goalPath = rel(project, goals[0]);
    write(goalPath, readFileSync(goalPath, "utf8").replace(`Execution Plan: ${planRef}`, `Execution Plan: ${singleRef}`));
    const single = { version: 1, target: { kind: "goal", path: goals[0] }, goals: [{ ...plan.goals[0], milestoneItem: undefined }], verification: [structuredClone(plan.goals[0].tasks[0].verification[0])] };
    write(rel(project, singleRef), `${JSON.stringify(single, null, 2)}\n`);
    assert.equal(call(project, ["plan", "validate", "--plan", singleRef]).ok, true);
    assert.equal(call(project, ["execute", "next", "--goal", goals[0]]).action, "prepare-run");
    const unassigned = structuredClone(single);
    unassigned.verification[0].id = "outside-task";
    write(rel(project, singleRef), `${JSON.stringify(unassigned, null, 2)}\n`);
    fail(project, ["plan", "validate", "--plan", singleRef], /assigned|Task|verification/i);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("fixed contract Milestone uses default root and explicit Spec root", () => {
  const { project, goals } = fixture({ contract: "fixed" });
  try {
    const config = json(rel(project, ".harness/config.json"));
    assert.equal(config.paths.milestones, undefined, "Fixture exercises the fixed default Milestone root");
    assert.equal(config.paths.specs, "notes/specs");
    assert.equal(call(project, ["plan", "validate", "--plan", planRef]).ok, true);
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).action, "prepare-run");
    const run1 = prepared(project, goals[0]);
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text);\n");
    review(project, run1, "parse-code", receipt(project, run1, "parse-code"));
    review(project, run1, "parse-check", receipt(project, run1, "parse-check"));
    call(project, ["goal", "complete", "--goal", goals[0], "--run", run1, ...checkpointArgs(project, run1)]);
    assert.equal(call(project, ["run", "validate", "--run", run1]).ok, true);
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).goal, goals[1]);
    const run2 = prepared(project, goals[1]);
    write(rel(project, "src/format.mjs"), "export const format = (value) => `sum=${value}`;\n");
    review(project, run2, "format-code", receipt(project, run2, "format-code"));
    call(project, ["goal", "complete", "--goal", goals[1], "--run", run2, ...checkpointArgs(project, run2)]);
    assert.equal(call(project, ["run", "validate", "--run", run2]).ok, true);
    const stage = call(project, ["plan", "inputs", "--plan", planRef]).checks[0];
    const result = spawnSync(process.execPath, stage.command.split(" ").slice(1), { cwd: project, encoding: "utf8", timeout: 30_000 });
    assert.equal(result.status, 0, `${result.stdout || ""}${result.stderr || ""}`);
    const logRef = `${run2}/logs/fixed-stage.log`, evidenceRef = `${run2}/logs/fixed-stage.json`;
    write(rel(project, logRef), `${result.stdout || ""}${result.stderr || ""}`);
    write(rel(project, evidenceRef), `${JSON.stringify({ version: 1, target: { kind: "milestone", path: milestoneRef }, stateSyncNotes: "Fixed Goals and task index synchronized after verified tests.", checks: [{ id: stage.id, command: stage.command, inputs: stage.inputs, exitCode: result.status, observedAt: new Date().toISOString(), log: logRef, logHash: sha(readFileSync(rel(project, logRef))) }] }, null, 2)}\n`);
    const closing = call(project, ["execute", "next", "--milestone", milestoneRef]);
    assert.equal(closing.action, "complete-milestone");
    assert.equal(closing.run, run2);
    call(project, ["milestone", "complete", "--milestone", milestoneRef, "--evidence", evidenceRef, ...checkpointArgs(project, run2)]);
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).action, "done");
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("root verification input ignores transient control files and tracks source edits", () => {
  const { project, plan } = fixture({ contract: "fixed" });
  try {
    plan.verification[0].inputs = ["."];
    savePlan(project, plan);
    const before = call(project, ["plan", "inputs", "--plan", planRef]).checks[0].inputs["."];
    assert.match(before, /^[a-f0-9]{64}$/);
    write(rel(project, ".harness/execution-sync.json"), "transient journal\n");
    write(rel(project, ".harness/.harness-record.lock"), "transient lock\n");
    const configPath = rel(project, ".harness/config.json");
    const config = json(configPath);
    config.projectName = "Changed project label";
    write(configPath, `${JSON.stringify(config, null, 2)}\n`);
    const afterControl = call(project, ["plan", "inputs", "--plan", planRef]).checks[0].inputs["."];
    assert.equal(afterControl, before, "Transient journal, lock and config must not affect root input digest");
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text);\n");
    const afterSource = call(project, ["plan", "inputs", "--plan", planRef]).checks[0].inputs["."];
    assert.notEqual(afterSource, before, "Source changes must affect root input digest");
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("legacy fixed Goals retain arbitrary in-repository Spec references", () => {
  const project = mkdtempSync(join(tmpdir(), "harness-fixed-legacy-"));
  try {
    call(project, ["init", "--contract", "fixed"]);
    write(rel(project, "harness/tasks.md"), "# Tasks\n\n## Now\n\n- [ ] P1 Legacy source\n");
    write(rel(project, "notes/legacy-spec.md"), "# Spec: Legacy source\n\nStatus: accepted\n\n## Acceptance Criteria\n\n- Existing repo-local Spec remains supported.\n");
    call(project, ["goal", "create", "--task", "Legacy source", "--spec", "notes/legacy-spec.md", "--work-mode", "local"]);
    const goal = `harness/goals/${readdirSync(rel(project, "harness/goals")).find((name) => name.endsWith(".md"))}`;
    assert.equal(call(project, ["goal", "validate", "--goal", goal]).ok, true);
    call(project, ["run", "prepare", "--goal", goal]);
    assert.equal(json(rel(project, `${runDirs(project)[0]}/manifest.json`)).manifestVersion, 1);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("Goal completion preserves canonical task-index table columns", () => {
  const { project, goals } = fixture();
  try {
    const table = `# Tasks\n\n## Now\n\n| Task | Type | Status | Priority | Doc |\n| --- | --- | --- | --- | --- |\n| Parse input | implementation | active | P1 | harness/specs/parse.md |\n| Format result | implementation | active | P1 | harness/specs/format.md |\n`;
    write(rel(project, "harness/tasks.md"), table);
    const run = prepared(project, goals[0]);
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text);\n");
    review(project, run, "parse-code", receipt(project, run, "parse-code"));
    review(project, run, "parse-check", receipt(project, run, "parse-check"));
    call(project, ["goal", "complete", "--goal", goals[0], "--run", run, ...checkpointArgs(project, run)]);
    const updated = readFileSync(rel(project, "harness/tasks.md"), "utf8");
    assert.match(updated, /\| Parse input \| implementation \| done \| P1 \| harness\/specs\/parse\.md \|/);
    assert.match(updated, /\| Format result \| implementation \| active \| P1 \| harness\/specs\/format\.md \|/);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("planned Goal named Finish M2 does not inherit Spec phasing map heuristics", () => {
  const { project, goals } = fixture();
  try {
    const goalPath = rel(project, goals[0]);
    write(goalPath, readFileSync(goalPath, "utf8").replaceAll("Parse input", "Finish M2"));
    const indexPath = rel(project, "harness/tasks.md");
    write(indexPath, readFileSync(indexPath, "utf8").replace("P1 Parse input", "P1 Finish M2"));
    const specPath = rel(project, "harness/specs/parse.md");
    write(specPath, `${readFileSync(specPath, "utf8")}\n## Implementation Phasing\n\n### M2-S1 Parse\n\n### M2-S2 Review\n`);
    assert.equal(call(project, ["goal", "validate", "--goal", goals[0]]).ok, true);
    assert.equal(call(project, ["plan", "validate", "--plan", planRef]).ok, true);
    assert.equal(prepared(project, goals[0]).startsWith(".harness/runs/"), true);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("three unchanged repair failures block one Task while independent work stays ready", () => {
  const { project, goals, plan } = fixture();
  try {
    const goalPath = rel(project, goals[0]);
    const extra = "- Item: parse-audit\n  - Acceptance: Independent parse review is recorded.\n  - Evidence: TBD\n  - Status: pending\n  - Unblocker: N/A\n\n";
    write(goalPath, readFileSync(goalPath, "utf8").replace("## Required Gate Evidence", `${extra}## Required Gate Evidence`));
    plan.goals[0].tasks.push({ id: "parse-audit", label: "Independent parse audit", dependsOn: [], type: "verification", ownership: { read: ["src/parse.mjs", "test/parse.test.mjs"], write: [] }, acceptance: [{ path: goals[0], section: "Spec Acceptance Checklist", item: "parse-audit" }], verification: [{ id: "audit-check", command: "node --test test/parse.test.mjs", inputs: ["src/parse.mjs", "test/parse.test.mjs"] }] });
    savePlan(project, plan);
    assert.equal(call(project, ["plan", "validate", "--plan", planRef]).ok, true);
    const run = prepared(project, goals[0]);
    for (let attempt = 1; attempt <= 3; attempt++) {
      // This fixed failure log is a controlled repair-contract probe. The full lifecycle test above uses actual command output.
      const candidate = receipt(project, run, "parse-code", { stableFailureLog: "parse test failed: implementation is incomplete\n" });
      const result = review(project, run, "parse-code", candidate, "request-fix");
      assert.equal(result.noProgressAttempts, attempt);
      assert.equal(result.nodePhase, attempt === 3 ? "blocked" : "prepared");
    }
    const next = call(project, ["execute", "next", "--milestone", milestoneRef]);
    assert.equal(next.node, "parse-audit");
    assert.equal(next.action, "verify-node");
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("candidate review gates dependencies, repair and whole-target completion", () => {
  const { project, goals } = fixture();
  try {
    assert.equal(call(project, ["plan", "validate", "--plan", planRef]).ok, true);
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).action, "prepare-run");
    fail(project, ["run", "prepare", "--goal", goals[1], "--plan", planRef], /dependency|accepted|complete/i);
    const run1 = prepared(project, goals[0]);
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).node, "parse-code");
    fail(project, ["run", "node", "record", "--run", run1, "--node", "parse-code", "--phase", "completed", "--summary", "Cannot bypass controller review", "--verification", "Candidate evidence is not acceptance", ...checkpointArgs(project, run1)], /review|bypass/i);
    assert.equal(revision(project, run1), 0, "Rejected completion bypass must not change revision");
    fail(project, ["run", "node", "record", "--run", run1, "--node", "parse-check", "--phase", "running", "--summary", "start verification", ...checkpointArgs(project, run1)], /depend|accepted/i);
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text);\n");
    const candidate = receipt(project, run1, "parse-code");
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).action, "review-node");
    fail(project, ["run", "node", "record", "--run", run1, "--node", "parse-check", "--phase", "running", "--summary", "candidate exists", ...checkpointArgs(project, run1)], /depend|accepted/i);
    fail(project, ["run", "node", "review", "--run", run1, "--node", "parse-code", "--evidence", candidate, "--decision", "accepted", "--expected-revision", "999"], /revision|stale/i);
    assert.equal(call(project, ["run", "node", "review", "--run", run1, "--node", "parse-code", "--evidence", candidate, "--decision", "accepted", ...checkpointArgs(project, run1), "--dry-run"]).dryRun, true);
    assert.equal(revision(project, run1), 0, "Dry run must preserve revision");
    const failed = receipt(project, run1, "parse-code", { forcedExitCode: 1 });
    assert.equal(review(project, run1, "parse-code", failed, "request-fix").nodePhase, "prepared");
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).node, "parse-code");
    review(project, run1, "parse-code", receipt(project, run1, "parse-code"));
    const checkCandidate = receipt(project, run1, "parse-check", { changedFiles: [] });
    review(project, run1, "parse-check", checkCandidate);
    fail(project, ["goal", "complete", "--goal", goals[1], "--run", run1, ...checkpointArgs(project, run1)], /Goal|Run|planned/i);
    call(project, ["goal", "complete", "--goal", goals[0], "--run", run1, ...checkpointArgs(project, run1)]);
    assert.equal(call(project, ["run", "validate", "--run", run1]).ok, true);
    const closeRevision = revision(project, run1);
    assert.equal(call(project, ["goal", "complete", "--goal", goals[0], "--run", run1, ...checkpointArgs(project, run1)]).idempotent, true);
    assert.equal(revision(project, run1), closeRevision, "Repeat Goal closeout must not increment the revision");
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).action, "prepare-run");
    const run2 = prepared(project, goals[1]);
    write(rel(project, "src/format.mjs"), "export const format = (value) => `sum=${value}`;\n");
    const formatCandidate = receipt(project, run2, "format-code");
    review(project, run2, "format-code", formatCandidate);
    fail(project, ["milestone", "complete", "--milestone", milestoneRef, "--evidence", formatCandidate, ...checkpointArgs(project, run2)], /incomplete|Goal|accepted/i);
    call(project, ["goal", "complete", "--goal", goals[1], "--run", run2, ...checkpointArgs(project, run2)]);
    assert.equal(call(project, ["run", "validate", "--run", run2]).ok, true);
    const stageInputs = call(project, ["plan", "inputs", "--plan", planRef]).checks;
    const stageLog = `${run2}/logs/stage.log`;
    const stageCommand = stageInputs[0].command.split(" ");
    assert.equal(stageCommand[0], "node");
    const stageResult = spawnSync(process.execPath, stageCommand.slice(1), { cwd: project, encoding: "utf8", timeout: 30_000 });
    assert.equal(stageResult.status, 0, `${stageResult.stdout || ""}${stageResult.stderr || ""}`);
    write(rel(project, stageLog), `${stageResult.stdout || ""}${stageResult.stderr || ""}`);
    const stageReceipt = `${run2}/logs/stage-receipt.json`;
    write(rel(project, stageReceipt), JSON.stringify({ version: 1, target: { kind: "milestone", path: milestoneRef }, stateSyncNotes: "Both Goals, index and status were verified.", checks: stageInputs.map((item) => ({ id: item.id, command: item.command, inputs: item.inputs, exitCode: 0, observedAt: new Date().toISOString(), log: stageLog, logHash: sha(readFileSync(rel(project, stageLog))) })) }, null, 2));
    const closing = call(project, ["execute", "next", "--milestone", milestoneRef]);
    assert.equal(closing.action, "complete-milestone");
    assert.equal(closing.run, run2);
    const validStage = json(rel(project, stageReceipt));
    const latestGoalCompletion = Math.max(...[run1, run2].map((run) => Date.parse(json(rel(project, `${run}/status.json`)).completedAt)));
    assert(Number.isFinite(latestGoalCompletion));
    const prematureObservation = new Date(latestGoalCompletion - 1).toISOString();
    const prematureStage = { ...validStage, checks: validStage.checks.map((check) => ({ ...check, observedAt: prematureObservation })) };
    write(rel(project, stageReceipt), `${JSON.stringify(prematureStage, null, 2)}\n`);
    fail(project, ["milestone", "complete", "--milestone", milestoneRef, "--evidence", stageReceipt, ...checkpointArgs(project, run2)], /observedAt|timestamp|verification/i);
    const foreignStageLog = `${run1}/logs/foreign-stage.log`;
    write(rel(project, foreignStageLog), readFileSync(rel(project, stageLog)));
    write(rel(project, stageReceipt), `${JSON.stringify({ ...validStage, checks: validStage.checks.map((check) => ({ ...check, log: foreignStageLog })) }, null, 2)}\n`);
    fail(project, ["milestone", "complete", "--milestone", milestoneRef, "--evidence", stageReceipt, ...checkpointArgs(project, run2)], /bound Run|Verification logs/i);
    write(rel(project, stageReceipt), `${JSON.stringify(validStage, null, 2)}\n`);
    call(project, ["milestone", "complete", "--milestone", milestoneRef, "--evidence", stageReceipt, ...checkpointArgs(project, run2)]);
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).action, "done");
    const stageRevision = revision(project, run2);
    assert.equal(call(project, ["milestone", "complete", "--milestone", milestoneRef, "--evidence", stageReceipt, ...checkpointArgs(project, run2)]).idempotent, true);
    assert.equal(revision(project, run2), stageRevision, "Repeat stage closeout must preserve the revision");
    assert.equal(call(project, ["goal", "validate", "--goal", goals[0]]).ok, true);
    assert.equal(call(project, ["goal", "validate", "--goal", goals[1]]).ok, true);
    assert.equal(call(project, ["run", "validate", "--run", run1]).ok, true);
    assert.equal(call(project, ["run", "validate", "--run", run2]).ok, true);
    assert.match(readFileSync(rel(project, "harness/tasks.md"), "utf8"), /\[x\].*Parse input[\s\S]*\[x\].*Format result/);
    const acceptedStage = `${milestoneRef}.completion.json`;
    const prematureRaw = `${JSON.stringify(prematureStage, null, 2)}\n`;
    write(rel(project, acceptedStage), prematureRaw);
    const milestonePath = rel(project, milestoneRef);
    write(milestonePath, readFileSync(milestonePath, "utf8").replace(/^Completion Evidence Hash:.*$/m, `Completion Evidence Hash: ${sha(prematureRaw)}`));
    const staleNext = call(project, ["execute", "next", "--milestone", milestoneRef]);
    assert.notEqual(staleNext.action, "done", "Next must revalidate accepted stage evidence");
    assert.match(staleNext.reason, /observedAt|timestamp|verification/i);
    const statusPath = rel(project, "harness/status.md");
    write(statusPath, readFileSync(statusPath, "utf8").replace(`Target: \`${milestoneRef}\``, "Target: `harness/milestones/new-stage.md`").replace("Phase: completed", "Phase: active"));
    assert.equal(call(project, ["goal", "validate", "--goal", goals[0]]).ok, true, "Historical completed Goal survives later target projection");
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("completed evidence becomes invalid when verification inputs change", () => {
  const { project, goals } = fixture();
  try {
    const run = prepared(project, goals[0]);
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text);\n");
    review(project, run, "parse-code", receipt(project, run, "parse-code"));
    review(project, run, "parse-check", receipt(project, run, "parse-check"));
    call(project, ["goal", "complete", "--goal", goals[0], "--run", run, ...checkpointArgs(project, run)]);
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text.trim());\n");
    fail(project, ["goal", "validate", "--goal", goals[0]], /changed|stale|verification|evidence/i);
    assert.match(JSON.stringify(call(project, ["execute", "next", "--milestone", milestoneRef])), /replan|verify-node|revalidat/i);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("completed Goal with pending acceptance is rejected", () => {
  const { project, goals } = fixture();
  try {
    const path = rel(project, goals[0]);
    write(path, readFileSync(path, "utf8").replace("Status: active.", "Status: completed."));
    fail(project, ["goal", "validate", "--goal", goals[0]], /pending|satisfied|accepted|Run/i);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("contract drift requires explicit replacement Run and superseding checkpoint", () => {
  const { project, goals, plan } = fixture();
  try {
    const oldRun = prepared(project, goals[0]);
    plan.goals[0].tasks[0].label = "Revised parse implementation";
    savePlan(project, plan);
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).action, "replan");
    call(project, ["run", "checkpoint", "update", "--run", oldRun, "--control-state", "replan-required", "--pause-reason", "Accepted plan changed", "--next-action", "Prepare replacement Run", ...checkpointArgs(project, oldRun)]);
    const replacement = prepared(project, goals[0]);
    fail(project, ["run", "checkpoint", "update", "--run", oldRun, "--control-state", "superseded", "--replacement-run", "not-a-run", ...checkpointArgs(project, oldRun)], /replacement|Run/i);
    call(project, ["run", "checkpoint", "update", "--run", oldRun, "--control-state", "superseded", "--replacement-run", replacement, "--next-action", "Use replacement Run", ...checkpointArgs(project, oldRun)]);
    assert.equal(json(rel(project, `${oldRun}/checkpoint.json`)).replacementRun, replacement);
    const next = call(project, ["execute", "next", "--milestone", milestoneRef]);
    assert.equal(next.run, replacement);
    assert.equal(next.node, "parse-code");
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("unknown executor and project synchronization replay/conflict are explicit", () => {
  const { project, goals } = fixture();
  try {
    const run = prepared(project, goals[0]);
    const cp = checkpointArgs(project, run);
    call(project, ["run", "node", "record", "--run", run, "--node", "parse-code", "--phase", "running", "--summary", "worker dispatched", "--thread", "worker-1", "--executor-state", "unknown", ...cp]);
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).action, "reconcile");
    fail(project, ["run", "node", "record", "--run", run, "--node", "parse-code", "--phase", "running", "--summary", "replace worker", "--thread", "worker-2", ...checkpointArgs(project, run)], /inspect|cancel|owner/i);
    const journalRef = ".harness/execution-sync.json";
    const statusRef = "harness/status.md";
    const original = readFileSync(rel(project, statusRef), "utf8");
    const checkpointRef = `${run}/checkpoint.json`;
    const originalCheckpoint = readFileSync(rel(project, checkpointRef), "utf8");
    const nextCheckpoint = `${JSON.stringify({ ...JSON.parse(originalCheckpoint), revision: revision(project, run) + 1 }, null, 2)}\n`;
    const makeJournal = (next, entries = [{ path: statusRef, beforeHash: sha(original), afterHash: sha(next), content: next }]) => {
      const body = { version: 1, operation: "node-record", run, plan: planRef, planHash: sha(readFileSync(rel(project, planRef))), revision: JSON.parse(originalCheckpoint).revision, entries };
      write(rel(project, journalRef), `${JSON.stringify({ ...body, integrity: sha(JSON.stringify(body)) }, null, 2)}\n`);
    };
    const next = `${original}\nReplay accepted.\n`;
    const statusEntry = { path: statusRef, beforeHash: sha(original), afterHash: sha(next), content: next };
    const checkpointEntry = { path: checkpointRef, beforeHash: sha(originalCheckpoint), afterHash: sha(nextCheckpoint), content: nextCheckpoint };
    makeJournal(next, [statusEntry, checkpointEntry]);
    write(rel(project, statusRef), next); // Simulate interruption after one successful journal write.
    write(rel(project, checkpointRef), nextCheckpoint); // The journal's matching checkpoint can already be at revision +1.
    call(project, ["run", "sync", "--run", run, ...checkpointArgs(project, run)]);
    assert.equal(existsSync(rel(project, journalRef)), false);
    assert.equal(revision(project, run), JSON.parse(nextCheckpoint).revision);
    write(rel(project, statusRef), original);
    const changedGoalRef = goals[0];
    const originalGoal = readFileSync(rel(project, changedGoalRef), "utf8");
    const projectedGoal = `${originalGoal}\nController projected state.\n`;
    const goalEntry = { path: changedGoalRef, beforeHash: sha(originalGoal), afterHash: sha(projectedGoal), content: projectedGoal };
    const nextStatus = `${original}\nReplay should not write.\n`;
    const pendingStatus = { path: statusRef, beforeHash: sha(original), afterHash: sha(nextStatus), content: nextStatus };
    const currentRevision = revision(project, run);
    const conflictBody = { version: 1, operation: "node-record", run, plan: planRef, planHash: sha(readFileSync(rel(project, planRef))), revision: currentRevision, entries: [pendingStatus, goalEntry] };
    write(rel(project, journalRef), `${JSON.stringify({ ...conflictBody, integrity: sha(JSON.stringify(conflictBody)) }, null, 2)}\n`);
    write(rel(project, changedGoalRef), `${originalGoal}\nIntervening user edit.\n`);
    const userEdit = readFileSync(rel(project, changedGoalRef), "utf8");
    fail(project, ["run", "sync", "--run", run, ...checkpointArgs(project, run)], /conflict|intervening/i);
    assert.equal(readFileSync(rel(project, statusRef), "utf8"), original, "No pending write may apply on conflict");
    assert.equal(readFileSync(rel(project, changedGoalRef), "utf8"), userEdit, "User edit must survive conflict");
    assert.equal(existsSync(rel(project, journalRef)), true);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("unknown current-session executor requires reconciliation before foreground continuation", () => {
  const { project, goals } = fixture();
  try {
    const run = prepared(project, goals[0]);
    call(project, ["run", "node", "record", "--run", run, "--node", "parse-code", "--phase", "running", "--summary", "foreground liveness unknown", "--thread", "current-session", "--executor-state", "unknown", ...checkpointArgs(project, run)]);
    const next = call(project, ["execute", "next", "--milestone", milestoneRef]);
    assert.equal(next.action, "reconcile");
    assert.equal(next.run, run);
    assert.equal(next.node, "parse-code");
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("explicit completed planned Run closes its existing Goal without preparing a duplicate", () => {
  const { project, goals } = fixture();
  try {
    const run = prepared(project, goals[0]);
    write(rel(project, "src/parse.mjs"), "export const parse = (text) => Number(text);\n");
    review(project, run, "parse-code", receipt(project, run, "parse-code"));
    review(project, run, "parse-check", receipt(project, run, "parse-check"));
    const goalPath = rel(project, goals[0]);
    write(goalPath, readFileSync(goalPath, "utf8").replace(/## State Sync Notes\n[\s\S]*?(?=\n## |$)/, `## State Sync Notes\n\n- Accepted-state records: ${goals[0]} and harness/tasks.md will be synchronized by the controller.\n- Run evidence: ${run} contains accepted Task checks.\n- Bounded status update: harness/status.md will record verified completion.\n`));
    call(project, ["run", "checkpoint", "update", "--run", run, "--control-state", "completed", "--next-action", "Close Goal using this Run", ...checkpointArgs(project, run)]);
    call(project, ["run", "record", "--run", run, "--phase", "completed", "--summary", "Both parse Tasks accepted", "--verification", "node --test test/parse.test.mjs passed", ...checkpointArgs(project, run)]);
    const next = call(project, ["execute", "next", "--milestone", milestoneRef]);
    assert.equal(next.action, "complete-goal");
    assert.equal(next.run, run);
  } finally { rmSync(project, { recursive: true, force: true }); }
});

test("unplanned Runs retain v1 manifest behavior", () => {
  const { project, goals } = fixture();
  try {
    const goalText = readFileSync(rel(project, goals[0]), "utf8").replace(`Execution Plan: ${planRef}\n`, "");
    write(rel(project, goals[0]), goalText);
    call(project, ["run", "prepare", "--goal", goals[0]]);
    const run = runDirs(project)[0];
    assert.equal(json(rel(project, `${run}/manifest.json`)).manifestVersion, 1);
    assert.equal(json(rel(project, `${run}/status.json`)).manifestVersion, 1);
  } finally { rmSync(project, { recursive: true, force: true }); }
});


test("accepted human approval is reused before dependent implementation", () => {
  const { project, goals, plan } = fixture();
  try {
    const goalPath = rel(project, goals[0]);
    const item = "- Item: data-contract\n  - Acceptance: The input data contract is approved.\n  - Evidence: TBD\n  - Status: pending\n  - Unblocker: N/A\n\n";
    write(goalPath, readFileSync(goalPath, "utf8").replace("## Required Gate Evidence", `${item}## Required Gate Evidence`));
    const mapping = { path: goals[0], section: "Spec Acceptance Checklist", item: "data-contract" };
    plan.goals[0].tasks.unshift({ id: "contract-approval", dependsOn: [], type: "human", question: "Approve the signed-integer input contract?", ownership: { read: ["src/parse.mjs"], write: [] }, acceptance: [mapping], verification: [{ id: "approval", command: "Review accepted input contract approval", inputs: ["src/parse.mjs"], manual: true }] });
    plan.goals[0].tasks.find(t => t.id === "parse-code").dependsOn = ["contract-approval"];
    savePlan(project, plan);
    const run = prepared(project, goals[0]);
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).action, "need-user");
    fail(project, ["run", "node", "record", "--run", run, "--node", "parse-code", "--phase", "running", "--summary", "Maker cannot bypass the data contract", ...checkpointArgs(project, run)], /depend|accepted/i);
    const approvalText = "User accepted the signed-integer input contract in the saved product decision.";
    const current = readFileSync(goalPath, "utf8");
    write(goalPath, current.replace(item, item.replace("Evidence: TBD", `Evidence: ${approvalText}`).replace("Status: pending", "Status: satisfied")));
    const reuse = call(project, ["execute", "next", "--milestone", milestoneRef]);
    assert.equal(reuse.action, "verify-node");
    assert.equal(reuse.node, "contract-approval");
    assert.equal(reuse.needUser, null);
    const checks = call(project, ["run", "node", "inputs", "--run", run, "--node", "contract-approval"]).checks;
    const log = `${run}/logs/approval.log`;
    write(rel(project, log), `${approvalText}\n`);
    const evidence = `${run}/agents/contract-approval/candidate.json`;
    const packet = { version: 1, target: plan.target, goal: goals[0], run, node: "contract-approval", summary: "Verified existing product approval.", changedFiles: [], stateSyncNotes: "Accept the data-contract map without requesting repeat approval.", risks: [], remaining: [], needUser: null, executor: { status: "completed", observedAt: new Date().toISOString(), observedSource: "Recorded human product decision reviewed by controller" }, checks: checks.map(c => ({ id: c.id, command: c.command, inputs: c.inputs, exitCode: 0, observedAt: new Date().toISOString(), log, logHash: sha(readFileSync(rel(project, log))), humanDecision: approvalText })) };
    write(rel(project, evidence), JSON.stringify(packet));
    review(project, run, "contract-approval", evidence);
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).node, "parse-code");
  } finally { rmSync(project, { recursive: true, force: true }); }
});


test("explicitly blocked Milestone prevents Run and Task starts", () => {
  const { project, goals } = fixture();
  try {
    const run = prepared(project, goals[0]);
    const target = rel(project, milestoneRef);
    write(target, readFileSync(target, "utf8").replace("Status: active.", "Status: blocked."));
    assert.equal(call(project, ["execute", "next", "--milestone", milestoneRef]).action, "reconcile");
    fail(project, ["run", "node", "record", "--run", run, "--node", "parse-code", "--phase", "running", "--summary", "Must respect explicit stage pause", ...checkpointArgs(project, run)], /blocked|recovery/i);
    fail(project, ["run", "prepare", "--goal", goals[0], "--plan", planRef], /blocked|recovery/i);
  } finally { rmSync(project, { recursive: true, force: true }); }
});


test("plan validation rejects missing durable adapter gate coverage", () => {
  const { project } = fixture();
  try {
    const configPath = rel(project, ".harness/config.json");
    const config = json(configPath);
    config.gates.requiredForCompletion = ["integration"];
    write(configPath, JSON.stringify(config));
    fail(project, ["plan", "validate", "--plan", planRef], /gate|integration/i);
  } finally { rmSync(project, { recursive: true, force: true }); }
});
