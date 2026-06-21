#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve, basename } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const pluginRoot = resolve(dirname(__filename), "..");
const templateRoot = join(pluginRoot, "templates");

const contract = {
  tasks: "tasks.md",
  config: ".agent-harness/config.json",
  status: ".agent-harness/status.md",
  goals: ".agent-harness/goals",
  runs: ".agent-harness/runs"
};

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--cwd") {
      args.cwd = argv[i + 1];
      i += 1;
    } else if (arg === "--force") {
      args.force = true;
    } else if (arg === "--project-name") {
      args.projectName = argv[i + 1];
      i += 1;
    } else {
      args._.push(arg);
    }
  }
  return args;
}

function targetCwd(args) {
  return resolve(args.cwd || process.cwd());
}

function readTemplate(name) {
  return readFileSync(join(templateRoot, name), "utf8");
}

function writeIfMissing(path, content, force = false) {
  if (existsSync(path) && !force) {
    return false;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
  return true;
}

function buildConfig(projectName) {
  const payload = JSON.parse(readTemplate("config.json"));
  payload.projectName = projectName;
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function init(args) {
  const cwd = targetCwd(args);
  const projectName = args.projectName || basename(cwd);
  const created = [];

  const tasksPath = join(cwd, contract.tasks);
  if (writeIfMissing(tasksPath, readTemplate("tasks.md"), args.force)) {
    created.push(contract.tasks);
  }

  const configPath = join(cwd, contract.config);
  if (writeIfMissing(configPath, buildConfig(projectName), args.force)) {
    created.push(contract.config);
  }

  const statusPath = join(cwd, contract.status);
  if (writeIfMissing(statusPath, readTemplate("status.md"), args.force)) {
    created.push(contract.status);
  }

  for (const dir of [contract.goals, contract.runs]) {
    mkdirSync(join(cwd, dir), { recursive: true });
  }

  console.log(`Agent Harness initialized in ${cwd}`);
  console.log(created.length ? `Created: ${created.join(", ")}` : "No files changed.");
}

function git(args, gitArgs) {
  try {
    return execFileSync("git", gitArgs, {
      cwd: targetCwd(args),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }).trim();
  } catch {
    return "";
  }
}

function doctor(args) {
  const cwd = targetCwd(args);
  const required = [contract.tasks, contract.config, contract.status, contract.goals, contract.runs];
  const missing = required.filter((path) => !existsSync(join(cwd, path)));
  const gitRoot = git(args, ["rev-parse", "--show-toplevel"]);
  const status = git(args, ["status", "--short"]);
  const worktrees = git(args, ["worktree", "list", "--porcelain"]);

  console.log(`Project: ${cwd}`);
  console.log(`Git root: ${gitRoot || "not a git repository"}`);
  console.log(`Harness files: ${missing.length ? `missing ${missing.join(", ")}` : "ok"}`);
  console.log(`Git status: ${status ? "dirty" : "clean or unavailable"}`);
  if (status) {
    console.log(status);
  }
  if (worktrees) {
    const count = worktrees.split("\n").filter((line) => line.startsWith("worktree ")).length;
    console.log(`Worktrees: ${count}`);
  }
}

function printContract() {
  console.log(JSON.stringify(contract, null, 2));
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0] || "help";

  if (command === "init") {
    init(args);
  } else if (command === "doctor") {
    doctor(args);
  } else if (command === "print-contract") {
    printContract();
  } else {
    console.log("Usage: agent-harness <init|doctor|print-contract> [--cwd PATH] [--force]");
  }
}

main();
