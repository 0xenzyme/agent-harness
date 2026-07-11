#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const casesPath = join(repoRoot, "evals/skills/agent-harness/trigger_cases.yaml");
const allowedSkills = ["harness:orient", "harness:intake", "harness:init", "harness:execute", "none"];

function argValue(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? "" : process.argv[index + 1] || "";
}

function findField(value, key) {
  if (!value || typeof value !== "object") return "";
  if (typeof value[key] === "string" && value[key]) return value[key];
  for (const nested of Object.values(value)) {
    const found = findField(nested, key);
    if (found) return found;
  }
  return "";
}

function fail(message) {
  console.error(message);
  process.exitCode = 1;
  throw new Error(message);
}

if (process.env.AGENT_HARNESS_LIVE_EVAL !== "1") {
  fail("Live activation eval is opt-in. Set AGENT_HARNESS_LIVE_EVAL=1 after approving model usage and cost.");
}

const requestedModel = argValue("--model");
if (!requestedModel) fail("Live activation eval requires --model <model>; model evidence must be explicit.");
const reasoningEffort = argValue("--reasoning-effort") || "high";
const requestedLimit = Number(argValue("--limit") || "0");
const outputPath = argValue("--output");
const cases = JSON.parse(readFileSync(casesPath, "utf8"));
const selectedCases = requestedLimit > 0 ? cases.slice(0, requestedLimit) : cases;
const tempRoot = mkdtempSync(join(tmpdir(), "agent-harness-live-eval-"));

try {
  const schemaPath = join(tempRoot, "activation.schema.json");
  writeFileSync(schemaPath, `${JSON.stringify({
    type: "object",
    additionalProperties: false,
    required: ["selected_skill", "reason"],
    properties: {
      selected_skill: { type: "string", enum: allowedSkills },
      reason: { type: "string" }
    }
  }, null, 2)}\n`);

  const results = [];
  const runtimeModels = new Set();
  for (const testCase of selectedCases) {
    const lastMessagePath = join(tempRoot, `${testCase.id}.json`);
    const prompt = [
      "Perform a live skill-activation routing decision for the user request below.",
      "Use installed skill metadata exactly as Codex would, but do not call tools or mutate files.",
      `Return selected_skill as one of: ${allowedSkills.join(", ")}.`,
      "Choose none when no Agent Harness skill should activate.",
      "User request:",
      testCase.user_request
    ].join("\n");
    const raw = execFileSync("codex", [
      "exec", "--ephemeral", "--sandbox", "read-only", "--json",
      "--model", requestedModel,
      "--config", `model_reasoning_effort=\"${reasoningEffort}\"`,
      "--output-schema", schemaPath,
      "--output-last-message", lastMessagePath,
      "--cd", repoRoot,
      prompt
    ], { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
    const events = raw.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
    for (const event of events) {
      const reported = findField(event, "model");
      if (reported) runtimeModels.add(reported);
    }
    const response = JSON.parse(readFileSync(lastMessagePath, "utf8"));
    const expected = testCase.expected_skills[0] || "none";
    results.push({
      id: testCase.id,
      requestedModel,
      runtimeReportedModel: [...runtimeModels][0] || "",
      reasoningEffort,
      selectedSkill: response.selected_skill,
      expectedSkill: expected,
      passed: response.selected_skill === expected,
      reason: response.reason
    });
  }

  const reportedModels = [...runtimeModels];
  const report = {
    kind: "live-codex-skill-activation",
    createdAt: new Date().toISOString(),
    requestedModel,
    runtimeReportedModels: reportedModels,
    reasoningEffort,
    caseCount: results.length,
    passed: results.filter((item) => item.passed).length,
    failed: results.filter((item) => !item.passed).length,
    results
  };
  const serialized = `${JSON.stringify(report, null, 2)}\n`;
  if (outputPath) writeFileSync(resolve(repoRoot, outputPath), serialized);
  process.stdout.write(serialized);

  if (!reportedModels.length) fail("Codex JSONL did not report the runtime model; refusing to claim GPT-5.6 activation evidence.");
  if (!reportedModels.every((model) => model === requestedModel)) {
    fail(`Runtime model mismatch: requested ${requestedModel}, reported ${reportedModels.join(", ")}.`);
  }
  if (report.failed) process.exitCode = 1;
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
