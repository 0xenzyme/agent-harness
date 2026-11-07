import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(root, "plugins/agent-harness/scripts/agent-harness.mjs");
const env = { ...process.env, AGENT_HARNESS_LANG: "en", LANG: "C", LC_ALL: "C", LC_MESSAGES: "C" };
const write = (path, text) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text); };
const json = path => JSON.parse(readFileSync(path, "utf8"));
function call(project, args, expected = true) {
  const result = spawnSync(process.execPath, [cli, ...args, "--cwd", project, "--json"], { cwd: root, env, encoding: "utf8" });
  const output = `${result.stdout || ""}${result.stderr || ""}`;
  assert.equal(result.status === 0, expected, output);
  try { return JSON.parse(result.stdout); } catch { return output; }
}
function project() {
  const cwd = mkdtempSync(join(tmpdir(), "harness-regression-"));
  call(cwd, ["init", "--contract", "adapter"]);
  const config = json(join(cwd, ".harness/config.json"));
  config.gates.requiredForCompletion = [];
  config.paths.runs = ".harness/runs";
  config.checkpoint = { defaultPolicy: "enforced", stages: ["legacy"] };
  config.artifactPolicy.runs = "local-only";
  config.artifactPolicy.retention = { completedDays: 0, keepLatest: 0 };
  write(join(cwd, ".harness/config.json"), JSON.stringify(config));
  write(join(cwd, "harness/tasks.md"), "# Tasks\n\n## Now\n\n- [ ] P1 Delivery\n\n## Done\n");
  write(join(cwd, "harness/specs/delivery.md"), "# Spec\n\nStatus: accepted\n");
  call(cwd, ["goal", "create", "--task", "Delivery", "--spec", "harness/specs/delivery.md", "--work-mode", "local"]);
  const goal = `harness/goals/${readdirSync(join(cwd, "harness/goals")).find(name => name.endsWith(".md"))}`;
  write(join(cwd, goal), readFileSync(join(cwd, goal), "utf8").replace("Status: active.", `Status: active.\nExecution Plan: ${goal}.plan.json`).replace("## Spec Acceptance Checklist", "## Spec Acceptance Checklist\n\n- Item: output\n  - Acceptance: Result works.\n  - Evidence: TBD\n  - Status: pending\n  - Unblocker: N/A"));
  const plan = { version: 1, target: { kind: "goal", path: goal }, goals: [{ id: "delivery", path: goal, dependsOn: [], tasks: [{ id: "build", dependsOn: [], type: "implementation", ownership: { read: ["src"], write: ["src"] }, acceptance: [{ path: goal, section: "Spec Acceptance Checklist", item: "output" }], verification: [{ id: "test", command: "node --test" }] }] }] };
  write(join(cwd, `${goal}.plan.json`), JSON.stringify(plan));
  return { cwd, goal };
}

const fixtures = [];
try {
  {
    const { cwd, goal } = project();
    fixtures.push(cwd);
    write(join(cwd, ".harness/runs/forged/status.json"), JSON.stringify({ phase: "completed", goalPath: goal }));
    write(join(cwd, ".harness/runs/forged/checkpoint.json"), JSON.stringify({ controlState: "reconciliation-required", revision: 5 }));
    assert.equal(call(cwd, ["config", "validate"]).ok, true, "legacy fields stay readable");
    const orientation = call(cwd, ["orient", "next"]);
    assert.equal("checkpointRecovery" in orientation, false, "old checkpoints never drive orientation");
    assert.equal(call(cwd, ["maintain", "tasks"]).active, 1, "forged Run must not complete a Task");
    assert.match(readFileSync(join(cwd, "harness/tasks.md"), "utf8"), /- \[ \] P1 Delivery/);
    write(join(cwd, goal), readFileSync(join(cwd, goal), "utf8").replace("Evidence: TBD", "Evidence: src/result.mjs; test: 5 passed").replace("Status: pending", "Status: satisfied"));
    call(cwd, ["goal", "complete", "--goal", goal, "--verification", "test: 5 passed"]);
    write(join(cwd, "src/result.mjs"), "rapid uncommitted change\n");
    assert.equal(call(cwd, ["execute", "next", "--goal", goal]).action, "done");
    assert.equal(existsSync(join(cwd, ".harness/runs/forged/status.json")), true, "historical files are preserved, never pruned implicitly");
  }
  {
    const { cwd, goal } = project();
    fixtures.push(cwd);
    const original = readFileSync(join(cwd, goal), "utf8");
    assert.match(String(call(cwd, ["goal", "complete", "--goal", goal, "--verification", "test: passed"], false)), /Acceptance is not satisfied/);
    assert.equal(readFileSync(join(cwd, goal), "utf8"), original, "rejected completion must not modify the Goal");
    write(join(cwd, `${goal}.plan.json`), JSON.stringify({ version: 1, target: { kind: "goal", path: "../outside" }, goals: [] }));
    assert.match(JSON.stringify(call(cwd, ["plan", "validate", "--plan", `${goal}.plan.json`], false)), /path|outside|Goals/i);
  }
  {
    const cwd = mkdtempSync(join(tmpdir(), "harness-regression-link-"));
    fixtures.push(cwd);
    const outside = mkdtempSync(join(tmpdir(), "harness-regression-outside-"));
    fixtures.push(outside);
    mkdirSync(join(cwd, ".harness"), { recursive: true });
    symlinkSync(outside, join(cwd, "escape"), "dir");
    write(join(cwd, ".harness/config.json"), JSON.stringify({ contract: "fixed", paths: { tasks: "escape/tasks.md", status: "harness/status.md", goals: "harness/goals" } }));
    assert.match(String(call(cwd, ["maintain", "tasks"], false)), /symlink|outside|inside|escapes/i);
    assert.equal(existsSync(join(outside, "tasks.md")), false);
  }
} finally {
  for (const cwd of fixtures) rmSync(cwd, { recursive: true, force: true });
}

console.log("Regression checks passed.");
