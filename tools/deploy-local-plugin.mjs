#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageManifest = readJson(join(repoRoot, "package.json"));
const pluginManifest = readJson(join(repoRoot, "plugins/agent-harness/.codex-plugin/plugin.json"));

const marketplace = process.env.AGENT_HARNESS_PLUGIN_MARKETPLACE || "personal";
const pluginName = process.env.AGENT_HARNESS_PLUGIN_NAME || pluginManifest.name;
const pluginVersion = process.env.AGENT_HARNESS_PLUGIN_VERSION || pluginManifest.version || packageManifest.version;
const pluginSelector = process.env.AGENT_HARNESS_PLUGIN_SELECTOR || `${pluginName}@${marketplace}`;
const codexHome = resolve(process.env.CODEX_HOME || join(homedir(), ".codex"));
const cacheDir = resolve(codexHome, "plugins/cache", marketplace, pluginName, pluginVersion);
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function commandLabel(command, args) {
  return [command, ...args].join(" ");
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    env: process.env,
    encoding: "utf8",
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
      text: "User-Facing Summary"
    },
    {
      file: "skills/orient/references/user-facing-summary.md",
      text: "Do not paste"
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

console.log("Validating local plugin source...");
run(npmCommand, ["run", "validate:plugin"]);
run(npmCommand, ["run", "test:smoke"]);

console.log(`Refreshing Codex plugin cache for ${pluginSelector}...`);
run("codex", ["plugin", "--help"], { capture: true });
const marketplaceList = run("codex", ["plugin", "marketplace", "list"], { capture: true });
if (!marketplaceList.stdout.includes(marketplace)) {
  throw new Error(`Codex plugin marketplace ${JSON.stringify(marketplace)} is not registered.`);
}
if (!marketplaceList.stdout.includes(repoRoot)) {
  console.warn(`Warning: marketplace list does not show this repo root: ${repoRoot}`);
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
