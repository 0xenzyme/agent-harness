#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageManifest = readJson(join(repoRoot, "package.json"));
const pluginManifest = readJson(join(repoRoot, "plugins/agent-harness/.codex-plugin/plugin.json"));
const marketplaceManifest = readJson(join(repoRoot, ".agents/plugins/marketplace.json"));
const marketplaceEntries = Array.isArray(marketplaceManifest.plugins) ? marketplaceManifest.plugins : [];
if (marketplaceEntries.length !== 1) {
  throw new Error("Local marketplace must declare exactly one plugin entry.");
}
const marketplaceEntry = marketplaceEntries[0];
const marketplace = marketplaceManifest.name;
const pluginName = marketplaceEntry.name;
const declaredPluginRoot = resolve(repoRoot, marketplaceEntry.source?.path || "");
const manifestPluginRoot = resolve(repoRoot, "plugins/agent-harness");
if (!marketplace || pluginName !== pluginManifest.name || declaredPluginRoot !== manifestPluginRoot) {
  throw new Error(`Marketplace identity mismatch: marketplace=${marketplace || "missing"}, entry=${pluginName || "missing"}, manifest=${pluginManifest.name}, root=${declaredPluginRoot}.`);
}
for (const [key, expected] of [
  ["AGENT_HARNESS_PLUGIN_MARKETPLACE", marketplace],
  ["AGENT_HARNESS_PLUGIN_NAME", pluginName]
]) {
  if (process.env[key] && process.env[key] !== expected) {
    throw new Error(`${key} conflicts with repository metadata: expected ${expected}, got ${process.env[key]}.`);
  }
}

const pluginVersion = process.env.AGENT_HARNESS_PLUGIN_VERSION || pluginManifest.version || packageManifest.version;
const pluginSelector = process.env.AGENT_HARNESS_PLUGIN_SELECTOR || `${pluginName}@${marketplace}`;
const codexHome = resolve(process.env.CODEX_HOME || join(homedir(), ".codex"));
const cacheDir = resolve(codexHome, "plugins/cache", marketplace, pluginName, pluginVersion);
const validationRoute = "validate:plugin";
const smokeRoute = "test:smoke";
const smokeEnv = {
  AGENT_HARNESS_LANG: "en",
  LANG: "C",
  LC_ALL: "C",
  LC_MESSAGES: "C"
};

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function commandLabel(command, args) {
  return [command, ...args].join(" ");
}

function run(command, args, options = {}) {
  const useShell = process.platform === "win32"
    && !command.includes("\\")
    && !command.includes("/")
    && !existsSync(command);
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...(options.env || {})
    },
    encoding: "utf8",
    shell: useShell,
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
  });

  if (result.error) {
    throw new Error(`Failed to run ${commandLabel(command, args)}: ${result.error.message}`);
  }

  if (result.status !== 0 && !options.allowFailure) {
    const captured = `${result.stdout || ""}${result.stderr || ""}`.trim();
    const detail = captured ? `\n\n${captured}` : "";
    throw new Error(`Command failed (${result.status}): ${commandLabel(command, args)}${detail}`);
  }

  return result;
}

function assertCacheSentinels() {
  const sentinels = [
    {
      file: "skills/orient/SKILL.md",
      text: "ordinary actions"
    },
    {
      file: "references/worker-runner-contract.md",
      text: "Worker Runner Contract"
    },
    {
      file: "templates/worker-prompt.md",
      text: "Return candidate evidence only"
    }
  ];

  const failures = [];
  for (const sentinel of sentinels) {
    const path = join(cacheDir, sentinel.file);
    if (!existsSync(path)) {
      failures.push(`missing ${sentinel.file}`);
      continue;
    }
    const content = readFileSync(path, "utf8");
    if (!content.includes(sentinel.text)) {
      failures.push(`${sentinel.file} missing ${JSON.stringify(sentinel.text)}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(
      [
        "Installed plugin cache does not match the local source update.",
        `Cache: ${cacheDir}`,
        ...failures.map((failure) => `- ${failure}`)
      ].join("\n")
    );
  }
}

console.log(`Validating local plugin source (${validationRoute})...`);
run(process.execPath, ["tools/validate-plugin.mjs"]);
console.log(`Running local smoke suite (${smokeRoute})...`);
run(process.execPath, ["tests/smoke.mjs"], { env: smokeEnv });

console.log(`Refreshing Codex plugin cache for ${pluginSelector}...`);
run("codex", ["plugin", "--help"], { capture: true });
const marketplaceBefore = run("codex", ["plugin", "marketplace", "list"], { capture: true });
if (marketplaceBefore.stdout.includes(marketplace) && !marketplaceBefore.stdout.includes(repoRoot)) {
  throw new Error(`Marketplace ${JSON.stringify(marketplace)} is already registered to a different root; refusing to deploy from ${repoRoot}.`);
}
const marketplaceAdd = run("codex", ["plugin", "marketplace", "add", repoRoot], {
  allowFailure: true,
  capture: true
});
if (marketplaceAdd.status !== 0) {
  const captured = `${marketplaceAdd.stdout || ""}${marketplaceAdd.stderr || ""}`.trim();
  if (!/already|exists|configured/i.test(captured)) {
    throw new Error(`Could not register marketplace ${JSON.stringify(marketplace)} from ${repoRoot}.\n\n${captured}`);
  }
}
const marketplaceList = run("codex", ["plugin", "marketplace", "list"], { capture: true });
if (!marketplaceList.stdout.includes(marketplace) || !marketplaceList.stdout.includes(repoRoot)) {
  throw new Error(`Marketplace registration did not confirm name ${JSON.stringify(marketplace)} at root ${repoRoot}.`);
}

const removeResult = run("codex", ["plugin", "remove", pluginSelector], {
  allowFailure: true,
  capture: true
});
if (removeResult.status !== 0) {
  const captured = `${removeResult.stdout || ""}${removeResult.stderr || ""}`.trim();
  console.warn(`Warning: could not remove ${pluginSelector}; continuing with add.${captured ? `\n${captured}` : ""}`);
}

run("codex", ["plugin", "add", pluginSelector]);
assertCacheSentinels();

console.log(`Local plugin cache updated: ${cacheDir}`);
console.log("Start a new Codex thread or restart Codex App before validating refreshed skill behavior.");
