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
const allowedTraceEventTypes = new Set([
  "read",
  "write",
  "mutation",
  "tool_call",
  "worker_result",
  "verification",
  "status_snapshot",
  "control_notice",
  "gate_record",
  "state_transition",
  "closeout"
]);

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

function targetMatches(actual, expected) {
  if (expected.endsWith("/**")) {
    return actual === expected.slice(0, -3) || actual.startsWith(expected.slice(0, -2));
  }
  return actual === expected || actual.includes(expected);
}

function traceEventField(event, field) {
  return event.fields?.[field];
}

function assertRequiredOrderedReads(trace, requiredReads, caseId) {
  let cursor = 0;
  for (const expectedRead of requiredReads || []) {
    const index = trace.findIndex(
      (event, eventIndex) => eventIndex >= cursor && event.type === "read" && targetMatches(event.target, expectedRead)
    );
    assert(index !== -1, `${caseId}: missing required ordered read ${expectedRead}`);
    cursor = index + 1;
  }
}

function assertForbiddenWrites(trace, forbiddenWrites, caseId) {
  for (const event of trace) {
    if (event.type !== "write") {
      continue;
    }
    for (const forbiddenWrite of forbiddenWrites || []) {
      assert(
        !targetMatches(event.target, forbiddenWrite),
        `${caseId}: forbidden write to ${event.target} matched ${forbiddenWrite}`
      );
    }
  }
}

function assertForbiddenMutations(trace, forbiddenMutations, caseId) {
  for (const event of trace) {
    const mutationName = event.action || event.name || event.target;
    if (event.type !== "mutation" && event.type !== "tool_call" && event.type !== "state_transition") {
      continue;
    }
    for (const forbiddenMutation of forbiddenMutations || []) {
      assert(
        !targetMatches(mutationName, forbiddenMutation),
        `${caseId}: forbidden mutation ${mutationName} matched ${forbiddenMutation}`
      );
    }
  }
}

function assertWorkerEvidence(trace, expectedEvidence, caseId) {
  if (!expectedEvidence) {
    return;
  }
  const workerResult = trace.find((event) => event.type === "worker_result");
  assert(workerResult, `${caseId}: missing worker_result event`);
  for (const [field, expected] of Object.entries(expectedEvidence)) {
    if (expected === true) {
      assert(Boolean(traceEventField(workerResult, field)), `${caseId}: missing worker evidence field ${field}`);
    } else {
      assert(
        JSON.stringify(traceEventField(workerResult, field)) === JSON.stringify(expected),
        `${caseId}: expected worker evidence ${field}=${JSON.stringify(expected)}`
      );
    }
  }
  assert(
    traceEventField(workerResult, "candidate_evidence") === true,
    `${caseId}: worker evidence must remain candidate evidence`
  );
}

function assertDegradedProvenance(trace, expectedProvenance, caseId) {
  if (!expectedProvenance) {
    return;
  }
  const provenanceEvent = trace.find((event) => {
    const markers = event.markers || [];
    return markers.includes("harness-rule:degraded-execution-provenance") || event.fields?.degraded === true;
  });
  assert(provenanceEvent, `${caseId}: missing degraded execution provenance event`);
  for (const marker of expectedProvenance.markers || []) {
    assert(
      (provenanceEvent.markers || []).includes(marker),
      `${caseId}: missing degraded execution provenance marker ${marker}`
    );
  }
  for (const [field, expected] of Object.entries(expectedProvenance.fields || {})) {
    assert(
      JSON.stringify(traceEventField(provenanceEvent, field)) === JSON.stringify(expected),
      `${caseId}: expected degraded provenance ${field}=${JSON.stringify(expected)}, got ${JSON.stringify(traceEventField(provenanceEvent, field))}`
    );
  }
}

function assertGateOnlyAcceptanceEvidence(trace, expectedEvidence, caseId) {
  if (!expectedEvidence) {
    return;
  }
  const gateIndex = trace.findIndex((event) => event.type === "gate_record");
  assert(gateIndex !== -1, `${caseId}: missing gate_record event`);
  const gateRecord = trace[gateIndex];
  for (const field of ["implementer_output", "verification", "controller_acceptance"]) {
    if (expectedEvidence[field]) {
      assert(Boolean(traceEventField(gateRecord, field)), `${caseId}: missing gate-only acceptance field ${field}`);
    }
  }
  if (expectedEvidence.state_transition_after_gate) {
    const stateTransitionIndex = trace.findIndex((event) => event.type === "state_transition");
    assert(stateTransitionIndex !== -1, `${caseId}: missing accepted-state transition event`);
    assert(
      stateTransitionIndex > gateIndex,
      `${caseId}: accepted-state transition must occur after gate evidence`
    );
  }
}

