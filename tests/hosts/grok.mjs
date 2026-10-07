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

const marketplace = json(".grok-plugin/marketplace.json");
assert(marketplace.name === "agent-harness-local", "Grok marketplace identity must remain agent-harness-local");
const plugin = Array.isArray(marketplace.plugins)
  ? marketplace.plugins.find((item) => item.name === "harness")
  : null;
assert(plugin, "Grok marketplace must list the harness plugin");
assert(plugin.source === "./plugins/agent-harness", "Grok marketplace must point at the shared plugin");

const hostPack = read("plugins/agent-harness/hosts/grok/execution.md");
for (const marker of [
  "runtimeOutcome",
  "Not exposed",
  "plan.md",
  "todo_write",
  "spawn_subagent",
  "worktree",
  "workflow",
  "openai.yaml",
  "host-direct",
  "host-direct-postflight",
  "durable-harness"
]) {
  assert(hostPack.includes(marker), `Grok host pack must include ${marker}`);
}
assert(hostPack.includes("plugins/agent-harness/agents/"), "Grok host pack must forbid a default plugin agent");

const packet = read("plugins/agent-harness/hosts/grok/result-packet.md");
assert(packet.includes("run node record"), "Grok result packet must record through the CLI");
assert(packet.includes("--surface grok"), "Grok result packet must name the grok surface");
assert(packet.includes("subagent_id"), "Grok result packet must use only an exposed subagent id");

assert(!existsSync(join(repoRoot, "plugins/agent-harness/agents")), "Grok plugin agents directory must stay absent");

console.log("Grok host suite passed.");
