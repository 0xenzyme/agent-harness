#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

function read(path) {
  const absolute = join(repoRoot, path);
  if (!existsSync(absolute)) throw new Error(`Missing ${path}`);
  return readFileSync(absolute, "utf8");
}

function json(path) {
  return JSON.parse(read(path));
}

function assert(value, message) {
  if (!value) throw new Error(message);
}

const plugin = json("plugins/agent-harness/.codex-plugin/plugin.json");
assert(plugin.name === "harness", "Codex plugin name must remain harness");
assert(Array.isArray(plugin.interface.defaultPrompt), "Codex plugin defaultPrompt must be a string array");

const marketplace = json(".agents/plugins/marketplace.json");
assert(marketplace.name === "agent-harness-local", "Codex marketplace identity must remain unique");

const hostPack = read("plugins/agent-harness/hosts/codex/execution.md");
for (const marker of ["create_goal", "update_plan", "startingState", "codex-direct", "codex-direct-postflight"]) {
  assert(hostPack.includes(marker), `Codex host pack must include ${marker}`);
}

const pointer = read("plugins/agent-harness/references/codex-native-execution.md");
assert(pointer.includes("hosts/codex/execution.md"), "migration pointer must name the Codex host pack");
assert(pointer.includes("codex-direct"), "migration pointer must keep the legacy path alias");

assert(!existsSync(join(repoRoot, "plugins/agent-harness/templates/codex-agents/harness_explorer.toml")), "explorer template must be absent");
assert(!existsSync(join(repoRoot, "plugins/agent-harness/templates/codex-agents/harness_implementer.toml")), "implementer template must be absent");

const reviewer = read("plugins/agent-harness/templates/codex-agents/harness_reviewer.toml");
assert(reviewer.includes('sandbox_mode = "read-only"'), "Codex reviewer must stay read-only");

console.log("Codex host suite passed.");