function assertCancellationBoundary(trace, expectedBoundary, caseId) {
  if (!expectedBoundary) {
    return;
  }
  const boundaryEvent = trace.find((event) => {
    const markers = event.markers || [];
    return markers.includes("harness-rule:controller-cancellation-boundary");
  });
  assert(boundaryEvent, `${caseId}: missing controller cancellation boundary event`);
  for (const marker of expectedBoundary.markers || []) {
    assert((boundaryEvent.markers || []).includes(marker), `${caseId}: missing cancellation boundary marker ${marker}`);
  }
  for (const [field, expected] of Object.entries(expectedBoundary.fields || {})) {
    assert(
      JSON.stringify(traceEventField(boundaryEvent, field)) === JSON.stringify(expected),
      `${caseId}: expected cancellation boundary ${field}=${JSON.stringify(expected)}, got ${JSON.stringify(traceEventField(boundaryEvent, field))}`
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

function validateBehaviorTraceCaseShape(testCase) {
  assert(typeof testCase.id === "string" && testCase.id, "behavior trace case must have id");
  assert(allowedSkills.has(testCase.skill), `${testCase.id}: unknown skill ${testCase.skill}`);
  assert(typeof testCase.scenario === "string" && testCase.scenario, `${testCase.id}: missing scenario`);
  assert(typeof testCase.user_request === "string" && testCase.user_request, `${testCase.id}: missing request`);
  assert(Array.isArray(testCase.trace) && testCase.trace.length > 0, `${testCase.id}: trace must be a non-empty array`);
  assert(testCase.assertions && typeof testCase.assertions === "object", `${testCase.id}: missing assertions`);

  for (const event of testCase.trace) {
    assert(allowedTraceEventTypes.has(event.type), `${testCase.id}: invalid trace event type ${event.type}`);
    assert(typeof event.target === "string" && event.target, `${testCase.id}: trace event missing target`);
    if (event.fields !== undefined) {
      assert(typeof event.fields === "object" && !Array.isArray(event.fields), `${testCase.id}: event fields must be an object`);
    }
    if (event.markers !== undefined) {
      assert(Array.isArray(event.markers), `${testCase.id}: event markers must be an array`);
    }
  }

  const assertions = testCase.assertions;
  assert(Array.isArray(assertions.required_ordered_reads), `${testCase.id}: required_ordered_reads must be an array`);
  assert(Array.isArray(assertions.forbidden_writes), `${testCase.id}: forbidden_writes must be an array`);
  assert(Array.isArray(assertions.forbidden_mutations), `${testCase.id}: forbidden_mutations must be an array`);
}

function runBehaviorTraceCase(testCase) {
  validateBehaviorTraceCaseShape(testCase);
  const { trace, assertions } = testCase;

  assertRequiredOrderedReads(trace, assertions.required_ordered_reads, testCase.id);
  assertForbiddenWrites(trace, assertions.forbidden_writes, testCase.id);
  assertForbiddenMutations(trace, assertions.forbidden_mutations, testCase.id);
  assertWorkerEvidence(trace, assertions.required_worker_evidence, testCase.id);
  assertDegradedProvenance(trace, assertions.required_degraded_provenance, testCase.id);
  assertGateOnlyAcceptanceEvidence(trace, assertions.required_gate_only_acceptance_evidence, testCase.id);
  assertCancellationBoundary(trace, assertions.required_cancellation_boundary, testCase.id);
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
  const behaviorTraceCases = readJsonYaml(join(skillEvalRoot, "behavior_trace_cases.yaml"));

  const triggerCounts = validateTriggerCases(triggerCases);
  assert(Array.isArray(taskCases), "task cases must be an array");
  assert(taskCases.length >= 4, `expected at least 4 task cases, got ${taskCases.length}`);
  assert(Array.isArray(behaviorTraceCases), "behavior trace cases must be an array");
  assert(behaviorTraceCases.length >= 5, `expected at least 5 behavior trace cases, got ${behaviorTraceCases.length}`);

  let hardCommandCount = 0;
  for (const testCase of taskCases) {
    hardCommandCount += runTaskCase(testCase);
  }
  for (const testCase of behaviorTraceCases) {
    runBehaviorTraceCase(testCase);
  }

  const totalTriggerCases = Object.values(triggerCounts).reduce((sum, count) => sum + count, 0);
  console.log("Agent Harness eval passed.");
  console.log(
    `Trigger cases: ${totalTriggerCases} (${triggerCounts.positive} positive, ${triggerCounts.negative} negative, ${triggerCounts.boundary} boundary).`
  );
  console.log(`Task cases: ${taskCases.length}; hard CLI checks: ${hardCommandCount}.`);
  console.log(`Behavior trace cases: ${behaviorTraceCases.length}.`);
}

main();
