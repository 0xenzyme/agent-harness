#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
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
  const valueOptions = new Set(["cwd", "goal", "projectName", "project-name", "run", "task"]);
  const booleanOptions = new Set(["dryRun", "dry-run", "force", "help"]);

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg.startsWith("--")) {
      const rawKey = arg.slice(2);
      const key = toCamelCase(rawKey);
      if (booleanOptions.has(rawKey) || booleanOptions.has(key)) {
        args[key] = true;
      } else if (valueOptions.has(rawKey) || valueOptions.has(key)) {
        const value = argv[i + 1];
        if (!value || value.startsWith("--")) {
          throw new Error(`Missing value for ${arg}`);
        }
        args[key] = value;
        i += 1;
      } else {
        throw new Error(`Unknown option: ${arg}`);
      }
    } else {
      args._.push(arg);
    }
  }
  return args;
}

function toCamelCase(value) {
  return value.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
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

function loadProjectConfig(cwd) {
  const configPath = join(cwd, contract.config);
  if (!existsSync(configPath)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(configPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not parse ${contract.config}: ${error.message}`);
  }
}

function projectPaths(cwd) {
  const config = loadProjectConfig(cwd);
  const paths = config.paths || {};
  return {
    tasks: paths.tasks || contract.tasks,
    config: contract.config,
    status: paths.status || contract.status,
    goals: paths.goals || contract.goals,
    runs: paths.runs || contract.runs
  };
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

function todayStamp(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function runTimestamp(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("") + "-" + [
    String(date.getHours()).padStart(2, "0"),
    String(date.getMinutes()).padStart(2, "0"),
    String(date.getSeconds()).padStart(2, "0")
  ].join("");
}

function slugify(value) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || "goal";
}

function displayPath(cwd, path) {
  const rel = relative(cwd, path);
  if (rel && !rel.startsWith("..")) {
    return rel;
  }
  return path;
}

function titleCase(value) {
  return value.replace(/\b[a-z]/g, (char) => char.toUpperCase());
}

function parseTasks(content) {
  const lines = content.split(/\r?\n/);
  const tasks = [];
  let current = null;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const match = line.match(/^- \[( |x|X)\]\s+(?:(P\d+)\s+)?(.+?)\s*$/);
    if (match) {
      current = {
        done: match[1].toLowerCase() === "x",
        priority: match[2] || "",
        title: match[3],
        line: index + 1,
        details: []
      };
      tasks.push(current);
    } else if (current && line.startsWith("  - ")) {
      current.details.push(line.slice(4));
    } else if (line.startsWith("#") || line.trim() === "") {
      current = null;
    }
  }

  return tasks;
}

function normalized(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function findTask(tasks, query) {
  const needle = normalized(query);
  const activeTasks = tasks.filter((task) => !task.done);
  const exactMatches = activeTasks.filter((task) => {
    const title = normalized(task.title);
    const titledPriority = normalized(`${task.priority} ${task.title}`);
    return title === needle || titledPriority === needle;
  });
  if (exactMatches.length === 1) {
    return exactMatches[0];
  }

  const partialMatches = activeTasks.filter((task) => normalized(task.title).includes(needle));
  if (partialMatches.length === 1) {
    return partialMatches[0];
  }

  if (exactMatches.length > 1 || partialMatches.length > 1) {
    const matches = (exactMatches.length > 1 ? exactMatches : partialMatches)
      .map((task) => `- ${task.priority ? `${task.priority} ` : ""}${task.title}`)
      .join("\n");
    throw new Error(`Task query matched multiple tasks:\n${matches}`);
  }

  throw new Error(`Task not found in tasks.md: ${query}`);
}

function detailValue(task, key) {
  const lowerKey = `${key.toLowerCase()}:`;
  const detail = task.details.find((line) => line.toLowerCase().startsWith(lowerKey));
  return detail ? detail.slice(lowerKey.length).trim() : "";
}

function buildGoalContent(task) {
  const heading = titleCase(task.title);
  const source = detailValue(task, "Source") || "tasks.md";
  const acceptance = detailValue(task, "Acceptance") || "Define concrete acceptance before implementation.";
  const notes = detailValue(task, "Notes");

  return `# Goal: ${heading}

Spec: TBD
Status: Draft goal handoff; execute only after the spec is confirmed by the user.

## Source Task

- \`tasks.md\`: \`${task.priority ? `${task.priority} ` : ""}${task.title}\`

## Read First

1. \`AGENTS.md\`
2. \`tasks.md\`
3. \`.agent-harness/config.json\`
4. \`.agent-harness/status.md\`

## Work Mode Recommendation

Use \`ask\` until the goal has a confirmed spec and clear file ownership.

## Scope

- ${acceptance}

## Non-Goals

- Do not push, deploy, publish, or open a PR unless separately requested.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: ${source || "Not recorded."}
${notes ? `- Notes: ${notes}\n` : ""}
## Verification

Run the smallest relevant deterministic checks for the files changed by this goal.

## Completion Conditions

- The source task acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- \`tasks.md\` and \`.agent-harness/status.md\` are updated.

## Pause Conditions

- The spec has not been confirmed by the user.
- The work requires credentials, paid APIs, production access, destructive commands, push, PR, or release.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
`;
}

function goalCreate(args) {
  const cwd = targetCwd(args);
  const paths = projectPaths(cwd);
  const taskQuery = args.task;
  if (!taskQuery) {
    throw new Error("Usage: agent-harness goal create --task <title-or-id> [--cwd PATH] [--dry-run]");
  }

  const tasksPath = join(cwd, paths.tasks);
  if (!existsSync(tasksPath)) {
    throw new Error(`Missing ${paths.tasks}`);
  }

  const task = findTask(parseTasks(readFileSync(tasksPath, "utf8")), taskQuery);
  const slug = slugify(task.title);
  const goalRelPath = join(paths.goals, `${todayStamp()}-${slug}.md`);
  const goalPath = join(cwd, goalRelPath);
  const content = buildGoalContent(task);

  if (args.dryRun) {
    console.log(`Would create ${goalRelPath}`);
    console.log("");
    console.log(content.trimEnd());
    return;
  }

  if (existsSync(goalPath) && !args.force) {
    throw new Error(`${goalRelPath} already exists. Use --force to overwrite.`);
  }

  mkdirSync(dirname(goalPath), { recursive: true });
  writeFileSync(goalPath, content);
  console.log(`Created ${goalRelPath}`);
}

function extractSection(content, title) {
  const pattern = new RegExp(`^## ${escapeRegExp(title)}\\s*$`, "m");
  const match = content.match(pattern);
  if (!match || match.index === undefined) {
    return "";
  }

  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const next = rest.search(/^## /m);
  return (next === -1 ? rest : rest.slice(0, next)).trim();
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractInlinePath(content, label) {
  const pattern = new RegExp(`^${escapeRegExp(label)}:\\s+\`?([^\\n\`]+)\`?`, "m");
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
}

function extractWorkMode(goalContent, cwd) {
  const section = extractSection(goalContent, "Work Mode Recommendation");
  const match = section.match(/Use\s+`(local|worktree|ask)`/i);
  if (match) {
    return match[1].toLowerCase();
  }

  const config = loadProjectConfig(cwd);
  return config.worktree?.defaultPolicy || "ask";
}

function countSectionBullets(section) {
  if (!section) {
    return 0;
  }
  return section.split(/\r?\n/).filter((line) => /^- /.test(line)).length;
}

function countNumberedItems(section) {
  if (!section) {
    return 0;
  }
  return section.split(/\r?\n/).filter((line) => /^\d+\.\s+/.test(line)).length;
}

function classifyTask(goalContent, workMode) {
  if (workMode === "ask") {
    return "ask";
  }

  const scopeCount = countSectionBullets(extractSection(goalContent, "Scope"));
  const readFirstCount = countNumberedItems(extractSection(goalContent, "Read First"));

  if (scopeCount <= 3 && readFirstCount <= 5) {
    return "small";
  }
  if (scopeCount <= 9 && readFirstCount <= 12) {
    return "medium";
  }
  return "large";
}

function extractVerificationCommands(verificationSection) {
  const commands = [];
  const fencePattern = /```(?:bash|sh)?\n([\s\S]*?)```/g;
  for (const match of verificationSection.matchAll(fencePattern)) {
    const block = match[1]
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
    commands.push(...block);
  }
  return commands;
}

function runSlugFromGoal(goalPath) {
  const base = basename(goalPath, extname(goalPath));
  return slugify(base.replace(/^\d{4}-\d{2}-\d{2}-/, ""));
}

function nextAvailableRunDir(basePath) {
  if (!existsSync(basePath)) {
    return basePath;
  }

  for (let index = 2; index < 100; index += 1) {
    const candidate = `${basePath}-${index}`;
    if (!existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Could not find an available run directory for ${basePath}`);
}

function buildRunMarkdown({ createdAt, cwd, goalPath, goalContent, runDir, taskSize, workMode }) {
  const relGoal = displayPath(cwd, goalPath);
  const relRunDir = displayPath(cwd, runDir);
  const spec = extractInlinePath(goalContent, "Spec") || "Not specified";
  const sourceTask = extractSection(goalContent, "Source Task") || "Not specified";
  const verification = extractSection(goalContent, "Verification") || "No explicit verification section was found in the goal.";

  return `# Agent Harness Run

Created: ${createdAt}
Phase: prepared
Goal: \`${relGoal}\`
Spec: \`${spec}\`
Run directory: \`${relRunDir}\`
Work mode: \`${workMode}\`
Task size: \`${taskSize}\`

## Source Task

${sourceTask}

## Manual Checkpoints

1. Read \`${relGoal}\` and its referenced spec before editing.
2. Confirm the goal's Scope, Non-Goals, Completion Conditions, and Pause Conditions still apply.
3. Use \`subagents.md\` only as bounded guidance; small tasks can stay in one main-agent context.
4. Run the verification commands from the goal.
5. Record any command output summaries or follow-ups under this run directory.
6. Update \`tasks.md\` and \`.agent-harness/status.md\` after completion.

## Verification

${verification}

## Boundaries

- This prepared run packet does not start Codex, create a daemon, push, deploy, publish, or open a PR.
- Direct execution remains manual until a stable Codex CLI file-prompt contract is confirmed.
- Stop if the goal conflicts with repository instructions, production constraints, or newer user instructions.
`;
}

function buildPromptMarkdown({ cwd, goalPath, goalContent }) {
  const relGoal = displayPath(cwd, goalPath);
  const spec = extractInlinePath(goalContent, "Spec") || "the spec referenced by the goal";

  return `# Goal Execution Prompt

In \`${cwd}\`, execute this goal:

\`${relGoal}\`

Requirements:

- Read \`${relGoal}\` and \`${spec}\` before making edits.
- Follow the goal's Scope, Non-Goals, Work Mode Recommendation, Verification, Completion Conditions, and Pause Conditions.
- Do not push, deploy, publish, open a PR, start a daemon, or automatically launch additional Codex sessions unless the user explicitly asks.
- If the checkout is dirty with unrelated work, use the worktree policy from the goal and project docs.
- After implementation, run the goal's verification commands and update \`tasks.md\` plus \`.agent-harness/status.md\`.

## Goal Content

~~~md
${goalContent.trimEnd()}
~~~
`;
}

function recommendedSubagentTasks(taskSize) {
  if (taskSize === "small") {
    return `Recommended for this run: \`small\`.

No subagent is required. Keep exploration, implementation, and verification in the main context unless the task unexpectedly grows.`;
  }

  if (taskSize === "ask") {
    return `Recommended for this run: \`ask\`.

Do not split work yet. Pause for the user when product direction, production access, destructive operations, or file ownership is unclear.`;
  }

  if (taskSize === "medium") {
    return `Recommended for this run: \`medium\`.

## Suggested Subtasks

### Explorer

- Mode: read-only.
- Ownership: goal file, referenced spec, relevant docs, and the smallest set of source files needed to map the implementation.
- Expected output: implementation map, risks, and exact files the worker should touch.
- Stop conditions: spec conflict, unclear product direction, or file ownership overlap.

### Worker

- Mode: write.
- Ownership: files identified by the explorer; avoid unrelated refactors.
- Expected output: focused patch plus notes on behavior changes.
- Stop conditions: need for credentials, destructive commands, daemon behavior, or broad contract changes outside the goal.

### Verification

- Mode: read/execute deterministic commands.
- Ownership: validation commands and generated run artifacts.
- Expected output: command results, artifact paths, and residual risks.
- Stop conditions: failing verification that needs a product or scope decision.`;
  }

  return `Recommended for this run: \`large\`.

## Suggested Subtasks

### Explorer

- Mode: read-only.
- Ownership: goal, spec, architecture docs, and dependency map.
- Expected output: file ownership plan with non-overlapping worker boundaries.
- Stop conditions: unclear merge responsibility or conflicting instructions.

### CLI/Contract Worker

- Mode: write.
- Ownership: CLI scripts, schemas, deterministic file contracts, and tests for those surfaces.
- Expected output: focused implementation patch and machine-readable contract notes.
- Stop conditions: contract migration, daemon behavior, or direct Codex execution.

### Docs/Skill Worker

- Mode: write.
- Ownership: README, docs, templates, and skill instructions.
- Expected output: docs that match the implemented command surface.
- Stop conditions: downstream-project-specific assumptions or language/product direction questions.

### Verification

- Mode: read/execute deterministic commands.
- Ownership: validation commands, temporary-project checks, and run packet inspection.
- Expected output: pass/fail summary and exact follow-up tasks.
- Stop conditions: failing verification that requires scope expansion.`;
}

function buildSubagentsMarkdown({ cwd, goalPath, taskSize }) {
  const relGoal = displayPath(cwd, goalPath);

  return `# Subagent Split Guidance

Goal: \`${relGoal}\`

## Policy

- \`small\`: no subagent by default; the main agent owns exploration, implementation, and verification.
- \`medium\`: split into \`explorer\` plus \`worker\`, or \`worker\` plus \`verification\`, when it reduces context load.
- \`large\`: split into multiple workers only when file ownership is non-overlapping and merge responsibility is clear.
- \`ask\`: pause before splitting when the work involves production, destructive actions, credentials, paid APIs, product direction, or unclear file ownership.

Every subagent task must include context, goal path, read/write scope, file ownership, expected output, and stop conditions. Subagents must not revert user changes or edits owned by another agent.

${recommendedSubagentTasks(taskSize)}
`;
}

function runPrepare(args) {
  const cwd = targetCwd(args);
  const paths = projectPaths(cwd);
  if (!args.goal) {
    throw new Error("Usage: agent-harness run prepare --goal <goal-file> [--cwd PATH]");
  }

  const goalPath = resolve(cwd, args.goal);
  if (!existsSync(goalPath)) {
    throw new Error(`Goal file not found: ${args.goal}`);
  }

  const goalContent = readFileSync(goalPath, "utf8");
  const createdAt = new Date().toISOString();
  const workMode = extractWorkMode(goalContent, cwd);
  const taskSize = classifyTask(goalContent, workMode);
  const runSlug = runSlugFromGoal(goalPath);
  const runDir = nextAvailableRunDir(join(cwd, paths.runs, `${runTimestamp()}-${runSlug}`));
  const files = ["run.md", "prompt.md", "subagents.md", "status.json"];
  const logsDir = join(runDir, "logs");

  mkdirSync(logsDir, { recursive: true });
  writeFileSync(join(runDir, "run.md"), buildRunMarkdown({
    createdAt,
    cwd,
    goalPath,
    goalContent,
    runDir,
    taskSize,
    workMode
  }));
  writeFileSync(join(runDir, "prompt.md"), buildPromptMarkdown({ cwd, goalPath, goalContent }));
  writeFileSync(join(runDir, "subagents.md"), buildSubagentsMarkdown({ cwd, goalPath, taskSize }));
  writeFileSync(join(runDir, "status.json"), `${JSON.stringify({
    schemaVersion: 1,
    phase: "prepared",
    createdAt,
    updatedAt: createdAt,
    cwd,
    goalPath: displayPath(cwd, goalPath),
    runDir: displayPath(cwd, runDir),
    workMode,
    taskSize,
    files,
    logs: "logs/",
    verificationCommands: extractVerificationCommands(extractSection(goalContent, "Verification"))
  }, null, 2)}\n`);

  console.log(`Prepared run packet: ${displayPath(cwd, runDir)}`);
  console.log(`Prompt: ${displayPath(cwd, join(runDir, "prompt.md"))}`);
  console.log("Next: open prompt.md in a new Codex session or paste it into /goal when ready.");
}

function runStatus(args) {
  const cwd = targetCwd(args);
  if (!args.run) {
    throw new Error("Usage: agent-harness run status --run <run-dir> [--cwd PATH]");
  }

  const runDir = resolve(cwd, args.run);
  const statusPath = join(runDir, "status.json");
  if (!existsSync(statusPath)) {
    throw new Error(`Missing ${displayPath(cwd, statusPath)}`);
  }

  const status = JSON.parse(readFileSync(statusPath, "utf8"));
  const expectedFiles = status.files || ["run.md", "prompt.md", "subagents.md", "status.json"];
  const missing = expectedFiles.filter((file) => !existsSync(join(runDir, file)));

  console.log(`Run: ${displayPath(cwd, runDir)}`);
  console.log(`Phase: ${status.phase || "unknown"}`);
  console.log(`Goal: ${status.goalPath || "unknown"}`);
  console.log(`Work mode: ${status.workMode || "unknown"}`);
  console.log(`Task size: ${status.taskSize || "unknown"}`);
  console.log(`Updated: ${status.updatedAt || "unknown"}`);
  console.log(`Files: ${missing.length ? `missing ${missing.join(", ")}` : "ok"}`);
}

function usage() {
  console.log(`Usage:
  agent-harness init [--cwd PATH] [--project-name NAME] [--force]
  agent-harness doctor [--cwd PATH]
  agent-harness print-contract
  agent-harness goal create --task <title-or-id> [--cwd PATH] [--dry-run] [--force]
  agent-harness run prepare --goal <goal-file> [--cwd PATH]
  agent-harness run status --run <run-dir> [--cwd PATH]`);
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    const command = args._[0] || "help";
    const subcommand = args._[1] || "";

    if (args.help || command === "help") {
      usage();
    } else if (command === "init") {
      init(args);
    } else if (command === "doctor") {
      doctor(args);
    } else if (command === "print-contract") {
      printContract();
    } else if (command === "goal" && subcommand === "create") {
      goalCreate(args);
    } else if (command === "run" && subcommand === "prepare") {
      runPrepare(args);
    } else if (command === "run" && subcommand === "status") {
      runStatus(args);
    } else {
      usage();
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
