#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const deterministicEnv = { ...process.env, AGENT_HARNESS_LANG: "en", LANG: "C", LC_ALL: "C", LC_MESSAGES: "C" };
function read(path) { const absolute = join(repoRoot, path); if (!existsSync(absolute)) throw new Error(`Missing ${path}`); return readFileSync(absolute, "utf8"); }
function json(path) { return JSON.parse(read(path)); }
function assert(value, message) { if (!value) throw new Error(message); }
function includes(path, needle) { assert(read(path).includes(needle), `${path} must include ${needle}`); }
function excludes(path, needle) { assert(!read(path).includes(needle), `${path} must not include ${needle}`); }

const invariants = [
  "harness-rule:path-containment",
  "harness-rule:run-dag-ownership",
  "harness-rule:pre-delegation-work-mode",
  "harness-rule:candidate-accepted-evidence",
  "harness-rule:authoritative-completion-state",
  "harness-rule:state-sync-evidence",
  "harness-rule:bounded-status-snapshot",
  "harness-rule:project-neutral-core",
  "harness-rule:durable-tier-boundary"
];

function protocol() {
  const execute = "plugins/agent-harness/skills/execute/SKILL.md";
  for (const invariant of invariants) includes(execute, invariant);
  excludes(execute, "`mixed`");
  includes("plugins/agent-harness/references/route-entry-mapping.md", "Ordinary clear change/build requests use Codex directly");
  includes("plugins/agent-harness/references/model-routing.md", "not pin either by default");
  includes("plugins/agent-harness/references/worker-runner-contract.md", "Codex runtime owns delegation");
  includes("plugins/agent-harness/references/codex-native-execution.md", "codex-direct-postflight");
  includes("plugins/agent-harness/references/codex-native-execution.md", "create_goal");
  includes("plugins/agent-harness/references/codex-native-execution.md", "update_plan");
  includes(execute, "Controller means outcome owner and accepted-state owner");
  includes(execute, "Authorization to create a thread is not authorization to create a worktree");
  includes(execute, "Do not pass `startingState` unless the current user explicitly requests");
  includes(execute, "Workers return candidate evidence and State Sync Notes; only the controller");
  includes(execute, "writes accepted Goal, Task, status, Run, or gate state");
  includes(execute, "Do not apply durable gates");
  includes("plugins/agent-harness/templates/worker-prompt.md", "only the controller records accepted state");
  includes("plugins/agent-harness/templates/worker-prompt.md", "recorded dependencies are incomplete");
  includes("plugins/agent-harness/references/gate-results.md", "Configured completion gates are durable Goal/Run gates");
  includes("plugins/agent-harness/scripts/agent-harness.mjs", "durableRequiredCompletionGates");
  excludes("plugins/agent-harness/scripts/agent-harness.mjs", "gitMaintenanceSummary");
  excludes("plugins/agent-harness/scripts/agent-harness.mjs", "deliveryStateSnapshot");
  excludes("plugins/agent-harness/scripts/agent-harness.mjs", "runStartSnapshot");
  excludes("plugins/agent-harness/scripts/agent-harness.mjs", "deliveryTargetErrors");
  excludes("plugins/agent-harness/templates/goal.md", "## Delivery State");
  excludes("plugins/agent-harness/templates/status.md", "## Git");
  excludes("plugins/agent-harness/scripts/agent-harness.mjs", 'id: "explorer"');
  excludes("plugins/agent-harness/scripts/agent-harness.mjs", 'id: "cli-contract-worker"');
  excludes("plugins/agent-harness/scripts/agent-harness.mjs", 'id: "docs-skill-worker"');
  includes("plugins/agent-harness/scripts/agent-harness.mjs", 'id: "execution"');
  includes("plugins/agent-harness/scripts/agent-harness.mjs", 'dependencies: ["execution"]');
  assert(!existsSync(join(repoRoot, "plugins/agent-harness/templates/codex-agents/harness_explorer.toml")), "explorer template must be absent");
  assert(!existsSync(join(repoRoot, "plugins/agent-harness/templates/codex-agents/harness_implementer.toml")), "implementer template must be absent");
  const schema = json("plugins/agent-harness/schemas/config.schema.json");
  assert(schema.properties.gates.properties.requiredForCompletion && schema.properties.gates.properties.blocking, "completion gate fields must remain supported");
  assert(schema.properties.artifactPolicy.properties.retention && schema.properties.artifactPolicy.properties.tasks, "artifact lifecycle policy must remain supported");
  const adapter = json("plugins/agent-harness/templates/config.adapter.json");
  assert(adapter.worktree && adapter.artifactPolicy && !adapter.workMode && !adapter.loops && !adapter.lifecycle, "canonical adapter config must be slim and lifecycle-aware");
  console.log(`Protocol checks passed (${invariants.length} domain invariants).`);
}

function presentation() {
  const pkg = json("package.json");
  const plugin = json("plugins/agent-harness/.codex-plugin/plugin.json");
  assert(typeof pkg.version === "string" && pkg.version.length > 0, "package version required");
  assert(pkg.version === plugin.version, "canonical package and plugin versions must match");
  const version = pkg.version;
  const releaseNotes = `docs/releases/v${version}.md`;
  assert(existsSync(join(repoRoot, releaseNotes)), `${releaseNotes} must exist for the canonical version`);
  includes(releaseNotes, `# Agent Harness v${version}`);
  includes("CHANGELOG.md", `## ${version} -`);
  assert(Array.isArray(plugin.interface.defaultPrompt) && plugin.interface.defaultPrompt.every((item) => typeof item === "string"), "defaultPrompt must be a string array");
  for (const file of ["README.md", "README.en.md"]) {
    includes(file, `version-${version}-`);
    includes(file, `(docs/releases/v${version}.md)`);
    includes(file, "Plugins Directory");
    includes(file, "marketplace");
  }
  includes("docs/github-presentation.md", `release surface for \`${version}\``);
  includes("docs/github-presentation.md", `docs/releases/v${version}.md`);
  includes("docs/assets/github/social-preview.svg", `v${version}`);
  const marketplace = json(".agents/plugins/marketplace.json");
  assert(marketplace.name === "agent-harness-local", "unique local marketplace identity required");
  console.log("Presentation checks passed.");
}

function smoke() {
  execFileSync(process.execPath, ["tests/smoke.mjs"], { cwd: repoRoot, env: deterministicEnv, stdio: "inherit" });
}

const mode = process.argv[2] || "list";
if (mode === "protocol") protocol();
else if (mode === "presentation") presentation();
else if (mode === "all") { presentation(); protocol(); smoke(); }
else if (mode === "list" || mode === "--list") console.log("presentation, protocol, all");
else throw new Error(`Unknown suite mode: ${mode}`);
