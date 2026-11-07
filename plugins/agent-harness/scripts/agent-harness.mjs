#!/usr/bin/env node

import { closeSync, cpSync, existsSync, fsyncSync, lstatSync, mkdirSync, openSync, readdirSync, readFileSync, realpathSync, renameSync, rmSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createDeliveryControl } from "./delivery-control.mjs";
import { createStateMaintenance } from "./state-maintenance.mjs";

const __filename = fileURLToPath(import.meta.url);
const pluginRoot = resolve(dirname(__filename), "..");
const templateRoot = join(pluginRoot, "templates");
const schemaRoot = join(pluginRoot, "schemas");

const configRelPath = ".harness/config.json";
const agentHarnessConfigRelPath = ".agent-harness/config.json";
const configRelPathCandidates = [configRelPath, agentHarnessConfigRelPath];
const configSchemaFile = "config.schema.json";

const fixedContract = {
  contract: "fixed",
  tasks: "harness/tasks.md",
  taskIndex: "harness/tasks.md",
  config: configRelPath,
  status: "harness/status.md",
  goals: "harness/goals"
};

const adapterContract = {
  contract: "adapter",
  taskIndex: "harness/tasks.md",
  ideaInbox: "harness/intake.md",
  config: configRelPath,
  adapterDocs: "harness/README.md",
  status: "harness/status.md",
  specs: "harness/specs",
  goals: "harness/goals",
  milestones: "harness/milestones",
  deferredRegister: "harness/milestones",
  mentalModels: "harness/mental-models",
  mentalModelIndex: "harness/mental-models/README.md"
};

const mentalModelTemplates = [
  ["01-user-scenario.md", "mental-model-user-scenario.md"],
  ["02-work-unit.md", "mental-model-work-unit.md"],
  ["03-control-loop-handoff.md", "mental-model-control-loop-handoff.md"],
  ["04-ownership-boundary.md", "mental-model-ownership-boundary.md"]
];

const commonTaskIndexCandidates = [
  "harness/tasks.md",
  "todolist.md",
  "tasks.md"
];

const validExecutionRoles = new Set(["gate-only", "implementer"]);
const conversationRouteAliases = {
  "current-session": "current-session",
  "delegated-worker": "delegated-worker",
  "isolated-worktree": "isolated-worktree",
  "current-thread": "current-session",
  "slot-thread": "delegated-worker",
  "remote-control-worktree": "isolated-worktree"
};
const validConversationRoutes = new Set(Object.keys(conversationRouteAliases));
const validAcceptanceMapStatuses = new Set(["pending", "satisfied", "deferred", "blocked"]);
const validEvidenceItemStatuses = new Set(["pending", "satisfied", "deferred", "blocked"]);
const validGoalStatuses = new Set(["active", "completed", "blocked"]);
const placeholderEvidenceValues = new Set(["tbd", "n/a", "none", "not recorded", "pending", "-", "..."]);
const validCommentaryPolicies = new Set(["minimal", "balanced", "audit"]);
const contextFocusIntentTargets = "`Milestone`, `Goal`, `Task`, `Priority`, or `Spec`";
const contextFocusRoutingGuidance = `\`harness-rule:project-neutral-core\`: Normalize the durable target to ${contextFocusIntentTargets}; adapters own downstream paths and facts while plugin core remains project-neutral.`;
const executeContextFocusGuidance = "`harness-rule:path-containment`: configured writes and Goal/Spec references stay inside configured roots after lexical and existing-parent realpath checks.";
const authoritativeCompletionGuidance = "`harness-rule:authoritative-completion-state`: Task/Goal is the accepted-state authority with active, completed, or blocked phase; blocked is resumable and non-complete, and status is a bounded projection.";
const cyberneticStabilityGuidance = "`harness-rule:state-sync-evidence`: completion includes a concise verification summary and synchronization of the configured Goal, Task and bounded status records.";
const degradedExecutionProvenanceGuidance = "`harness-rule:candidate-accepted-evidence`: execution and worker output remains candidate evidence until the accepted-state owner verifies and records it.";
const controllerCancellationBoundaryGuidance = "`harness-rule:host-owned-execution`: Harness records accepted scope and outcomes; the host owns scheduling, delegation, concurrency, cancellation, and resume.";
const boundedStatusSnapshotGuidance = "`harness-rule:bounded-status-snapshot`: The configured status file is a bounded current-state snapshot, not an append-only history log. Replace current status sections when syncing state; the host session owns execution history.";
const boundedDirectExecutionGuidance = "`harness-rule:durable-tier-boundary`: ordinary clear change/build uses the current host directly; already tracked simple work may use one bounded postflight sync; Harness ceremony is reserved for recovery, audit, persistent state sync, milestones, orchestration, multiple workers, or high-risk control.";
const hostOwnedExecutionGuidance = "`harness-rule:host-owned-execution`: sessions, resume, workers, terminals, logs and transient execution state belong to the host; Harness records only accepted outcomes and bounded delivery state.";
const hostExecutionGuidance = "For accepted long-running controller work, establish or reuse a compatible runtime outcome and use the host transient plan for current multi-step progress when those capabilities are exposed. Controller means outcome owner and accepted-state owner; only explicit review-only or gate-only direction prohibits foreground implementation.";
const postflightSyncGuidance = "Postflight sync verifies completed work and updates existing tracked state only. It creates no Goal, Run, orchestration, gate, or status artifact solely for bookkeeping. The host owns resume and execution history.";

function commentaryPolicyDetails(config = {}) {
  const configured = config.communication?.commentary;
  const policy = validCommentaryPolicies.has(configured) ? configured : "minimal";
  const definitions = {
    minimal: {
      reportCadence: "material-transition-or-host-heartbeat",
      notifyOn: "blocker, risk, scope-or-authorization-change, user-decision, failed-verification, state-transition",
      guidance: "Use one short kickoff that combines skill, reason, scope, boundaries, and next action. Do not narrate routine UI-visible tool activity or repeat unchanged boundaries. Later commentary must add a new material fact unless it is a one-sentence host-required heartbeat."
    },
    balanced: {
      reportCadence: "meaningful-phase-transition",
      notifyOn: "minimal-signals, exploration-complete, implementation-complete, verification-complete",
      guidance: "Apply signal-only rules and additionally report meaningful execution phase transitions. Do not narrate individual commands or files."
    },
    audit: {
      reportCadence: "gate-and-decision-transition",
      notifyOn: "balanced-signals, gate-input, gate-decision, state-sync, state-transition",
      guidance: "Apply signal-only rules and permit compact transcript-quality gate, decision, state-sync, and accepted-state evidence summaries. Prefer paths and summaries over raw packet dumps."
    }
  };

  return {
    commentary: policy,
    source: configured ? "configured" : "default",
    ...definitions[policy]
  };
}

function parseArgs(argv) {
  const args = { _: [] };
  const valueOptions = new Set([
    "adapterDocs",
    "adapter-docs",
    "cwd",
    "gateEvidence",
    "gate-evidence",
    "goal",
    "plan",
    "milestone",
    "idea",
    "lang",
    "contract",
    "mode",
    "deferredRegister",
    "deferred-register",
    "priority",
    "projectName",
    "project-name",
    "gateRecords",
    "gate-records",
    "mentalModel",
    "mental-model",
    "mentalModelIndex",
    "mental-model-index",
    "mentalModels",
    "mental-models",
    "node",
    "section",
    "summary",
    "status",
    "specs",
    "goals",
    "ideaInbox",
    "idea-inbox",
    "milestones",
    "runs",
    "spec",
    "taskIndex",
    "task-index",
    "task",
    "verification",
    "workMode",
    "work-mode",
  ]);
  const booleanOptions = new Set(["allowNoSpec", "allow-no-spec", "apply", "dryRun", "dry-run", "force", "goalSlice", "goal-slice", "help", "json", "legacy", "record"]);

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

function isPathInside(root, candidate) {
  const rel = relative(root, candidate);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

function existingAncestor(path) {
  let cursor = resolve(path);
  while (true) {
    try {
      lstatSync(cursor);
      return cursor;
    } catch (error) {
      if (error?.code !== "ENOENT") {
        throw error;
      }
    }
    const parent = dirname(cursor);
    if (parent === cursor) return cursor;
    cursor = parent;
  }
}

function assertContainedPath(root, candidate, label = "Path") {
  const absoluteRoot = resolve(root);
  const absoluteCandidate = resolve(candidate);
  if (!isPathInside(absoluteRoot, absoluteCandidate)) {
    throw new Error(`${label} must stay inside ${absoluteRoot}: ${candidate}`);
  }
  let rootAnchor = "";
  let candidateAnchor = "";
  try {
    rootAnchor = realpathSync(existingAncestor(absoluteRoot));
    candidateAnchor = realpathSync(existingAncestor(absoluteCandidate));
  } catch {
    throw new Error(`${label} uses an unresolved symlink: ${candidate}`);
  }
  if (!isPathInside(rootAnchor, candidateAnchor)) {
    throw new Error(`${label} escapes ${absoluteRoot} through an existing symlink: ${candidate}`);
  }
  try {
    const candidateStat = lstatSync(absoluteCandidate);
    if (candidateStat.isSymbolicLink()) {
      let candidateReal = "";
      try {
        candidateReal = realpathSync(absoluteCandidate);
      } catch {
        throw new Error(`${label} uses an unresolved symlink: ${candidate}`);
      }
      if (!isPathInside(rootAnchor, candidateReal)) {
        throw new Error(`${label} resolves outside ${absoluteRoot}: ${candidate}`);
      }
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }
  if (existsSync(absoluteCandidate)) {
    const candidateReal = realpathSync(absoluteCandidate);
    if (!isPathInside(rootAnchor, candidateReal)) {
      throw new Error(`${label} resolves outside ${absoluteRoot}: ${candidate}`);
    }
  }
  return absoluteCandidate;
}

function configuredPath(cwd, relPath, label = "Configured path") {
  if (!isRelativeHarnessPath(relPath)) {
    throw new Error(`${label} must be a non-empty project-relative path without '..': ${relPath}`);
  }
  return assertContainedPath(cwd, resolve(cwd, relPath), label);
}

function configuredOptionalPath(cwd, relPath, label = "Configured path") {
  return relPath ? configuredPath(cwd, relPath, label) : "";
}

function artifactPath(root, relPath, label = "Artifact path") {
  const normalized = normalizePathReference(relPath);
  if (!isRelativeHarnessPath(relPath) || !normalized || normalized === ".") {
    throw new Error(`${label} must be relative and must not contain '..': ${relPath}`);
  }
  return assertContainedPath(root, resolve(root, relPath), label);
}

function sleepSync(milliseconds) {
  if (milliseconds <= 0) return;
  const buffer = new SharedArrayBuffer(4);
  Atomics.wait(new Int32Array(buffer), 0, 0, milliseconds);
}

function lockPathFor(root) {
  return artifactPath(root, ".harness-state.lock", "Delivery state lock path");
}

function withStateLock(root, callback) {
  const lockPath = lockPathFor(root);
  const startedAt = Date.now();
  const timeoutMs = 30_000;
  let acquired = false;
  while (!acquired) {
    try {
      let existing = null;
      try { existing = lstatSync(lockPath); } catch (error) { if (error?.code !== "ENOENT") throw error; }
      if (existing) {
        if (!existing.isDirectory()) {
          throw new Error(`Delivery state lock is not a directory: ${lockPath}`);
        }
        if (Date.now() - existing.mtimeMs > timeoutMs) {
          rmSync(lockPath, { recursive: true, force: true });
          continue;
        }
      }
      mkdirSync(lockPath);
      acquired = true;
    } catch (error) {
      if (error?.code !== "EEXIST") throw error;
      if (Date.now() - startedAt > timeoutMs) {
        throw new Error(`Timed out waiting for delivery state lock: ${displayPath(process.cwd(), root)}`);
      }
      sleepSync(10);
    }
  }

  try {
    return callback();
  } finally {
    rmSync(lockPath, { recursive: true, force: true });
  }
}

function temporarySiblingPath(path) {
  return `${path}.tmp-${process.pid}-${Date.now()}-${randomBytes(5).toString("hex")}`;
}

function atomicWriteFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  try {
    if (lstatSync(path).isSymbolicLink()) {
      throw new Error(`Refusing to replace a symbolic link: ${path}`);
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const temporaryPath = temporarySiblingPath(path);
  let fd = null;
  try {
    fd = openSync(temporaryPath, "wx");
    writeFileSync(fd, content, "utf8");
    fsyncSync(fd);
    closeSync(fd);
    fd = null;
    try {
      renameSync(temporaryPath, path);
    } catch (error) {
      // Windows cannot replace an existing file with renameSync. The caller
      // holds the project-state lock, so this fallback is safe.
      if (!(["EEXIST", "EPERM", "ENOTEMPTY"].includes(error?.code)) || !existsSync(path)) {
        throw error;
      }
      const targetStat = lstatSync(path);
      if (targetStat.isSymbolicLink()) {
        throw new Error(`Refusing to replace a symbolic link: ${path}`);
      }
      unlinkSync(path);
      renameSync(temporaryPath, path);
    }
  } finally {
    if (fd !== null) closeSync(fd);
    if (existsSync(temporaryPath)) unlinkSync(temporaryPath);
  }
}

function readTemplate(name) {
  return readFileSync(join(templateRoot, name), "utf8");
}

function writeExclusiveFile(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  try {
    if (lstatSync(path).isSymbolicLink()) throw new Error(`Refusing to write through a symbolic link: ${path}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  let fd = null;
  try {
    fd = openSync(path, "wx");
    writeFileSync(fd, content, "utf8");
    fsyncSync(fd);
  } finally {
    if (fd !== null) closeSync(fd);
  }
}

function writeIfMissing(path, content, force = false) {
  if (existsSync(path) && !force) {
    return false;
  }
  if (force) {
    atomicWriteFile(path, content);
  } else {
    try {
      writeExclusiveFile(path, content);
    } catch (error) {
      if (error?.code === "EEXIST") return false;
      throw error;
    }
  }
  return true;
}

function requestedContract(args) {
  const requested = args.contract || args.mode;
  if (requested) {
    const contract = String(requested).trim().toLowerCase();
    if (contract === "fixed" || contract === "adapter") {
      return contract;
    }
    throw new Error(`Unknown harness contract: ${requested}`);
  }

  return "fixed";
}

function hasRequestedContract(args) {
  return Boolean(args.contract || args.mode);
}

function buildConfig(projectName, mode = "fixed") {
  const template = mode === "adapter" ? "config.adapter.json" : "config.fixed.json";
  const payload = JSON.parse(readTemplate(template));
  payload.projectName = projectName;
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function buildConfigPayload(projectName, mode = "fixed") {
  const template = mode === "adapter" ? "config.adapter.json" : "config.fixed.json";
  const payload = JSON.parse(readTemplate(template));
  payload.projectName = projectName;
  return payload;
}

const messages = {
  en: {
    usage: `Usage:
  agent-harness init [--cwd PATH] [--contract fixed|adapter] [--task-index PATH] [--idea-inbox PATH] [--project-name NAME] [--force] [--lang CODE]
  agent-harness skills install [--cwd PATH] [--dry-run] [--force] [--json]
  agent-harness skills uninstall [--cwd PATH] [--dry-run] [--json]
  agent-harness doctor [--cwd PATH] [--lang CODE]
  agent-harness print-contract [--contract fixed|adapter]
  agent-harness activation snippet [--cwd PATH] [--json]
  agent-harness orient next [--cwd PATH] [--goal PATH|--milestone PATH] [--json]
  agent-harness intake idea --idea <text> [--cwd PATH] [--priority P1|P2|P3] [--section Now|Next|Later] [--record] [--json]
  agent-harness maintain tasks [--cwd PATH] [--record] [--json]
  agent-harness artifacts inspect [--cwd PATH] [--json]
  agent-harness artifacts compact [--cwd PATH] [--record] [--json]
  agent-harness config inspect [--cwd PATH] [--json]
  agent-harness config validate [--cwd PATH] [--json]
  agent-harness config import [--cwd PATH] [--task-index PATH] [--idea-inbox PATH] [--status PATH] [--specs PATH] [--goals PATH] [--milestones PATH] [--deferred-register PATH] [--mental-model PATH] [--mental-model-index PATH] [--mental-models PATH] [--dry-run] [--force] [--json]
  agent-harness adapter inspect [--cwd PATH] [--json]
  agent-harness worktree recommend [--cwd PATH] [--json] [--lang CODE]
  agent-harness goal create --task <title-or-id> [--cwd PATH] [--spec PATH] [--allow-no-spec] [--work-mode local|worktree|ask] [--plan PATH] [--dry-run] [--force] [--json]
  agent-harness goal list [--cwd PATH] [--json]
  agent-harness goal inspect --goal <goal-file> [--cwd PATH] [--json]
  agent-harness goal validate --goal <goal-file> [--cwd PATH] [--json]
  agent-harness plan validate --plan PATH [--cwd PATH] [--json]
  agent-harness execute next --goal PATH|--milestone PATH [--goal-slice] [--cwd PATH] [--json]
  agent-harness goal complete --goal PATH --verification <commands-and-results> [--dry-run] [--json]
  agent-harness milestone complete --milestone PATH --verification <commands-and-results> [--dry-run] [--json]`,
    initDone: "Agent Harness initialized in {cwd}",
    initCreated: "Created: {files}",
    initNoChanges: "No files changed.",
    doctorProject: "Project",
    doctorGitRoot: "Git root",
    doctorNoGit: "not a git repository",
    doctorHarnessFiles: "Harness files",
    doctorMissing: "missing {files}",
    doctorOk: "ok",
    doctorGitStatus: "Git status",
    doctorDirty: "dirty",
    doctorClean: "clean or unavailable",
    doctorWorktrees: "Worktrees",
    worktreeRecommendation: "Worktree recommendation",
    worktreeReasons: "Reasons",
    worktreeAction: "Action",
    worktreeActionLocal: "continue in the current checkout; this command did not edit files.",
    worktreeActionWorktree: "create or choose a separate worktree before editing; this command did not create one.",
    worktreeActionAsk: "ask the user before choosing local or worktree."
  },
  "zh-CN": {
    usage: `用法:
  agent-harness init [--cwd PATH] [--contract fixed|adapter] [--task-index PATH] [--idea-inbox PATH] [--project-name NAME] [--force] [--lang CODE]
  agent-harness skills install [--cwd PATH] [--dry-run] [--force] [--json]
  agent-harness skills uninstall [--cwd PATH] [--dry-run] [--json]
  agent-harness doctor [--cwd PATH] [--lang CODE]
  agent-harness print-contract [--contract fixed|adapter]
  agent-harness activation snippet [--cwd PATH] [--json]
  agent-harness orient next [--cwd PATH] [--goal PATH|--milestone PATH] [--json]
  agent-harness intake idea --idea <text> [--cwd PATH] [--priority P1|P2|P3] [--section Now|Next|Later] [--record] [--json]
  agent-harness maintain tasks [--cwd PATH] [--record] [--json]
  agent-harness artifacts inspect [--cwd PATH] [--json]
  agent-harness artifacts compact [--cwd PATH] [--record] [--json]
  agent-harness config inspect [--cwd PATH] [--json]
  agent-harness config validate [--cwd PATH] [--json]
  agent-harness config import [--cwd PATH] [--task-index PATH] [--idea-inbox PATH] [--status PATH] [--specs PATH] [--goals PATH] [--milestones PATH] [--deferred-register PATH] [--mental-model PATH] [--mental-model-index PATH] [--mental-models PATH] [--dry-run] [--force] [--json]
  agent-harness adapter inspect [--cwd PATH] [--json]
  agent-harness worktree recommend [--cwd PATH] [--json] [--lang CODE]
  agent-harness goal create --task <title-or-id> [--cwd PATH] [--spec PATH] [--allow-no-spec] [--work-mode local|worktree|ask] [--plan PATH] [--dry-run] [--force] [--json]
  agent-harness goal list [--cwd PATH] [--json]
  agent-harness goal inspect --goal <goal-file> [--cwd PATH] [--json]
  agent-harness goal validate --goal <goal-file> [--cwd PATH] [--json]
  agent-harness plan validate --plan PATH [--cwd PATH] [--json]
  agent-harness execute next --goal PATH|--milestone PATH [--goal-slice] [--cwd PATH] [--json]
  agent-harness goal complete --goal PATH --verification <commands-and-results> [--dry-run] [--json]
  agent-harness milestone complete --milestone PATH --verification <commands-and-results> [--dry-run] [--json]`,
    initDone: "Agent Harness 已初始化: {cwd}",
    initCreated: "已创建: {files}",
    initNoChanges: "没有文件变更。",
    doctorProject: "项目",
    doctorGitRoot: "Git 根目录",
    doctorNoGit: "不是 Git 仓库",
    doctorHarnessFiles: "Harness 文件",
    doctorMissing: "缺少 {files}",
    doctorOk: "ok",
    doctorGitStatus: "Git 状态",
    doctorDirty: "dirty",
    doctorClean: "clean or unavailable",
    doctorWorktrees: "Worktree 数量",
    worktreeRecommendation: "Worktree 推荐",
    worktreeReasons: "原因",
    worktreeAction: "动作",
    worktreeActionLocal: "继续使用当前 checkout；此命令没有编辑文件。",
    worktreeActionWorktree: "编辑前创建或选择独立 worktree；此命令没有创建 worktree。",
    worktreeActionAsk: "先询问用户，再选择 local 或 worktree。"
  }
};

function formatMessage(template, vars = {}) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (_, key) => vars[key] ?? "");
}

function t(lang, key, vars = {}) {
  const template = messages[lang]?.[key] || messages.en[key] || key;
  return formatMessage(template, vars);
}

function normalizeLanguageCode(value) {
  if (!value) {
    return "auto";
  }

  const raw = String(value).trim();
  if (!raw || raw.toLowerCase() === "auto") {
    return "auto";
  }

  const code = raw
    .split(".")[0]
    .replace(/_/g, "-")
    .toLowerCase();

  if (code === "en" || code.startsWith("en-") || code === "c" || code === "posix") {
    return "en";
  }
  if (code === "zh" || code.startsWith("zh-")) {
    return "zh-CN";
  }
  return "en";
}

function findConfigRelPath(cwd) {
  return configRelPathCandidates.find((candidate) => existsSync(join(cwd, candidate))) || "";
}

function languageFromConfig(cwd) {
  const relPath = findConfigRelPath(cwd);
  if (!relPath) {
    return "";
  }

  try {
    const config = JSON.parse(readFileSync(join(cwd, relPath), "utf8"));
    return config.language?.default || "";
  } catch {
    return "";
  }
}

function resolveLanguage(args) {
  const cwd = targetCwd(args);
  const candidates = [
    args.lang,
    process.env.AGENT_HARNESS_LANG,
    languageFromConfig(cwd),
    process.env.LC_ALL,
    process.env.LC_MESSAGES,
    process.env.LANG
  ];

  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }

    const lang = normalizeLanguageCode(candidate);
    if (lang !== "auto") {
      return lang;
    }
  }

  return "en";
}

function loadProjectConfig(cwd) {
  const relPath = findConfigRelPath(cwd);
  if (!relPath) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(join(cwd, relPath), "utf8"));
  } catch (error) {
    throw new Error(`Could not parse ${relPath}: ${error.message}`);
  }
}

function readConfigSchema() {
  return JSON.parse(readFileSync(join(schemaRoot, configSchemaFile), "utf8"));
}

function schemaType(value) {
  if (Array.isArray(value)) {
    return "array";
  }
  if (value === null) {
    return "null";
  }
  return typeof value;
}

function schemaPath(base, key) {
  if (/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key)) {
    return `${base}.${key}`;
  }
  return `${base}[${JSON.stringify(key)}]`;
}

function matchesSchemaType(value, expected) {
  if (expected === "integer") {
    return Number.isInteger(value);
  }
  if (expected === "number") {
    return typeof value === "number" && Number.isFinite(value);
  }
  if (expected === "object") {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  if (expected === "array") {
    return Array.isArray(value);
  }
  return schemaType(value) === expected;
}

function validateJsonSchemaValue(value, schema, path = "$") {
  const errors = [];
  if (!schema || typeof schema !== "object") {
    return errors;
  }

  if (schema.anyOf) {
    const matches = schema.anyOf.filter((candidate) => validateJsonSchemaValue(value, candidate, path).length === 0);
    if (!matches.length) {
      errors.push(`${path} must match at least one schema option.`);
    }
  }

  if (schema.oneOf) {
    const matches = schema.oneOf.filter((candidate) => validateJsonSchemaValue(value, candidate, path).length === 0);
    if (matches.length !== 1) {
      errors.push(`${path} must match exactly one schema option.`);
    }
  }

  if (schema.type) {
    const types = Array.isArray(schema.type) ? schema.type : [schema.type];
    if (!types.some((type) => matchesSchemaType(value, type))) {
      errors.push(`${path} must be ${types.join(" or ")}; got ${schemaType(value)}.`);
      return errors;
    }
  }

  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${path} must be one of ${schema.enum.map((item) => JSON.stringify(item)).join(", ")}.`);
  }

  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push(`${path} must have length >= ${schema.minLength}.`);
    }
    if (schema.pattern && !(new RegExp(schema.pattern).test(value))) {
      errors.push(`${path} must match pattern ${schema.pattern}.`);
    }
  }

  if (typeof value === "number") {
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push(`${path} must be >= ${schema.minimum}.`);
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push(`${path} must be <= ${schema.maximum}.`);
    }
  }

  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push(`${path} must contain at least ${schema.minItems} item(s).`);
    }
    if (schema.uniqueItems) {
      const seen = new Set(value.map((item) => JSON.stringify(item)));
      if (seen.size !== value.length) {
        errors.push(`${path} must contain unique items.`);
      }
    }
    if (schema.items) {
      for (let index = 0; index < value.length; index += 1) {
        errors.push(...validateJsonSchemaValue(value[index], schema.items, `${path}[${index}]`));
      }
    }
  }

  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    const properties = schema.properties || {};
    const required = schema.required || [];
    for (const key of required) {
      if (!Object.prototype.hasOwnProperty.call(value, key)) {
        errors.push(`${path}.${key} is required.`);
      }
    }
    for (const [key, item] of Object.entries(value)) {
      if (properties[key]) {
        errors.push(...validateJsonSchemaValue(item, properties[key], schemaPath(path, key)));
      } else if (schema.additionalProperties === false) {
        errors.push(`${schemaPath(path, key)} is not allowed.`);
      }
    }
  }

  return errors;
}

