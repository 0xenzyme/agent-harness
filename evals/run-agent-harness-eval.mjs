#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const evalRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(evalRoot, "..");
const cli = join(repoRoot, "plugins/agent-harness/scripts/agent-harness.mjs");
const skillEvalRoot = join(evalRoot, "skills/agent-harness");

const allowedSkills = new Set([
  "harness:orient",
  "harness:intake",
  "harness:init",
  "harness:execute"
]);
const allowedKinds = new Set(["positive", "negative", "boundary"]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJsonYaml(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${path} must be valid YAML-compatible JSON: ${error.message}`);
  }
}

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function getAtPath(value, dottedPath) {
  return dottedPath.split(".").reduce((current, part) => {
    if (current === undefined || current === null) {
      return undefined;
    }
    return current[part];
  }, value);
}

function valueIncludes(value, expected) {
  if (Array.isArray(value)) {
    return value.includes(expected);
  }
  if (typeof value === "string") {
    return value.includes(expected);
  }
  return JSON.stringify(value).includes(JSON.stringify(expected));
}

function assertJsonEquals(json, checks, caseId) {
  for (const [path, expected] of Object.entries(checks || {})) {
    const actual = getAtPath(json, path);
    assert(
      JSON.stringify(actual) === JSON.stringify(expected),
      `${caseId}: expected ${path}=${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function assertJsonIncludes(json, checks, caseId) {
  for (const [path, expected] of Object.entries(checks || {})) {
    const actual = getAtPath(json, path);
    assert(
      valueIncludes(actual, expected),
      `${caseId}: expected ${path} to include ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function assertJsonNotIncludes(json, checks, caseId) {
  for (const [path, expected] of Object.entries(checks || {})) {
    const actual = getAtPath(json, path);
    assert(
      !valueIncludes(actual, expected),
      `${caseId}: expected ${path} not to include ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

function runHarness(args, projectDir) {
  const expandedArgs = args.map((arg) => (arg === "$PROJECT" ? projectDir : arg));
  try {
    return execFileSync(process.execPath, [cli, ...expandedArgs], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    });
  } catch (error) {
    throw new Error(
      `Command failed: agent-harness ${expandedArgs.join(" ")}\n${error.stdout || ""}${error.stderr || ""}`
    );
  }
}

function validateTriggerCases(cases) {
  assert(Array.isArray(cases), "trigger cases must be an array");

  const ids = new Set();
  const counts = { positive: 0, negative: 0, boundary: 0 };

  for (const testCase of cases) {
    assert(typeof testCase.id === "string" && testCase.id, "trigger case must have id");
    assert(!ids.has(testCase.id), `duplicate trigger case id: ${testCase.id}`);
    ids.add(testCase.id);
    assert(allowedKinds.has(testCase.kind), `${testCase.id}: invalid kind ${testCase.kind}`);
    counts[testCase.kind] += 1;
    assert(typeof testCase.user_request === "string" && testCase.user_request, `${testCase.id}: missing request`);
    assert(typeof testCase.should_trigger === "boolean", `${testCase.id}: missing should_trigger boolean`);
    assert(Array.isArray(testCase.expected_skills), `${testCase.id}: expected_skills must be an array`);
    for (const skill of testCase.expected_skills) {
      assert(allowedSkills.has(skill), `${testCase.id}: unknown skill ${skill}`);
    }
    if (!testCase.should_trigger) {
      assert(testCase.expected_skills.length === 0, `${testCase.id}: negative cases should not expect skills`);
    }
    assert(typeof testCase.rationale === "string" && testCase.rationale, `${testCase.id}: missing rationale`);
  }

  assert(counts.positive >= 20, `expected at least 20 positive trigger cases, got ${counts.positive}`);
  assert(counts.negative >= 10, `expected at least 10 negative trigger cases, got ${counts.negative}`);
  assert(counts.boundary >= 5, `expected at least 5 boundary trigger cases, got ${counts.boundary}`);

  return counts;
}

function materializeFixture(name, projectDir) {
  if (name === "new-project") {
    write(join(projectDir, "README.md"), "# New Project\n");
    write(join(projectDir, "package.json"), "{\"private\":true,\"scripts\":{\"test\":\"node src/app.js\"}}\n");
    write(join(projectDir, "src/app.js"), "console.log('new project');\n");
    return;
  }

  if (name === "legacy-project") {
    write(join(projectDir, "harness/README.md"), "# Legacy Adapter\n\nHarness contract: adapter\n");
    write(join(projectDir, "todolist.md"), "# Todo\n\n## Now\n\n- [ ] P1 Existing import task\n");
    write(join(projectDir, "harness/specs/existing.md"), "# Existing Spec\n\nStatus: accepted\n");
    return;
  }

  if (name === "non-harness-project") {
    write(join(projectDir, "README.md"), "# Ordinary Application\n");
    write(join(projectDir, "package.json"), "{\"private\":true}\n");
    write(join(projectDir, "src/server.js"), "console.log('ordinary app');\n");
    write(join(projectDir, "docs/notes.md"), "# Notes\n");
    return;
  }

  if (name === "messy-realistic") {
    write(
      join(projectDir, ".harness/config.json"),
      `${JSON.stringify(
        {
          contract: "adapter",
          projectName: "messy-realistic",
          adapter: {
            docs: "harness/README.md",
            machineReadable: ".harness/config.json",
            preflight: ["Read AGENTS.md before editing repository files."],
            stateSync: ["Update harness/status.md after execution or verification."]
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
          }
        },
        null,
        2
      )}\n`
    );
    write(join(projectDir, "AGENTS.md"), "# Project Rules\n\nDo not edit implementation files during orientation.\n");
    write(join(projectDir, "harness/README.md"), "# Messy Adapter\n\nHarness contract: adapter\n");
    write(
      join(projectDir, "harness/tasks.md"),
      [
        "# Project Tasks",
        "",
        "## Now",
        "",
        "- [ ] P1 Stabilize eval runner",
        "- [ ] P2 Draft transcript rubric",
        "",
        "## Blocked",
        "",
        "- [ ] P1 Release eval runner",
        "  - Blocked: waiting for judge calibration",
        "",
        "## Done",
        "",
        "- [x] P3 Create eval fixture notes",
        ""
      ].join("\n")
    );
    write(
      join(projectDir, "harness/status.md"),
      [
        "# Project Status",
        "",
        "## Focus",
        "",
        "- Current focus: stale focus from a prior task.",
        "",
        "## Blockers",
        "",
        "- Judge calibration is not complete.",
        ""
      ].join("\n")
    );
    write(join(projectDir, "harness/goals/active.md"), "# Active Goal\n\nStatus: accepted\n");
    write(join(projectDir, "harness/specs/accepted.md"), "# Accepted Spec\n\nStatus: accepted\n");
    return;
  }

  throw new Error(`Unknown fixture: ${name}`);
}

function validateTaskCaseShape(testCase) {
  assert(typeof testCase.id === "string" && testCase.id, "task case must have id");
  assert(typeof testCase.fixture === "string" && testCase.fixture, `${testCase.id}: missing fixture`);
  assert(typeof testCase.user_request === "string" && testCase.user_request, `${testCase.id}: missing request`);
  assert(typeof testCase.expected_route === "string" && testCase.expected_route, `${testCase.id}: missing route`);
  assert(Array.isArray(testCase.required_reads), `${testCase.id}: required_reads must be an array`);
  assert(Array.isArray(testCase.forbidden_operations), `${testCase.id}: forbidden_operations must be an array`);
  assert(Array.isArray(testCase.hard_checks) && testCase.hard_checks.length > 0, `${testCase.id}: missing hard checks`);
  assert(Array.isArray(testCase.soft_rubric) && testCase.soft_rubric.length > 0, `${testCase.id}: missing soft rubric`);
}

function runTaskCase(testCase) {
  validateTaskCaseShape(testCase);

  const projectDir = mkdtempSync(join(tmpdir(), `agent-harness-eval-${testCase.id}-`));
  let commandCount = 0;

  try {
    materializeFixture(testCase.fixture, projectDir);

    for (const check of testCase.hard_checks) {
      assert(Array.isArray(check.command), `${testCase.id}: hard check command must be an array`);
      const output = runHarness(check.command, projectDir);
      commandCount += 1;

      if (check.stdout_includes) {
        for (const expected of check.stdout_includes) {
          assert(output.includes(expected), `${testCase.id}: command output did not include ${expected}`);
        }
      }

      if (check.json_equals || check.json_includes || check.json_not_includes) {
        let json;
        try {
          json = JSON.parse(output);
        } catch (error) {
          throw new Error(`${testCase.id}: command output was not JSON: ${error.message}\n${output}`);
        }
        assertJsonEquals(json, check.json_equals, testCase.id);
        assertJsonIncludes(json, check.json_includes, testCase.id);
        assertJsonNotIncludes(json, check.json_not_includes, testCase.id);
      }
    }

    for (const relativePath of testCase.path_absent_after || []) {
      assert(!existsSync(join(projectDir, relativePath)), `${testCase.id}: unexpected path exists: ${relativePath}`);
    }

    for (const relativePath of testCase.path_exists_after || []) {
      assert(existsSync(join(projectDir, relativePath)), `${testCase.id}: expected path missing: ${relativePath}`);
    }
  } finally {
    rmSync(projectDir, { recursive: true, force: true });
  }

  return commandCount;
}

function main() {
  const triggerCases = readJsonYaml(join(skillEvalRoot, "trigger_cases.yaml"));
  const taskCases = readJsonYaml(join(skillEvalRoot, "task_cases.yaml"));

  const triggerCounts = validateTriggerCases(triggerCases);
  assert(Array.isArray(taskCases), "task cases must be an array");
  assert(taskCases.length >= 4, `expected at least 4 task cases, got ${taskCases.length}`);

  let hardCommandCount = 0;
  for (const testCase of taskCases) {
    hardCommandCount += runTaskCase(testCase);
  }

  const totalTriggerCases = Object.values(triggerCounts).reduce((sum, count) => sum + count, 0);
  console.log("Agent Harness eval passed.");
  console.log(
    `Trigger cases: ${totalTriggerCases} (${triggerCounts.positive} positive, ${triggerCounts.negative} negative, ${triggerCounts.boundary} boundary).`
  );
  console.log(`Task cases: ${taskCases.length}; hard CLI checks: ${hardCommandCount}.`);
}

main();
