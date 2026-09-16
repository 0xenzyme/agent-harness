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
  "harness-rule:durable-tier-boundary",
  "harness-rule:checkpoint-recovery"
];

function protocol() {
  const execute = "plugins/agent-harness/skills/execute/SKILL.md";
  for (const invariant of invariants) {
    includes(execute, invariant);
    includes("docs/HARNESSES.md", invariant);
  }
  excludes(execute, "`mixed`");
  includes("plugins/agent-harness/references/route-entry-mapping.md", "Ordinary clear change/build requests use the current host directly");
  includes("plugins/agent-harness/references/model-routing.md", "not pin either by default");
  includes("plugins/agent-harness/references/worker-runner-contract.md", "the host owns delegation");
  includes("plugins/agent-harness/references/host-execution.md", "host-direct-postflight");
  includes("plugins/agent-harness/references/host-execution.md", "host-direct");
  includes("plugins/agent-harness/references/host-capabilities.md", "runtimeOutcome");
  includes("plugins/agent-harness/references/host-capabilities.md", "resultPacket");
  includes("plugins/agent-harness/hosts/cursor/execution.md", "runtimeOutcome");
  includes("plugins/agent-harness/hosts/cursor/result-packet.md", "run node record");
  includes("plugins/agent-harness/references/codex-native-execution.md", "codex-direct-postflight");
  includes("plugins/agent-harness/references/artifact-lifecycle.md", "reconciliation-required");
  includes("plugins/agent-harness/templates/goal.md", "Checkpoint Policy: disabled");
  includes("docs/cli.md", "run checkpoint update");
  includes("docs/cli.zh-CN.md", "run checkpoint update");
  includes(execute, "Controller means outcome owner and accepted-state owner");
  includes(execute, "Authorization to create a session or worker is not authorization to create a worktree");
  includes(execute, "Do not pass host-specific starting checkout or session state unless the");
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
  assert(schema.properties.checkpoint.properties.defaultPolicy && schema.properties.checkpoint.properties.stages && schema.properties.checkpoint.properties.adapterDimensions, "checkpoint policy, stage vocabulary, and adapter dimensions must remain supported");
  const adapter = json("plugins/agent-harness/templates/config.adapter.json");
  assert(adapter.worktree && adapter.artifactPolicy && adapter.checkpoint?.defaultPolicy === "disabled" && adapter.paths.ideaInbox === "harness/intake.md" && !adapter.workMode && !adapter.loops && !adapter.lifecycle, "canonical adapter config must include the idea inbox and explicit default-disabled checkpoint policy while remaining slim and lifecycle-aware");
  console.log(`Protocol checks passed (${invariants.length} domain invariants).`);
}