function isRelativeHarnessPath(value) {
  return typeof value === "string"
    && value.trim()
    && !value.startsWith("/")
    && !value.startsWith("\\")
    && !/^[A-Za-z]:/.test(value)
    && !/^[\\/]{2}/.test(value)
    && !value.split(/[\\/]+/).includes("..");
}

function validateConfiguredPaths(config, contract) {
  const errors = [];
  const paths = config.paths || {};
  if (paths.tasks && paths.taskIndex && paths.tasks !== paths.taskIndex) {
    errors.push("$.paths.tasks and $.paths.taskIndex conflict; keep only canonical taskIndex output.");
  }
  if (paths.mentalModel && paths.mentalModelIndex && paths.mentalModel !== paths.mentalModelIndex) {
    errors.push("$.paths.mentalModel and $.paths.mentalModelIndex conflict; keep only canonical mentalModelIndex output.");
  }
  if (config.worktree?.defaultPolicy && config.workMode?.defaultPolicy
      && config.worktree.defaultPolicy !== config.workMode.defaultPolicy) {
    errors.push("$.worktree.defaultPolicy and legacy $.workMode.defaultPolicy conflict.");
  }
  const canonicalGates = stringList(config.gates?.requiredForCompletion).sort();
  const legacyGates = stringList(config.gates?.enabled).sort();
  if (canonicalGates.length && legacyGates.length
      && JSON.stringify(canonicalGates) !== JSON.stringify(legacyGates)) {
    errors.push("$.gates.requiredForCompletion and legacy $.gates.enabled conflict.");
  }
  const pathKeys = [
    "tasks",
    "taskIndex",
    "ideaInbox",
    "status",
    "specs",
    "goals",
    "milestones",
    "runs",
    "gateRecords",
    "deferredRegister",
    "mentalModels",
    "mentalModel",
    "mentalModelIndex"
  ];
  for (const key of pathKeys) {
    if (paths[key] !== undefined && !isRelativeHarnessPath(paths[key])) {
      errors.push(`$.paths.${key} must be a non-empty repo-relative path without '..'.`);
    }
  }

  const artifactPolicy = config.artifactPolicy || {};
  for (const [index, value] of (Array.isArray(artifactPolicy.durableEvidence) ? artifactPolicy.durableEvidence : []).entries()) {
    if (!isRelativeHarnessPath(value)) {
      errors.push(`$.artifactPolicy.durableEvidence[${index}] must be a non-empty repo-relative path without '..'.`);
    }
  }
  if (artifactPolicy.tasks?.archive !== undefined && !isRelativeHarnessPath(artifactPolicy.tasks.archive)) {
    errors.push("$.artifactPolicy.tasks.archive must be a non-empty repo-relative path without '..'.");
  }
  const configuredTaskIndex = paths.taskIndex || paths.tasks;
  if (configuredTaskIndex && artifactPolicy.tasks?.archive
      && normalizePathReference(configuredTaskIndex) === normalizePathReference(artifactPolicy.tasks.archive)) {
    errors.push("$.artifactPolicy.tasks.archive must differ from the active task index.");
  }

  if (config.adapter?.docs !== undefined && !isRelativeHarnessPath(config.adapter.docs)) {
    errors.push("$.adapter.docs must be a non-empty repo-relative path without '..'.");
  }
  if (config.adapter?.machineReadable !== undefined && !isRelativeHarnessPath(config.adapter.machineReadable)) {
    errors.push("$.adapter.machineReadable must be a non-empty repo-relative path without '..'.");
  }

  if (contract === "adapter") {
    if (!config.adapter || typeof config.adapter !== "object" || Array.isArray(config.adapter)) {
      errors.push("$.adapter is required for adapter contract.");
    } else {
      for (const key of ["docs", "machineReadable"]) {
        if (!config.adapter[key]) {
          errors.push(`$.adapter.${key} is required for adapter contract.`);
        }
      }
    }
    for (const key of ["taskIndex", "status", "specs", "goals", "milestones"]) {
      if (!paths[key]) {
        errors.push(`$.paths.${key} is required for adapter contract.`);
      }
    }
  }

  if (contract === "fixed") {
    for (const key of ["status", "goals"]) {
      if (!paths[key]) {
        errors.push(`$.paths.${key} is required for fixed contract.`);
      }
    }
    if (!paths.tasks && !paths.taskIndex) {
      errors.push("$.paths.tasks or $.paths.taskIndex is required for fixed contract.");
    }
  }

  return errors;
}

function validateConfigPayloadObject(config) {
  const errors = [];
  let contract = "fixed";
  try {
    contract = normalizeHarnessContract(config);
  } catch (error) {
    errors.push(error.message);
  }
  errors.push(...validateJsonSchemaValue(config, readConfigSchema()));
  errors.push(...validateConfiguredPaths(config, contract));
  return {
    ok: errors.length === 0,
    errors
  };
}

function configValidationPayload(cwd) {
  const configPath = findConfigRelPath(cwd);
  const schemaPathAbs = join(schemaRoot, configSchemaFile);
  const payload = {
    ok: true,
    cwd,
    configPath,
    configSource: configPath ? "file" : "default-or-discovered",
    schemaPath: displayPath(cwd, schemaPathAbs),
    errors: [],
    warnings: []
  };

  if (!configPath) {
    payload.warnings.push("No config file found; schema validation applies after config is imported or initialized.");
    return payload;
  }

  let config;
  try {
    config = JSON.parse(readFileSync(join(cwd, configPath), "utf8"));
  } catch (error) {
    payload.ok = false;
    payload.errors.push(`Could not parse ${configPath}: ${error.message}`);
    return payload;
  }

  const schema = readConfigSchema();
  let contract = "";
  try {
    contract = normalizeHarnessContract(config);
  } catch (error) {
    payload.errors.push(error.message);
  }
  payload.contract = contract;
  payload.errors.push(...validateJsonSchemaValue(config, schema, "$"));
  if (contract) {
    payload.errors.push(...validateConfiguredPaths(config, contract));
  }
  payload.ok = payload.errors.length === 0;
  return payload;
}

function pathExists(cwd, relPath) {
  return Boolean(relPath && existsSync(join(cwd, relPath)));
}

function firstExistingPath(cwd, candidates) {
  return candidates.find((candidate) => pathExists(cwd, candidate)) || "";
}

function existingTaskIndexCandidates(cwd) {
  return commonTaskIndexCandidates.filter((candidate) => pathExists(cwd, candidate));
}

function chooseExistingTaskIndex(cwd, explicitTaskIndex = "") {
  if (explicitTaskIndex) {
    return explicitTaskIndex;
  }

  const candidates = existingTaskIndexCandidates(cwd);
  if (candidates.length > 1) {
    throw new Error(
      `Multiple existing task indexes found: ${candidates.join(", ")}. Pass --task-index <path> to choose one.`
    );
  }
  return candidates[0] || "";
}

function discoverAdapterProject(cwd, options = {}) {
  const adapterDocs = options.adapterDocs
    || firstExistingPath(cwd, [adapterContract.adapterDocs, "docs/harness/README.md"]);
  const taskIndex = chooseExistingTaskIndex(cwd, options.taskIndex || "");
  const specs = options.specs || firstExistingPath(cwd, [adapterContract.specs, "docs/specs"]);
  const goals = options.goals || firstExistingPath(cwd, [adapterContract.goals, "docs/goals"]);
  const milestones = options.milestones || firstExistingPath(cwd, [adapterContract.milestones, "docs/milestones"]);
  const hasAdapterArtifacts = Boolean(adapterDocs && (taskIndex || specs || goals || milestones));

  return {
    detected: hasAdapterArtifacts,
    adapterDocs,
    taskIndex,
    status: options.status || "",
    ideaInbox: options.ideaInbox || "",
    specs,
    goals,
    milestones,
    runs: options.runs || "",
    gateRecords: options.gateRecords || "",
    deferredRegister: options.deferredRegister || "",
    mentalModel: options.mentalModel || "",
    mentalModelIndex: options.mentalModelIndex || "",
    mentalModels: options.mentalModels || ""
  };
}

function buildAdapterConfigPayload(projectName, discovery = {}) {
  const payload = buildConfigPayload(projectName, "adapter");
  payload.adapter = payload.adapter || {};
  payload.paths = payload.paths || {};

  payload.adapter.docs = discovery.adapterDocs || payload.adapter.docs || adapterContract.adapterDocs;
  payload.adapter.machineReadable = configRelPath;
  payload.paths.taskIndex = discovery.taskIndex || payload.paths.taskIndex || adapterContract.taskIndex;
  payload.paths.ideaInbox = discovery.ideaInbox || payload.paths.ideaInbox || adapterContract.ideaInbox;
  payload.paths.status = discovery.status || payload.paths.status || adapterContract.status;
  payload.paths.specs = discovery.specs || payload.paths.specs || adapterContract.specs;
  payload.paths.goals = discovery.goals || payload.paths.goals || adapterContract.goals;
  payload.paths.milestones = discovery.milestones || payload.paths.milestones || adapterContract.milestones;
  delete payload.paths.runs;
  delete payload.paths.gateRecords;
  payload.paths.deferredRegister = discovery.deferredRegister || payload.paths.deferredRegister || payload.paths.milestones || adapterContract.deferredRegister;
  payload.paths.mentalModels = discovery.mentalModels || payload.paths.mentalModels || adapterContract.mentalModels;
  if (discovery.mentalModel) {
    payload.paths.mentalModel = discovery.mentalModel;
  }
  payload.paths.mentalModelIndex = discovery.mentalModelIndex || discovery.mentalModel || payload.paths.mentalModelIndex || adapterContract.mentalModelIndex;

  return payload;
}

function normalizeHarnessContract(config) {
  const rawContract = typeof config.contract === "string" ? config.contract.trim().toLowerCase() : "";
  const rawMode = typeof config.mode === "string" ? config.mode.trim().toLowerCase() : "";
  if (rawContract && rawMode && rawContract !== rawMode) {
    throw new Error(`Conflicting config aliases: contract=${config.contract} and mode=${config.mode}.`);
  }
  if (rawContract) {
    if (rawContract === "fixed" || rawContract === "adapter") {
      return rawContract;
    }
    throw new Error(`Unsupported harness contract in ${configRelPath}: ${config.contract}`);
  }

  if (rawMode && !["fixed", "adapter"].includes(rawMode)) {
    throw new Error(`Unsupported harness mode in ${configRelPath}: ${config.mode}`);
  }
  if (rawMode) {
    return rawMode;
  }
  return "fixed";
}

function resolvedAdapterPaths(config, activeConfigRelPath = configRelPath) {
  const paths = config.paths || {};
  const adapter = config.adapter || {};
  if (paths.taskIndex && paths.tasks && paths.taskIndex !== paths.tasks) {
    throw new Error(`Conflicting config aliases: paths.taskIndex=${paths.taskIndex} and paths.tasks=${paths.tasks}.`);
  }
  if (paths.mentalModelIndex && paths.mentalModel && paths.mentalModelIndex !== paths.mentalModel) {
    throw new Error(`Conflicting config aliases: paths.mentalModelIndex=${paths.mentalModelIndex} and paths.mentalModel=${paths.mentalModel}.`);
  }
  const mentalModelIndex = paths.mentalModelIndex || paths.mentalModel || adapterContract.mentalModelIndex;
  return {
    taskIndex: paths.taskIndex || paths.tasks || adapterContract.taskIndex,
    tasks: paths.taskIndex || paths.tasks || adapterContract.taskIndex,
    ideaInbox: paths.ideaInbox || "",
    config: adapter.machineReadable || activeConfigRelPath || configRelPath,
    adapterDocs: adapter.docs || adapterContract.adapterDocs,
    status: paths.status || adapterContract.status,
    specs: paths.specs || adapterContract.specs,
    goals: paths.goals || adapterContract.goals,
    milestones: paths.milestones || adapterContract.milestones,
    deferredRegister: paths.deferredRegister || paths.milestones || adapterContract.deferredRegister,
    mentalModels: paths.mentalModels || adapterContract.mentalModels,
    mentalModelIndex,
    mentalModel: mentalModelIndex
  };
}

