#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const codexHome = resolve(process.env.CODEX_HOME || join(homedir(), ".codex"));
const validator = join(codexHome, "skills/.system/plugin-creator/scripts/validate_plugin.py");
const pluginPath = join(repoRoot, "plugins/agent-harness");
const yamlShim = join(repoRoot, "tools/python-yaml-shim");

if (!existsSync(validator)) {
  console.error(`Plugin validator not found: ${validator}`);
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
