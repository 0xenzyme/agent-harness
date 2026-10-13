#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const codexHome = resolve(process.env.CODEX_HOME || join(homedir(), ".codex"));
const args = process.argv.slice(2);
if (args.includes("--help")) {
  console.log("Usage: node tools/validate-plugin.mjs [--validator PATH]\nOverride: AGENT_HARNESS_PLUGIN_VALIDATOR=PATH\nRuns the external official Python plugin validator; no local fallback.");
  process.exit(0);
}
const option = args.indexOf("--validator");
if (option !== -1 && (option !== 0 || args.length !== 2 || !args[1])) {
  console.error("Usage: node tools/validate-plugin.mjs [--validator PATH]");
  process.exit(2);
}
if (option === -1 && args.length) {
  console.error(`Unknown argument: ${args[0]}`);
  process.exit(2);
}
const validator = resolve(option !== -1
  ? args[option + 1]
  : process.env.AGENT_HARNESS_PLUGIN_VALIDATOR || join(codexHome, "skills/.system/plugin-creator/scripts/validate_plugin.py"));
const pluginPath = join(repoRoot, "plugins/agent-harness");
const yamlShim = join(repoRoot, "tools/python-yaml-shim");

if (!existsSync(validator)) {
  console.error(`Official plugin validator not found: ${validator}\nSet --validator PATH or AGENT_HARNESS_PLUGIN_VALIDATOR to its Python script. For a separate portable integrity check, run node tools/validate-plugin-local.mjs.`);
  process.exit(1);
}

const pythonCandidates = process.env.PYTHON
  ? [process.env.PYTHON]
  : process.platform === "win32"
    ? ["python", "python3"]
    : ["python3", "python"];

const env = {
  ...process.env,
  PYTHONPATH: process.env.PYTHONPATH
    ? `${yamlShim}${process.platform === "win32" ? ";" : ":"}${process.env.PYTHONPATH}`
    : yamlShim
};

let lastError = null;
for (const python of pythonCandidates) {
  const result = spawnSync(python, [validator, pluginPath], {
    cwd: repoRoot,
    env,
    encoding: "utf8",
    stdio: "inherit"
  });

  if (result.error) {
    lastError = result.error;
    continue;
  }

  process.exit(result.status ?? 1);
}

console.error(`Unable to run Python for plugin validation: ${lastError?.message || "no Python executable found"}`);
process.exit(1);