function resolveHarnessContext(cwd) {
  const activeConfigRelPath = findConfigRelPath(cwd);
  let config = loadProjectConfig(cwd);
  let configSource = "file";
  const warnings = [];

  if (!Object.keys(config).length) {
    const discovery = discoverAdapterProject(cwd);
    if (discovery.detected) {
      config = buildAdapterConfigPayload(basename(cwd), discovery);
      configSource = "discovered";
      warnings.push(`Detected project adapter without ${configRelPath}. Run config import to persist these paths.`);
    } else {
      configSource = "default";
    }
  }

  const contract = normalizeHarnessContract(config);
  const communication = commentaryPolicyDetails(config);
  const paths = config.paths || {};

  if (contract === "adapter") {
    const resolvedPaths = resolvedAdapterPaths(config, activeConfigRelPath || configRelPath);
    const requiredPaths = uniqueList(configSource === "discovered"
      ? [
        resolvedPaths.adapterDocs,
        resolvedPaths.taskIndex
      ]
      : [
        resolvedPaths.config,
        resolvedPaths.adapterDocs,
        resolvedPaths.taskIndex,
        resolvedPaths.status,
        resolvedPaths.specs,
        resolvedPaths.goals,
        resolvedPaths.milestones
      ]);
    const optionalPaths = uniqueList(configSource === "discovered"
      ? [
        resolvedPaths.config,
        resolvedPaths.status,
        resolvedPaths.specs,
        resolvedPaths.goals,
        resolvedPaths.milestones,
        resolvedPaths.deferredRegister,
        resolvedPaths.mentalModels,
        resolvedPaths.mentalModelIndex,
        resolvedPaths.ideaInbox
      ]
      : [
        resolvedPaths.deferredRegister,
        resolvedPaths.mentalModels,
        resolvedPaths.mentalModelIndex,
        resolvedPaths.ideaInbox
      ]);

    return {
      contract,
      mode: contract,
      cwd,
      config,
      configSource,
      warnings,
      communication,
      paths: resolvedPaths,
      requiredPaths,
      optionalPaths
    };
  }

  const resolvedPaths = {
    taskIndex: paths.tasks || paths.taskIndex || fixedContract.taskIndex,
    tasks: paths.tasks || paths.taskIndex || fixedContract.taskIndex,
    ideaInbox: paths.ideaInbox || "",
    config: activeConfigRelPath || configRelPath,
    status: paths.status || fixedContract.status,
    goals: paths.goals || fixedContract.goals,
    specs: paths.specs || "",
    milestones: paths.milestones || "harness/milestones"
  };

  return {
    contract,
    mode: contract,
    cwd,
    config,
    configSource,
    warnings,
    communication,
    paths: resolvedPaths,
    requiredPaths: uniqueList([
      resolvedPaths.tasks,
      resolvedPaths.config,
      resolvedPaths.status,
      resolvedPaths.goals
    ]),
    optionalPaths: uniqueList([resolvedPaths.ideaInbox])
  };
}

function fixedPathsFromConfig(config, activeConfigRelPath = configRelPath) {
  const paths = config.paths || {};
  if (paths.tasks && paths.taskIndex && paths.tasks !== paths.taskIndex) {
    throw new Error(`Conflicting config aliases: paths.tasks=${paths.tasks} and paths.taskIndex=${paths.taskIndex}.`);
  }
  return {
    taskIndex: paths.tasks || paths.taskIndex || fixedContract.taskIndex,
    ideaInbox: paths.ideaInbox || "",
    config: activeConfigRelPath,
    status: paths.status || fixedContract.status,
    goals: paths.goals || fixedContract.goals,
    specs: paths.specs || "",
    milestones: paths.milestones || "harness/milestones"
  };
}

function configExists(cwd) {
  return Boolean(findConfigRelPath(cwd));
}

function renderAdapterTemplate(paths) {
  return readTemplate("adapter.md")
    .replace("- Goal index: `harness/tasks.md`", `- Goal index: \`${paths.taskIndex}\``)
    .replace("- Idea inbox: `harness/intake.md`", `- Idea inbox: \`${paths.ideaInbox || "not configured"}\``)
    .replace("- Status file: `harness/status.md`", `- Status file: \`${paths.status}\``)
    .replace("- Specs: `harness/specs/`", `- Specs: \`${paths.specs}/\``)
    .replace("- Goals: `harness/goals/`", `- Goals: \`${paths.goals}/\``)
    .replace("- Milestones: `harness/milestones/`", `- Milestones: \`${paths.milestones}/\``)
    .replace("- Deferred register: `harness/milestones/`", `- Deferred register: \`${paths.deferredRegister}/\``)
    .replace("- Mental models: `harness/mental-models/`", `- Mental models: \`${paths.mentalModels}/\``)
    .replace("- Mental model index: `harness/mental-models/README.md`", `- Mental model index: \`${paths.mentalModelIndex}\``);
}

function ensureDir(cwd, relPath, created) {
  if (!relPath) {
    return;
  }
  const absPath = configuredPath(cwd, relPath, "Directory path");
  if (!existsSync(absPath)) {
    mkdirSync(absPath, { recursive: true });
    created.push(relPath);
    return;
  }
  mkdirSync(absPath, { recursive: true });
}

function mentalModelArtifactPaths(paths) {
  const mentalModelsDir = paths.mentalModels || dirname(paths.mentalModelIndex || adapterContract.mentalModelIndex);
  return [
    paths.mentalModelIndex,
    ...mentalModelTemplates.map(([fileName]) => join(mentalModelsDir, fileName))
  ].filter(Boolean);
}

function ensureMentalModelArtifacts(cwd, paths, created, force = false) {
  const mentalModelsDir = paths.mentalModels || dirname(paths.mentalModelIndex || adapterContract.mentalModelIndex);

  if (paths.mentalModelIndex && writeIfMissing(configuredPath(cwd, paths.mentalModelIndex, "Mental model index"), readTemplate("mental-models.md"), force)) {
    created.push(paths.mentalModelIndex);
  }

  for (const [fileName, templateName] of mentalModelTemplates) {
    const relPath = join(mentalModelsDir, fileName);
    if (writeIfMissing(configuredPath(cwd, relPath, "Mental model artifact"), readTemplate(templateName), force)) {
      created.push(relPath);
    }
  }
}

function ensureImportSupportArtifacts(cwd, paths, created) {
  if (writeIfMissing(configuredPath(cwd, paths.status, "Status path"), readTemplate("status.md"))) {
    created.push(paths.status);
  }
  if (paths.ideaInbox && writeIfMissing(configuredPath(cwd, paths.ideaInbox, "Idea inbox path"), readTemplate("intake.md"))) {
    created.push(paths.ideaInbox);
  }
  for (const dir of [paths.specs, paths.goals, paths.milestones, paths.mentalModels]) {
    ensureDir(cwd, dir, created);
  }
  ensureMentalModelArtifacts(cwd, paths, created);
}

function initPlan(args, cwd, projectName) {
  const activeConfigRelPath = findConfigRelPath(cwd);
  if (configExists(cwd)) {
    const config = loadProjectConfig(cwd);
    const existingMode = normalizeHarnessContract(config);
    if (hasRequestedContract(args)) {
      const requested = requestedContract(args);
      if (requested !== existingMode) {
        throw new Error(
          `Existing ${activeConfigRelPath} is ${existingMode}; requested init contract is ${requested}. Use a migration command instead of init.`
        );
      }
    }
    const existingPaths = existingMode === "adapter"
      ? resolvedAdapterPaths(config, activeConfigRelPath)
      : fixedPathsFromConfig(config, activeConfigRelPath);
    const requestedPaths = [
      ["task index", args.taskIndex, existingPaths.taskIndex],
      ["idea inbox", args.ideaInbox, existingPaths.ideaInbox]
    ];
    for (const [label, requested, existing] of requestedPaths) {
      if (requested && normalizePathReference(requested) !== normalizePathReference(existing)) {
        throw new Error(`Existing ${activeConfigRelPath} already configures the ${label} as ${existing || "(not configured)"}; init does not migrate paths.`);
      }
    }
    return {
      mode: existingMode,
      configPayload: config,
      paths: existingPaths,
      writeConfig: false
    };
  }

  const mode = requestedContract(args);
  const discovery = mode === "adapter"
    ? discoverAdapterProject(cwd, {
      taskIndex: args.taskIndex,
      adapterDocs: args.adapterDocs,
      ideaInbox: args.ideaInbox
    })
    : {};
  const configPayload = mode === "adapter"
    ? buildAdapterConfigPayload(projectName, discovery)
    : buildConfigPayload(projectName, "fixed");
  if (mode === "fixed") {
    if (args.taskIndex) {
      configPayload.paths.tasks = args.taskIndex;
      delete configPayload.paths.taskIndex;
    }
    if (args.ideaInbox) {
      configPayload.paths.ideaInbox = args.ideaInbox;
    }
  }

  return {
    mode,
    configPayload,
    paths: mode === "adapter"
      ? resolvedAdapterPaths(configPayload)
      : fixedPathsFromConfig(configPayload),
    writeConfig: true
  };
}

function validateWritablePlan(cwd, mode, paths) {
  const files = [paths.taskIndex, paths.config, paths.status, paths.ideaInbox];
  const dirs = [paths.goals];
  if (mode === "adapter") {
    files.push(paths.adapterDocs, paths.mentalModelIndex, paths.ideaInbox);
    dirs.push(paths.specs, paths.milestones, paths.deferredRegister, paths.mentalModels);
  }
  for (const path of uniqueList(files.filter(Boolean))) configuredPath(cwd, path, "Writable file path");
  for (const path of uniqueList(dirs.filter(Boolean))) configuredPath(cwd, path, "Writable directory path");
}

function init(args) {
  const cwd = targetCwd(args);
  const lang = args.language;
  const projectName = args.projectName || basename(cwd);
  const created = [];
  const plan = initPlan(args, cwd, projectName);
  const { mode, configPayload, paths } = plan;
  const configValidation = validateConfigPayloadObject(configPayload);
  if (!configValidation.ok) {
    throw new Error(`Harness config is invalid:\n${configValidation.errors.map((error) => `- ${error}`).join("\n")}`);
  }
  validateWritablePlan(cwd, mode, paths);

  const taskTemplate = mode === "adapter" ? "task-index.md" : "tasks.md";
  const tasksPath = configuredPath(cwd, paths.taskIndex, "Task index path");
  if (writeIfMissing(tasksPath, readTemplate(taskTemplate), args.force)) {
    created.push(paths.taskIndex);
  }

  const configPath = configuredPath(cwd, paths.config, "Config path");
  if (plan.writeConfig && writeIfMissing(configPath, `${JSON.stringify(configPayload, null, 2)}\n`, args.force)) {
    created.push(paths.config);
  }

  const statusPath = configuredPath(cwd, paths.status, "Status path");
  if (writeIfMissing(statusPath, readTemplate("status.md"), args.force)) {
    created.push(paths.status);
  }

  if (mode === "adapter") {
    const adapterPath = configuredPath(cwd, paths.adapterDocs, "Adapter docs path");
    if (writeIfMissing(adapterPath, renderAdapterTemplate(paths), args.force)) {
      created.push(paths.adapterDocs);
    }
    if (paths.ideaInbox) {
      const ideaInboxPath = configuredPath(cwd, paths.ideaInbox, "Idea inbox path");
      if (writeIfMissing(ideaInboxPath, readTemplate("intake.md"), args.force)) {
        created.push(paths.ideaInbox);
      }
    }
  } else if (paths.ideaInbox) {
    const ideaInboxPath = configuredPath(cwd, paths.ideaInbox, "Idea inbox path");
    if (writeIfMissing(ideaInboxPath, readTemplate("intake.md"), args.force)) {
      created.push(paths.ideaInbox);
    }
  }

  const dirs = mode === "adapter"
    ? [paths.specs, paths.goals, paths.milestones, paths.mentalModels]
    : [paths.goals];
  for (const dir of dirs) {
    mkdirSync(configuredPath(cwd, dir, "Harness directory"), { recursive: true });
  }

  if (mode === "adapter" && paths.mentalModelIndex) {
    ensureMentalModelArtifacts(cwd, paths, created, args.force);
  }

  console.log(t(lang, "initDone", { cwd }));
  console.log(created.length ? t(lang, "initCreated", { files: created.join(", ") }) : t(lang, "initNoChanges"));
}

const publicSkillNames = ["orient", "intake", "init", "execute"];

function skillsInstallPlan() {
  return [
    ...publicSkillNames.map((name) => ({
      kind: "skill",
      name,
      from: join(pluginRoot, "skills", name),
      toRel: `.agents/skills/${name}`
    })),
    {
      kind: "references",
      name: "references",
      from: join(pluginRoot, "references"),
      toRel: ".agents/references"
    }
  ];
}

function skillsInstall(args) {
  const cwd = targetCwd(args);
  const projectRoot = resolve(cwd);
  const writes = skillsInstallPlan().map((item) => {
    const dest = resolve(projectRoot, item.toRel);
    const relativeDest = relative(projectRoot, dest);
    if (isAbsolute(relativeDest) || relativeDest.startsWith("..")) {
      throw new Error(`Skill install path escapes project root: ${item.toRel}`);
    }
    const exists = existsSync(dest);
    let action = "copy";
    if (args.dryRun) action = "would-copy";
    if (exists && !args.force) action = "skip";
    return { ...item, dest, exists, action };
  });

  if (args.json) {
    console.log(JSON.stringify({
      ok: true,
      dryRun: Boolean(args.dryRun),
      target: ".agents/skills/",
      writes: writes.map((item) => ({
        kind: item.kind,
        name: item.name,
        path: item.toRel,
        exists: item.exists,
        action: item.action
      }))
    }, null, 2));
    return;
  }

  for (const item of writes) {
    if (item.action === "skip") {
      console.log(`Skip existing ${item.toRel} (use --force to replace)`);
      continue;
    }
    if (args.dryRun) {
      console.log(`Would install ${item.toRel}`);
      continue;
    }
    mkdirSync(dirname(item.dest), { recursive: true });
    if (existsSync(item.dest)) {
      rmSync(item.dest, { recursive: true, force: true });
    }
    cpSync(item.from, item.dest, { recursive: true });
    console.log(`Installed ${item.toRel}`);
  }
}

function skillFrontmatter(text) {
  const match = String(text).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match?.[1] || "";
}

function isHarnessSkillCopy(dest, name) {
  let destStat;
  try {
    destStat = lstatSync(dest);
  } catch {
    return false;
  }
  if (destStat.isSymbolicLink() || !destStat.isDirectory()) return false;
  const skillFile = join(dest, "SKILL.md");
  let skillStat;
  try {
    skillStat = lstatSync(skillFile);
  } catch {
    return false;
  }
  if (skillStat.isSymbolicLink() || !skillStat.isFile()) return false;
  let text = "";
  try {
    text = readFileSync(skillFile, "utf8");
  } catch {
    return false;
  }
  const frontmatter = skillFrontmatter(text);
  const nameMatch = frontmatter.match(/^name:\s*(\S+)\s*$/m);
  if (!nameMatch || nameMatch[1] !== name) return false;
  return /Agent Harness|\bHarness\b/i.test(frontmatter);
}

function listRegularFiles(rootDir) {
  const files = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) walk(path);
      else if (entry.isFile()) files.push(path);
    }
  };
  if (existsSync(rootDir)) walk(rootDir);
  return files;
}

function sameFileBytes(left, right) {
  let leftStat;
  let rightStat;
  try {
    leftStat = lstatSync(left);
    rightStat = lstatSync(right);
  } catch {
    return false;
  }
  if (leftStat.isSymbolicLink() || rightStat.isSymbolicLink()) return false;
  if (!leftStat.isFile() || !rightStat.isFile() || leftStat.size !== rightStat.size) return false;
  return readFileSync(left).equals(readFileSync(right));
}

function installDest(projectRoot, toRel) {
  const dest = resolve(projectRoot, toRel);
  const relativeDest = relative(projectRoot, dest).split("\\").join("/");
  if (!relativeDest || isAbsolute(relativeDest) || relativeDest.startsWith("..")) {
    throw new Error(`Skill uninstall path escapes project root: ${toRel}`);
  }
  if (relativeDest === "harness" || relativeDest.startsWith("harness/") || relativeDest === ".harness" || relativeDest.startsWith(".harness/")) {
    throw new Error(`Skill uninstall refuses project data path: ${toRel}`);
  }
  return { dest, toRel: relativeDest };
}

function installPathExists(dest) {
  try {
    lstatSync(dest);
    return true;
  } catch {
    return false;
  }
}

function skillsUninstallPlan(projectRoot) {
  const items = [];
  for (const item of skillsInstallPlan()) {
    if (item.kind === "skill") {
      const located = installDest(projectRoot, item.toRel);
      const action = !installPathExists(located.dest)
        ? "absent"
        : isHarnessSkillCopy(located.dest, item.name) ? "remove" : "skip-foreign";
      items.push({ kind: item.kind, name: item.name, path: located.toRel, dest: located.dest, action });
      continue;
    }
    for (const sourceFile of listRegularFiles(item.from)) {
      const rel = relative(item.from, sourceFile).split("\\").join("/");
      const located = installDest(projectRoot, `.agents/references/${rel}`);
      const action = !installPathExists(located.dest)
        ? "absent"
        : sameFileBytes(sourceFile, located.dest) ? "remove" : "skip-preserved";
      items.push({ kind: "reference", name: rel, path: located.toRel, dest: located.dest, action });
    }
  }
  return items;
}

function removeEmptyInstallDir(projectRoot, relPath) {
  const located = installDest(projectRoot, relPath);
  if (!installPathExists(located.dest)) return;
  const stat = lstatSync(located.dest);
  if (stat.isSymbolicLink() || !stat.isDirectory() || readdirSync(located.dest).length > 0) return;
  assertContainedPath(projectRoot, located.dest, "Skill uninstall directory");
  rmSync(located.dest, { recursive: false });
}

function skillsUninstall(args) {
  const projectRoot = resolve(targetCwd(args));
  const removals = skillsUninstallPlan(projectRoot).map((item) => {
    if (item.action !== "remove") return item;
    assertContainedPath(projectRoot, item.dest, "Skill uninstall path");
    return item;
  });

  if (args.json) {
    console.log(JSON.stringify({
      ok: true,
      dryRun: Boolean(args.dryRun),
      preservesProjectData: true,
      untouched: ["harness/", ".harness/"],
      removals: removals.map((item) => ({
        kind: item.kind,
        name: item.name,
        path: item.path,
        action: item.action === "remove" ? "would-remove" : item.action
      }))
    }, null, 2));
    return;
  }

  for (const item of removals) {
    if (item.action !== "remove") {
      if (!args.json && item.action === "skip-foreign") {
        console.log(`Skip ${item.path}; it is not an Agent Harness skill`);
      } else if (!args.json && item.action === "skip-preserved") {
        console.log(`Preserved ${item.path}; it differs from the installed reference`);
      }
      continue;
    }
    if (args.dryRun) {
      if (!args.json) console.log(`Would remove ${item.path}`);
      continue;
    }
    const stat = lstatSync(item.dest);
    if (stat.isSymbolicLink()) {
      throw new Error(`Skill uninstall refuses to delete a symlink: ${item.path}`);
    }
    rmSync(item.dest, { recursive: stat.isDirectory() });
    if (!args.json) console.log(`Removed ${item.path}`);
  }

  if (!args.dryRun) {
    removeEmptyInstallDir(projectRoot, ".agents/skills");
    removeEmptyInstallDir(projectRoot, ".agents/references");
  }
  if (!args.json) console.log("Project data was left unchanged.");
}