function hostsCodex() {
  includes("plugins/agent-harness/hosts/codex/execution.md", "create_goal");
  includes("plugins/agent-harness/hosts/codex/execution.md", "update_plan");
  includes("plugins/agent-harness/hosts/codex/execution.md", "startingState");
  includes("plugins/agent-harness/hosts/codex/execution.md", "codex-direct");
  includes("plugins/agent-harness/references/codex-native-execution.md", "hosts/codex/execution.md");
  assert(!existsSync(join(repoRoot, "plugins/agent-harness/templates/codex-agents/harness_explorer.toml")), "explorer template must be absent");
  assert(!existsSync(join(repoRoot, "plugins/agent-harness/templates/codex-agents/harness_implementer.toml")), "implementer template must be absent");
  const plugin = json("plugins/agent-harness/.codex-plugin/plugin.json");
  assert(plugin.name === "harness", "Codex plugin name must remain harness");
  execFileSync(process.execPath, ["tests/hosts/codex.mjs"], { cwd: repoRoot, env: deterministicEnv, stdio: "inherit" });
  console.log("Codex host checks passed.");
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
  assert(!existsSync(join(repoRoot, "README.en.md")), "English README must be README.md, not README.en.md");
  const pkgDescription = "Adapter-driven control plane for coding-agent work: tasks, goals, run DAGs, gates, verification, and state sync.";
  assert(pkg.description === pkgDescription, "package.json description must match the GitHub presentation positioning line");
  includes("docs/github-presentation.md", pkgDescription);
  for (const file of ["README.md", "README.zh-CN.md"]) {
    const body = read(file);
    const hero = body.slice(0, body.indexOf("\n## "));
    assert(hero.includes(`version-${version}-`), `${file} first screen must include the version badge`);
    assert(hero.includes("protocol-checks"), `${file} first screen must include the protocol badge`);
    assert(hero.includes("smoke-checks"), `${file} first screen must include the smoke badge`);
    assert(hero.includes("(docs/HARNESSES.md)"), `${file} first screen must route to the capability matrix`);
    assert(hero.includes("(CHANGELOG.md)"), `${file} first screen must route to the changelog`);
    assert(hero.includes(`(docs/releases/v${version}.md)`), `${file} first screen must route to release notes`);
    assert(hero.includes("docs/assets/github/social-preview.svg"), `${file} first screen must route to the social preview`);
    assert(!/!\[[^\]]*]\(\s*docs\/assets\/github\/social-preview/.test(hero), `${file} must link rather than embed the social preview`);
    includes(file, "Plugins Directory");
    includes(file, "marketplace");
    includes(file, "npm run test:all");
  }
  const en = read("README.md");
  const zh = read("README.zh-CN.md");
  assert(en.indexOf("### 1. Ask the current host to use Harness") !== -1
    && en.indexOf("### 1. Ask the current host to use Harness") < en.indexOf("### 2. Adopt a project with the CLI"),
  "English README must lead first-use with host prompts, then CLI adoption");
  assert(zh.indexOf("### 1. 让当前 host 使用 Harness") !== -1
    && zh.indexOf("### 1. 让当前 host 使用 Harness") < zh.indexOf("### 2. 用 CLI 接入项目"),
  "Chinese README must lead first-use with host prompts, then CLI adoption");
  for (const file of ["docs/cli.md", "docs/cli.zh-CN.md"]) includes(file, "npm run test:regressions");
  includes("docs/github-presentation.md", `release surface for \`${version}\``);
  includes("docs/github-presentation.md", `docs/releases/v${version}.md`);
  includes("docs/assets/github/social-preview.svg", `v${version}`);
  includes("docs/assets/github/social-preview.svg", "Adapter-driven control plane for coding-agent work");
  includes("docs/assets/github/social-preview.svg", "State Sync");
  excludes("docs/assets/github/social-preview.svg", "for Codex and coding-agent");
  assert(existsSync(join(repoRoot, "docs/assets/github/social-preview.png")), "social preview PNG must exist at 1280x640 source output");
  const marketplace = json(".agents/plugins/marketplace.json");
  assert(marketplace.name === "agent-harness-local", "unique local marketplace identity required");
  console.log("Presentation checks passed.");
}

function smoke() {
  execFileSync(process.execPath, ["tests/smoke.mjs"], { cwd: repoRoot, env: deterministicEnv, stdio: "inherit" });
}

function regressions() {
  execFileSync(process.execPath, ["tests/regressions.mjs"], { cwd: repoRoot, env: deterministicEnv, stdio: "inherit" });
}

const mode = process.argv[2] || "list";
if (mode === "protocol") protocol();
else if (mode === "presentation") presentation();
else if (mode === "hosts-codex") hostsCodex();
else if (mode === "all") { presentation(); protocol(); hostsCodex(); smoke(); regressions(); }
else if (mode === "smoke") smoke();
else if (mode === "regressions") regressions();
else if (mode === "list" || mode === "--list") console.log("presentation, protocol, hosts-codex, smoke, regressions, all");
else throw new Error(`Unknown suite mode: ${mode}`);