function configImport(args) {
  const cwd = targetCwd(args);
  const projectName = args.projectName || basename(cwd);
  const configPath = configuredPath(cwd, configRelPath, "Config path");
  const activeConfigRelPath = findConfigRelPath(cwd);
  const discovery = discoverAdapterProject(cwd, {
    taskIndex: args.taskIndex,
    ideaInbox: args.ideaInbox,
    adapterDocs: args.adapterDocs,
    status: args.status,
    specs: args.specs,
    goals: args.goals,
    milestones: args.milestones,
    runs: args.runs,
    gateRecords: args.gateRecords,
    deferredRegister: args.deferredRegister,
    mentalModel: args.mentalModel,
    mentalModelIndex: args.mentalModelIndex,
    mentalModels: args.mentalModels
  });

  if (!discovery.detected) {
    throw new Error(
      `No existing project adapter found. Expected ${adapterContract.adapterDocs} plus an existing task index such as harness/tasks.md, todolist.md, or tasks.md.`
    );
  }
  if (!discovery.adapterDocs || !existsSync(join(cwd, discovery.adapterDocs))) {
    throw new Error("Could not find an existing project adapter. Pass --adapter-docs <path> to import one explicitly.");
  }
  if (!discovery.taskIndex || !existsSync(join(cwd, discovery.taskIndex))) {
    throw new Error("Could not find an existing task index. Pass --task-index <path> to import one explicitly.");
  }
  if (activeConfigRelPath && !args.force) {
    throw new Error(`${activeConfigRelPath} already exists. Use --force to overwrite.`);
  }

  const configPayload = buildAdapterConfigPayload(projectName, discovery);
  const configValidation = validateConfigPayloadObject(configPayload);
  if (!configValidation.ok) {
    throw new Error(`Proposed adapter config is invalid:\n${configValidation.errors.map((error) => `- ${error}`).join("\n")}`);
  }
  const paths = resolvedAdapterPaths(configPayload, configRelPath);
  validateWritablePlan(cwd, "adapter", paths);

  const payload = {
    dryRun: Boolean(args.dryRun),
    wouldCreate: [
      configRelPath,
      paths.status,
      paths.specs,
      paths.goals,
      paths.milestones,
      paths.mentalModels,
      paths.ideaInbox,
      ...mentalModelArtifactPaths(paths)
    ].filter((relPath) => relPath && !existsSync(join(cwd, relPath))),
    created: [],
    contract: "adapter",
    cwd,
    proposedConfig: configPayload,
    configValidation,
    paths
  };

  if (!args.dryRun) {
    mkdirSync(dirname(configPath), { recursive: true });
    writeFileSync(configPath, `${JSON.stringify(configPayload, null, 2)}\n`);
    payload.created.push(configRelPath);
    ensureImportSupportArtifacts(cwd, paths, payload.created);
  }

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`${args.dryRun ? "Would import" : "Imported"} adapter config: ${configRelPath}`);
  console.log(`Task index: ${payload.paths.taskIndex}`);
  console.log(`Adapter: ${payload.paths.adapterDocs}`);
  if (args.dryRun) {
    console.log(`Would create: ${payload.wouldCreate.length ? payload.wouldCreate.join(", ") : "nothing"}`);
  } else {
    console.log(`Created: ${payload.created.length ? payload.created.join(", ") : "nothing"}`);
  }
}

function doctor(args) {
  const cwd = targetCwd(args);
  const lang = args.language;
  const context = resolveHarnessContext(cwd);
  const configValidation = configValidationPayload(cwd);
  const required = context.requiredPaths;
  const missing = required.filter((path) => !existsSync(join(cwd, path)));

  console.log(`${t(lang, "doctorProject")}: ${cwd}`);
  console.log(`Harness contract: ${context.contract}`);
  console.log(`Config source: ${context.configSource}`);
  console.log(`Config schema: ${configValidation.ok ? "ok" : "failed"}`);
  for (const error of configValidation.errors) {
    console.log(`Config schema error: ${error}`);
  }
  console.log(`${t(lang, "doctorHarnessFiles")}: ${missing.length ? t(lang, "doctorMissing", { files: missing.join(", ") }) : t(lang, "doctorOk")}`);
  if (context.optionalPaths.length) {
    const optionalMissing = context.optionalPaths.filter((path) => !existsSync(join(cwd, path)));
    console.log(`Optional harness paths: ${optionalMissing.length ? `missing ${optionalMissing.join(", ")}` : "ok"}`);
  }
  for (const warning of context.warnings) {
    console.log(`Warning: ${warning}`);
  }
  if (!configValidation.ok || missing.length) {
    process.exitCode = 1;
  }
}

const validWorkModes = new Set(["local", "worktree", "ask"]);

function worktreeConfig(cwd) {
  const context = resolveHarnessContext(cwd);
  const config = context.config;
  const worktree = config.worktree || {};
  const workMode = config.workMode || {};
  if (worktree.defaultPolicy && workMode.defaultPolicy && worktree.defaultPolicy !== workMode.defaultPolicy) {
    throw new Error(`Conflicting config aliases: worktree.defaultPolicy=${worktree.defaultPolicy} and workMode.defaultPolicy=${workMode.defaultPolicy}.`);
  }
  return {
    contract: context.contract,
    defaultPolicy: worktree.defaultPolicy || workMode.defaultPolicy || "ask"
  };
}

function recommendWorkMode({ cwd, config }) {
  const reasons = [];
  let matchedRule = "";

  if (validWorkModes.has(config.defaultPolicy)) {
    reasons.push({
      source: "config",
      code: "default_policy",
      use: config.defaultPolicy,
      detail: `defaultPolicy=${config.defaultPolicy}`
    });
    return {
      contract: config.contract || config.mode || "fixed",
      cwd,
      recommendation: config.defaultPolicy,
      reasons,
      config: {
        defaultPolicy: config.defaultPolicy,
        matchedRule
      }
    };
  }

  reasons.push({
    source: "config",
    code: "invalid_default_policy",
    use: config.defaultPolicy,
    detail: "falling back to ask"
  });

  return {
    contract: config.contract || config.mode || "fixed",
    cwd,
    recommendation: "ask",
    reasons,
    config: {
      defaultPolicy: config.defaultPolicy,
      matchedRule
    }
  };
}

function formatWorktreeReason(lang, reason) {
  const zh = lang === "zh-CN";
  const rule = reason.rule || "(missing)";
  const use = reason.use || "(missing)";

  if (reason.code === "auto_rule_matched") {
    return zh ? `config rule: ${rule} -> ${use}` : `config rule: ${rule} -> ${use}`;
  }
  if (reason.code === "default_policy_not_used") {
    return zh
      ? `fallback: defaultPolicy=${use} 未使用`
      : `fallback: defaultPolicy=${use} was not used`;
  }
  if (reason.code === "auto_rule_not_matched") {
    return zh
      ? `config rule 未匹配: ${rule} (${reason.detail})`
      : `config rule did not match: ${rule} (${reason.detail})`;
  }
  if (reason.code === "auto_rule_skipped") {
    return zh
      ? `config rule 已跳过: ${rule} (${reason.detail})`
      : `config rule skipped: ${rule} (${reason.detail})`;
  }
  if (reason.code === "invalid_auto_rule_use") {
    return zh
      ? `config rule 已忽略: ${rule} 的 use=${use} 无效`
      : `config rule ignored: ${rule} has invalid use=${use}`;
  }
  if (reason.code === "default_policy") {
    return zh
      ? `config fallback: defaultPolicy=${use}`
      : `config fallback: defaultPolicy=${use}`;
  }
  if (reason.code === "invalid_default_policy") {
    return zh
      ? `config fallback 无效: defaultPolicy=${use}; 使用 ask`
      : `config fallback invalid: defaultPolicy=${use}; using ask`;
  }

  return reason.detail || reason.code;
}

function worktreeActionKey(recommendation) {
  if (recommendation === "local") {
    return "worktreeActionLocal";
  }
  if (recommendation === "worktree") {
    return "worktreeActionWorktree";
  }
  return "worktreeActionAsk";
}

function worktreeRecommend(args) {
  const cwd = targetCwd(args);
  const lang = args.language;
  const config = worktreeConfig(cwd);
  const recommendation = recommendWorkMode({ cwd, config });

  if (args.json) {
    console.log(JSON.stringify(recommendation, null, 2));
    return;
  }

  console.log(`${t(lang, "worktreeRecommendation")}: ${recommendation.recommendation}`);
  console.log(`${t(lang, "worktreeReasons")}:`);
  for (const reason of recommendation.reasons) {
    console.log(`- ${formatWorktreeReason(lang, reason)}`);
  }
  console.log(`${t(lang, "worktreeAction")}: ${t(lang, worktreeActionKey(recommendation.recommendation))}`);
}

function printableContract(mode) {
  if (mode === "adapter") {
    return adapterContract;
  }
  return fixedContract;
}

function printContract(args) {
  const mode = requestedContract(args);
  console.log(JSON.stringify(printableContract(mode), null, 2));
}

function configInspect(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  const configValidation = configValidationPayload(cwd);
  const payload = {
    contract: context.contract,
    cwd,
    configSource: context.configSource,
    configPath: context.paths.config,
    configValidation,
    communication: context.communication,
    paths: context.paths,
    requiredPaths: context.requiredPaths,
    optionalPaths: context.optionalPaths,
    warnings: context.warnings,
    config: context.config
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Harness contract: ${payload.contract}`);
  console.log(`Config source: ${payload.configSource}`);
  console.log(`Config: ${payload.configPath}`);
  console.log(`Config schema: ${configValidation.ok ? "ok" : "failed"}`);
  for (const error of configValidation.errors) {
    console.log(`Config schema error: ${error}`);
  }
  console.log(`Commentary policy: ${payload.communication.commentary} (${payload.communication.source})`);
  console.log(`Report cadence: ${payload.communication.reportCadence}`);
  console.log(`Notify on: ${payload.communication.notifyOn}`);
  console.log("Paths:");
  for (const [key, value] of Object.entries(payload.paths)) {
    console.log(`- ${key}: ${value}`);
  }
}

function configValidate(args) {
  const cwd = targetCwd(args);
  const payload = configValidationPayload(cwd);

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log("Agent Harness config validation");
    console.log(`Config: ${payload.configPath || "not found"}`);
    console.log(`Schema: ${payload.schemaPath}`);
    console.log(`Result: ${payload.ok ? "ok" : "failed"}`);
    for (const warning of payload.warnings) {
      console.log(`Warning: ${warning}`);
    }
    for (const error of payload.errors) {
      console.log(`- ${error}`);
    }
  }

  if (!payload.ok) {
    process.exitCode = 1;
  }
}

function adapterInspect(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  const adapterPath = context.paths.adapterDocs || "";
  const exists = Boolean(adapterPath && existsSync(join(cwd, adapterPath)));
  const payload = {
    contract: context.contract,
    cwd,
    adapterPath,
    exists
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  if (!adapterPath) {
  console.log("Adapter: not configured for this harness contract");
    return;
  }

  console.log(`Adapter: ${adapterPath}`);
  console.log(`Exists: ${exists ? "yes" : "no"}`);
}

function activationSnippet(context) {
  const paths = context.paths;
  const configPath = paths.config || configRelPath;
  const taskIndex = paths.taskIndex || paths.tasks || fixedContract.taskIndex;
  const ideaInbox = paths.ideaInbox || "";
  const statusPath = paths.status || fixedContract.status;
  const adapterPath = context.contract === "adapter" ? paths.adapterDocs : "";
  const specsPath = paths.specs || "";
  const goalsPath = paths.goals || fixedContract.goals;

  return `## Agent Harness

If \`${configPath}\` exists, read it before substantial project work.

- Resolve the harness contract and artifact paths with \`agent-harness config inspect --cwd .\` when the project state is unclear.
${adapterPath ? `- For \`contract: "adapter"\`, read the project adapter at \`${adapterPath}\` before goal, run, or implementation work.\n` : ""}- Read the configured task index at \`${taskIndex}\` and status file at \`${statusPath}\` before choosing or executing tasks.
${ideaInbox ? `- For intake capture, use the configured idea inbox at \`${ideaInbox}\`; inbox entries are unaccepted candidates.\n` : ""}
${specsPath ? `- Read relevant specs under \`${specsPath}\` and goals under \`${goalsPath}\` before implementation.\n` : `- Read relevant goals under \`${goalsPath}\` before implementation.\n`}- For orientation or next-action requests, summarize current status and task state first; do not start implementation unless the user asks.
- Use \`agent-harness doctor --cwd .\`, \`agent-harness orient next --cwd .\`, \`agent-harness goal create --cwd . --task "<task>"\`, \`agent-harness plan validate --cwd . --plan <target-file>.plan.json\`, and \`agent-harness execute next --cwd . --goal <goal-file>\` when they fit the task. Execute in the host; do not create Runs, hashes or copied logs.
- Preserve existing project instructions. Pause before product-direction decisions, \`AGENTS.md\` changes, credentials, paid APIs, production access, destructive operations, branch/worktree changes, delivery steps above the active goal policy, deploy, release, daemons, watchers, or background automation.
`;
}

function activationSnippetCommand(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  const snippet = activationSnippet(context);
  const payload = {
    cwd,
    contract: context.contract,
    target: "AGENTS.md",
    writesFiles: false,
    snippet
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log("Agent Harness activation snippet");
  console.log("Target: AGENTS.md");
  console.log("Writes files: no");
  console.log("");
  console.log(snippet.trimEnd());
}

function statusFocus(content) {
  const focus = extractSection(content, "Focus");
  if (!focus) {
    return "";
  }
  const lines = focus
    .split(/\r?\n/)
    .map((line) => line.replace(/^-+\s*/, "").trim())
    .filter(Boolean);
  return lines.join(" ").replace(/^Current focus:\s*/i, "").trim();
}

function taskStatus(task) {
  const explicit = detailValue(task, "Status").toLowerCase();
  if (explicit) {
    return explicit;
  }
  if (task.done) {
    return "done";
  }
  const section = String(task.section || "").toLowerCase();
  if (section === "done") {
    return "done";
  }
  if (section === "now") {
    return "todo";
  }
  return "";
}

function taskKind(task) {
  return detailValue(task, "Type").toLowerCase();
}

function canonicalTaskState(task) {
  const status = taskStatus(task);
  for (const state of ["cancelled", "closed", "done", "blocked", "paused", "doing", "review", "triage", "watching", "signal", "todo", "spec-ready", "goal-ready", "spec-draft", "action-needed"]) {
    if (status === state || status.startsWith(`${state} `) || status.startsWith(`${state}(`) || status.startsWith(`${state}-`)) return state;
  }
  return status;
}

function taskSummary(task) {
  const status = taskStatus(task);
  const kind = taskKind(task);
  const parts = [
    task.priority,
    status ? `status=${status}` : "",
    kind ? `type=${kind}` : "",
    task.section ? `section=${task.section}` : "",
    `line=${task.line}`
  ].filter(Boolean);
  return {
    title: task.title,
    priority: task.priority,
    status,
    type: kind,
    section: task.section || "",
    line: task.line,
    summary: `${task.priority ? `${task.priority} ` : ""}${task.title}${parts.length ? ` (${parts.join(", ")})` : ""}`
  };
}

function pathInConfiguredDir(relPath, dirPath) {
  const cleanedPath = cleanLinkedTarget(relPath);
  const cleanedDir = cleanLinkedTarget(dirPath).replace(/\/+$/g, "");
  return Boolean(cleanedPath && cleanedDir && (cleanedPath === cleanedDir || cleanedPath.startsWith(`${cleanedDir}/`)));
}

function taskLinkedDocs(task) {
  return extractLinkedDocPaths(detailValue(task, "Doc"));
}

function taskSpecPath(task, paths) {
  const explicit = cleanLinkedTarget(detailValue(task, "Spec"));
  if (explicit) {
    return explicit;
  }
  return taskLinkedDocs(task).find((docPath) => pathInConfiguredDir(docPath, paths.specs)) || "";
}

function taskGoalPath(task, paths) {
  const explicit = cleanLinkedTarget(detailValue(task, "Goal"));
  if (explicit) {
    return explicit;
  }
  return taskLinkedDocs(task).find((docPath) => pathInConfiguredDir(docPath, paths.goals)) || "";
}

function existingGoalForTask(cwd, paths, task) {
  const goalsPath = paths.goals || fixedContract.goals;
  for (const goalPath of goalFiles(cwd, goalsPath)) {
    const goalContent = readFileSync(goalPath, "utf8");
    if (canonicalGoalStatus(extractStatusLine(goalContent)) === "blocked") {
      continue;
    }
    const source = goalSourceTask(goalContent);
    if (source.title && normalizedTaskTitle(source.title) === normalizedTaskTitle(task.title)) {
      return displayPath(cwd, goalPath);
    }
  }
  return "";
}

function shellQuote(value) {
  return `"${String(value).replace(/(["\\$`])/g, "\\$1")}"`;
}

function recommendationForTask(task, context, reason) {
  const status = canonicalTaskState(task);
  const priority = priorityRank(task.priority);
  const specPath = taskSpecPath(task, context.paths);
  const linkedGoalPath = taskGoalPath(task, context.paths);
  const existingGoalPath = linkedGoalPath || existingGoalForTask(context.cwd, context.paths, task);
  const titleArg = shellQuote(task.title);
  const specArg = specPath ? ` --spec ${shellQuote(specPath)}` : "";

  const base = {
    title: task.title,
    taskState: status || "unspecified",
    priority: task.priority || "",
    spec: specPath,
    goal: existingGoalPath,
    reason,
    route: "",
    startPrompt: "",
    goalCommand: ""
  };

  if (status === "goal-ready") {
    if (existingGoalPath) {
      return {
        ...base,
        route: "goal-ready",
        startPrompt: `Validate the existing goal and its delivery plan for: ${task.title}`,
        goalCommand: `agent-harness goal validate --cwd . --goal ${shellQuote(existingGoalPath)} && agent-harness plan validate --cwd . --plan ${shellQuote(`${existingGoalPath}.plan.json`)} && agent-harness execute next --cwd . --goal ${shellQuote(existingGoalPath)}`
      };
    }
    return {
      ...base,
      route: "goal-ready",
      startPrompt: `Create a goal from accepted scope for: ${task.title}`,
      goalCommand: specPath
        ? `agent-harness goal create --cwd . --task ${titleArg}${specArg}`
        : `agent-harness goal create --cwd . --task ${titleArg} --allow-no-spec`
    };
  }

  if (status === "spec-ready") {
    if (specPath) {
      return {
        ...base,
        route: "goal",
        startPrompt: `Create a goal from the accepted spec for: ${task.title}`,
        goalCommand: `agent-harness goal create --cwd . --task ${titleArg}${specArg}`
      };
    }
    return {
      ...base,
      route: "shape",
      startPrompt: `Link or confirm the accepted spec for: ${task.title}`,
      goalCommand: ""
    };
  }

  if (["todo", "spec-draft"].includes(status) && priority <= 1 && !specPath) {
    return {
      ...base,
      route: "shape",
      startPrompt: `Shape or confirm scope/spec before creating a goal for: ${task.title}`,
      goalCommand: ""
    };
  }

  if (specPath) {
    return {
      ...base,
      route: "goal",
      startPrompt: `Create a goal from the linked spec for: ${task.title}`,
      goalCommand: `agent-harness goal create --cwd . --task ${titleArg}${specArg}`
    };
  }

  return {
    ...base,
    route: "shape",
    startPrompt: `Confirm accepted scope before goal creation for: ${task.title}`,
    goalCommand: ""
  };
}

function isBlockedTask(task) {
  const status = canonicalTaskState(task);
  return ["blocked", "paused", "action-needed"].includes(status);
}

function isDoneTask(task) {
  const status = canonicalTaskState(task);
  return task.done || ["done", "cancelled", "closed"].includes(status);
}

function isInProgressTask(task) {
  const status = canonicalTaskState(task);
  return ["doing", "review", "triage", "watching", "signal"].includes(status);
}

function isReadyTask(task) {
  if (isDoneTask(task) || isBlockedTask(task) || isInProgressTask(task)) {
    return false;
  }
  const status = canonicalTaskState(task);
  return !status || ["todo", "spec-ready", "goal-ready", "spec-draft", "action-needed"].includes(status);
}

function priorityRank(priority) {
  const match = String(priority || "").match(/^P(\d+)$/i);
  return match ? Number(match[1]) : 99;
}

function taskSort(a, b) {
  const priorityDiff = priorityRank(a.priority) - priorityRank(b.priority);
  if (priorityDiff) {
    return priorityDiff;
  }
  return a.line - b.line;
}

function firstLines(value, limit = 6) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function orientationPayload(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  const taskIndex = context.paths.taskIndex || context.paths.tasks;
  const statusPath = context.paths.status;
  const taskIndexAbs = configuredOptionalPath(cwd, taskIndex, "Task index path");
  const statusAbs = configuredOptionalPath(cwd, statusPath, "Status path");
  const taskContent = taskIndexAbs && existsSync(taskIndexAbs) ? readFileSync(taskIndexAbs, "utf8") : "";
  const statusContent = statusAbs && existsSync(statusAbs) ? readFileSync(statusAbs, "utf8") : "";
  const tasks = taskContent ? parseTasks(taskContent) : [];
  const ready = tasks.filter(isReadyTask).sort(taskSort);
  const blocked = tasks.filter(isBlockedTask).sort(taskSort);
  const inProgress = tasks.filter(isInProgressTask).sort(taskSort);
  const done = tasks.filter(isDoneTask).sort(taskSort);
  const recommendationTask = ready[0] || inProgress[0] || blocked[0] || null;
  const recommendationReason = recommendationTask
    ? ready[0] === recommendationTask
      ? "highest-priority ready task from the configured task index"
      : inProgress[0] === recommendationTask
        ? "no ready task found; continue the active in-progress task"
        : "no ready or in-progress task found; unblock the highest-priority blocked task"
    : "";
  let recommendation = recommendationTask
    ? recommendationForTask(recommendationTask, context, recommendationReason)
    : {
      title: "",
      taskState: "",
      priority: "",
      spec: "",
      goal: "",
      reason: tasks.length === 0
        ? "no parsed tasks found in the configured task index"
        : done.length === tasks.length
          ? "all parsed tasks are completed or closed"
          : "no actionable tasks found in the configured task index",
      route: "",
      startPrompt: "",
      goalCommand: ""
    };

  return {
    cwd,
    contract: context.contract,
    configSource: context.configSource,
    paths: {
      taskIndex,
      status: statusPath,
      adapter: context.paths.adapterDocs || "",
      config: context.paths.config || ""
    },
    status: {
      exists: Boolean(statusContent),
      focus: statusFocus(statusContent),
      blockers: firstLines(extractSection(statusContent, "Blockers"), 5)
    },
    tasks: {
      exists: Boolean(taskContent),
      total: tasks.length,
      ready: ready.map(taskSummary),
      blocked: blocked.map(taskSummary),
      inProgress: inProgress.map(taskSummary),
      done: done.slice(0, 5).map(taskSummary)
    },
    recommendation,
    confirmation: {
      canContinueWithoutConfirmation: [
        "read harness artifacts",
        "summarize status and task state",
        "draft a spec or goal preview",
        "run local read-only inspection commands"
      ],
      needsUserConfirmation: [
        "choose product direction",
        "move from shaping into implementation when scope is ambiguous",
        "modify AGENTS.md or activation behavior",
        "create branches or worktrees",
        "delivery above the active goal policy, deploy, release, daemon, watcher, credentials, paid API, production, or destructive actions"
      ]
    },
    warnings: context.warnings
  };
}

function formatTaskSummaries(tasks, emptyText) {
  if (!tasks.length) {
    return `- ${emptyText}`;
  }
  return tasks.slice(0, 5).map((task) => `- ${task.summary}`).join("\n");
}

function orientNext(args) {
  if (args.goal || args.milestone) return planned.next(args);
  const payload = orientationPayload(args);

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log("Agent Harness orientation");
  console.log(`Harness contract: ${payload.contract}`);
  console.log(`Task index: ${payload.paths.taskIndex || "not configured"}`);
  console.log(`Status file: ${payload.paths.status || "not configured"}`);
  console.log("");
  console.log("Current focus:");
  console.log(`- ${payload.status.focus || "not recorded"}`);
  console.log("");
  console.log("Ready tasks:");
  console.log(formatTaskSummaries(payload.tasks.ready, "none detected"));
  console.log("");
  console.log("In progress:");
  console.log(formatTaskSummaries(payload.tasks.inProgress, "none detected"));
  console.log("");
  console.log("Blocked:");
  console.log(formatTaskSummaries(payload.tasks.blocked, "none detected"));
  console.log("");
  console.log("Recommended next action:");
  if (payload.recommendation.title) {
    console.log(`- ${payload.recommendation.title}`);
    console.log(`- Reason: ${payload.recommendation.reason}`);
    console.log(`- Route: ${payload.recommendation.route}`);
    console.log(`- To start: ${payload.recommendation.startPrompt}`);
    if (payload.recommendation.spec) {
      console.log(`- Spec: ${payload.recommendation.spec}`);
    }
    if (payload.recommendation.goal) {
      console.log(`- Goal: ${payload.recommendation.goal}`);
    }
    console.log(`- Goal command: ${payload.recommendation.goalCommand || "not recommended until spec or accepted scope is confirmed"}`);
  } else {
    console.log(`- ${payload.recommendation.reason}`);
  }
  console.log("");
  console.log("Confirmation check:");
  console.log("- This command is read-only and did not start implementation.");
  console.log("- Ask before moving into implementation, activation changes, branch/worktree changes, delivery above the active goal policy, deploy, release, credentials, paid APIs, production, destructive operations, daemons, or automation.");
}

const validIntakePriorities = new Set(["P1", "P2", "P3"]);
const validIntakeSections = new Set(["Now", "Next", "Later"]);

function oneLine(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizePathReference(value) {
  return String(value || "")
    .replaceAll("\\", "/")
    .replace(/^\.\/+/, "")
    .replace(/\/{2,}/g, "/")
    .replace(/\/$/, "");
}

function containsExactPathReference(content, reference) {
  const normalizedReference = normalizePathReference(reference);
  if (!normalizedReference) return false;
  const haystack = normalizePathReference(content);
  const comparison = process.platform === "win32" ? haystack.toLowerCase() : haystack;
  const candidates = uniqueList([normalizedReference, `./${normalizedReference}`])
    .map((candidate) => process.platform === "win32" ? candidate.toLowerCase() : candidate);
  return candidates.some((candidate) => {
    const pattern = new RegExp(`(^|[^A-Za-z0-9._/-])${escapeRegExp(candidate)}(?=$|[^A-Za-z0-9._/-])`);
    return pattern.test(comparison);
  });
}

function sentenceTitle(value) {
  const cleaned = oneLine(value)
    .replace(/^["'`]+|["'`]+$/g, "")
    .replace(/[.!?。！？]+$/g, "");
  if (cleaned.length <= 80) {
    return cleaned || "Untitled intake idea";
  }
  const shortened = cleaned.slice(0, 80);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${(lastSpace > 40 ? shortened.slice(0, lastSpace) : shortened).trim()}...`;
}

function wordTokens(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function overlapScore(a, b) {
  const aTokens = new Set(wordTokens(a));
  const bTokens = new Set(wordTokens(b));
  if (!aTokens.size || !bTokens.size) {
    return 0;
  }
  let overlap = 0;
  for (const token of aTokens) {
    if (bTokens.has(token)) {
      overlap += 1;
    }
  }
  return overlap / aTokens.size;
}

function taskSearchText(task) {
  return [
    task.title,
    task.priority,
    task.section,
    ...task.details
  ].filter(Boolean).join(" ");
}

function intakeTaskMatches(tasks, idea, source = "task-index") {
  const ideaText = normalized(idea);
  return tasks
    .filter((task) => !isDoneTask(task))
    .map((task) => {
      const taskText = taskSearchText(task);
      const taskTitle = normalized(task.title);
      const score = overlapScore(idea, taskText);
      const exact = Boolean(ideaText && (taskTitle.includes(ideaText) || ideaText.includes(taskTitle)));
      return {
        task: taskSummary(task),
        source,
        score: exact ? 1 : score,
        kind: exact ? "duplicate" : score >= 0.35 ? "related" : ""
      };
    })
    .filter((match) => match.kind)
    .sort((a, b) => b.score - a.score || a.task.line - b.task.line)
    .slice(0, 5);
}

function collectMarkdownFiles(cwd, relPath, limit = 80) {
  const root = configuredOptionalPath(cwd, relPath, "Artifact root");
  if (!root || !existsSync(root)) {
    return [];
  }
  const files = [];
  const stack = [root];
  while (stack.length && files.length < limit) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) {
        continue;
      }
      const absPath = join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(absPath);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        files.push(displayPath(cwd, absPath));
      }
    }
  }
  return files.sort();
}

function artifactMatches(cwd, paths, idea) {
  const files = [
    ...collectMarkdownFiles(cwd, paths.specs),
    ...collectMarkdownFiles(cwd, paths.goals)
  ];
  return files
    .map((file) => {
      const fileAbs = assertContainedPath(cwd, resolve(cwd, file), "Artifact match path");
      const content = readFileIfExists(fileAbs);
      const title = goalTitle(content, file);
      const score = Math.max(overlapScore(idea, file), overlapScore(idea, title));
      return {
        path: file,
        title,
        score
      };
    })
    .filter((match) => match.score >= 0.35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

function intakeSignals(idea) {
  const text = String(idea || "").toLowerCase();
  const tokens = wordTokens(idea);
  const asksQuestion = /(\?|？|should we|can we|whether|能不能|是否|要不要)/i.test(idea);
  const broad = /(workflow|architecture|system|migration|bootstrap|policy|mental model|roadmap|体系|流程|架构|迁移|策略|心智模型)/i.test(idea);
  const risky = /(production|credential|paid|destructive|deploy|release|database|prod|凭证|付费|生产|破坏|发布|部署|数据库)/i.test(idea);
  const concrete = /^(add|fix|update|rename|document|write|validate|record|list|inspect|create|支持|新增|修复|更新|记录|验证)/i.test(oneLine(idea));
  return {
    asksQuestion,
    broad,
    risky,
    concrete,
    long: tokens.length > 14 || oneLine(idea).length > 140
  };
}

function classifyIntakeIdea({ idea, taskMatches }) {
  if (taskMatches.some((match) => match.kind === "duplicate")) {
    return "duplicate";
  }
  if (taskMatches.length) {
    return "related";
  }
  const signals = intakeSignals(idea);
  if (signals.asksQuestion || signals.risky) {
    return "ask";
  }
  if (signals.broad || signals.long) {
    return "spec-needed";
  }
  if (signals.concrete) {
    return "goal-ready";
  }
  return "task-candidate";
}

function intakeAcceptance(classification) {
  if (classification === "duplicate" || classification === "related") {
    return "Decide whether to merge this idea with existing work or record a separate task.";
  }
  if (classification === "spec-needed") {
    return "Draft or confirm a spec that defines scope, non-goals, validation, and pause conditions.";
  }
  if (classification === "goal-ready") {
    return "Create a goal from the accepted Goal entry, implement the bounded change, verify it, and sync harness state.";
  }
  if (classification === "ask") {
    return "Clarify product direction, priority, scope, and acceptance before recording or executing.";
  }
  return "Define scope, implement the accepted change, verify it, and update harness state.";
}

function intakeNeedsSpec(classification) {
  return ["spec-needed", "ask"].includes(classification);
}

function intakeRecommendedAction(classification) {
  if (classification === "duplicate" || classification === "related") {
    return "Review related tasks before recording a new task.";
  }
  if (classification === "spec-needed") {
    return "Record as a task candidate, then draft a spec before goal creation.";
  }
  if (classification === "goal-ready") {
    return "Record the task, confirm priority, then create a goal when ready.";
  }
  if (classification === "ask") {
    return "Ask the user to confirm product direction and priority before recording.";
  }
  return "Record as a task candidate after user confirmation.";
}

function intakePayload(args) {
  const cwd = targetCwd(args);
  const idea = oneLine(args.idea);
  if (!idea) {
    throw new Error("Usage: agent-harness intake idea --idea <text> [--cwd PATH] [--priority P1|P2|P3] [--section Now|Next|Later] [--record] [--json]");
  }
  const priority = (args.priority || "P2").toUpperCase();
  if (!validIntakePriorities.has(priority)) {
    throw new Error(`Invalid --priority: ${args.priority}`);
  }
  const section = args.section || "Next";
  if (!validIntakeSections.has(section)) {
    throw new Error(`Invalid --section: ${args.section}`);
  }

  const context = resolveHarnessContext(cwd);
  const taskIndex = context.paths.taskIndex || context.paths.tasks;
  const ideaInbox = context.paths.ideaInbox || "";
  const statusPath = context.paths.status;
  const taskIndexAbs = taskIndex ? configuredPath(cwd, taskIndex, "Task index path") : "";
  const ideaInboxAbs = ideaInbox ? configuredPath(cwd, ideaInbox, "Idea inbox path") : "";
  const statusAbs = statusPath ? configuredPath(cwd, statusPath, "Status path") : "";
  const taskContent = taskIndexAbs && existsSync(taskIndexAbs) ? readFileSync(taskIndexAbs, "utf8") : "";
  const ideaInboxContent = ideaInboxAbs && existsSync(ideaInboxAbs) ? readFileSync(ideaInboxAbs, "utf8") : "";
  const statusContent = statusAbs && existsSync(statusAbs) ? readFileSync(statusAbs, "utf8") : "";
  const tasks = taskContent ? parseTasks(taskContent) : [];
  const inboxTasks = ideaInboxContent ? parseTasks(ideaInboxContent) : [];
  const taskMatches = [
    ...intakeTaskMatches(tasks, idea, "task-index"),
    ...intakeTaskMatches(inboxTasks, idea, "idea-inbox")
  ]
    .sort((a, b) => b.score - a.score || a.task.line - b.task.line)
    .slice(0, 5);
  const artifacts = artifactMatches(cwd, context.paths, idea);
  const classification = classifyIntakeIdea({ idea, taskMatches });
  const needsSpec = intakeNeedsSpec(classification);
  const title = sentenceTitle(idea);
  const recordTarget = ideaInbox ? "idea-inbox" : "task-index";
  const recordPath = ideaInbox || taskIndex;
  const recordContent = ideaInbox ? ideaInboxContent : taskContent;
  const recordTargetLabel = ideaInbox ? "idea inbox" : "task index";
  const confirmationNeeded = args.record
    ? "record flag supplied; no implementation will start"
    : `pass --record to append this candidate to the configured ${recordTargetLabel}`;

  return {
    cwd,
    contract: context.contract,
    writesFiles: false,
    idea,
    taskIndex,
    ideaInbox,
    status: {
      path: statusPath,
      focus: statusFocus(statusContent)
    },
    suggested: {
      classification,
      title,
      priority,
      section,
      why: `Intake candidate from user idea: ${idea}`,
      acceptance: intakeAcceptance(classification),
      needsSpec,
      dependencies: [
        ...taskMatches.map((match) => `${match.source === "idea-inbox" ? "Related inbox candidate" : "Related task"}: ${match.task.title}`),
        ...artifacts.map((match) => `Related artifact: ${match.path}`)
      ],
      risks: needsSpec
        ? ["Scope or product direction may be ambiguous."]
        : [`Confirm this belongs in the configured ${recordTargetLabel} before recording.`],
      validationQuestions: [
        `Is ${priority} the right priority?`,
        `Should this be recorded under ${section}?`,
        needsSpec ? "What are the non-goals and validation commands for the spec?" : "What is the smallest deterministic verification?",
        taskMatches.length ? "Should this merge with an existing task instead of creating a new one?" : ""
      ].filter(Boolean),
      recommendedNextAction: intakeRecommendedAction(classification),
      confirmationNeeded
    },
    related: {
      tasks: taskMatches,
      artifacts
    },
    record: {
      requested: Boolean(args.record),
      supported: Boolean(recordContent && !isTableTaskIndex(recordContent)),
      target: recordTarget,
      path: recordPath,
      section
    },
    warnings: context.warnings
  };
}

function isTableTaskIndex(content) {
  return /^\|\s*(?:Task|Goal)\s*\|/im.test(content);
}

function intakeTaskEntry(payload) {
  const item = payload.suggested;
  return `- [ ] ${item.priority} ${item.title}
  - Source: Intake idea: ${payload.idea}
  - Acceptance: ${item.acceptance}
  - Notes: Classification=${item.classification}; Needs spec=${item.needsSpec ? "yes" : "no"}; Confirmation=${item.confirmationNeeded}
`;
}

function appendTaskToSection(content, section, entry) {
  const sectionPattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "m");
  const match = content.match(sectionPattern);
  if (!match || match.index === undefined) {
    return `${content.trimEnd()}\n\n## ${section}\n\n${entry}`;
  }
  const start = match.index + match[0].length;
  const rest = content.slice(start);
  const nextSection = rest.search(/^##\s+/m);
  const insertAt = nextSection === -1 ? content.length : start + nextSection;
  const before = content.slice(0, insertAt).trimEnd();
  const after = content.slice(insertAt).replace(/^\n+/, "");
  return `${before}\n\n${entry}${after ? `\n${after}` : ""}`;
}

function recordIntake(payload) {
  const recordPath = payload.record.path;
  const recordLabel = payload.record.target === "idea-inbox" ? "Idea inbox path" : "Task index path";
  const recordAbs = configuredPath(payload.cwd, recordPath, recordLabel);
  if (!existsSync(recordAbs)) {
    throw new Error(`${recordLabel} not found: ${recordPath}`);
  }
  const content = readFileSync(recordAbs, "utf8");
  if (isTableTaskIndex(content)) {
    const kind = payload.record.target === "idea-inbox" ? "idea inbox" : "task index";
    throw new Error(`Refusing to record into table-based ${kind}: ${recordPath}`);
  }
  const nextContent = appendTaskToSection(content, payload.suggested.section, intakeTaskEntry(payload));
  writeFileSync(recordAbs, nextContent);
  payload.writesFiles = true;
  payload.record.written = true;
  payload.record.entry = intakeTaskEntry(payload).trimEnd();
}

function intakeIdea(args) {
  const payload = intakePayload(args);
  if (args.record) {
    recordIntake(payload);
  }

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log("Agent Harness intake");
  console.log(`Task index: ${payload.taskIndex || "not configured"}`);
  if (payload.ideaInbox) {
    console.log(`Idea inbox: ${payload.ideaInbox}`);
  }
  console.log(`Writes files: ${payload.writesFiles ? "yes" : "no"}`);
  console.log("");
  console.log("Suggested classification:");
  console.log(`- ${payload.suggested.classification}`);
  console.log("Suggested task title:");
  console.log(`- ${payload.suggested.title}`);
  console.log("Priority / section:");
  console.log(`- ${payload.suggested.priority} / ${payload.suggested.section}`);
  console.log("Acceptance:");
  console.log(`- ${payload.suggested.acceptance}`);
  console.log("Needs spec:");
  console.log(`- ${payload.suggested.needsSpec ? "yes" : "no"}`);
  console.log("Recommended next action:");
  console.log(`- ${payload.suggested.recommendedNextAction}`);
  console.log("Confirmation needed:");
  console.log(`- ${payload.suggested.confirmationNeeded}`);
  if (payload.related.tasks.length) {
    console.log("Related tasks:");
    console.log(payload.related.tasks.map((match) => `- ${match.task.summary}`).join("\n"));
  }
}

function stripTaskPriority(value) {
  return String(value || "").replace(/^P\d+\s+/i, "").trim();
}

function normalizedTaskTitle(value) {
  return normalized(stripTaskPriority(value).replace(/[.!?]+$/g, ""));
}

function goalSourceTask(content) {
  const sourceTask = extractSection(content, "Source Task");
  const match = sourceTask.match(/`([^`]+)`:\s+`([^`]+)`/);
  if (!match) {
    return {
      path: "",
      title: ""
    };
  }
  return {
    path: match[1],
    title: stripTaskPriority(match[2])
  };
}

function replaceMarkdownSection(content, title, body) {
  const sectionHeading = `## ${title}`;
  const sourceLines = String(content || "").split(/\r?\n/);
  const start = sourceLines.findIndex((line) => line.trim() === sectionHeading);
  const nextSectionIndex = (from) => {
    for (let index = from + 1; index < sourceLines.length; index += 1) {
      if (/^##\s+/.test(sourceLines[index])) {
        return index;
      }
    }
    return sourceLines.length;
  };

  if (start === -1) {
    return `${String(content || "").trimEnd()}\n\n${sectionHeading}\n\n${body.trimEnd()}\n`;
  }

  const end = nextSectionIndex(start);
  const before = sourceLines.slice(0, start).join("\n").trimEnd();
  const after = sourceLines.slice(end).join("\n").replace(/^\n+/, "");
  return `${before ? `${before}\n\n` : ""}${sectionHeading}\n\n${body.trimEnd()}${after ? `\n\n${after.trimStart()}` : "\n"}`;
}

function taskBlockRange(linesValue, task) {
  const start = task.line - 1;
  let end = start + 1;
  while (end < linesValue.length) {
    const line = linesValue[end];
    if (/^##\s+/.test(line) || /^- \[( |x|X)\]\s+/.test(line)) {
      break;
    }
    end += 1;
  }
  return { start, end };
}

function todayStamp(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
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
  let section = "";

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const sectionMatch = line.match(/^##\s+(.+?)\s*$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      current = null;
    }

    const match = line.match(/^- \[( |x|X)\]\s+(?:(P\d+)\s+)?(.+?)\s*$/);
    if (match) {
      current = {
        done: match[1].toLowerCase() === "x",
        priority: match[2] || "",
        title: match[3],
        section,
        line: index + 1,
        details: []
      };
      tasks.push(current);
    } else if (current && line.startsWith("  - ")) {
      current.details.push(line.slice(4));
    } else if (line.startsWith("#") || line.trim() === "") {
      current = null;
    }

    if (!match && line.trim().startsWith("|")) {
      const cells = line
        .trim()
        .replace(/^\||\|$/g, "")
        .split("|")
        .map((cell) => cell.trim());
      const isSeparator = cells.every((cell) => /^:?-+:?$/.test(cell));
      const isHeader = ["task", "goal"].includes(cells[0]?.toLowerCase());
      if (cells.length >= 4 && !isSeparator && !isHeader) {
        const [title, type, status, priority, doc] = cells;
        if (title) {
          current = {
            done: ["done", "cancelled", "closed"].includes(status.toLowerCase()),
            priority,
            title,
            section,
            line: index + 1,
            details: [
              `Type: ${type}`,
              `Status: ${status}`,
              doc ? `Doc: ${doc}` : ""
            ].filter(Boolean)
          };
          tasks.push(current);
        }
      }
    }
  }

  return tasks;
}

function normalized(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function findTask(tasks, query, taskIndexPath = "harness/tasks.md") {
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

  throw new Error(`Task not found in ${taskIndexPath}: ${query}`);
}

function detailValue(task, key) {
  const lowerKey = `${key.toLowerCase()}:`;
  const detail = task.details.find((line) => line.toLowerCase().startsWith(lowerKey));
  return detail ? detail.slice(lowerKey.length).trim() : "";
}

function uniqueList(values) {
  const seen = new Set();
  const result = [];
  for (const value of values) {
    const item = String(value || "").trim();
    if (!item || seen.has(item)) {
      continue;
    }
    seen.add(item);
    result.push(item);
  }
  return result;
}

function cleanLinkedTarget(value) {
  let target = String(value || "").trim();
  if (!target) {
    return "";
  }
  if (target.startsWith("<") && target.endsWith(">")) {
    target = target.slice(1, -1).trim();
  }
  if (target.startsWith("`") && target.endsWith("`")) {
    target = target.slice(1, -1).trim();
  }
  const titleMatch = target.match(/^(\S+)\s+["'][^"']+["']$/);
  return titleMatch ? titleMatch[1] : target;
}

function looksLikeProjectDoc(value) {
  const target = cleanLinkedTarget(value);
  if (!target || target === "-" || /^https?:\/\//i.test(target) || target.startsWith("#")) {
    return false;
  }
  return target.includes("/") || /\.(md|mdx|txt|html|json|ya?ml|vue|tsx?|jsx?)($|#)/i.test(target);
}

function extractLinkedDocPaths(value) {
  if (!value) {
    return [];
  }

  const paths = [];
  let remainder = String(value);
  const markdownLinkPattern = /\[[^\]]+\]\(([^)]+)\)/g;
  for (const match of remainder.matchAll(markdownLinkPattern)) {
    const target = cleanLinkedTarget(match[1]);
    if (looksLikeProjectDoc(target)) {
      paths.push(target);
    }
  }
  remainder = remainder.replace(markdownLinkPattern, " ");

  const inlineCodePattern = /`([^`]+)`/g;
  for (const match of remainder.matchAll(inlineCodePattern)) {
    const target = cleanLinkedTarget(match[1]);
    if (looksLikeProjectDoc(target)) {
      paths.push(target);
    }
  }
  remainder = remainder.replace(inlineCodePattern, " ");

  for (const part of remainder.split(/\s+\/\s+|[,;]\s*/)) {
    const target = cleanLinkedTarget(part);
    if (looksLikeProjectDoc(target)) {
      paths.push(target);
    }
  }

  return uniqueList(paths);
}

function stringList(value) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(/\r?\n/)
      .map((item) => item.replace(/^-+\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
}

function adapterRequirementLists(context) {
  const adapter = context.config.adapter || {};
  const project = context.config.project || {};
  return {
    preflight: uniqueList([
      ...stringList(adapter.preflight),
      ...stringList(project.preflight)
    ]),
    stateSync: uniqueList([
      ...stringList(adapter.stateSync),
      ...stringList(project.stateSync)
    ])
  };
}

function durableRequiredCompletionGates(context) {
  const gates = context.config.gates || {};
  const canonical = stringList(gates.requiredForCompletion);
  const legacy = stringList(gates.enabled);
  if (canonical.length && legacy.length
      && JSON.stringify([...canonical].sort()) !== JSON.stringify([...legacy].sort())) {
    throw new Error("Conflicting config aliases: gates.requiredForCompletion and legacy gates.enabled.");
  }
  return uniqueList([
    ...(canonical.length ? canonical : legacy),
    ...stringList(gates.blocking)
  ]);
}

function formatBulletList(values) {
  return values.map((value) => `- ${value}`).join("\n");
}

function formatInlinePathList(values) {
  return values.map((value) => `\`${value}\``).join(", ");
}

function existingReadPath(context, relPath) {
  return pathExists(context.cwd, relPath) ? relPath : "";
}

function stateSyncPaths(context) {
  return uniqueList([
    context.paths.taskIndex || context.paths.tasks || "",
    existingReadPath(context, context.paths.status)
  ]);
}

function generatedStageCompletionMapSection({ task, context, spec }) {
  const specAbs = resolveProjectPath(context.cwd, spec);
  const specContent = specAbs && isInsideProject(context.cwd, specAbs) && existsSync(specAbs)
    ? readFileSync(specAbs, "utf8")
    : "";
  const requiredLabels = stageCompletionRequiredLabels("", specContent);
  const signalContent = `# ${task.title}

## Source Task

- ${task.title}

## Scope

- ${detailValue(task, "Acceptance") || ""}
`;
  if (!stageCompletionMapRequired(signalContent, specContent, requiredLabels)) {
    return "";
  }

  const items = requiredLabels.map((label) => `- Item: \`${label}\`
  - Acceptance: \`Complete and verify ${label}.\`
  - Evidence: \`TBD\`
  - Status: \`pending\`
  - Unblocker: \`N/A\``).join("\n");

  return `## Milestone Completion Map

${items}

`;
}

function buildGoalContent({ task, context, specPath, workMode, planPath = "", allowNoSpec = false }) {
  const heading = titleCase(task.title);
  const paths = context.paths;
  const taskIndexPath = paths.taskIndex || paths.tasks;
  const statusPath = paths.status;
  const source = detailValue(task, "Source") || taskIndexPath;
  const acceptance = detailValue(task, "Acceptance") || "Define concrete acceptance before implementation.";
  const notes = detailValue(task, "Notes");
  const spec = specPath || detailValue(task, "Spec") || "TBD";
  const hasConfirmedSpec = !missingSpecValue(spec);
  const specPolicyLine = !hasConfirmedSpec && allowNoSpec ? "Spec Policy: allow-no-spec\n" : "";
  const statusLine = hasConfirmedSpec || allowNoSpec
    ? "active."
    : "blocked pending an accepted spec.";
  const docValue = detailValue(task, "Doc");
  const linkedDocs = extractLinkedDocPaths(docValue);
  const selectedWorkMode = workMode || "ask";
  const stateSyncPathList = stateSyncPaths(context);
  const readFirst = uniqueList([
    "AGENTS.md",
    taskIndexPath,
    context.mode === "adapter" ? paths.adapterDocs : "",
    existingReadPath(context, paths.config),
    existingReadPath(context, statusPath),
    hasConfirmedSpec ? spec : "",
    ...linkedDocs
  ]);

  const adapterRequirements = adapterRequirementLists(context);
  const requiredGates = durableRequiredCompletionGates(context);
  const defaultAdapterRequirements = context.mode === "adapter"
    ? [
      `Read \`${paths.adapterDocs}\` for project-specific hard boundaries, validation rules, preflight requirements, and state-sync requirements.`,
      "If a linked Doc is a goal prompt, read the spec and context documents referenced by that goal before editing.",
      "Agent Harness plugin references: adapter-harness, task-routing, and work-mode-policy."
    ]
    : [];
  const projectAdapterRequirementList = [
    ...defaultAdapterRequirements,
    ...adapterRequirements.preflight.map((item) => `Preflight: ${item}`),
    ...adapterRequirements.stateSync.map((item) => `State sync: ${item}`)
  ];

  const readFirstList = readFirst
    .filter(Boolean)
    .map((path, index) => `${index + 1}. \`${path}\``)
    .join("\n");
  const requiredGateLines = requiredGates.length
    ? requiredGates.map((gate) => `- Gate: \`${gate}\`
  - Required: \`yes\`
  - Evidence: \`TBD\`
  - Status: \`pending\`
  - Unblocker: \`N/A\``).join("\n")
    : "Add one `Gate` item for each adapter-required completion gate. Technical\nverification is necessary but does not replace gate evidence.";
  const stageCompletionMapSection = hasConfirmedSpec
    ? generatedStageCompletionMapSection({ task, context, spec })
    : "";

  return `# Goal: ${heading}

Spec: ${spec}
${planPath ? `Execution Plan: ${planPath}\n` : ""}${specPolicyLine}
Status: ${statusLine}

## Source Task

- \`${taskIndexPath}\`: \`${task.priority ? `${task.priority} ` : ""}${task.title}\`

## Read First

${readFirstList}

## Work Mode Recommendation

Use \`${selectedWorkMode}\` until the goal has ${hasConfirmedSpec ? "a confirmed spec" : "accepted scope"} and clear file ownership.

## Execution Role

Use \`implementer\`.

- \`gate-only\`: the current thread reviews candidate output and verification evidence, but does not directly edit implementation files.
- \`implementer\`: the current thread may edit files inside the accepted scope.
- Controller means outcome owner and accepted-state owner. Use \`gate-only\` only when review-only behavior is explicit; otherwise a controller may implement foreground work.
- Ordinary clear change/build requests use the current host directly. This durable Goal uses only \`gate-only\` or \`implementer\` roles.
- ${boundedDirectExecutionGuidance} Once this durable Goal exists, do not downgrade its checklist, gate, or state-sync obligations to the bounded tier.

## Host Execution

- ${hostExecutionGuidance}
- Runtime outcome owns the current outcome and continuation; transient plan owns short-lived steps.
- The host owns scheduling, concurrency, cancellation, and model/effort selection when those capabilities are exposed.
- The Goal owns accepted scope, dependencies, concise verification and state sync.
- If native outcome or plan is unavailable, continue in the current session. Never invent runtime identifiers.

## Conversation Route

Use \`current-session\`.

- \`current-session\`: the current conversation owns execution in the locked cwd.
- \`delegated-worker\`: hand off to a dedicated worker session before editing.
- \`isolated-worktree\`: the current conversation may control a different locked worktree only when explicitly approved.

## Execution Context Lock

- Conversation lane: \`current-session\`
- Controller thread: \`current-session\`
- Execution cwd: \`${context.cwd}\`
- Execution branch: \`TBD\`
- Execution slot: \`N/A\`
- Remote-control worktree: \`no\`

## Execution

Work in the host session. Record verified outcomes, not execution history.

## Context Focus Routing

${contextFocusRoutingGuidance} ${executeContextFocusGuidance}

## Cybernetic Stability

${cyberneticStabilityGuidance}

${stageCompletionMapSection}
## State Sync Notes

Record accepted-state updates, concise verification and bounded status
synchronization before marking this Goal completed.

- Accepted-state records: \`TBD\`
- Verification: \`TBD\`
- Bounded status update: \`TBD\`

## Spec Acceptance Checklist

Add checklist items here when the referenced spec has concrete acceptance
criteria, required page/workflow coverage, or product-quality gates. Candidate
implementation evidence is not accepted completion until relevant checklist
items are satisfied.

## Required Gate Evidence

These gates apply only to Goal completion. ${postflightSyncGuidance}

${requiredGateLines}

## Scope

- ${acceptance}

## Non-Goals

- Do not launch workers or perform external side effects outside the accepted scope unless separately requested.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Delivery Contract

- Delivered outcome: \`${acceptance}\`
- Global hard constraints: preserve the accepted Scope, Non-Goals, adapter boundaries, and explicit compatibility requirements; add task-specific non-breakage constraints before planning.
- Whole-target verification: run the smallest checks that prove both the complete result and its hard constraints; node checks alone are insufficient when an integration check is needed.
- Delivery authority: no commit, push, release, deploy, publish, reply, or other external side effect unless the accepted scope explicitly authorizes it.
- Final report: delivered result, key changes, whole-target and constraint verification, actual delivery state, \`Need user\`, and \`Remaining\`.

## Context

- Source: ${source || "Not recorded."}
${docValue ? `- Task Doc: ${docValue}\n` : ""}${linkedDocs.length ? `- Linked Doc Paths: ${formatInlinePathList(linkedDocs)}\n` : ""}
${notes ? `- Notes: ${notes}\n` : ""}${projectAdapterRequirementList.length ? `\n## Project Adapter Requirements\n\n${formatBulletList(projectAdapterRequirementList)}\n\n` : ""}
## Verification

Run the smallest relevant deterministic checks for the files changed by this goal.
If no deterministic command exists, document the manual verification evidence before completion.

## Completion Conditions

- The source Goal/work item acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- State-sync evidence or State Sync Notes are produced as part of Goal/Task Done.
- Status-file updates use a bounded current-state snapshot; replace status
  sections instead of appending historical focus logs.
- Update configured state records (${formatInlinePathList(stateSyncPathList)}) when the project adapter requires state sync.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The measurement snapshot cannot identify a reliable observed state, feedback quality is insufficient for completion, or the remaining gap is not shrinking.
- The work requires credentials, paid APIs, production access, destructive commands, release, or another external side effect outside accepted scope.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
`;
}

function goalCreate(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  const paths = context.paths;
  const taskQuery = args.task;
  if (!taskQuery) {
    throw new Error("Usage: agent-harness goal create --task <title-or-id> [--cwd PATH] [--spec PATH] [--allow-no-spec] [--work-mode local|worktree|ask] [--dry-run]");
  }
  if (args.workMode && !validWorkModes.has(args.workMode)) {
    throw new Error(`Invalid --work-mode: ${args.workMode}`);
  }
  if (args.plan) {
    configuredPath(cwd, args.plan, "Execution plan");
  }
  if (context.mode === "adapter" && !args.spec && !args.allowNoSpec) {
    throw new Error("Adapter goal creation requires --spec <spec-path> unless --allow-no-spec is explicitly set.");
  }

  const taskIndexRelPath = paths.taskIndex || paths.tasks;
  const tasksPath = configuredPath(cwd, taskIndexRelPath, "Task index path");
  if (!existsSync(tasksPath)) {
    throw new Error(`Missing ${taskIndexRelPath}`);
  }
  if (args.spec) {
    const specRoot = configuredPath(cwd, paths.specs || dirname(args.spec), "Specs root");
    const specPath = assertContainedPath(specRoot, resolve(cwd, args.spec), "Spec path");
    if (!existsSync(specPath)) throw new Error(`Spec file not found: ${args.spec}`);
  }

  const task = findTask(parseTasks(readFileSync(tasksPath, "utf8")), taskQuery, taskIndexRelPath);
  const slug = slugify(task.title);
  const goalRelPath = join(paths.goals, `${todayStamp()}-${slug}.md`);
  const goalRoot = configuredPath(cwd, paths.goals, "Goals root");
  const goalPath = assertContainedPath(goalRoot, resolve(cwd, goalRelPath), "Goal path");
  const content = buildGoalContent({
    task,
    context,
    specPath: args.spec,
    planPath: args.plan || "",
    workMode: args.workMode,
    allowNoSpec: Boolean(args.allowNoSpec)
  });

  if (args.dryRun) {
    if (args.json) { console.log(JSON.stringify({ goal: goalRelPath, dryRun: true, content }, null, 2)); return; }
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
  if (args.json) console.log(JSON.stringify({ goal: goalRelPath, dryRun: false }, null, 2));
  else console.log(`Created ${goalRelPath}`);
}

function goalTitle(content, goalPath) {
  const match = content.match(/^#\s+(.+?)\s*$/m);
  return match ? match[1].trim().replace(/^Goal:\s*/i, "") : basename(goalPath, extname(goalPath));
}

function extractStatusLine(content) {
  const match = content.match(/^Status:\s+(.+?)\s*$/m);
  return match ? match[1].trim() : "";
}

function canonicalGoalStatus(value) {
  return String(value || "")
    .trim()
    .replace(/^[`"']+|[`"']+$/g, "")
    .replace(/[.!?。！？]+$/g, "")
    .trim()
    .toLowerCase();
}

function extractSpecPolicyRaw(content) {
  const match = content.match(/^Spec Policy:\s+`?([^\n`]+)`?\s*$/m);
  return match ? match[1].trim().toLowerCase() : "";
}

function missingSpecValue(value) {
  return !value || /^(tbd|n\/a|none|not specified)$/i.test(cleanMapValue(value));
}

function resolveProjectPath(cwd, relPath) {
  const cleaned = cleanLinkedTarget(relPath);
  return cleaned ? assertContainedPath(cwd, resolve(cwd, cleaned), "Project reference") : "";
}

function isInsideProject(cwd, absPath) {
  const rel = relative(cwd, absPath);
  return rel === "" || Boolean(rel && !rel.startsWith("..") && !rel.startsWith("/"));
}

function readFileIfExists(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

function specStatus(content) {
  return extractStatusLine(content);
}

function isDraftStatus(status) {
  const normalizedStatus = String(status || "").trim().toLowerCase();
  if (!normalizedStatus) {
    return true;
  }
  return [
    "draft",
    "draft goal handoff",
    "spec-draft",
    "tbd",
    "todo",
    "proposed",
    "in progress",
    "wip"
  ].some((value) => normalizedStatus === value || normalizedStatus.includes(value));
}

function extractGoalWorkModeRaw(goalContent) {
  const section = extractSection(goalContent, "Work Mode Recommendation");
  const match = section.match(/Use\s+`([^`]+)`/i);
  return match ? match[1].trim() : "";
}

function extractGoalExecutionRoleRaw(goalContent) {
  const section = extractSection(goalContent, "Execution Role");
  const match = section.match(/Use\s+`([^`]+)`/i);
  return match ? match[1].trim().toLowerCase() : "";
}

function extractConversationRouteRaw(goalContent) {
  const section = extractSection(goalContent, "Conversation Route");
  const match = section.match(/Use\s+`([^`]+)`/i);
  return match ? match[1].trim().toLowerCase() : "";
}

function normalizeConversationRoute(value) {
  return conversationRouteAliases[String(value || "").trim().toLowerCase()] || "";
}

function extractHostExecutionSection(content) {
  return extractSection(content, "Host Execution") || extractSection(content, "Codex-Native Execution");
}

function parseExecutionContextLock(section) {
  const fields = {};
  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^-\s+([^:]+):\s*(.*?)\s*$/);
    if (match) {
      fields[match[1].trim().toLowerCase()] = cleanMapValue(match[2]);
    }
  }
  return {
    conversationLane: fields["conversation lane"] || "",
    controllerThread: fields["controller thread"] || "",
    executionCwd: fields["execution cwd"] || "",
    executionBranch: fields["execution branch"] || "",
    executionSlot: fields["execution slot"] || "",
    remoteControlWorktree: fields["remote-control worktree"] || ""
  };
}

function executionContextLockDetails(goalContent) {
  const section = extractSection(goalContent, "Execution Context Lock");
  return {
    section,
    ...parseExecutionContextLock(section)
  };
}

function cleanMapValue(value) {
  const trimmed = String(value || "").trim();
  if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function parseSourceTaskAcceptanceMap(section) {
  const items = [];
  let current = null;
  let currentField = "";
  for (const line of section.split(/\r?\n/)) {
    const taskMatch = line.match(/^-\s+Task:\s*(.+?)\s*$/);
    if (taskMatch) {
      current = {
        task: cleanMapValue(taskMatch[1]),
        acceptance: "",
        evidence: "",
        status: "",
        unblocker: ""
      };
      items.push(current);
      currentField = "";
      continue;
    }

    if (!current) {
      continue;
    }

    const fieldMatch = line.match(/^\s+-\s+(Acceptance|Evidence|Status|Unblocker):\s*(.*?)\s*$/i);
    if (fieldMatch) {
      currentField = fieldMatch[1].toLowerCase();
      current[currentField] = cleanMapValue(fieldMatch[2]);
      continue;
    }

    const continuation = line.match(/^\s{4,}(\S.*?)\s*$/);
    if (currentField && continuation) {
      current[currentField] = cleanMapValue(`${current[currentField]} ${continuation[1]}`);
    }
  }
  return items;
}

function parseEvidenceItems(section, itemLabel) {
  const items = [];
  let current = null;
  let currentField = "";
  const escapedLabel = escapeRegExp(itemLabel);
  const itemPattern = new RegExp(`^-\\s+${escapedLabel}:\\s*(.+?)\\s*$`, "i");
  const fieldPattern = /^\s+-\s+(Acceptance|Required|Evidence|Status|Unblocker):\s*(.*?)\s*$/i;

  for (const line of section.split(/\r?\n/)) {
    const itemMatch = line.match(itemPattern);
    if (itemMatch) {
      current = {
        label: cleanMapValue(itemMatch[1]),
        acceptance: "",
        required: "",
        evidence: "",
        status: "",
        unblocker: ""
      };
      items.push(current);
      currentField = "";
      continue;
    }

    if (!current) {
      continue;
    }

    const fieldMatch = line.match(fieldPattern);
    if (fieldMatch) {
      currentField = fieldMatch[1].toLowerCase();
      current[currentField] = cleanMapValue(fieldMatch[2]);
      continue;
    }

    const continuation = line.match(/^\s{4,}(\S.*?)\s*$/);
    if (currentField && continuation) {
      current[currentField] = cleanMapValue(`${current[currentField]} ${continuation[1]}`);
    }
  }

  return items;
}

function specAcceptanceChecklistDetails(goalContent, specContent = "") {
  const goalSection = extractSection(goalContent, "Spec Acceptance Checklist");
  const specSection = extractSection(specContent, "Spec Acceptance Checklist");
  const section = goalSection || specSection;
  return {
    source: goalSection ? "goal" : specSection ? "spec" : "",
    section,
    items: section ? parseEvidenceItems(section, "Item") : []
  };
}

function gateEvidenceDetails(goalContent, specContent = "") {
  const goalSection = extractSection(goalContent, "Required Gate Evidence");
  const specSection = extractSection(specContent, "Required Gate Evidence");
  const section = goalSection || specSection;
  return {
    source: goalSection ? "goal" : specSection ? "spec" : "",
    section,
    items: section ? parseEvidenceItems(section, "Gate") : []
  };
}

function implementationPhasingSection(content) {
  return extractSection(content, "Implementation Phasing");
}

function implementationStageLabels(content) {
  const section = implementationPhasingSection(content);
  if (!section) {
    return [];
  }

  const labels = [];
  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^#{3,6}\s+(.+?)\s*$/);
    if (!match) {
      continue;
    }
    const label = cleanMapValue(match[1]);
    if (/\b[A-Z][A-Za-z0-9]*\d+-(?:S|D)\d+\b/.test(label)) {
      labels.push(label);
    }
  }

  return uniqueList(labels);
}

function stageShortLabel(label) {
  const match = String(label || "").match(/\b([A-Z][A-Za-z0-9]*\d+-(?:S|D)\d+)\b/);
  return match ? match[1] : "";
}

function stagePrefixFromLabels(labels) {
  for (const label of labels) {
    const short = stageShortLabel(label);
    const match = short.match(/^([A-Z][A-Za-z0-9]*\d+)-/);
    if (match) {
      return match[1];
    }
  }
  return "";
}

function stageCompletionSignalText(content) {
  return [
    goalTitle(content, ""),
    extractStatusLine(content),
    extractSection(content, "Source Task"),
    extractSection(content, "Goal"),
    extractSection(content, "Scope"),
    extractSection(content, "Completion Conditions")
  ].join("\n");
}

function hasWholeStageSignal(content) {
  const text = stageCompletionSignalText(content);
  return /\b(?:whole|entire|full)\s+(?:milestone|stage)\b/i.test(text)
    || /\b(?:complete|finish|推进完成|完成)\b[\s\S]{0,80}\b(?:M\d+|milestone\s+M\d+|stage\s+M\d+|roadmap\s+M\d+)\b/i.test(text)
    || /\b(?:M\d+|milestone\s+M\d+|stage\s+M\d+|roadmap\s+M\d+)\b[\s\S]{0,80}\b(?:complete|done|completion|完成)\b/i.test(text);
}

function stageCompletionRequiredLabels(goalContent, specContent = "") {
  return uniqueList([
    ...implementationStageLabels(goalContent),
    ...implementationStageLabels(specContent)
  ]);
}

function stageCompletionMapRequired(goalContent, specContent, requiredLabels) {
  if (hasWholeStageSignal(goalContent) || hasWholeStageSignal(specContent)) {
    return true;
  }

  if (requiredLabels.length < 2) {
    return false;
  }

  const prefix = stagePrefixFromLabels(requiredLabels);
  if (!prefix) {
    return false;
  }

  const goalText = stageCompletionSignalText(goalContent);
  const referencesPrefix = new RegExp(`\\b${escapeRegExp(prefix)}\\b`, "i").test(goalText);
  const referencesLeaf = requiredLabels
    .map(stageShortLabel)
    .filter(Boolean)
    .some((label) => new RegExp(`\\b${escapeRegExp(label)}\\b`, "i").test(goalText));

  return referencesPrefix && !referencesLeaf;
}

function stageCompletionMapDetails(goalContent, specContent = "") {
  const goalMilestoneSection = extractSection(goalContent, "Milestone Completion Map");
  const specMilestoneSection = extractSection(specContent, "Milestone Completion Map");
  const goalLegacyStageSection = extractSection(goalContent, "Stage Completion Map");
  const specLegacyStageSection = extractSection(specContent, "Stage Completion Map");
  const section = goalMilestoneSection || specMilestoneSection || goalLegacyStageSection || specLegacyStageSection;
  const plannedTarget = Boolean(extractInlinePath(goalContent, "Execution Plan"));
  const requiredLabels = plannedTarget
    ? parseEvidenceItems(section, "Item").map(item => item.label)
    : stageCompletionRequiredLabels(goalContent, specContent);
  return {
    required: plannedTarget ? Boolean(section) : stageCompletionMapRequired(goalContent, specContent, requiredLabels),
    requiredLabels,
    source: goalMilestoneSection
      ? "goal"
      : specMilestoneSection
        ? "spec"
        : goalLegacyStageSection
          ? "goal-legacy-stage"
          : specLegacyStageSection
            ? "spec-legacy-stage"
            : "",
    section,
    items: section ? parseEvidenceItems(section, "Item") : []
  };
}

function normalizedGateName(value) {
  return String(value || "").trim().toLowerCase();
}

function truthyGateRequired(value) {
  return /^(yes|true|required|blocking|1)$/i.test(String(value || "").trim());
}

function evidenceItemValidationErrors(details, {
  sectionTitle,
  itemTitle,
  requireAcceptance = false,
  requiredLabels = [],
  requiredMissingLabel = "required gate",
  completed = false
} = {}) {
  const errors = [];
  const requiredSet = new Set(requiredLabels.map(normalizedGateName).filter(Boolean));
  const itemsByLabel = new Map();

  details.items.forEach((item, index) => {
    const label = item.label || `item ${index + 1}`;
    const normalized = normalizedGateName(item.label);
    if (normalized) {
      itemsByLabel.set(normalized, item);
    }
    if (!item.label) {
      errors.push(`${sectionTitle} ${itemTitle} ${index + 1} is missing ${itemTitle}.`);
    }
    if (requireAcceptance && !item.acceptance) {
      errors.push(`${sectionTitle} ${itemTitle} '${label}' is missing Acceptance.`);
    }
    if (!validEvidenceItemStatuses.has(item.status)) {
      errors.push(`${sectionTitle} ${itemTitle} '${label}' must use Status pending, satisfied, deferred, or blocked; found ${item.status || "(missing)"}.`);
    }
    if ((item.status === "deferred" || item.status === "blocked") && missingEvidence(item.unblocker)) {
      errors.push(`${sectionTitle} ${itemTitle} '${label}' is ${item.status} but missing Unblocker.`);
    }
    const itemRequired = truthyGateRequired(item.required) || requiredSet.has(normalized);
    if (completed && itemRequired && item.status !== "satisfied") {
      errors.push(`Completed runs require ${sectionTitle} ${itemTitle} '${label}' to be satisfied; found ${item.status || "(missing)"}.`);
    }
    if (completed && itemRequired && missingEvidence(item.evidence)) {
      errors.push(`Completed runs require concrete Evidence for ${sectionTitle} ${itemTitle} '${label}'.`);
    }
  });

  for (const requiredLabel of requiredLabels) {
    const normalized = normalizedGateName(requiredLabel);
    if (normalized && !itemsByLabel.has(normalized)) {
      errors.push(`${sectionTitle} must include ${requiredMissingLabel} '${requiredLabel}'.`);
    }
  }

  return errors;
}

function missingEvidence(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return true;
  const normalizedValue = raw
    .replace(/^[`"'\s]+|[`"'\s]+$/g, "")
    .replace(/[.!?,;:。！？、]+$/g, "")
    .trim()
    .toLowerCase();
  if (!normalizedValue || !/[a-z0-9\u4e00-\u9fff]/i.test(normalizedValue)) return true;
  return placeholderEvidenceValues.has(normalizedValue);
}

function stateSyncNotesDetails(content) {
  const section = extractSection(content, "State Sync Notes");
  return {
    section,
    text: oneLine(section)
  };
}

function stateSyncNotesValidationErrors(details, { completed = false } = {}) {
  const errors = [];
  if (!details.section) {
    errors.push("Goal must include a State Sync Notes section.");
    return errors;
  }
  if (!completed) return errors;

  const hasPlaceholderLine = details.section
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s*/, "").trim())
    .filter(Boolean)
    .some((line) => missingEvidence(line) || /:\s*`?(?:tbd|n\/a|none|not recorded|pending)`?\s*\.?$/i.test(line));
  if (missingEvidence(details.text)) {
    errors.push("Completed runs require concrete State Sync Notes.");
  } else if (hasPlaceholderLine || /`(?:tbd|n\/a|none|not recorded|pending)`/i.test(details.text)) {
    errors.push("Completed runs require concrete State Sync Notes instead of placeholders.");
  }
  return errors;
}

function yesNoValue(value) {
  const normalizedValue = String(value || "").trim().toLowerCase();
  if (["yes", "true", "1"].includes(normalizedValue)) {
    return "yes";
  }
  if (["no", "false", "0"].includes(normalizedValue)) {
    return "no";
  }
  return "";
}

function executionContextValidationErrors({ workMode, conversationRoute, executionContextLock }) {
  const errors = [];
  if (workMode !== "worktree") {
    return errors;
  }

  const canonicalRoute = normalizeConversationRoute(conversationRoute);
  if (!conversationRoute) {
    errors.push("Worktree goals require a Conversation Route section.");
  } else if (!canonicalRoute) {
    errors.push(`Conversation Route must use one of current-session, delegated-worker, or isolated-worktree (legacy aliases current-thread, slot-thread, remote-control-worktree remain readable); found ${conversationRoute}.`);
  }

  if (!executionContextLock.section) {
    errors.push("Worktree goals require an Execution Context Lock section.");
    return errors;
  }

  const requiredFields = [
    ["Conversation lane", executionContextLock.conversationLane],
    ["Controller thread", executionContextLock.controllerThread],
    ["Execution cwd", executionContextLock.executionCwd],
    ["Execution branch", executionContextLock.executionBranch],
    ["Remote-control worktree", executionContextLock.remoteControlWorktree]
  ];
  for (const [label, value] of requiredFields) {
    if (missingEvidence(value)) {
      errors.push(`Execution Context Lock must include ${label} for worktree goals.`);
    }
  }

  const remoteControl = yesNoValue(executionContextLock.remoteControlWorktree);
  if (executionContextLock.remoteControlWorktree && !remoteControl) {
    errors.push("Execution Context Lock Remote-control worktree must be yes or no.");
  }
  if (canonicalRoute === "isolated-worktree" && remoteControl !== "yes") {
    errors.push("Conversation Route isolated-worktree requires Execution Context Lock Remote-control worktree: yes.");
  }
  if ((canonicalRoute === "current-session" || canonicalRoute === "delegated-worker") && remoteControl === "yes") {
    errors.push(`Conversation Route ${conversationRoute} must not set Remote-control worktree: yes.`);
  }

  return errors;
}

function batchSignals(content) {
  const relevant = [
    goalTitle(content, ""),
    extractSection(content, "Goal"),
    extractSection(content, "Source Task"),
    extractSection(content, "Scope"),
    extractSection(content, "Completion Conditions")
  ].join("\n");
  return /\b(batch|source tasks|multiple source tasks|unfinished tasks|merged source tasks)\b/i.test(relevant);
}

function acceptanceMapDetails(goalContent, specContent = "") {
  const goalSection = extractSection(goalContent, "Source Task Acceptance Map");
  const specSection = extractSection(specContent, "Source Task Acceptance Map");
  const section = goalSection || specSection;
  return {
    required: extractInlinePath(goalContent, "Execution Plan") ? Boolean(section) : batchSignals(goalContent) || batchSignals(specContent),
    source: goalSection ? "goal" : specSection ? "spec" : "",
    section,
    items: section ? parseSourceTaskAcceptanceMap(section) : []
  };
}

function acceptanceMapValidationErrors(mapDetails, { completed = false } = {}) {
  const errors = [];
  if (!mapDetails.required && !mapDetails.section) {
    return errors;
  }

  if (mapDetails.required && !mapDetails.section) {
    errors.push("Batch goals require a Source Task Acceptance Map.");
    return errors;
  }

  if (!mapDetails.items.length) {
    errors.push("Source Task Acceptance Map must include at least one '- Task:' item.");
    return errors;
  }

  mapDetails.items.forEach((item, index) => {
    const label = item.task || `item ${index + 1}`;
    if (!item.task) {
      errors.push(`Source Task Acceptance Map item ${index + 1} is missing Task.`);
    }
    if (!item.acceptance) {
      errors.push(`Source Task Acceptance Map item '${label}' is missing Acceptance.`);
    }
    if (!validAcceptanceMapStatuses.has(item.status)) {
      errors.push(`Source Task Acceptance Map item '${label}' must use Status pending, satisfied, deferred, or blocked; found ${item.status || "(missing)"}.`);
    }
    if ((item.status === "deferred" || item.status === "blocked") && missingEvidence(item.unblocker)) {
      errors.push(`Source Task Acceptance Map item '${label}' is ${item.status} but missing Unblocker.`);
    }
    if (completed && item.status !== "satisfied") {
      errors.push(`Completed batch runs require Source Task Acceptance Map item '${label}' to be satisfied; found ${item.status || "(missing)"}.`);
    }
    if (completed && missingEvidence(item.evidence)) {
      errors.push(`Completed batch runs require concrete Evidence for Source Task Acceptance Map item '${label}'.`);
    }
  });

  return errors;
}

function stageCompletionMapValidationErrors(mapDetails, { completed = false } = {}) {
  const errors = [];
  if (!mapDetails.required && !mapDetails.section) {
    return errors;
  }

  if (mapDetails.required && !mapDetails.section) {
    errors.push("Milestone completion goals require a Milestone Completion Map.");
    return errors;
  }

  if (!mapDetails.items.length) {
    errors.push("Milestone Completion Map must include at least one '- Item:' item.");
    return errors;
  }

  const completedRequiredLabels = completed
    ? uniqueList([
      ...mapDetails.requiredLabels,
      ...mapDetails.items.map((item) => item.label)
    ])
    : mapDetails.requiredLabels;

  errors.push(...evidenceItemValidationErrors(mapDetails, {
    sectionTitle: "Milestone Completion Map",
    itemTitle: "Item",
    requireAcceptance: true,
    requiredLabels: completedRequiredLabels,
    requiredMissingLabel: "required item",
    completed
  }));

  return errors;
}

function sectionHasManualVerification(section) {
  return /\b(manual|human|review|evidence|document|not automated|cannot be automated)\b/i.test(section);
}

function extractVerificationCommands(section) {
  const commands = [];
  for (const match of String(section || "").matchAll(/```(?:bash|sh)?\n([\s\S]*?)```/g)) {
    commands.push(...match[1].split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith("#")));
  }
  return commands;
}

function goalMetadata(cwd, goalPath) {
  const content = readFileIfExists(goalPath);
  const spec = extractInlinePath(content, "Spec");
  const specAbs = resolveProjectPath(cwd, spec);
  const specInProject = Boolean(specAbs && isInsideProject(cwd, specAbs));
  const specExists = Boolean(specInProject && existsSync(specAbs));
  const specContent = specExists ? readFileSync(specAbs, "utf8") : "";
  const workMode = extractGoalWorkModeRaw(content);
  const executionRole = extractGoalExecutionRoleRaw(content);
  const conversationRoute = extractConversationRouteRaw(content);
  const executionContextLock = executionContextLockDetails(content);
  const acceptanceMap = acceptanceMapDetails(content, specContent);
  const stageCompletionMap = stageCompletionMapDetails(content, specContent);
  const specChecklist = specAcceptanceChecklistDetails(content, specContent);
  const gateEvidence = gateEvidenceDetails(content, specContent);
  const stateSyncNotes = stateSyncNotesDetails(content);

  return {
    path: displayPath(cwd, goalPath),
    title: goalTitle(content, goalPath),
    status: extractStatusLine(content),
    specPolicy: extractSpecPolicyRaw(content),
    spec,
    specPath: specInProject && specAbs ? displayPath(cwd, specAbs) : spec,
    specExists,
    specStatus: specStatus(specContent),
    workMode,
    executionRole,
    conversationRoute,
    executionContextLock,
    acceptanceMap: {
      required: acceptanceMap.required,
      source: acceptanceMap.source,
      itemCount: acceptanceMap.items.length,
      items: acceptanceMap.items
    },
    milestoneCompletionMap: {
      required: stageCompletionMap.required,
      requiredLabels: stageCompletionMap.requiredLabels,
      source: stageCompletionMap.source,
      itemCount: stageCompletionMap.items.length,
      items: stageCompletionMap.items
    },
    stageCompletionMap: {
      required: stageCompletionMap.required,
      requiredLabels: stageCompletionMap.requiredLabels,
      source: stageCompletionMap.source,
      itemCount: stageCompletionMap.items.length,
      items: stageCompletionMap.items
    },
    specAcceptanceChecklist: {
      source: specChecklist.source,
      itemCount: specChecklist.items.length,
      items: specChecklist.items
    },
    requiredGateEvidence: {
      source: gateEvidence.source,
      itemCount: gateEvidence.items.length,
      items: gateEvidence.items
    },
    stateSyncNotes: {
      section: Boolean(stateSyncNotes.section),
      text: stateSyncNotes.text
    },
    sections: {
      sourceTask: Boolean(extractSection(content, "Source Task")),
      readFirst: Boolean(extractSection(content, "Read First")),
      workModeRecommendation: Boolean(extractSection(content, "Work Mode Recommendation")),
      executionRole: Boolean(extractSection(content, "Execution Role")),
      hostExecution: Boolean(extractHostExecutionSection(content)),
      conversationRoute: Boolean(extractSection(content, "Conversation Route")),
      executionContextLock: Boolean(extractSection(content, "Execution Context Lock")),
      sourceTaskAcceptanceMap: Boolean(extractSection(content, "Source Task Acceptance Map")),
      milestoneCompletionMap: Boolean(extractSection(content, "Milestone Completion Map")),
      stageCompletionMap: Boolean(extractSection(content, "Milestone Completion Map") || extractSection(content, "Stage Completion Map")),
      specAcceptanceChecklist: Boolean(extractSection(content, "Spec Acceptance Checklist")),
      requiredGateEvidence: Boolean(extractSection(content, "Required Gate Evidence")),
      scope: Boolean(extractSection(content, "Scope")),
      nonGoals: Boolean(extractSection(content, "Non-Goals")),
      verification: Boolean(extractSection(content, "Verification")),
      completionConditions: Boolean(extractSection(content, "Completion Conditions")),
      stateSyncNotes: Boolean(extractSection(content, "State Sync Notes")),
      pauseConditions: Boolean(extractSection(content, "Pause Conditions"))
    }
  };
}

function validateGoal(cwd, goalPath, { checkCompletion = true } = {}) {
  const errors = [];
  const warnings = [];
  const context = resolveHarnessContext(cwd);
  const content = readFileIfExists(goalPath);

  if (!content) {
    return {
      ok: false,
      errors: [`Goal file not found: ${displayPath(cwd, goalPath)}`],
      warnings,
      metadata: {
        path: displayPath(cwd, goalPath)
      }
    };
  }

  const metadata = goalMetadata(cwd, goalPath);
  const canonicalStatus = canonicalGoalStatus(metadata.status);
  if (!canonicalStatus || !validGoalStatuses.has(canonicalStatus)) {
    errors.push(`Status must use active, completed, or blocked; found ${metadata.status || "(missing)"}.`);
  }
  const spec = metadata.spec;
  const allowNoSpec = metadata.specPolicy === "allow-no-spec";
  if (metadata.specPolicy && !allowNoSpec) {
    errors.push(`Spec Policy must be allow-no-spec when present; found ${metadata.specPolicy}.`);
  }
  if (missingSpecValue(spec)) {
    if (!allowNoSpec) {
      errors.push("Spec must point to a repo-local spec file, not TBD, unless Spec Policy is allow-no-spec.");
    }
  } else {
    const specAbs = resolveProjectPath(cwd, spec);
    const specsRoot = context.paths.specs ? configuredPath(cwd, context.paths.specs, "Specs root") : cwd;
    if (!isInsideProject(cwd, specAbs) || !isPathInside(specsRoot, specAbs)) {
      errors.push(`Spec must stay inside the project: ${spec}`);
    } else if (!existsSync(specAbs)) {
      errors.push(`Spec file not found: ${spec}`);
    } else if (isDraftStatus(metadata.specStatus)) {
      errors.push(`Spec status is not confirmed: ${metadata.specStatus || "(missing)"}`);
    }
  }

  const requiredSections = [
    ["Source Task", "sourceTask"],
    ["Read First", "readFirst"],
    ["Work Mode Recommendation", "workModeRecommendation"],
    ["Execution Role", "executionRole"],
    ["Scope", "scope"],
    ["Non-Goals", "nonGoals"],
    ["Verification", "verification"],
    ["Completion Conditions", "completionConditions"],
    ["State Sync Notes", "stateSyncNotes"],
    ["Pause Conditions", "pauseConditions"]
  ];
  for (const [title, key] of requiredSections) {
    if (!metadata.sections[key]) {
      errors.push(`Missing required section: ${title}`);
    }
  }

  const readFirst = extractSection(content, "Read First");
  if (!missingSpecValue(spec) && !readFirst.includes(spec)) {
    errors.push("Read First must include the referenced spec path.");
  }

  if (!validWorkModes.has(metadata.workMode)) {
    errors.push(`Work Mode Recommendation must use one of local, worktree, or ask; found ${metadata.workMode || "(missing)"}.`);
  }

  if (!validExecutionRoles.has(metadata.executionRole)) {
    errors.push(`Execution Role must use gate-only or implementer; found ${metadata.executionRole || "(missing)"}.`);
  }
  errors.push(...executionContextValidationErrors({
    workMode: metadata.workMode,
    conversationRoute: metadata.conversationRoute,
    executionContextLock: metadata.executionContextLock
  }));
  const verification = extractSection(content, "Verification");
  const verificationCommands = extractVerificationCommands(verification);
  if (!verificationCommands.length && !sectionHasManualVerification(verification)) {
    errors.push("Verification must include executable commands or explain the manual verification evidence.");
  }

  const specContent = metadata.specExists ? readFileSync(join(cwd, metadata.specPath), "utf8") : "";
  const acceptanceMap = acceptanceMapDetails(content, specContent);
  errors.push(...acceptanceMapValidationErrors(acceptanceMap));
  const stageCompletionMap = stageCompletionMapDetails(content, specContent);
  errors.push(...stageCompletionMapValidationErrors(stageCompletionMap));
  const specChecklist = specAcceptanceChecklistDetails(content, specContent);
  errors.push(...evidenceItemValidationErrors(specChecklist, {
    sectionTitle: "Spec Acceptance Checklist",
    itemTitle: "Item",
    requireAcceptance: true
  }));
  const requiredGates = durableRequiredCompletionGates(context);
  const gateEvidence = gateEvidenceDetails(content, specContent);
  if (requiredGates.length && !gateEvidence.section) {
    errors.push(`Required Gate Evidence must include durable adapter-required gate(s): ${requiredGates.join(", ")}.`);
  } else {
    errors.push(...evidenceItemValidationErrors(gateEvidence, {
      sectionTitle: "Required Gate Evidence",
      itemTitle: "Gate",
      requiredLabels: requiredGates
    }));
  }

  errors.push(...stateSyncNotesValidationErrors(stateSyncNotesDetails(content)));

  if (canonicalStatus === "completed" && checkCompletion) {
    errors.push(...goalEvidenceErrors(cwd, context, displayPath(cwd, goalPath)));
    errors.push(...planned.completionErrors(cwd, context, normalizePathReference(displayPath(cwd, goalPath))));
  }

  const pauseConditions = extractSection(content, "Pause Conditions");
  const pauseLower = pauseConditions.toLowerCase();
  const requiredPauseSignals = [
    ["spec conflict or newer instructions", ["spec", "conflict", "instruction"]],
    ["credentials or paid APIs", ["credential", "paid"]],
    ["destructive or production action", ["destructive", "production"]],
    ["product direction", ["product"]]
  ];
  for (const [label, signals] of requiredPauseSignals) {
    if (!signals.some((signal) => pauseLower.includes(signal))) {
      errors.push(`Pause Conditions must cover ${label}.`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    metadata: {
      ...metadata,
      verificationCommands
    }
  };
}

function goalFiles(cwd, goalsRelPath) {
  const goalsDir = configuredPath(cwd, goalsRelPath, "Goals root");
  if (!existsSync(goalsDir)) {
    return [];
  }
  return readdirSync(goalsDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => join(goalsDir, entry.name))
    .sort();
}

function goalList(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  const files = goalFiles(cwd, context.paths.goals || fixedContract.goals);
  const goals = files.map((file) => {
    const metadata = goalMetadata(cwd, file);
    const validation = validateGoal(cwd, file);
    return {
      ...metadata,
      valid: validation.ok,
      errorCount: validation.errors.length
    };
  });
  const payload = {
    cwd,
    contract: context.contract,
    goalsPath: context.paths.goals || fixedContract.goals,
    goals
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Goals: ${payload.goalsPath}`);
  if (!goals.length) {
    console.log("- none");
    return;
  }
  for (const goal of goals) {
    console.log(`- ${goal.path} | ${goal.valid ? "valid" : `invalid:${goal.errorCount}`} | ${goal.spec || "Spec:TBD"} | ${goal.workMode || "workMode:missing"}`);
  }
}

function goalInspect(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  if (!args.goal) {
    throw new Error("Usage: agent-harness goal inspect --goal <goal-file> [--cwd PATH] [--json]");
  }

  const goalPath = assertContainedPath(configuredPath(cwd, context.paths.goals, "Goals root"), resolve(cwd, args.goal), "Goal path");
  const validation = validateGoal(cwd, goalPath);
  const payload = {
    ...validation.metadata,
    validation: {
      ok: validation.ok,
      errors: validation.errors,
      warnings: validation.warnings
    }
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Goal: ${payload.path}`);
  console.log(`Title: ${payload.title || "unknown"}`);
  console.log(`Status: ${payload.status || "unknown"}`);
  console.log(`Spec: ${payload.spec || "missing"}`);
  console.log(`Spec status: ${payload.specStatus || "unknown"}`);
  console.log(`Work mode: ${payload.workMode || "missing"}`);
  console.log(`Execution role: ${payload.executionRole || "missing"}`);
  console.log(`Acceptance map: ${payload.acceptanceMap?.required ? `${payload.acceptanceMap.itemCount} item(s)` : "not required"}`);
  console.log(`Milestone completion map: ${payload.milestoneCompletionMap?.required ? `${payload.milestoneCompletionMap.itemCount} item(s)` : "not required"}`);
  console.log(`Spec checklist: ${payload.specAcceptanceChecklist?.itemCount || 0} item(s)`);
  console.log(`Required gate evidence: ${payload.requiredGateEvidence?.itemCount || 0} item(s)`);
  console.log(`Validation: ${validation.ok ? "ok" : "failed"}`);
  for (const error of validation.errors) {
    console.log(`- ${error}`);
  }
}

function goalEvidenceErrors(cwd, context, goalRef, { skipSync = false, additionalGates = [] } = {}) {
  const goalContent = readFileSync(configuredPath(cwd, goalRef), "utf8");
  const metadata = goalMetadata(cwd, configuredPath(cwd, goalRef));
  const specContent = metadata.specExists ? readFileSync(join(cwd, metadata.specPath), "utf8") : "";
  const errors = [];
  const maps = [
    ["Source Task Acceptance Map", acceptanceMapValidationErrors(acceptanceMapDetails(goalContent, specContent), { completed: true })],
    ["Milestone Completion Map", stageCompletionMapValidationErrors(stageCompletionMapDetails(goalContent, specContent), { completed: true })]
  ];
  const checklist = specAcceptanceChecklistDetails(goalContent, specContent);
  maps.push(["Spec Acceptance Checklist", evidenceItemValidationErrors(checklist, {
    sectionTitle: "Spec Acceptance Checklist", itemTitle: "Item", requireAcceptance: true,
    completed: true, requiredLabels: checklist.items.map(item => item.label)
  })]);
  const requiredGates = uniqueList([...durableRequiredCompletionGates(context), ...additionalGates]);
  const gates = gateEvidenceDetails(goalContent, specContent);
  if (requiredGates.length && !gates.section) errors.push(`Required Gate Evidence must include durable adapter-required gate(s): ${requiredGates.join(", ")}.`);
  maps.push(["Required Gate Evidence", evidenceItemValidationErrors(gates, {
    sectionTitle: "Required Gate Evidence", itemTitle: "Gate", completed: true, requiredLabels: requiredGates
  })]);
  if (!skipSync) maps.push(["State Sync Notes", stateSyncNotesValidationErrors(stateSyncNotesDetails(goalContent), { completed: true })]);
  for (const [label, failures] of maps) if (failures.length) errors.push(`${label} validation failed:\n${failures.map(error => `- ${error}`).join("\n")}`);
  return errors;
}

function goalValidate(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  if (!args.goal) {
    throw new Error("Usage: agent-harness goal validate --goal <goal-file> [--cwd PATH] [--json]");
  }

  const goalPath = assertContainedPath(configuredPath(cwd, context.paths.goals, "Goals root"), resolve(cwd, args.goal), "Goal path");
  const validation = validateGoal(cwd, goalPath);
  const payload = {
    ok: validation.ok,
    errors: validation.errors,
    warnings: validation.warnings,
    goal: validation.metadata
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else {
    console.log(`Goal validation: ${validation.ok ? "ok" : "failed"}`);
    for (const error of validation.errors) {
      console.log(`- ${error}`);
    }
    for (const warning of validation.warnings) {
      console.log(`Warning: ${warning}`);
    }
  }

  if (!validation.ok) {
    process.exitCode = 1;
  }
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

function usage(lang = "en") {
  console.log(t(lang, "usage"));
}

function main() {
  try {
    const args = parseArgs(process.argv.slice(2));
    args.language = resolveLanguage(args);
    const command = args._[0] || "help";
    const subcommand = args._[1] || "";

    if (args.help || command === "help") {
      usage(args.language);
    } else if (command === "init") {
      init(args);
    } else if (command === "skills" && subcommand === "install") {
      skillsInstall(args);
    } else if (command === "skills" && subcommand === "uninstall") {
      skillsUninstall(args);
    } else if (command === "doctor") {
      doctor(args);
    } else if (command === "print-contract") {
      printContract(args);
    } else if (command === "activation" && subcommand === "snippet") {
      activationSnippetCommand(args);
    } else if (command === "orient" && subcommand === "next") {
      orientNext(args);
    } else if (command === "intake" && subcommand === "idea") {
      intakeIdea(args);
    } else if (command === "maintain" && subcommand === "tasks") {
      stateMaintenance.maintain(args);
    } else if (command === "artifacts" && subcommand === "inspect") {
      stateMaintenance.inspect(args);
    } else if (command === "artifacts" && subcommand === "compact") {
      stateMaintenance.compact(args);
    } else if (command === "artifacts" && subcommand === "prune") {
      throw new Error("Run pruning is outside delivery control. Preserve old files or remove an explicitly selected local directory through normal project maintenance.");
    } else if (command === "config" && subcommand === "inspect") {
      configInspect(args);
    } else if (command === "config" && subcommand === "validate") {
      configValidate(args);
    } else if (command === "config" && subcommand === "import") {
      configImport(args);
    } else if (command === "adapter" && subcommand === "inspect") {
      adapterInspect(args);
    } else if (command === "worktree" && subcommand === "recommend") {
      worktreeRecommend(args);
    } else if (command === "plan" && subcommand === "validate") {
      planned.planValidate(args);
    } else if (command === "execute" && subcommand === "next") {
      planned.next(args);
    } else if (command === "goal" && subcommand === "complete") {
      planned.goalComplete(args);
    } else if (command === "milestone" && subcommand === "complete") {
      planned.milestoneComplete(args);
    } else if (command === "run" && subcommand === "node" && args._[2] === "review") {
      throw new Error("Legacy Run review is retired. Execute and verify in the host, record the verified acceptance outcome, then use goal complete --verification.");
    } else if (command === "goal" && subcommand === "create") {
      goalCreate(args);
    } else if (command === "goal" && subcommand === "list") {
      goalList(args);
    } else if (command === "goal" && subcommand === "inspect") {
      goalInspect(args);
    } else if (command === "goal" && subcommand === "validate") {
      goalValidate(args);
    } else if (command === "run" && subcommand === "prepare") {
      throw new Error("Run preparation is retired. Use the host session and execute next --goal or --milestone.");
    } else if (command === "run") {
      throw new Error("Run execution records are retired. The host owns session and resume; use execute next and Goal/Milestone completion with --verification.");
    } else {
      usage(args.language);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

const planned = createDeliveryControl({
  configuredPath, targetCwd, resolveHarnessContext, displayPath, assertContainedPath, isPathInside,
  extractInlinePath, extractSection, parseEvidenceItems, cleanMapValue,
  goalMetadata, validateGoal, canonicalGoalStatus, extractStatusLine, goalEvidenceErrors,
  goalSourceTask, parseTasks, normalizedTaskTitle, isDoneTask, withStateLock, atomicWriteFile,
  replaceMarkdownSection, missingEvidence
});

const stateMaintenance = createStateMaintenance({
  targetCwd, resolveHarnessContext, configuredPath, parseTasks, isDoneTask,
  atomicWriteFile, replaceMarkdownSection
});

main();
