#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

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
  goals: "harness/goals",
  runs: ".harness/runs"
};

const adapterContract = {
  contract: "adapter",
  taskIndex: "harness/tasks.md",
  config: configRelPath,
  adapterDocs: "harness/README.md",
  status: "harness/status.md",
  specs: "harness/specs",
  goals: "harness/goals",
  milestones: "harness/milestones",
  runs: ".harness/runs",
  gateRecords: ".harness/runs",
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
const validConversationRoutes = new Set(["current-thread", "slot-thread", "remote-control-worktree"]);
const deliveryStateOrder = ["implemented-local", "validated-local", "committed", "pushed", "review-open", "integrated", "released/shipped"];
const validDeliveryStates = new Set(deliveryStateOrder);
const validAcceptanceMapStatuses = new Set(["pending", "satisfied", "deferred", "blocked"]);
const validEvidenceItemStatuses = new Set(["pending", "satisfied", "deferred", "blocked"]);
const recordableRunNodePhases = new Set(["running", "completed", "blocked"]);
const validCommentaryPolicies = new Set(["minimal", "balanced", "audit"]);
const contextFocusIntentTargets = "`Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec`";
const contextFocusRoutingGuidance = `\`harness-rule:project-neutral-core\`: Normalize the durable target to ${contextFocusIntentTargets}; adapters own downstream paths and facts while plugin core remains project-neutral.`;
const executeContextFocusGuidance = "`harness-rule:path-containment`: configured writes, Goal/Spec references, Run arguments, and DAG artifacts stay inside configured roots after lexical and existing-parent realpath checks.";
const cyberneticStabilityGuidance = "`harness-rule:state-sync-evidence`: durable completion includes verified State Sync Notes and synchronization of the configured Goal, Task, Run, gate, and bounded status records.";
const degradedExecutionProvenanceGuidance = "`harness-rule:candidate-accepted-evidence`: execution and worker output remains candidate evidence until the accepted-state owner verifies and records it.";
const controllerCancellationBoundaryGuidance = "`harness-rule:run-dag-ownership`: Harness records ready nodes, dependencies, ownership, verification, and candidate evidence; the Codex runtime owns scheduling, delegation, concurrency, and cancellation.";
const boundedStatusSnapshotGuidance = "`harness-rule:bounded-status-snapshot`: The configured status file is a bounded current-state snapshot, not an append-only history log. Replace current status sections when syncing state; keep historical details in tasks, goals, runs, and gate records.";
const boundedDirectExecutionGuidance = "`harness-rule:durable-tier-boundary`: ordinary clear change/build uses Codex directly; Harness ceremony is reserved for recovery, audit, persistent state sync, milestones, DAGs, multiple workers, or high-risk control.";
const localDeliveryCeilingGuidance = "`harness-rule:local-delivery-ceiling`: local implementation or validation is not commit, push, review, integration, release, or deploy evidence.";
const runScopedDeliveryGuidance = "`harness-rule:run-scoped-delivery`: delivery claims compare this Run's recorded start snapshot, current delta, and explicit evidence.";

function commentaryPolicyDetails(config = {}) {
  const configured = config.communication?.commentary;
  const policy = validCommentaryPolicies.has(configured) ? configured : "minimal";
  const definitions = {
    minimal: {
      reportCadence: "material-transition-or-host-heartbeat",
      notifyOn: "blocker, risk, scope-or-authorization-change, user-decision, failed-verification, delivery-transition",
      guidance: "Use one short kickoff that combines skill, reason, scope, boundaries, and next action. Do not narrate routine UI-visible tool activity or repeat unchanged boundaries. Later commentary must add a new material fact unless it is a one-sentence host-required heartbeat."
    },
    balanced: {
      reportCadence: "meaningful-phase-transition",
      notifyOn: "minimal-signals, exploration-complete, implementation-complete, verification-complete",
      guidance: "Apply signal-only rules and additionally report meaningful execution phase transitions. Do not narrate individual commands or files."
    },
    audit: {
      reportCadence: "gate-and-decision-transition",
      notifyOn: "balanced-signals, gate-input, gate-decision, state-sync, delivery-transition",
      guidance: "Apply signal-only rules and permit compact transcript-quality gate, decision, state-sync, and delivery evidence summaries. Prefer paths and summaries over raw packet dumps."
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
    "idea",
    "integrationRef",
    "integration-ref",
    "isolationEvidence",
    "isolation-evidence",
    "lang",
    "contract",
    "mode",
    "deferredRegister",
    "deferred-register",
    "phase",
    "priority",
    "prUrl",
    "pr-url",
    "projectName",
    "project-name",
    "reviewUrl",
    "review-url",
    "releaseRef",
    "release-ref",
    "gateRecords",
    "gate-records",
    "mergeSha",
    "merge-sha",
    "mentalModel",
    "mental-model",
    "mentalModelIndex",
    "mental-model-index",
    "mentalModels",
    "mental-models",
    "node",
    "run",
    "section",
    "summary",
    "status",
    "specs",
    "goals",
    "milestones",
    "runs",
    "surface",
    "spec",
    "taskIndex",
    "task-index",
    "task",
    "thread",
    "verification",
    "workMode",
    "work-mode"
  ]);
  const booleanOptions = new Set(["allowNoSpec", "allow-no-spec", "dryRun", "dry-run", "force", "help", "json", "record"]);

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
  while (!existsSync(cursor)) {
    const parent = dirname(cursor);
    if (parent === cursor) break;
    cursor = parent;
  }
  return cursor;
}

function assertContainedPath(root, candidate, label = "Path") {
  const absoluteRoot = resolve(root);
  const absoluteCandidate = resolve(candidate);
  if (!isPathInside(absoluteRoot, absoluteCandidate)) {
    throw new Error(`${label} must stay inside ${absoluteRoot}: ${candidate}`);
  }
  const rootAnchor = realpathSync(existingAncestor(absoluteRoot));
  const candidateAnchor = realpathSync(existingAncestor(absoluteCandidate));
  if (!isPathInside(rootAnchor, candidateAnchor)) {
    throw new Error(`${label} escapes ${absoluteRoot} through an existing symlink: ${candidate}`);
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

function artifactPath(root, relPath, label = "Artifact path") {
  if (!isRelativeHarnessPath(relPath)) {
    throw new Error(`${label} must be relative and must not contain '..': ${relPath}`);
  }
  return assertContainedPath(root, resolve(root, relPath), label);
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
  agent-harness init [--cwd PATH] [--contract fixed|adapter] [--task-index PATH] [--project-name NAME] [--force] [--lang CODE]
  agent-harness doctor [--cwd PATH] [--lang CODE]
  agent-harness print-contract [--contract fixed|adapter]
  agent-harness activation snippet [--cwd PATH] [--json]
  agent-harness orient next [--cwd PATH] [--json]
  agent-harness intake idea --idea <text> [--cwd PATH] [--priority P1|P2|P3] [--section Now|Next|Later] [--record] [--json]
  agent-harness maintain tasks [--cwd PATH] [--record] [--json]
  agent-harness config inspect [--cwd PATH] [--json]
  agent-harness config validate [--cwd PATH] [--json]
  agent-harness config import [--cwd PATH] [--task-index PATH] [--status PATH] [--specs PATH] [--goals PATH] [--milestones PATH] [--runs PATH] [--gate-records PATH] [--deferred-register PATH] [--mental-model PATH] [--mental-model-index PATH] [--mental-models PATH] [--dry-run] [--force] [--json]
  agent-harness adapter inspect [--cwd PATH] [--json]
  agent-harness worktree recommend [--cwd PATH] [--json] [--lang CODE]
  agent-harness goal create --task <title-or-id> [--cwd PATH] [--spec PATH] [--allow-no-spec] [--work-mode local|worktree|ask] [--dry-run] [--force]
  agent-harness goal list [--cwd PATH] [--json]
  agent-harness goal inspect --goal <goal-file> [--cwd PATH] [--json]
  agent-harness goal validate --goal <goal-file> [--cwd PATH] [--json]
  agent-harness run prepare --goal <goal-file> [--cwd PATH]
  agent-harness run node record --run <run-dir> --node <node-id> --phase running|completed|blocked --summary <text> [--verification <text>] [--thread <thread-id>] [--surface <surface>] [--isolation-evidence <text>] [--cwd PATH] [--json]
  agent-harness run record --run <run-dir> --phase completed|blocked --summary <text> [--verification <text>] [--gate-evidence <text>] [--review-url <url>] [--integration-ref <ref>] [--pr-url <url>] [--merge-sha <sha>] [--release-ref <ref>] [--cwd PATH] [--json]
  agent-harness run status --run <run-dir> [--cwd PATH] [--json]`,
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
  agent-harness init [--cwd PATH] [--contract fixed|adapter] [--task-index PATH] [--project-name NAME] [--force] [--lang CODE]
  agent-harness doctor [--cwd PATH] [--lang CODE]
  agent-harness print-contract [--contract fixed|adapter]
  agent-harness activation snippet [--cwd PATH] [--json]
  agent-harness orient next [--cwd PATH] [--json]
  agent-harness intake idea --idea <text> [--cwd PATH] [--priority P1|P2|P3] [--section Now|Next|Later] [--record] [--json]
  agent-harness maintain tasks [--cwd PATH] [--record] [--json]
  agent-harness config inspect [--cwd PATH] [--json]
  agent-harness config validate [--cwd PATH] [--json]
  agent-harness config import [--cwd PATH] [--task-index PATH] [--status PATH] [--specs PATH] [--goals PATH] [--milestones PATH] [--runs PATH] [--gate-records PATH] [--deferred-register PATH] [--mental-model PATH] [--mental-model-index PATH] [--mental-models PATH] [--dry-run] [--force] [--json]
  agent-harness adapter inspect [--cwd PATH] [--json]
  agent-harness worktree recommend [--cwd PATH] [--json] [--lang CODE]
  agent-harness goal create --task <title-or-id> [--cwd PATH] [--spec PATH] [--allow-no-spec] [--work-mode local|worktree|ask] [--dry-run] [--force]
  agent-harness goal list [--cwd PATH] [--json]
  agent-harness goal inspect --goal <goal-file> [--cwd PATH] [--json]
  agent-harness goal validate --goal <goal-file> [--cwd PATH] [--json]
  agent-harness run prepare --goal <goal-file> [--cwd PATH]
  agent-harness run node record --run <run-dir> --node <node-id> --phase running|completed|blocked --summary <text> [--verification <text>] [--thread <thread-id>] [--surface <surface>] [--isolation-evidence <text>] [--cwd PATH] [--json]
  agent-harness run record --run <run-dir> --phase completed|blocked --summary <text> [--verification <text>] [--gate-evidence <text>] [--review-url <url>] [--integration-ref <ref>] [--pr-url <url>] [--merge-sha <sha>] [--release-ref <ref>] [--cwd PATH] [--json]
  agent-harness run status --run <run-dir> [--cwd PATH] [--json]`,
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
    && !/^[A-Za-z]:[\\/]/.test(value)
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
    for (const key of ["taskIndex", "status", "specs", "goals", "milestones", "runs"]) {
      if (!paths[key]) {
        errors.push(`$.paths.${key} is required for adapter contract.`);
      }
    }
  }

  if (contract === "fixed") {
    for (const key of ["status", "goals", "runs"]) {
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
  payload.paths.status = discovery.status || payload.paths.status || adapterContract.status;
  payload.paths.specs = discovery.specs || payload.paths.specs || adapterContract.specs;
  payload.paths.goals = discovery.goals || payload.paths.goals || adapterContract.goals;
  payload.paths.milestones = discovery.milestones || payload.paths.milestones || adapterContract.milestones;
  payload.paths.runs = discovery.runs || payload.paths.runs || adapterContract.runs;
  payload.paths.gateRecords = discovery.gateRecords || payload.paths.gateRecords || payload.paths.runs || adapterContract.gateRecords;
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
    config: adapter.machineReadable || activeConfigRelPath || configRelPath,
    adapterDocs: adapter.docs || adapterContract.adapterDocs,
    status: paths.status || adapterContract.status,
    specs: paths.specs || adapterContract.specs,
    goals: paths.goals || adapterContract.goals,
    milestones: paths.milestones || adapterContract.milestones,
    runs: paths.runs || adapterContract.runs,
    gateRecords: paths.gateRecords || paths.runs || adapterContract.gateRecords,
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
        resolvedPaths.milestones,
        resolvedPaths.runs
      ]);
    const optionalPaths = uniqueList(configSource === "discovered"
      ? [
        resolvedPaths.config,
        resolvedPaths.status,
        resolvedPaths.specs,
        resolvedPaths.goals,
        resolvedPaths.milestones,
        resolvedPaths.runs,
        resolvedPaths.gateRecords,
        resolvedPaths.deferredRegister,
        resolvedPaths.mentalModels,
        resolvedPaths.mentalModelIndex
      ]
      : [
        resolvedPaths.gateRecords,
        resolvedPaths.deferredRegister,
        resolvedPaths.mentalModels,
        resolvedPaths.mentalModelIndex
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
    config: activeConfigRelPath || configRelPath,
    status: paths.status || fixedContract.status,
    goals: paths.goals || fixedContract.goals,
    runs: paths.runs || fixedContract.runs
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
      resolvedPaths.goals,
      resolvedPaths.runs
    ]),
    optionalPaths: []
  };
}

function fixedPathsFromConfig(config, activeConfigRelPath = configRelPath) {
  const paths = config.paths || {};
  if (paths.tasks && paths.taskIndex && paths.tasks !== paths.taskIndex) {
    throw new Error(`Conflicting config aliases: paths.tasks=${paths.tasks} and paths.taskIndex=${paths.taskIndex}.`);
  }
  return {
    taskIndex: paths.tasks || paths.taskIndex || fixedContract.taskIndex,
    config: activeConfigRelPath,
    status: paths.status || fixedContract.status,
    goals: paths.goals || fixedContract.goals,
    runs: paths.runs || fixedContract.runs
  };
}

function configExists(cwd) {
  return Boolean(findConfigRelPath(cwd));
}

function renderAdapterTemplate(paths) {
  return readTemplate("adapter.md")
    .replace("- Goal index: `harness/tasks.md`", `- Goal index: \`${paths.taskIndex}\``)
    .replace("- Status file: `harness/status.md`", `- Status file: \`${paths.status}\``)
    .replace("- Specs: `harness/specs/`", `- Specs: \`${paths.specs}/\``)
    .replace("- Goals: `harness/goals/`", `- Goals: \`${paths.goals}/\``)
    .replace("- Milestones: `harness/milestones/`", `- Milestones: \`${paths.milestones}/\``)
    .replace("- Runs / logs: `.harness/runs/`", `- Runs / logs: \`${paths.runs}/\``)
    .replace("- Gate records: `.harness/runs/`", `- Gate records: \`${paths.gateRecords}/\``)
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
  for (const dir of [paths.specs, paths.goals, paths.milestones, paths.runs, paths.mentalModels]) {
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
    return {
      mode: existingMode,
      configPayload: config,
      paths: existingMode === "adapter"
        ? resolvedAdapterPaths(config, activeConfigRelPath)
        : fixedPathsFromConfig(config, activeConfigRelPath),
      writeConfig: false
    };
  }

  const mode = requestedContract(args);
  const discovery = mode === "adapter"
    ? discoverAdapterProject(cwd, {
      taskIndex: args.taskIndex,
      adapterDocs: args.adapterDocs
    })
    : {};
  const configPayload = mode === "adapter"
    ? buildAdapterConfigPayload(projectName, discovery)
    : buildConfigPayload(projectName, "fixed");

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
  const files = [paths.taskIndex, paths.config, paths.status];
  const dirs = [paths.goals, paths.runs];
  if (mode === "adapter") {
    files.push(paths.adapterDocs, paths.mentalModelIndex);
    dirs.push(paths.specs, paths.milestones, paths.gateRecords, paths.deferredRegister, paths.mentalModels);
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
  }

  const dirs = mode === "adapter"
    ? [paths.specs, paths.goals, paths.milestones, paths.runs, paths.mentalModels]
    : [paths.goals, paths.runs];
  for (const dir of dirs) {
    mkdirSync(configuredPath(cwd, dir, "Harness directory"), { recursive: true });
  }

  if (mode === "adapter" && paths.mentalModelIndex) {
    ensureMentalModelArtifacts(cwd, paths, created, args.force);
  }

  console.log(t(lang, "initDone", { cwd }));
  console.log(created.length ? t(lang, "initCreated", { files: created.join(", ") }) : t(lang, "initNoChanges"));
}

function configImport(args) {
  const cwd = targetCwd(args);
  const projectName = args.projectName || basename(cwd);
  const configPath = configuredPath(cwd, configRelPath, "Config path");
  const activeConfigRelPath = findConfigRelPath(cwd);
  const discovery = discoverAdapterProject(cwd, {
    taskIndex: args.taskIndex,
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
      paths.runs,
      paths.mentalModels,
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
  const lang = args.language;
  const context = resolveHarnessContext(cwd);
  const configValidation = configValidationPayload(cwd);
  const required = context.requiredPaths;
  const missing = required.filter((path) => !existsSync(join(cwd, path)));
  const gitRoot = git(args, ["rev-parse", "--show-toplevel"]);
  const status = git(args, ["status", "--short"]);
  const worktrees = git(args, ["worktree", "list", "--porcelain"]);

  console.log(`${t(lang, "doctorProject")}: ${cwd}`);
  console.log(`Harness contract: ${context.contract}`);
  console.log(`Config source: ${context.configSource}`);
  console.log(`Config schema: ${configValidation.ok ? "ok" : "failed"}`);
  for (const error of configValidation.errors) {
    console.log(`Config schema error: ${error}`);
  }
  console.log(`${t(lang, "doctorGitRoot")}: ${gitRoot || t(lang, "doctorNoGit")}`);
  console.log(`${t(lang, "doctorHarnessFiles")}: ${missing.length ? t(lang, "doctorMissing", { files: missing.join(", ") }) : t(lang, "doctorOk")}`);
  if (context.optionalPaths.length) {
    const optionalMissing = context.optionalPaths.filter((path) => !existsSync(join(cwd, path)));
    console.log(`Optional harness paths: ${optionalMissing.length ? `missing ${optionalMissing.join(", ")}` : "ok"}`);
  }
  for (const warning of context.warnings) {
    console.log(`Warning: ${warning}`);
  }
  console.log(`${t(lang, "doctorGitStatus")}: ${status ? t(lang, "doctorDirty") : t(lang, "doctorClean")}`);
  if (status) {
    console.log(status);
  }
  if (worktrees) {
    const count = worktrees.split("\n").filter((line) => line.startsWith("worktree ")).length;
    console.log(`${t(lang, "doctorWorktrees")}: ${count}`);
  }
  if (!configValidation.ok) {
    process.exitCode = 1;
  }
}

const validWorkModes = new Set(["local", "worktree", "ask"]);

function countNonEmptyLines(value) {
  if (!value) {
    return 0;
  }
  return value.split(/\r?\n/).filter((line) => line.trim()).length;
}

function readGitState(args) {
  const root = git(args, ["rev-parse", "--show-toplevel"]);
  const status = root ? git(args, ["status", "--short"]) : "";
  const worktrees = root ? git(args, ["worktree", "list", "--porcelain"]) : "";
  const statusCount = countNonEmptyLines(status);
  const worktreeCount = worktrees
    ? worktrees.split(/\r?\n/).filter((line) => line.startsWith("worktree ")).length
    : 0;

  return {
    isRepo: Boolean(root),
    root,
    dirty: statusCount > 0,
    statusCount,
    worktreeCount
  };
}

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

function recommendWorkMode({ cwd, config, gitState }) {
  const reasons = [];
  let matchedRule = "";

  if (!gitState.isRepo) {
    reasons.push({
      source: "git",
      code: "not_git_repo",
      detail: "not a git repository"
    });
    return {
      contract: config.contract || config.mode || "fixed",
      cwd,
      recommendation: "ask",
      reasons,
      git: gitState,
      config: {
        defaultPolicy: config.defaultPolicy,
        matchedRule
      }
    };
  }

  reasons.push(gitState.dirty
    ? {
      source: "git",
      code: "dirty_checkout",
      detail: `${gitState.statusCount} changed paths`
    }
    : {
      source: "git",
      code: "clean_checkout",
      detail: "0 changed paths"
    });

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
      git: gitState,
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
    git: gitState,
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

  if (reason.code === "dirty_checkout") {
    return zh ? `git status: dirty checkout，${reason.detail}` : `git status: dirty checkout with ${reason.detail}`;
  }
  if (reason.code === "clean_checkout") {
    return zh ? "git status: clean checkout" : "git status: clean checkout";
  }
  if (reason.code === "not_git_repo") {
    return zh ? "git: not a Git repository" : "git: not a Git repository";
  }
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
  const gitState = readGitState(args);
  const recommendation = recommendWorkMode({ cwd, config, gitState });

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
  const statusPath = paths.status || fixedContract.status;
  const adapterPath = context.contract === "adapter" ? paths.adapterDocs : "";
  const specsPath = paths.specs || "";
  const goalsPath = paths.goals || fixedContract.goals;

  return `## Agent Harness

If \`${configPath}\` exists, read it before substantial project work.

- Resolve the harness contract and artifact paths with \`agent-harness config inspect --cwd .\` when the project state is unclear.
${adapterPath ? `- For \`contract: "adapter"\`, read the project adapter at \`${adapterPath}\` before goal, run, or implementation work.\n` : ""}- Read the configured task index at \`${taskIndex}\` and status file at \`${statusPath}\` before choosing or executing tasks.
${specsPath ? `- Read relevant specs under \`${specsPath}\` and goals under \`${goalsPath}\` before implementation.\n` : `- Read relevant goals under \`${goalsPath}\` before implementation.\n`}- For orientation or next-action requests, summarize current status and task state first; do not start implementation unless the user asks.
- Use \`agent-harness doctor --cwd .\`, \`agent-harness orient next --cwd .\`, \`agent-harness goal create --cwd . --task "<task>"\`, and \`agent-harness run prepare --cwd . --goal <goal-file>\` when they fit the task.
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
    const source = goalSourceTask(readFileSync(goalPath, "utf8"));
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
  const status = taskStatus(task);
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
        startPrompt: `Validate existing goal for: ${task.title}`,
        goalCommand: `agent-harness goal validate --cwd . --goal ${shellQuote(existingGoalPath)} && agent-harness run prepare --cwd . --goal ${shellQuote(existingGoalPath)}`
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
  const status = taskStatus(task);
  return ["blocked", "paused", "action-needed"].includes(status);
}

function isDoneTask(task) {
  const status = taskStatus(task);
  return task.done || ["done", "cancelled", "closed"].includes(status);
}

function isInProgressTask(task) {
  const status = taskStatus(task);
  return ["doing", "review", "triage", "watching", "signal"].includes(status);
}

function isReadyTask(task) {
  if (isDoneTask(task) || isBlockedTask(task) || isInProgressTask(task)) {
    return false;
  }
  const status = taskStatus(task);
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
  const taskIndexAbs = taskIndex ? join(cwd, taskIndex) : "";
  const statusAbs = statusPath ? join(cwd, statusPath) : "";
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
  const recommendation = recommendationTask
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

function intakeTaskMatches(tasks, idea) {
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
        score: exact ? 1 : score,
        kind: exact ? "duplicate" : score >= 0.35 ? "related" : ""
      };
    })
    .filter((match) => match.kind)
    .sort((a, b) => b.score - a.score || a.task.line - b.task.line)
    .slice(0, 5);
}

function collectMarkdownFiles(cwd, relPath, limit = 80) {
  const root = relPath ? join(cwd, relPath) : "";
  if (!root || !existsSync(root)) {
    return [];
  }
  const files = [];
  const stack = [root];
  while (stack.length && files.length < limit) {
    const current = stack.pop();
    for (const entry of readdirSync(current, { withFileTypes: true })) {
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
      const content = readFileIfExists(join(cwd, file));
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
  const statusPath = context.paths.status;
  const taskIndexAbs = taskIndex ? join(cwd, taskIndex) : "";
  const statusAbs = statusPath ? join(cwd, statusPath) : "";
  const taskContent = taskIndexAbs && existsSync(taskIndexAbs) ? readFileSync(taskIndexAbs, "utf8") : "";
  const statusContent = statusAbs && existsSync(statusAbs) ? readFileSync(statusAbs, "utf8") : "";
  const tasks = taskContent ? parseTasks(taskContent) : [];
  const taskMatches = intakeTaskMatches(tasks, idea);
  const artifacts = artifactMatches(cwd, context.paths, idea);
  const classification = classifyIntakeIdea({ idea, taskMatches });
  const needsSpec = intakeNeedsSpec(classification);
  const title = sentenceTitle(idea);
  const confirmationNeeded = args.record
    ? "record flag supplied; no implementation will start"
    : "pass --record to append this candidate to the configured task index";

  return {
    cwd,
    contract: context.contract,
    writesFiles: false,
    idea,
    taskIndex,
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
        ...taskMatches.map((match) => `Related task: ${match.task.title}`),
        ...artifacts.map((match) => `Related artifact: ${match.path}`)
      ],
      risks: needsSpec
        ? ["Scope or product direction may be ambiguous."]
        : ["Confirm this belongs in the task index before recording."],
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
      supported: Boolean(taskContent && !isTableTaskIndex(taskContent)),
      path: taskIndex,
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
  const taskIndexAbs = configuredPath(payload.cwd, payload.taskIndex, "Task index path");
  if (!existsSync(taskIndexAbs)) {
    throw new Error(`Task index not found: ${payload.taskIndex}`);
  }
  const content = readFileSync(taskIndexAbs, "utf8");
  if (isTableTaskIndex(content)) {
    throw new Error(`Refusing to record into table-based task index: ${payload.taskIndex}`);
  }
  const nextContent = appendTaskToSection(content, payload.suggested.section, intakeTaskEntry(payload));
  writeFileSync(taskIndexAbs, nextContent);
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

function lines(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);
}

function parseBranchLine(line) {
  const raw = String(line || "").replace(/^##\s*/, "").trim();
  const aheadMatch = raw.match(/\bahead\s+(\d+)/i);
  const behindMatch = raw.match(/\bbehind\s+(\d+)/i);
  const branchPart = raw.replace(/\s+\[.+?\]\s*$/, "");
  const [branch, upstream = ""] = branchPart.includes("...")
    ? branchPart.split("...", 2)
    : [branchPart.replace(/^No commits yet on\s+/i, ""), ""];
  return {
    raw,
    branch: branch || "",
    upstream,
    ahead: aheadMatch ? Number(aheadMatch[1]) : 0,
    behind: behindMatch ? Number(behindMatch[1]) : 0
  };
}

function parseStatusPath(line) {
  const raw = String(line || "");
  const match = raw.match(/^(.{1,2})\s+(.+)$/);
  const pathPart = (match ? match[2] : raw.slice(3)).trim();
  if (!pathPart) {
    return "";
  }
  if (pathPart.includes(" -> ")) {
    return pathPart.split(" -> ").at(-1).trim();
  }
  return pathPart;
}

function parseNameStatus(value) {
  return lines(value).map((line) => {
    const parts = line.split(/\t+/);
    const status = parts[0] || "";
    const path = parts.at(-1) || "";
    return {
      status,
      path
    };
  }).filter((entry) => entry.path);
}

function gitMaintenanceSummary(args) {
  const root = git(args, ["rev-parse", "--show-toplevel"]);
  if (!root) {
    return {
      isRepo: false,
      root: "",
      branch: "",
      upstream: "",
      ahead: 0,
      behind: 0,
      dirty: false,
      changedPathCount: 0,
      changedFiles: [],
      staged: [],
      unstaged: [],
      statusShort: []
    };
  }

  const statusWithBranch = git(args, ["status", "--short", "--branch"]);
  const statusShort = git(args, ["status", "--short"]);
  const statusLines = lines(statusShort);
  const branchLine = lines(statusWithBranch).find((line) => line.startsWith("## ")) || "";
  const branch = parseBranchLine(branchLine);
  const staged = parseNameStatus(git(args, ["diff", "--cached", "--name-status"]));
  const unstaged = parseNameStatus(git(args, ["diff", "--name-status"]));
  const changedFiles = uniqueList(statusLines.map(parseStatusPath));

  return {
    isRepo: true,
    root,
    branch: branch.branch,
    upstream: branch.upstream,
    ahead: branch.ahead,
    behind: branch.behind,
    dirty: statusLines.length > 0,
    changedPathCount: changedFiles.length,
    changedFiles,
    staged,
    unstaged,
    statusShort: statusLines
  };
}

function deliveryStateFromGit(gitState, { completed = false } = {}) {
  if (!gitState.isRepo) {
    return "unknown";
  }
  if (gitState.dirty) {
    return completed ? "validated-local" : "implemented-local";
  }
  if (gitState.ahead > 0) {
    return "committed";
  }
  if (gitState.upstream) {
    return "pushed";
  }
  return completed ? "validated-local" : "implemented-local";
}

function deliveryStateSnapshot(cwd, { completed = false } = {}) {
  const gitState = gitMaintenanceSummary({ cwd });
  const head = gitState.isRepo ? git({ cwd }, ["rev-parse", "--short", "HEAD"]) : "";
  const pushed = gitState.isRepo && gitState.upstream && gitState.ahead === 0;

  return {
    state: deliveryStateFromGit(gitState, { completed }),
    isRepo: gitState.isRepo,
    root: gitState.root,
    branch: gitState.branch,
    upstream: gitState.upstream,
    ahead: gitState.ahead,
    behind: gitState.behind,
    workingTreeDirty: gitState.dirty ? "yes" : "no",
    changedPathCount: gitState.changedPathCount,
    commit: gitState.isRepo ? head || "none" : "none",
    push: pushed ? gitState.upstream : "none",
    review: "none",
    pr: "none",
    integration: "none",
    merge: "none",
    release: "none",
    statusShort: gitState.statusShort
  };
}

function runStartSnapshot(cwd) {
  const state = deliveryStateSnapshot(cwd);
  const status = Array.isArray(state.statusShort) ? state.statusShort : [];
  return {
    startHead: state.isRepo ? git({ cwd }, ["rev-parse", "HEAD"]) || "none" : "none",
    startBranch: state.branch || "none",
    startUpstream: state.upstream || "none",
    startDirtyState: {
      dirty: state.workingTreeDirty,
      changedPathCount: state.changedPathCount,
      statusShort: status,
      digest: createHash("sha256").update(status.join("\n")).digest("hex")
    }
  };
}

function runScopedDeliveryState(cwd, start, { completed = false } = {}) {
  const current = deliveryStateSnapshot(cwd, { completed });
  if (!current.isRepo) return current;
  const currentHead = git({ cwd }, ["rev-parse", "HEAD"]) || "none";
  const branchMatches = Boolean(
    start?.startBranch
    && start.startBranch !== "none"
    && current.branch
    && current.branch !== "none"
    && current.branch === start.startBranch
  );
  const headChanged = Boolean(branchMatches && start?.startHead && start.startHead !== "none" && currentHead !== start.startHead);
  const upstreamMatches = Boolean(
    current.upstream
    && current.upstream !== "none"
    && (!start?.startUpstream || start.startUpstream === "none" || current.upstream === start.startUpstream)
  );
  let state = completed ? "validated-local" : "implemented-local";
  let push = "none";
  if (headChanged) {
    state = "committed";
    if (upstreamMatches && current.ahead === 0) {
      state = "pushed";
      push = current.upstream;
    }
  }
  return {
    ...current,
    state,
    commit: headChanged ? currentHead : "none",
    push,
    runDelta: {
      headChanged,
      branchMatches,
      startBranch: start?.startBranch || "none",
      currentBranch: current.branch || "none",
      startHead: start?.startHead || "none",
      currentHead,
      startDirtyDigest: start?.startDirtyState?.digest || "",
      currentDirtyDigest: createHash("sha256").update((current.statusShort || []).join("\n")).digest("hex")
    }
  };
}

function normalizeDeliveryState(value) {
  const normalizedValue = String(cleanMapValue(value) || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");
  const normalized = normalizedValue.replace(/^target-/, "");
  if (!normalized || normalized === "tbd") {
    return "";
  }
  if (["implemented", "implemented-local", "local"].includes(normalized)) {
    return "implemented-local";
  }
  if (["validated", "validated-local", "review", "local-verified", "verified-local"].includes(normalized)) {
    return "validated-local";
  }
  if (["commit", "committed"].includes(normalized)) {
    return "committed";
  }
  if (["push", "pushed"].includes(normalized)) {
    return "pushed";
  }
  if (["review-open", "review-request", "review-requested", "pr", "pr-open", "pull-request", "pull-request-open", "mr", "mr-open", "merge-request", "merge-request-open", "change", "change-open", "patch-series"].includes(normalized)) {
    return "review-open";
  }
  if (["integrate", "integrated", "integration", "merge", "merged"].includes(normalized)) {
    return "integrated";
  }
  if (["release", "released", "ship", "shipped", "released-shipped", "released/shipped"].includes(normalized)) {
    return "released/shipped";
  }
  return cleanMapValue(value);
}

function deliveryStateRank(state) {
  const normalized = normalizeDeliveryState(state);
  return deliveryStateOrder.indexOf(normalized);
}

function applyDeliveryEvidence(deliveryState, evidence = {}) {
  const review = evidence.reviewUrl || evidence.prUrl || deliveryState.review || deliveryState.pr || "none";
  const integration = evidence.integrationRef || evidence.mergeSha || deliveryState.integration || deliveryState.merge || "none";
  const release = evidence.releaseRef || deliveryState.release || "none";
  let state = deliveryState.state;
  if (!missingEvidence(release)) {
    state = "released/shipped";
  } else if (!missingEvidence(integration)) {
    state = "integrated";
  } else if (!missingEvidence(review)) {
    state = "review-open";
  }

  return {
    ...deliveryState,
    state,
    review,
    pr: review,
    integration,
    merge: integration,
    release
  };
}

function deliveryPolicyFromSection(section) {
  const fields = {};
  for (const line of section.split(/\r?\n/)) {
    const match = line.match(/^-\s+([^:]+):\s*(.*?)\s*$/);
    if (match) {
      fields[match[1].trim().toLowerCase()] = cleanMapValue(match[2]);
    }
  }
  const target = normalizeDeliveryState(fields["target delivery state"] || "validated-local") || "validated-local";
  const reviewAuthorized = fields["review authorized"] || fields["pr authorized"] || "no";
  const integrationAuthorized = fields["integration authorized"] || fields["merge authorized"] || "no";
  return {
    section,
    deliveryIntent: fields["delivery intent"] || "local-validation",
    target,
    commitAuthorized: fields["commit authorized"] || "no",
    pushAuthorized: fields["push authorized"] || "no",
    reviewAuthorized,
    prAuthorized: reviewAuthorized,
    integrationAuthorized,
    mergeAuthorized: integrationAuthorized,
    releaseAuthorized: fields["release authorized"] || "no"
  };
}

function deliveryPolicyDetails(goalContent) {
  const section = extractSection(goalContent, "Delivery State");
  return deliveryPolicyFromSection(section);
}

function deliveryAuthValue(value) {
  return yesNoValue(value);
}

function requiredDeliveryAuthorizations(target) {
  const rank = deliveryStateRank(target);
  const requirements = [];
  if (rank >= deliveryStateRank("committed")) {
    requirements.push(["Commit authorized", "commitAuthorized"]);
  }
  if (rank >= deliveryStateRank("pushed")) {
    requirements.push(["Push authorized", "pushAuthorized"]);
  }
  if (normalizeDeliveryState(target) === "review-open") {
    requirements.push(["Review authorized", "reviewAuthorized"]);
  }
  if (rank >= deliveryStateRank("integrated")) {
    requirements.push(["Integration authorized", "integrationAuthorized"]);
  }
  if (rank >= deliveryStateRank("released/shipped")) {
    requirements.push(["Release authorized", "releaseAuthorized"]);
  }
  return requirements;
}

function deliveryPolicyValidationErrors(policy) {
  const errors = [];
  if (!validDeliveryStates.has(policy.target)) {
    errors.push(`Delivery State target must use one of ${deliveryStateOrder.join(", ")}; found ${policy.target || "(missing)"}.`);
  }
  for (const [label, value] of [
    ["Commit authorized", policy.commitAuthorized],
    ["Push authorized", policy.pushAuthorized],
    ["Review authorized", policy.reviewAuthorized],
    ["Integration authorized", policy.integrationAuthorized],
    ["Release authorized", policy.releaseAuthorized]
  ]) {
    if (value && !deliveryAuthValue(value)) {
      errors.push(`Delivery State ${label} must be yes or no.`);
    }
  }
  for (const [label, key] of requiredDeliveryAuthorizations(policy.target)) {
    if (deliveryAuthValue(policy[key]) !== "yes") {
      errors.push(`Delivery State target ${policy.target} requires ${label}: yes.`);
    }
  }
  return errors;
}

function deliveryTargetErrors(policy, deliveryState) {
  const errors = [];
  const targetRank = deliveryStateRank(policy.target);
  const actualRank = deliveryStateRank(deliveryState.state);
  if (targetRank < 0) {
    errors.push(`Unknown delivery target: ${policy.target || "(missing)"}.`);
    return errors;
  }
  if (!deliveryState.isRepo && targetRank <= deliveryStateRank("validated-local")) {
    return errors;
  }
  if (actualRank < targetRank) {
    errors.push(`Delivery target not reached: target ${policy.target}, actual ${deliveryState.state || "unknown"}.`);
    const auth = requiredDeliveryAuthorizations(policy.target)
      .map(([label, key]) => `${label}: ${policy[key] || "no"}`)
      .join(", ");
    errors.push(`After gates pass, continue the delivery pipeline (${auth || "no extra authorization required"}) and rerun run record with review / integration / release evidence when applicable.`);
  }
  return errors;
}

function readRecentRuns(cwd, runsRelPath, limit = 5) {
  const runsAbs = runsRelPath ? join(cwd, runsRelPath) : "";
  if (!runsAbs || !existsSync(runsAbs)) {
    return [];
  }

  return readdirSync(runsAbs, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
    .reverse()
    .slice(0, limit)
    .map((name) => {
      const runDir = join(runsRelPath, name);
      const statusPath = join(cwd, runDir, "status.json");
      if (!existsSync(statusPath)) {
        return {
          runDir,
          phase: "missing-status",
          goalPath: "",
          updatedAt: "",
          summary: "",
          verificationSummary: ""
        };
      }
      try {
        const status = JSON.parse(readFileSync(statusPath, "utf8"));
        return {
          runDir,
          phase: status.phase || "unknown",
          goalPath: status.goalPath || "",
          updatedAt: status.updatedAt || status.createdAt || "",
          summary: status.summary || "",
          verificationSummary: status.verificationSummary || ""
        };
      } catch (error) {
        return {
          runDir,
          phase: "invalid-status",
          goalPath: "",
          updatedAt: "",
          summary: `Could not parse status.json: ${error.message}`,
          verificationSummary: ""
        };
      }
    });
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

function taskCompletionActions(cwd, tasks, runs, taskIndexContent) {
  if (!taskIndexContent) {
    return [];
  }

  const canRecord = !isTableTaskIndex(taskIndexContent);
  const activeTasks = tasks.filter((task) => !isDoneTask(task));
  const actions = [];
  for (const run of runs) {
    if (run.phase !== "completed" || !run.goalPath) {
      continue;
    }
    const goalPath = resolveProjectPath(cwd, run.goalPath);
    if (!goalPath || !existsSync(goalPath)) {
      continue;
    }
    const source = goalSourceTask(readFileSync(goalPath, "utf8"));
    if (!source.title) {
      continue;
    }
    const match = activeTasks.find((task) => normalizedTaskTitle(task.title) === normalizedTaskTitle(source.title));
    if (!match || actions.some((action) => action.task.line === match.line)) {
      continue;
    }
    actions.push({
      kind: "task-completion",
      action: "move-to-done",
      title: match.title,
      evidence: `completed run ${run.runDir}`,
      canRecord,
      task: match
    });
  }
  return actions;
}

function maintenancePayload(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  const taskIndex = context.paths.taskIndex || context.paths.tasks;
  const statusPath = context.paths.status;
  const runsPath = context.paths.runs;
  const taskIndexAbs = taskIndex ? join(cwd, taskIndex) : "";
  const statusAbs = statusPath ? join(cwd, statusPath) : "";
  const taskIndexContent = taskIndexAbs && existsSync(taskIndexAbs) ? readFileSync(taskIndexAbs, "utf8") : "";
  const statusContent = statusAbs && existsSync(statusAbs) ? readFileSync(statusAbs, "utf8") : "";
  const tasks = taskIndexContent ? parseTasks(taskIndexContent) : [];
  const recentRuns = readRecentRuns(cwd, runsPath);
  const gitSummary = gitMaintenanceSummary(args);
  const completionActions = taskCompletionActions(cwd, tasks, recentRuns, taskIndexContent);
  const actions = [
    {
      kind: "status-snapshot",
      action: "update-status",
      title: "Record maintenance snapshot in configured status file",
      evidence: "task index, current git state, and recent run records",
      canRecord: Boolean(statusPath)
    },
    ...completionActions
  ];

  return {
    cwd,
    contract: context.contract,
    writesFiles: false,
    paths: {
      taskIndex,
      status: statusPath,
      runs: runsPath
    },
    git: gitSummary,
    tasks: {
      exists: Boolean(taskIndexContent),
      tableBased: Boolean(taskIndexContent && isTableTaskIndex(taskIndexContent)),
      total: tasks.length,
      ready: tasks.filter(isReadyTask).map(taskSummary),
      inProgress: tasks.filter(isInProgressTask).map(taskSummary),
      blocked: tasks.filter(isBlockedTask).map(taskSummary),
      done: tasks.filter(isDoneTask).slice(0, 5).map(taskSummary)
    },
    status: {
      exists: Boolean(statusContent),
      focus: statusFocus(statusContent)
    },
    runs: {
      exists: Boolean(runsPath && existsSync(join(cwd, runsPath))),
      recent: recentRuns
    },
    proposed: {
      actions
    },
    record: {
      requested: Boolean(args.record),
      statusWritten: false,
      taskIndexWritten: false,
      taskIndexRefused: false,
      taskIndexRefusalReason: ""
    },
    warnings: context.warnings
  };
}

function formatRunSummary(run) {
  const parts = [
    run.phase,
    run.goalPath ? `goal=${run.goalPath}` : "",
    run.summary ? `summary=${run.summary}` : ""
  ].filter(Boolean);
  return `${run.runDir}${parts.length ? ` (${parts.join(", ")})` : ""}`;
}

function maintenanceSnapshot(payload) {
  const gitSummary = payload.git.isRepo
    ? `${payload.git.branch || "(detached)"}${payload.git.upstream ? `...${payload.git.upstream}` : ""}; ahead=${payload.git.ahead}; behind=${payload.git.behind}; dirty=${payload.git.dirty ? "yes" : "no"}; changedPaths=${payload.git.changedPathCount}`
    : "not a git repository";
  const changedFiles = payload.git.changedFiles.length
    ? payload.git.changedFiles.slice(0, 12).map((file) => `  - ${file}`).join("\n")
    : "  - none detected";
  const runs = payload.runs.recent.length
    ? payload.runs.recent.slice(0, 5).map((run) => `  - ${formatRunSummary(run)}`).join("\n")
    : "  - none detected";
  const actions = payload.proposed.actions.length
    ? payload.proposed.actions.map((action) => `  - ${action.action}: ${action.title || action.evidence}`).join("\n")
    : "  - none";

  return `- Generated: ${new Date().toISOString()}
- Task index: \`${payload.paths.taskIndex || "not configured"}\`
- Status file: \`${payload.paths.status || "not configured"}\`
- Runs: \`${payload.paths.runs || "not configured"}\`
- Git: ${gitSummary}
- Ready tasks: ${payload.tasks.ready.length}
- In-progress tasks: ${payload.tasks.inProgress.length}
- Blocked tasks: ${payload.tasks.blocked.length}
- Recent changed files:
${changedFiles}
- Recent runs:
${runs}
- Proposed sync actions:
${actions}
- Record result: statusWritten=${payload.record.statusWritten ? "yes" : "no"}; taskIndexWritten=${payload.record.taskIndexWritten ? "yes" : "no"}${payload.record.taskIndexRefused ? `; taskIndexRefused=${payload.record.taskIndexRefusalReason}` : ""}
`;
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

function moveTaskToDone(content, task) {
  const sourceLines = content.split(/\r?\n/);
  const range = taskBlockRange(sourceLines, task);
  const block = sourceLines.slice(range.start, range.end);
  if (!block.length || !/^- \[ \]\s+/.test(block[0])) {
    return content;
  }
  block[0] = block[0].replace(/^- \[ \]/, "- [x]");
  const remaining = [
    ...sourceLines.slice(0, range.start),
    ...sourceLines.slice(range.end)
  ].join("\n");
  return appendTaskToSection(remaining, "Done", `${block.join("\n")}\n`);
}

function recordMaintenance(payload) {
  const statusPath = payload.paths.status;
  if (!statusPath) {
    throw new Error("Status path is not configured.");
  }
  const statusAbs = configuredPath(payload.cwd, statusPath, "Status path");
  const statusContent = existsSync(statusAbs) ? readFileSync(statusAbs, "utf8") : "# Project Status\n";

  const taskCompletions = payload.proposed.actions.filter((action) => action.kind === "task-completion");
  if (taskCompletions.length) {
    if (payload.tasks.tableBased) {
      payload.record.taskIndexRefused = true;
      payload.record.taskIndexRefusalReason = "table-based task index";
    } else if (payload.paths.taskIndex) {
      const taskIndexAbs = configuredPath(payload.cwd, payload.paths.taskIndex, "Task index path");
      let taskContent = readFileSync(taskIndexAbs, "utf8");
      for (const action of taskCompletions) {
        taskContent = moveTaskToDone(taskContent, action.task);
      }
      writeFileSync(taskIndexAbs, taskContent);
      payload.record.taskIndexWritten = true;
      payload.writesFiles = true;
    }
  }

  payload.record.statusWritten = true;
  payload.writesFiles = true;
  writeFileSync(statusAbs, replaceMarkdownSection(statusContent, "Maintenance Snapshot", maintenanceSnapshot(payload)));
}

function maintainTasks(args) {
  const payload = maintenancePayload(args);
  if (args.record) {
    recordMaintenance(payload);
  }

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log("Agent Harness task maintenance");
  console.log(`Task index: ${payload.paths.taskIndex || "not configured"}`);
  console.log(`Status file: ${payload.paths.status || "not configured"}`);
  console.log(`Runs: ${payload.paths.runs || "not configured"}`);
  console.log(`Writes files: ${payload.writesFiles ? "yes" : "no"}`);
  console.log("");
  console.log("Git:");
  if (payload.git.isRepo) {
    console.log(`- ${payload.git.branch || "(detached)"}${payload.git.upstream ? `...${payload.git.upstream}` : ""}; ahead=${payload.git.ahead}; behind=${payload.git.behind}; dirty=${payload.git.dirty ? "yes" : "no"}; changed paths=${payload.git.changedPathCount}`);
  } else {
    console.log("- not a git repository");
  }
  console.log("Recent runs:");
  if (payload.runs.recent.length) {
    console.log(payload.runs.recent.map((run) => `- ${formatRunSummary(run)}`).join("\n"));
  } else {
    console.log("- none detected");
  }
  console.log("Proposed sync actions:");
  if (payload.proposed.actions.length) {
    console.log(payload.proposed.actions.map((action) => `- ${action.action}: ${action.title || action.evidence}`).join("\n"));
  } else {
    console.log("- none");
  }
  console.log("Record:");
  console.log(`- requested=${payload.record.requested ? "yes" : "no"}; statusWritten=${payload.record.statusWritten ? "yes" : "no"}; taskIndexWritten=${payload.record.taskIndexWritten ? "yes" : "no"}`);
  if (payload.record.taskIndexRefused) {
    console.log(`- taskIndexRefused=${payload.record.taskIndexRefusalReason}`);
  }
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

function adapterRequiredCompletionGates(context) {
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

function buildGoalContent({ task, context, specPath, workMode, allowNoSpec = false }) {
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
  const statusLine = hasConfirmedSpec
    ? "Ready for execution from confirmed spec."
    : allowNoSpec
      ? "Ready for execution from accepted scope without a separate spec."
      : "Draft goal handoff; execute only after the spec is confirmed by the user.";
  const docValue = detailValue(task, "Doc");
  const linkedDocs = extractLinkedDocPaths(docValue);
  const selectedWorkMode = workMode || "ask";
  const currentDeliveryState = deliveryStateSnapshot(context.cwd);
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
  const requiredGates = adapterRequiredCompletionGates(context);
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
${specPolicyLine}Status: ${statusLine}

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
- Ordinary clear change/build requests use Codex directly. This durable Goal uses only \`gate-only\` or \`implementer\` roles.
- ${boundedDirectExecutionGuidance} Once this durable Goal exists, do not downgrade its checklist, gate, or state-sync obligations to the bounded tier.

## Conversation Route

Use \`current-thread\`.

- \`current-thread\`: the current conversation owns execution in the locked cwd.
- \`slot-thread\`: hand off to a dedicated slot conversation before editing.
- \`remote-control-worktree\`: the current conversation may control a different locked worktree only when explicitly approved.

## Execution Context Lock

- Conversation lane: \`current-thread\`
- Controller thread: \`current-thread\`
- Execution cwd: \`${context.cwd}\`
- Execution branch: \`${currentDeliveryState.branch || "TBD"}\`
- Execution slot: \`N/A\`
- Remote-control worktree: \`no\`

## Delivery State

- Delivery intent: \`local-validation\`
- Target delivery state: \`validated-local\`
- Commit authorized: \`no\`
- Push authorized: \`no\`
- Review authorized: \`no\`
- Integration authorized: \`no\`
- Release authorized: \`no\`

Generated Goals are local-only by default. Commit, push, review, integration,
release, and ship targets require fresh explicit authorization in the current
conversation or accepted source spec; never infer them from stale status text.

The locked Execution branch records where implementation happens. It is not
automatically the integration target, and Harness core does not assume a branch
named \`main\`.

## Execution DAG

Use \`run prepare\` to generate \`dag.json\`, \`dag.md\`, and per-node
\`agents/<node>/prompt.md\` files. The Codex runtime owns worker selection,
delegation, concurrency, and cancellation; Harness records ownership and evidence.

## Context Focus Routing

${contextFocusRoutingGuidance} ${executeContextFocusGuidance}

## Cybernetic Stability

${cyberneticStabilityGuidance}

${stageCompletionMapSection}
## Spec Acceptance Checklist

Add checklist items here when the referenced spec has concrete acceptance
criteria, required page/workflow coverage, or product-quality gates. Candidate
implementation evidence is not accepted completion until relevant checklist
items are satisfied.

## Required Gate Evidence

${requiredGateLines}

## Scope

- ${acceptance}

## Non-Goals

- Do not release, deploy, publish, or launch workers outside the run packet DAG unless separately requested.
- Do not execute delivery steps above the Delivery State policy.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

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
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
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
    workMode: args.workMode,
    allowNoSpec: Boolean(args.allowNoSpec)
  });

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

function goalTitle(content, goalPath) {
  const match = content.match(/^#\s+(.+?)\s*$/m);
  return match ? match[1].trim().replace(/^Goal:\s*/i, "") : basename(goalPath, extname(goalPath));
}

function extractStatusLine(content) {
  const match = content.match(/^Status:\s+(.+?)\s*$/m);
  return match ? match[1].trim() : "";
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
  const requiredLabels = stageCompletionRequiredLabels(goalContent, specContent);
  return {
    required: stageCompletionMapRequired(goalContent, specContent, requiredLabels),
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
  return !value || /^(tbd|n\/a|none|not recorded|-|\.\.\.)$/i.test(String(value).trim());
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

  if (!conversationRoute) {
    errors.push("Worktree goals require a Conversation Route section.");
  } else if (!validConversationRoutes.has(conversationRoute)) {
    errors.push(`Conversation Route must use one of current-thread, slot-thread, or remote-control-worktree; found ${conversationRoute}.`);
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
  if (conversationRoute === "remote-control-worktree" && remoteControl !== "yes") {
    errors.push("Conversation Route remote-control-worktree requires Execution Context Lock Remote-control worktree: yes.");
  }
  if ((conversationRoute === "current-thread" || conversationRoute === "slot-thread") && remoteControl === "yes") {
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
    required: batchSignals(goalContent) || batchSignals(specContent),
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
  const deliveryPolicy = deliveryPolicyDetails(content);
  const acceptanceMap = acceptanceMapDetails(content, specContent);
  const stageCompletionMap = stageCompletionMapDetails(content, specContent);
  const specChecklist = specAcceptanceChecklistDetails(content, specContent);
  const gateEvidence = gateEvidenceDetails(content, specContent);

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
    deliveryPolicy,
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
    sections: {
      sourceTask: Boolean(extractSection(content, "Source Task")),
      readFirst: Boolean(extractSection(content, "Read First")),
      workModeRecommendation: Boolean(extractSection(content, "Work Mode Recommendation")),
      executionRole: Boolean(extractSection(content, "Execution Role")),
      conversationRoute: Boolean(extractSection(content, "Conversation Route")),
      executionContextLock: Boolean(extractSection(content, "Execution Context Lock")),
      deliveryState: Boolean(extractSection(content, "Delivery State")),
      sourceTaskAcceptanceMap: Boolean(extractSection(content, "Source Task Acceptance Map")),
      milestoneCompletionMap: Boolean(extractSection(content, "Milestone Completion Map")),
      stageCompletionMap: Boolean(extractSection(content, "Milestone Completion Map") || extractSection(content, "Stage Completion Map")),
      specAcceptanceChecklist: Boolean(extractSection(content, "Spec Acceptance Checklist")),
      requiredGateEvidence: Boolean(extractSection(content, "Required Gate Evidence")),
      scope: Boolean(extractSection(content, "Scope")),
      nonGoals: Boolean(extractSection(content, "Non-Goals")),
      verification: Boolean(extractSection(content, "Verification")),
      completionConditions: Boolean(extractSection(content, "Completion Conditions")),
      pauseConditions: Boolean(extractSection(content, "Pause Conditions"))
    }
  };
}

function validateGoal(cwd, goalPath) {
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
    ["Delivery State", "deliveryState"],
    ["Scope", "scope"],
    ["Non-Goals", "nonGoals"],
    ["Verification", "verification"],
    ["Completion Conditions", "completionConditions"],
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
  errors.push(...deliveryPolicyValidationErrors(metadata.deliveryPolicy));

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
  const requiredGates = adapterRequiredCompletionGates(context);
  const gateEvidence = gateEvidenceDetails(content, specContent);
  if (requiredGates.length && !gateEvidence.section) {
    errors.push(`Required Gate Evidence must include adapter-required gate(s): ${requiredGates.join(", ")}.`);
  } else {
    errors.push(...evidenceItemValidationErrors(gateEvidence, {
      sectionTitle: "Required Gate Evidence",
      itemTitle: "Gate",
      requiredLabels: requiredGates
    }));
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

function extractWorkMode(goalContent, cwd) {
  const section = extractSection(goalContent, "Work Mode Recommendation");
  const match = section.match(/Use\s+`(local|worktree|ask)`/i);
  if (match) {
    return match[1].toLowerCase();
  }

  const config = loadProjectConfig(cwd);
  if (config.worktree?.defaultPolicy && config.workMode?.defaultPolicy
      && config.worktree.defaultPolicy !== config.workMode.defaultPolicy) {
    throw new Error(`Conflicting config aliases: worktree.defaultPolicy=${config.worktree.defaultPolicy} and workMode.defaultPolicy=${config.workMode.defaultPolicy}.`);
  }
  return config.worktree?.defaultPolicy || config.workMode?.defaultPolicy || "ask";
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

function buildDagNode({ id, label, mode, dependencies = [], ownership, expectedOutput, stopConditions }) {
  return {
    id,
    label,
    mode,
    dependencies,
    ownership,
    expectedOutput,
    stopConditions,
    prompt: `agents/${id}/prompt.md`,
    status: `agents/${id}/status.json`,
    result: `agents/${id}/result.md`
  };
}

function defaultDagNodes(taskSize, executionRole) {
  if (taskSize === "ask") {
    return [
      buildDagNode({
        id: "controller-decision",
        label: "Controller Decision",
        mode: "gate-only",
        ownership: "scope, product direction, credentials, destructive actions, and file ownership decision",
        expectedOutput: "decision request or approved execution route",
        stopConditions: "any unresolved cost, risk, product, production, or ownership decision"
      })
    ];
  }

  if (taskSize === "small") {
    if (executionRole === "gate-only") {
      return [
        buildDagNode({
          id: "worker",
          label: "Worker Subagent",
          mode: "write",
          ownership: "the accepted goal scope in an isolated worker subagent; the controller remains gate-only",
          expectedOutput: "focused patch, verification summary, changed files, and state-sync notes for controller review",
          stopConditions: "scope growth, unclear ownership, credentials, destructive commands, production access, or missing verification"
        })
      ];
    }
    return [
      buildDagNode({
        id: "main-agent",
        label: "Main Agent",
        mode: "implementer",
        ownership: "the accepted goal scope in the current foreground context",
        expectedOutput: "focused patch, verification summary, and state-sync notes",
        stopConditions: "scope growth, unclear ownership, credentials, destructive commands, or production access"
      })
    ];
  }

  if (taskSize === "medium") {
    return [
      buildDagNode({
        id: "explorer",
        label: "Explorer",
        mode: "read-only",
        ownership: "goal, spec, relevant docs, and the smallest source-file map needed for implementation",
        expectedOutput: "implementation map, risks, and exact file ownership recommendation",
        stopConditions: "spec conflict, unclear product direction, or file ownership overlap"
      }),
      buildDagNode({
        id: "worker",
        label: "Worker",
        mode: "write",
        dependencies: ["explorer"],
        ownership: "files assigned by the explorer; avoid unrelated refactors",
        expectedOutput: "focused patch plus notes on behavior changes",
        stopConditions: "credentials, destructive commands, daemon behavior, or broad contract changes outside the goal"
      }),
      buildDagNode({
        id: "verification",
        label: "Verification",
        mode: "read/execute",
        dependencies: ["worker"],
        ownership: "deterministic validation commands, run artifacts, and residual-risk reporting",
        expectedOutput: "pass/fail summary, command evidence, and unresolved risks",
        stopConditions: "failing verification that needs a product or scope decision"
      })
    ];
  }

  return [
    buildDagNode({
      id: "explorer",
      label: "Explorer",
      mode: "read-only",
      ownership: "goal, spec, architecture docs, dependency map, and file ownership plan",
      expectedOutput: "non-overlapping worker boundaries and merge responsibility",
      stopConditions: "unclear merge responsibility, conflicting instructions, or overlapping ownership"
    }),
    buildDagNode({
      id: "cli-contract-worker",
      label: "CLI/Contract Worker",
      mode: "write",
      dependencies: ["explorer"],
      ownership: "CLI scripts, schemas, deterministic file contracts, and tests for those surfaces",
      expectedOutput: "focused implementation patch and machine-readable contract notes",
      stopConditions: "contract migration, daemon behavior, direct Codex execution, or hidden UI automation"
    }),
    buildDagNode({
      id: "docs-skill-worker",
      label: "Docs/Skill Worker",
      mode: "write",
      dependencies: ["explorer"],
      ownership: "README, docs, templates, and skill instructions",
      expectedOutput: "documentation and skill guidance that match implemented behavior",
      stopConditions: "downstream-project-specific assumptions or language/product direction questions"
    }),
    buildDagNode({
      id: "verification",
      label: "Verification",
      mode: "read/execute",
      dependencies: ["cli-contract-worker", "docs-skill-worker"],
      ownership: "validation commands, temporary-project checks, and run packet inspection",
      expectedOutput: "pass/fail summary, exact follow-up tasks, and residual risks",
      stopConditions: "failing verification that requires scope expansion"
    })
  ];
}

function dagEdges(nodes) {
  const edges = [];
  for (const node of nodes) {
    for (const dependency of node.dependencies || []) {
      edges.push({ from: dependency, to: node.id });
    }
  }
  return edges;
}

function dagParallelLayers(nodes) {
  const remaining = new Map(nodes.map((node) => [node.id, new Set(node.dependencies || [])]));
  const completed = new Set();
  const layers = [];

  while (remaining.size) {
    const ready = [...remaining.entries()]
      .filter(([, dependencies]) => [...dependencies].every((dependency) => completed.has(dependency)))
      .map(([id]) => id)
      .sort();
    if (!ready.length) {
      return [];
    }
    layers.push(ready);
    for (const id of ready) {
      remaining.delete(id);
      completed.add(id);
    }
  }

  return layers;
}

function buildExecutionDag({ cwd, goalPath, taskSize, workMode, executionRole, communication }) {
  const nodes = defaultDagNodes(taskSize, executionRole);
  return {
    version: 1,
    goalPath: displayPath(cwd, goalPath),
    taskSize,
    workMode,
    executionRole,
    communication,
    enforcement: taskSize === "medium" || taskSize === "large" ? "required-before-run-completion" : "advisory",
    launchPolicy: "runtime-dispatched",
    runtimeOwnership: "Codex owns scheduling, delegation, concurrency, cancellation, and model selection; Harness records dependencies, ownership, verification, and candidate evidence",
    parallelSafety: {
      requirement: "parallel writers require separate locked worktrees/cwds; otherwise concurrent nodes must be read-only or have proven non-overlapping file ownership"
    },
    nodes,
    edges: dagEdges(nodes),
    parallelLayers: dagParallelLayers(nodes)
  };
}

function nodeStatusPath(runDir, node) {
  return artifactPath(runDir, node.status, `DAG node '${node.id}' status`);
}

function readNodeStatus(runDir, node) {
  const statusPath = nodeStatusPath(runDir, node);
  if (!existsSync(statusPath)) {
    return {
      node: node.id,
      phase: "prepared"
    };
  }
  return JSON.parse(readFileSync(statusPath, "utf8"));
}

function executionDagSnapshot(dag, runDir) {
  const nodeStatuses = {};
  const completed = [];
  const blocked = [];
  const running = [];
  const ready = [];
  const waiting = [];

  for (const node of dag.nodes) {
    const status = readNodeStatus(runDir, node);
    const phase = status.phase || "prepared";
    nodeStatuses[node.id] = {
      phase,
      ownership: node.ownership || "",
      verification: status.verificationSummary || "",
      candidateEvidence: status.result || node.result || "",
      thread: status.thread || "",
      surface: status.surface || "",
      isolationEvidence: status.isolationEvidence || ""
    };
    if (phase === "completed") {
      completed.push(node.id);
    } else if (phase === "blocked") {
      blocked.push(node.id);
    } else if (phase === "running") {
      running.push(node.id);
    }
  }

  const completedSet = new Set(completed);
  const blockedSet = new Set(blocked);
  for (const node of dag.nodes) {
    const phase = nodeStatuses[node.id].phase;
    if (phase !== "prepared") {
      continue;
    }
    const dependencies = node.dependencies || [];
    const hasBlockedDependency = dependencies.some((dependency) => blockedSet.has(dependency));
    const dependenciesComplete = dependencies.every((dependency) => completedSet.has(dependency));
    if (dependenciesComplete && !hasBlockedDependency) {
      ready.push(node.id);
    } else {
      waiting.push(node.id);
    }
  }

  return {
    version: dag.version,
    dag: "dag.json",
    agentsDir: "agents",
    enforcement: dag.enforcement,
    enforced: dag.enforcement === "required-before-run-completion",
    communication: dag.communication || commentaryPolicyDetails(),
    launchPolicy: dag.launchPolicy,
    runtimeOwnership: dag.runtimeOwnership,
    parallelSafety: dag.parallelSafety || {
      requirement: "record explicit isolation evidence before parallel launch"
    },
    nodeCount: dag.nodes.length,
    parallelLayers: dag.parallelLayers,
    readyNodes: ready,
    runningNodes: running,
    waitingNodes: waiting,
    completedNodes: completed,
    blockedNodes: blocked,
    allNodesCompleted: completed.length === dag.nodes.length,
    nodeStatus: nodeStatuses
  };
}

function readExecutionDag(runDir) {
  const dagPath = artifactPath(runDir, "dag.json", "DAG path");
  if (!existsSync(dagPath)) {
    return null;
  }
  const dag = JSON.parse(readFileSync(dagPath, "utf8"));
  if (!Array.isArray(dag.nodes)) throw new Error("DAG nodes must be an array.");
  for (const node of dag.nodes) {
    if (!node || typeof node.id !== "string" || !node.id) throw new Error("Every DAG node requires an id.");
    artifactPath(runDir, node.prompt, `DAG node '${node.id}' prompt`);
    artifactPath(runDir, node.status, `DAG node '${node.id}' status`);
    artifactPath(runDir, node.result, `DAG node '${node.id}' result`);
  }
  return dag;
}

function formatNodeList(values) {
  return values.length ? values.map((value) => `\`${value}\``).join(", ") : "`none`";
}

function buildDagMarkdown({ cwd, runDir, dag }) {
  const relRunDir = displayPath(cwd, runDir);
  const nodeRows = dag.nodes
    .map((node) => `| \`${node.id}\` | ${node.mode} | ${formatNodeList(node.dependencies || [])} | \`${node.prompt}\` |`)
    .join("\n");
  const layers = dag.parallelLayers
    .map((layer, index) => `${index + 1}. ${formatNodeList(layer)}`)
    .join("\n");

  return `# Execution DAG

Run: \`${relRunDir}\`
Launch policy: \`${dag.launchPolicy}\`
Enforcement: \`${dag.enforcement}\`

## Runtime Ownership

- Commentary policy: \`${dag.communication.commentary}\`
- Report cadence: \`${dag.communication.reportCadence}\`
- Notify on: ${dag.communication.notifyOn}
- Runtime: ${dag.runtimeOwnership}
- Parallel safety: ${dag.parallelSafety.requirement}
- Degraded provenance: ${degradedExecutionProvenanceGuidance}
- Cancellation boundary: ${controllerCancellationBoundaryGuidance}

## Nodes

| Node | Mode | Depends on | Prompt |
| --- | --- | --- | --- |
${nodeRows}

## Parallel Layers

${layers || "No valid layers; inspect `dag.json` before execution."}

## Controller Rules

- Dispatch only nodes listed as ready by \`run status --json\`; the runtime owns scheduling and delegation.
- Concurrent writers require recorded isolation evidence: separate locked
  worktrees/cwds or proven non-overlapping ownership.
- Use \`agent-harness run node record\` for each worker result before launching dependent nodes.
- Read \`plugins/agent-harness/references/worker-runner-contract.md\` before launching or accepting worker output.
- Treat worker output as candidate evidence until the controller validates scope, verification, State Sync Notes, and required gates.
- Do not present runtime cancellation or supersession as accepted evidence; unresolved or late output remains candidate evidence.
`;
}

function buildAgentPromptMarkdown({ cwd, runDir, goalPath, dag, node }) {
  const relRunDir = displayPath(cwd, runDir);
  const relGoal = displayPath(cwd, goalPath);
  const dependencies = node.dependencies?.length ? node.dependencies.join(", ") : "none";

  return `# Agent Node Prompt: ${node.label}

Run: \`${relRunDir}\`
Goal: \`${relGoal}\`
DAG node: \`${node.id}\`
Depends on: \`${dependencies}\`
Mode: \`${node.mode}\`
Commentary policy: \`${dag.communication.commentary}\`

You are an execution worker for one DAG node, not the controller thread.
Your output is candidate evidence only. The controller is the only lane that
may accept state, update accepted Goal, Task, status, run, or gate records, or mark work
complete.

## Read First

1. \`${relGoal}\`
2. \`${relRunDir}/run.md\`
3. \`${relRunDir}/dag.md\`
4. \`${relRunDir}/prompt.md\`
5. \`plugins/agent-harness/references/worker-runner-contract.md\`
6. \`plugins/agent-harness/templates/worker-prompt.md\`

## Ownership

${node.ownership}

## Expected Output

${node.expectedOutput}

## Stop Conditions

${node.stopConditions}

## Context Focus

- ${contextFocusRoutingGuidance}
- ${executeContextFocusGuidance}

## Runtime Policy

- Commentary: ${dag.communication.guidance}
- Report cadence: \`${dag.communication.reportCadence}\`
- Notify on: ${dag.communication.notifyOn}
- Worker selection, delegation, concurrency, cancellation, and model selection belong to the Codex runtime.
- Concurrent writers require a separate locked worktree/cwd or recorded proof of non-overlapping ownership.
- ${degradedExecutionProvenanceGuidance}
- ${controllerCancellationBoundaryGuidance}
- ${boundedStatusSnapshotGuidance}
- Do not launch dependent nodes yourself.
- Do not update accepted Goal, Task, status, run, gate, integration, release, or ship state.
- Do not mark work complete; return candidate evidence for controller acceptance.
- Return State Sync Notes as part of Goal/Task Done: name the Goal, Task, status, or run records that should change, the suggested state, and the evidence. These notes remain candidate evidence until the accepted-state owner records them.
- Do not release, deploy, publish, start a daemon, use credentials, use paid APIs, touch production, perform destructive operations, or execute delivery steps above the Delivery State policy unless the goal and controller explicitly authorize it.

## Return Contract

Return an Execution Result Packet:

\`\`\`text
Execution Result Packet

Goal:
Thread:
Node: ${node.id}
Status:
State change:
Changed files:
Summary:
Validation:
Known risks:
State Sync Notes:
Need user:
Remaining:
Needs review:
Commit:
Delivery state:
Target delivery state:
Working tree dirty:
Push:
Review:
Integration:
Release:
Controller notified:
Worktree:
Base commit:
Head commit:
Commit status:
Actual model:
Actual reasoning effort:
Degraded provenance:
Gate self-check:
Deferred items:
\`\`\`
`;
}

function writeExecutionDagArtifacts({ cwd, runDir, goalPath, dag, createdAt }) {
  writeFileSync(artifactPath(runDir, "dag.json", "DAG path"), `${JSON.stringify(dag, null, 2)}\n`);
  writeFileSync(artifactPath(runDir, "dag.md", "DAG documentation path"), buildDagMarkdown({ cwd, runDir, dag }));

  for (const node of dag.nodes) {
    const agentDir = artifactPath(runDir, join("agents", node.id), `DAG node '${node.id}' directory`);
    mkdirSync(agentDir, { recursive: true });
    writeFileSync(artifactPath(runDir, node.prompt, `DAG node '${node.id}' prompt`), buildAgentPromptMarkdown({ cwd, runDir, goalPath, dag, node }));
    writeFileSync(nodeStatusPath(runDir, node), `${JSON.stringify({
      node: node.id,
      label: node.label,
      phase: "prepared",
      createdAt,
      updatedAt: createdAt,
      dependencies: node.dependencies || [],
      mode: node.mode,
      prompt: node.prompt,
      result: node.result
    }, null, 2)}\n`);
  }
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

function buildRunMarkdown({
  context,
  createdAt,
  cwd,
  goalPath,
  goalContent,
  runDir,
  taskSize,
  workMode,
  executionRole,
  conversationRoute,
  executionContextLock,
  deliveryState,
  startHead,
  startBranch,
  startUpstream,
  startDirtyState,
  deliveryPolicy,
  acceptanceMap,
  stageCompletionMap,
  specChecklist,
  gateEvidence,
  requiredGates
}) {
  const relGoal = displayPath(cwd, goalPath);
  const relRunDir = displayPath(cwd, runDir);
  const stateSyncPathList = stateSyncPaths(context);
  const adapterPath = context.paths.adapterDocs || "";
  const adapterRequirements = adapterRequirementLists(context);
  const spec = extractInlinePath(goalContent, "Spec") || "Not specified";
  const specPolicy = extractSpecPolicyRaw(goalContent);
  const specDisplay = missingSpecValue(spec) && specPolicy === "allow-no-spec" ? "none (allow-no-spec)" : spec;
  const specCheckpoint = missingSpecValue(spec) && specPolicy === "allow-no-spec"
    ? `Read \`${relGoal}\`; no separate spec is declared, so the goal's Scope, Non-Goals, Verification, Completion Conditions, and Pause Conditions are authoritative.`
    : `Read \`${relGoal}\` and its referenced spec before editing.`;
  const sourceTask = extractSection(goalContent, "Source Task") || "Not specified";
  const verification = extractSection(goalContent, "Verification") || "No explicit verification section was found in the goal.";
  const adapterRequirementLines = context.mode === "adapter"
    ? [
      adapterPath ? `Read \`${adapterPath}\` before editing.` : "",
      "Apply project adapter boundaries for credentials, paid calls, production, Admin CLI, DB, destructive actions, review requests, integration, deploys, and releases.",
      ...adapterRequirements.preflight.map((item) => `Preflight: ${item}`),
      ...adapterRequirements.stateSync.map((item) => `State sync: ${item}`)
    ].filter(Boolean)
    : [];

  return `# Agent Harness Run

Created: ${createdAt}
Phase: prepared
Goal: \`${relGoal}\`
Spec: \`${specDisplay}\`
Run directory: \`${relRunDir}\`
Harness contract: \`${context.contract}\`
Commentary policy: \`${context.communication.commentary}\` (\`${context.communication.source}\`)
Report cadence: \`${context.communication.reportCadence}\`
Notify on: ${context.communication.notifyOn}
Work mode: \`${workMode}\`
Execution role: \`${executionRole}\`
Conversation route: \`${conversationRoute || "not-recorded"}\`
Conversation lane: \`${executionContextLock.conversationLane || "not-recorded"}\`
Controller thread: \`${executionContextLock.controllerThread || "not-recorded"}\`
Execution cwd: \`${executionContextLock.executionCwd || cwd}\`
Execution branch: \`${executionContextLock.executionBranch || deliveryState.branch || "not-recorded"}\`
Execution slot: \`${executionContextLock.executionSlot || "not-recorded"}\`
Remote-control worktree: \`${executionContextLock.remoteControlWorktree || "not-recorded"}\`
Task size: \`${taskSize}\`
Delivery state: \`${deliveryState.state}\`
Start HEAD: \`${startHead || "none"}\`
Start branch: \`${startBranch || "none"}\`
Start upstream: \`${startUpstream || "none"}\`
Start dirty digest: \`${startDirtyState?.digest || "none"}\`
Working tree dirty: \`${deliveryState.workingTreeDirty}\`
Commit: \`${deliveryState.commit}\`
Push: \`${deliveryState.push}\`
Review: \`${deliveryState.review || deliveryState.pr}\`
Integration: \`${deliveryState.integration || deliveryState.merge}\`
Release: \`${deliveryState.release}\`
Delivery intent: \`${deliveryPolicy.deliveryIntent}\`
Target delivery state: \`${deliveryPolicy.target}\`
Commit authorized: \`${deliveryPolicy.commitAuthorized}\`
Push authorized: \`${deliveryPolicy.pushAuthorized}\`
Review authorized: \`${deliveryPolicy.reviewAuthorized}\`
Integration authorized: \`${deliveryPolicy.integrationAuthorized}\`
Release authorized: \`${deliveryPolicy.releaseAuthorized}\`
Acceptance map required: \`${acceptanceMap.required ? "yes" : "no"}\`
Acceptance map items: \`${acceptanceMap.items.length}\`
Milestone completion map required: \`${stageCompletionMap.required ? "yes" : "no"}\`
Milestone completion map items: \`${stageCompletionMap.items.length}\`
Milestone completion required items: \`${stageCompletionMap.requiredLabels.length ? stageCompletionMap.requiredLabels.join(", ") : "none"}\`
Spec checklist items: \`${specChecklist.items.length}\`
Required gates: \`${requiredGates.length ? requiredGates.join(", ") : "none"}\`
Required gate evidence items: \`${gateEvidence.items.length}\`

## Source Task

${sourceTask}

## Manual Checkpoints

1. ${specCheckpoint}
2. Confirm the goal's Scope, Non-Goals, Completion Conditions, and Pause Conditions still apply.
3. Confirm the execution role. In \`gate-only\`, cite implementer output and gate evidence before accepting completion.
4. Do not bypass this prepared durable Run with ordinary direct execution.
5. ${contextFocusRoutingGuidance} ${executeContextFocusGuidance}
6. Apply the configured Commentary Policy: ${context.communication.guidance} Report cadence: \`${context.communication.reportCadence}\`. Notify on: ${context.communication.notifyOn}.
7. ${cyberneticStabilityGuidance}
8. ${degradedExecutionProvenanceGuidance}
9. ${controllerCancellationBoundaryGuidance}
10. Confirm the active conversation route and current \`pwd\` / branch match the Execution Context Lock before editing.
11. If the route is \`remote-control-worktree\`, use the locked execution cwd explicitly and do not patch the control lane.
12. If an acceptance map is required, update every map item with concrete evidence and \`Status: satisfied\` before recording a completed run.
13. If a milestone completion map is required, update every milestone item with concrete evidence and \`Status: satisfied\` before recording a completed run.
14. If the goal has \`Spec Acceptance Checklist\` items, update required items with concrete evidence and \`Status: satisfied\` before recording a completed run.
15. If adapter-required gates exist, update \`Required Gate Evidence\` with concrete evidence and \`Status: satisfied\` before recording a completed run.
16. Use \`dag.json\` and \`dag.md\` as the controller-gated execution order. Launch only ready nodes and default to sequential execution; parallel workers require recorded isolation evidence.
17. Give ready node packets to the Codex runtime and record ownership, verification, and candidate evidence.
18. Record each worker result with \`agent-harness run node record\` before launching dependent nodes.
19. Run the verification commands from the goal.
20. Treat State Sync Notes as part of Goal/Task Done. Every executor must name the Goal, Task, status, or run records that should change, the suggested state, and the evidence; accepted-state writes still belong only to the authorized accepted-state owner.
21. ${boundedStatusSnapshotGuidance}
22. Record delivery state before closeout. If actual delivery state is below target, continue the authorized delivery pipeline instead of closing the run.
    ${localDeliveryCeilingGuidance}
    ${runScopedDeliveryGuidance}
23. Close out with explicit \`Need user\` and \`Remaining\` values. Use \`Need user: None\` and \`Remaining: None\` when no true pause trigger or follow-up remains; do not ask broad confirmation questions.
24. Record any command output summaries or follow-ups under this run directory.
25. Update configured state records (${formatInlinePathList(stateSyncPathList)}) after completion when the project adapter requires state sync.

${adapterRequirementLines.length ? `## Project Adapter Requirements\n\n${formatBulletList(adapterRequirementLines)}\n\n` : ""}
## Verification

${verification}

## Boundaries

- This prepared run packet does not start Codex, create a daemon, push, deploy, publish, open a review request, or integrate changes by itself.
- Completion wording must not imply pushed, review-open, integrated, released, shipped, or deployed unless the delivery state records that evidence.
- A completed run must reach its target delivery state. Use review / integration / release evidence fields when Git alone cannot prove the target.
- Level 0 Fast Path can skip spec/goal/run/worker ceremony only for tiny low-risk local reversible work when no existing Harness Goal/Run or adapter-required gate requires state sync; verification, Delivery State, \`Need user\`, and \`Remaining\` still apply.
- ${boundedDirectExecutionGuidance} This prepared Run remains authoritative.
- Cybernetic stability closeout must identify the target, observed state, gap closed, remaining gap, feedback quality, and any stability/saturation pause trigger.
- The packet provides dependencies and evidence boundaries, not a scheduler or worker-selection policy.
- Stop if the goal conflicts with repository instructions, production constraints, or newer user instructions.
`;
}

function buildPromptMarkdown({ context, cwd, goalPath, goalContent }) {
  const relGoal = displayPath(cwd, goalPath);
  const spec = extractInlinePath(goalContent, "Spec") || "the spec referenced by the goal";
  const specPolicy = extractSpecPolicyRaw(goalContent);
  const readGoalInstruction = missingSpecValue(spec) && specPolicy === "allow-no-spec"
    ? `Read \`${relGoal}\` before making edits; this goal uses \`Spec Policy: allow-no-spec\`, so its Scope, Non-Goals, Verification, Completion Conditions, and Pause Conditions are authoritative.`
    : `Read \`${relGoal}\` and \`${spec}\` before making edits.`;
  const stateSyncPathList = stateSyncPaths(context);
  const adapterPath = context.paths.adapterDocs || "";
  const executionRole = extractGoalExecutionRoleRaw(goalContent) || "missing";
  const conversationRoute = extractConversationRouteRaw(goalContent) || "not-recorded";
  const executionContextLock = executionContextLockDetails(goalContent);
  const deliveryPolicy = deliveryPolicyDetails(goalContent);
  const deliveryState = deliveryStateSnapshot(cwd);

  return `# Goal Execution Prompt

In \`${cwd}\`, execute this goal:

\`${relGoal}\`

Requirements:

- ${readGoalInstruction}
- Apply Commentary Policy \`${context.communication.commentary}\`: ${context.communication.guidance} Report cadence: \`${context.communication.reportCadence}\`. Notify on: ${context.communication.notifyOn}.
- ${context.mode === "adapter" && adapterPath ? `Read \`${adapterPath}\` and apply its project-specific hard boundaries, preflight requirements, and state-sync rules.` : "Follow the repository instructions and configured harness paths."}
- Follow the goal's Scope, Non-Goals, Work Mode Recommendation, Verification, Completion Conditions, and Pause Conditions.
- Follow the goal's Execution Role: \`${executionRole}\`.
- If Execution Role is \`gate-only\`, keep the current thread as controller; the Codex runtime decides whether and how to delegate implementation.
- ${boundedDirectExecutionGuidance} The supplied Goal/Run remains authoritative and must not be downgraded.
- ${contextFocusRoutingGuidance} ${executeContextFocusGuidance}
- ${cyberneticStabilityGuidance}
- ${degradedExecutionProvenanceGuidance}
- ${controllerCancellationBoundaryGuidance}
- Follow the goal's Conversation Route: \`${conversationRoute}\`.
- Confirm Execution Context Lock before editing: lane \`${executionContextLock.conversationLane || "not-recorded"}\`, cwd \`${executionContextLock.executionCwd || cwd}\`, branch \`${executionContextLock.executionBranch || deliveryState.branch || "not-recorded"}\`, remote-control worktree \`${executionContextLock.remoteControlWorktree || "not-recorded"}\`.
- Current Delivery State: \`${deliveryState.state}\`; dirty working tree: \`${deliveryState.workingTreeDirty}\`; commit \`${deliveryState.commit}\`; push \`${deliveryState.push}\`; review \`${deliveryState.review || deliveryState.pr}\`; integration \`${deliveryState.integration || deliveryState.merge}\`; release \`${deliveryState.release}\`.
- ${localDeliveryCeilingGuidance}
- ${runScopedDeliveryGuidance}
- Target Delivery State: \`${deliveryPolicy.target}\`; delivery intent \`${deliveryPolicy.deliveryIntent}\`; commit authorized \`${deliveryPolicy.commitAuthorized}\`; push authorized \`${deliveryPolicy.pushAuthorized}\`; review authorized \`${deliveryPolicy.reviewAuthorized}\`; integration authorized \`${deliveryPolicy.integrationAuthorized}\`; release authorized \`${deliveryPolicy.releaseAuthorized}\`.
- Treat implementation output as candidate evidence until required checklist and gate evidence is satisfied and accepted by the control lane.
- Treat State Sync Notes as part of Goal/Task Done. Executors must provide them; the accepted-state owner verifies them before recording accepted Goal, Task, status, run, or gate state.
- ${boundedStatusSnapshotGuidance}
- If actual delivery state is below target after gates pass, continue the authorized commit / push / review / integration / release pipeline before closeout.
- Do not call local verification "integrated", "shipped", or "complete on the integration line" unless commit / push / review / integration / release evidence is recorded.
- Do not close if feedback quality is weak, stale, delayed, or advisory; verify, re-orient, ask, or pause when the remaining gap is not shrinking or the loop is saturated.
- Final user-facing closeout must include explicit \`Need user\` and \`Remaining\` values. Use \`Need user: None\` and \`Remaining: None\` for routine closeouts with no true pause trigger or follow-up instead of asking broad confirmation questions.
- Do not release, deploy, publish, start a daemon, or automatically launch additional Codex sessions unless the Delivery State policy and controller explicitly authorize it.
- If the checkout is dirty with unrelated work, use the worktree policy from the goal and project docs.
- After implementation, run the goal's verification commands, produce State Sync Notes, and update configured state records (${formatInlinePathList(stateSyncPathList)}) when the project adapter requires state sync. Status-file updates must replace bounded snapshot sections instead of appending historical focus logs.

## Goal Content

~~~md
${goalContent.trimEnd()}
~~~
`;
}

function recommendedSubagentTasks(taskSize, executionRole) {
  if (taskSize === "small") {
    if (executionRole === "gate-only") {
      return `Recommended for this run: \`small\`.

The current thread is \`gate-only\`; keep it for acceptance and give the implementation node to the Codex runtime.`;
    }
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

function buildSubagentsMarkdown({ cwd, goalPath, taskSize, executionRole }) {
  const relGoal = displayPath(cwd, goalPath);

  return `# Subagent Split Guidance

Goal: \`${relGoal}\`

## Policy

- Treat \`dag.json\` as the source of execution order. This file explains how to
  split work; it does not override DAG dependencies or controller gates.
- This prepared Run is durable and must not be downgraded to ordinary direct execution.
- ${cyberneticStabilityGuidance}
- \`small\`: the runtime may keep implementer work in the current lane or delegate it; gate-only remains read-only.
- \`medium\`: split into \`explorer\` plus \`worker\`, or \`worker\` plus \`verification\`, when it reduces context load.
- \`large\`: split into multiple workers only when file ownership is non-overlapping and merge responsibility is clear.
- \`ask\`: pause before splitting when the work involves production, destructive actions, credentials, paid APIs, product direction, or unclear file ownership.

Every subagent task must include context, goal path, read/write scope, file ownership, expected output, and stop conditions. Subagents must not revert user changes or edits owned by another agent.

${recommendedSubagentTasks(taskSize, executionRole)}
`;
}

function runPrepare(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  const paths = context.paths;
  if (!args.goal) {
    throw new Error("Usage: agent-harness run prepare --goal <goal-file> [--cwd PATH]");
  }

  const goalsRoot = configuredPath(cwd, paths.goals, "Goals root");
  const goalPath = assertContainedPath(goalsRoot, resolve(cwd, args.goal), "Goal path");
  if (!existsSync(goalPath)) {
    throw new Error(`Goal file not found: ${args.goal}`);
  }

  const validation = validateGoal(cwd, goalPath);
  if (!validation.ok) {
    throw new Error(`Goal validation failed:\n${validation.errors.map((error) => `- ${error}`).join("\n")}`);
  }

  const goalContent = readFileSync(goalPath, "utf8");
  const specRel = extractInlinePath(goalContent, "Spec");
  const specsRoot = paths.specs ? configuredPath(cwd, paths.specs, "Specs root") : cwd;
  const specAbs = specRel ? assertContainedPath(specsRoot, resolveProjectPath(cwd, specRel), "Spec path") : "";
  const specContent = specAbs && existsSync(specAbs) ? readFileSync(specAbs, "utf8") : "";
  const createdAt = new Date().toISOString();
  const workMode = extractWorkMode(goalContent, cwd);
  const executionRole = extractGoalExecutionRoleRaw(goalContent);
  const conversationRoute = extractConversationRouteRaw(goalContent);
  const executionContextLock = executionContextLockDetails(goalContent);
  const deliveryState = deliveryStateSnapshot(cwd);
  const startSnapshot = runStartSnapshot(cwd);
  const deliveryPolicy = deliveryPolicyDetails(goalContent);
  const acceptanceMap = acceptanceMapDetails(goalContent, specContent);
  const stageCompletionMap = stageCompletionMapDetails(goalContent, specContent);
  const specChecklist = specAcceptanceChecklistDetails(goalContent, specContent);
  const gateEvidence = gateEvidenceDetails(goalContent, specContent);
  const requiredGates = adapterRequiredCompletionGates(context);
  const taskSize = classifyTask(goalContent, workMode);
  const executionDag = buildExecutionDag({
    cwd,
    goalPath,
    taskSize,
    workMode,
    executionRole,
    communication: context.communication
  });
  const runSlug = runSlugFromGoal(goalPath);
  const runsRoot = configuredPath(cwd, paths.runs, "Runs root");
  const runDir = assertContainedPath(runsRoot, nextAvailableRunDir(join(runsRoot, `${runTimestamp()}-${runSlug}`)), "Run directory");
  const files = ["run.md", "prompt.md", "subagents.md", "dag.md", "dag.json", "agents", "status.json"];
  const logsDir = artifactPath(runDir, "logs", "Run logs path");

  mkdirSync(logsDir, { recursive: true });
  writeExecutionDagArtifacts({ cwd, runDir, goalPath, dag: executionDag, createdAt });
  writeFileSync(artifactPath(runDir, "run.md", "Run document path"), buildRunMarkdown({
    context,
    createdAt,
    cwd,
    goalPath,
    goalContent,
    runDir,
    taskSize,
    workMode,
    executionRole,
    communication: context.communication,
    conversationRoute,
    executionContextLock,
    deliveryState,
    ...startSnapshot,
    deliveryPolicy,
    acceptanceMap,
    stageCompletionMap,
    specChecklist,
    gateEvidence,
    requiredGates
  }));
  writeFileSync(artifactPath(runDir, "prompt.md", "Run prompt path"), buildPromptMarkdown({ context, cwd, goalPath, goalContent }));
  writeFileSync(artifactPath(runDir, "subagents.md", "Run guidance path"), buildSubagentsMarkdown({ cwd, goalPath, taskSize, executionRole }));
  const executionDagState = executionDagSnapshot(executionDag, runDir);
  writeFileSync(artifactPath(runDir, "status.json", "Run status path"), `${JSON.stringify({
    harnessContract: context.contract,
    phase: "prepared",
    createdAt,
    updatedAt: createdAt,
    cwd,
    goalPath: displayPath(cwd, goalPath),
    runDir: displayPath(cwd, runDir),
    workMode,
    executionRole,
    communication: context.communication,
    conversationRoute,
    executionContextLock: {
      conversationLane: executionContextLock.conversationLane,
      controllerThread: executionContextLock.controllerThread,
      executionCwd: executionContextLock.executionCwd || cwd,
      executionBranch: executionContextLock.executionBranch || deliveryState.branch,
      executionSlot: executionContextLock.executionSlot,
      remoteControlWorktree: executionContextLock.remoteControlWorktree
    },
    deliveryState,
    ...startSnapshot,
    deliveryPolicy,
    acceptanceMapRequired: acceptanceMap.required,
    acceptanceMapSource: acceptanceMap.source,
    acceptanceMapItemCount: acceptanceMap.items.length,
    milestoneCompletionMapRequired: stageCompletionMap.required,
    milestoneCompletionMapSource: stageCompletionMap.source,
    milestoneCompletionMapItemCount: stageCompletionMap.items.length,
    milestoneCompletionMapRequiredLabels: stageCompletionMap.requiredLabels,
    stageCompletionMapRequired: stageCompletionMap.required,
    stageCompletionMapSource: stageCompletionMap.source,
    stageCompletionMapItemCount: stageCompletionMap.items.length,
    stageCompletionMapRequiredLabels: stageCompletionMap.requiredLabels,
    specAcceptanceChecklistSource: specChecklist.source,
    specAcceptanceChecklistItemCount: specChecklist.items.length,
    requiredGates,
    requiredGateEvidenceSource: gateEvidence.source,
    requiredGateEvidenceItemCount: gateEvidence.items.length,
    taskSize,
    files,
    logs: "logs/",
    executionDag: executionDagState,
    verificationCommands: extractVerificationCommands(extractSection(goalContent, "Verification"))
  }, null, 2)}\n`);

  console.log(`Prepared run packet: ${displayPath(cwd, runDir)}`);
  console.log(`Prompt: ${displayPath(cwd, join(runDir, "prompt.md"))}`);
  console.log(`DAG: ${displayPath(cwd, join(runDir, "dag.md"))}`);
  console.log(`Ready nodes: ${executionDagState.readyNodes.join(", ") || "none"}`);
  console.log("Next: hand ready nodes to the Codex runtime; record ownership, verification, and candidate evidence in this Run.");
}

const recordableRunPhases = new Set(["completed", "blocked"]);

function configuredRunDir(cwd, context, value) {
  const runsRoot = configuredPath(cwd, context.paths.runs, "Runs root");
  const runDir = assertContainedPath(runsRoot, resolve(cwd, value), "Run directory");
  if (runDir === runsRoot) throw new Error("Run directory must name a child of the configured runs root.");
  return runDir;
}

function runNodeRecord(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  if (!args.run || !args.node) {
    throw new Error("Usage: agent-harness run node record --run <run-dir> --node <node-id> --phase running|completed|blocked --summary <text> [--verification <text>] [--thread <thread-id>] [--surface <surface>] [--isolation-evidence <text>] [--cwd PATH] [--json]");
  }
  if (!recordableRunNodePhases.has(args.phase)) {
    throw new Error(`Invalid --phase: ${args.phase || "(missing)"}`);
  }
  if (!args.summary) {
    throw new Error("Missing --summary <text>");
  }
  if (args.phase === "completed" && !args.verification) {
    throw new Error("Completed DAG nodes require --verification evidence.");
  }

  const runDir = configuredRunDir(cwd, context, args.run);
  const runStatusPath = artifactPath(runDir, "status.json", "Run status path");
  if (!existsSync(runStatusPath)) {
    throw new Error(`Missing ${displayPath(cwd, runStatusPath)}`);
  }
  const dag = readExecutionDag(runDir);
  if (!dag) {
    throw new Error(`Missing ${displayPath(cwd, join(runDir, "dag.json"))}`);
  }
  const node = dag.nodes.find((candidate) => candidate.id === args.node);
  if (!node) {
    throw new Error(`Unknown DAG node: ${args.node}`);
  }

  const before = executionDagSnapshot(dag, runDir);
  const dependencies = node.dependencies || [];
  const incompleteDependencies = dependencies.filter((dependency) => !before.completedNodes.includes(dependency));
  if ((args.phase === "running" || args.phase === "completed") && incompleteDependencies.length) {
    throw new Error(`Execution DAG node '${node.id}' cannot ${args.phase === "running" ? "start" : "complete"} before dependencies: ${incompleteDependencies.join(", ")}`);
  }
  if (args.phase === "running" && !before.readyNodes.includes(node.id)) {
    throw new Error(`Execution DAG node '${node.id}' is not ready to start.`);
  }
  if (args.phase === "running" && before.runningNodes.length && !args.isolationEvidence) {
    throw new Error(`Starting DAG node '${node.id}' while ${before.runningNodes.join(", ")} is running requires --isolation-evidence <separate-worktree-or-non-overlap-proof>.`);
  }

  const now = new Date().toISOString();
  const previousNodeStatus = readNodeStatus(runDir, node);
  const nodeStatus = {
    ...previousNodeStatus,
    node: node.id,
    label: node.label,
    phase: args.phase,
    updatedAt: now,
    summary: args.summary,
    verificationSummary: args.verification || "",
    thread: args.thread || previousNodeStatus.thread || "",
    surface: args.surface || previousNodeStatus.surface || "",
    isolationEvidence: args.isolationEvidence || previousNodeStatus.isolationEvidence || "sequential",
    result: node.result
  };
  const resultPath = artifactPath(runDir, node.result, `DAG node '${node.id}' result`);
  const resultContent = `# DAG Node ${titleCase(args.phase)}: ${node.id}

Updated: ${now}
Run: \`${displayPath(cwd, runDir)}\`
Node: \`${node.id}\`
Thread: \`${nodeStatus.thread || "Not recorded."}\`
Surface: \`${nodeStatus.surface || "Not recorded."}\`
Parallel isolation: \`${nodeStatus.isolationEvidence}\`

## Summary

${args.summary}

## Verification

${args.verification || "Not recorded."}
`;

  writeFileSync(nodeStatusPath(runDir, node), `${JSON.stringify(nodeStatus, null, 2)}\n`);
  writeFileSync(resultPath, resultContent);

  const nextDagState = executionDagSnapshot(dag, runDir);
  const runStatus = JSON.parse(readFileSync(runStatusPath, "utf8"));
  const runPhase = nextDagState.blockedNodes.length
    ? "blocked"
    : nextDagState.allNodesCompleted
      ? "ready-for-gate"
      : "running";
  const nextRunStatus = {
    ...runStatus,
    phase: runPhase,
    updatedAt: now,
    executionDag: nextDagState
  };
  writeFileSync(runStatusPath, `${JSON.stringify(nextRunStatus, null, 2)}\n`);

  const payload = {
    run: displayPath(cwd, runDir),
    node: node.id,
    status: displayPath(cwd, nodeStatusPath(runDir, node)),
    result: displayPath(cwd, resultPath),
    phase: args.phase,
    readyNodes: nextDagState.readyNodes,
    completedNodes: nextDagState.completedNodes,
    blockedNodes: nextDagState.blockedNodes,
    runPhase
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Recorded DAG node ${args.phase}: ${node.id}`);
  console.log(`Status: ${displayPath(cwd, nodeStatusPath(runDir, node))}`);
  console.log(`Result: ${displayPath(cwd, resultPath)}`);
  console.log(`Ready nodes: ${nextDagState.readyNodes.join(", ") || "none"}`);
}

function runRecord(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  if (!args.run) {
    throw new Error("Usage: agent-harness run record --run <run-dir> --phase completed|blocked --summary <text> [--verification <text>] [--gate-evidence <text>] [--cwd PATH] [--json]");
  }
  if (!recordableRunPhases.has(args.phase)) {
    throw new Error(`Invalid --phase: ${args.phase || "(missing)"}`);
  }
  if (!args.summary) {
    throw new Error("Missing --summary <text>");
  }

  const runDir = configuredRunDir(cwd, context, args.run);
  const statusPath = artifactPath(runDir, "status.json", "Run status path");
  if (!existsSync(statusPath)) {
    throw new Error(`Missing ${displayPath(cwd, statusPath)}`);
  }

  const now = new Date().toISOString();
  const status = JSON.parse(readFileSync(statusPath, "utf8"));
  const executionRole = status.executionRole || "unknown";
  let deliveryState = applyDeliveryEvidence(runScopedDeliveryState(cwd, status, { completed: args.phase === "completed" }), {
    reviewUrl: args.reviewUrl || args.prUrl || status.deliveryState?.review || status.deliveryState?.pr,
    integrationRef: args.integrationRef || args.mergeSha || status.deliveryState?.integration || status.deliveryState?.merge,
    releaseRef: args.releaseRef || status.deliveryState?.release
  });
  if (args.phase === "completed" && !args.verification) {
    throw new Error("Completed runs require --verification evidence.");
  }
  if (args.phase === "completed" && executionRole === "gate-only" && !args.gateEvidence) {
    throw new Error("Completed gate-only runs require --gate-evidence describing implementer output and acceptance evidence.");
  }
  const dag = readExecutionDag(runDir);
  const dagState = dag ? executionDagSnapshot(dag, runDir) : null;
  if (args.phase === "completed" && dagState?.runningNodes?.length) {
    throw new Error(`Completed DAG runs require active worker nodes to be resolved before acceptance; running: ${dagState.runningNodes.join(", ")}.`);
  }
  if (args.phase === "completed" && dagState?.enforced && !dagState.allNodesCompleted) {
    throw new Error(`Completed DAG runs require every execution DAG node to be completed; ready: ${dagState.readyNodes.join(", ") || "none"}, waiting: ${dagState.waitingNodes.join(", ") || "none"}.`);
  }
  const goalsRoot = configuredPath(cwd, context.paths.goals || fixedContract.goals, "Goals root");
  const goalPath = status.goalPath
    ? assertContainedPath(goalsRoot, resolveProjectPath(cwd, status.goalPath), "Run Goal path")
    : "";
  const goalContent = goalPath && existsSync(goalPath) ? readFileSync(goalPath, "utf8") : "";
  const specRel = goalContent ? extractInlinePath(goalContent, "Spec") : "";
  const specsRoot = context.paths.specs ? configuredPath(cwd, context.paths.specs, "Specs root") : cwd;
  const specAbs = specRel
    ? assertContainedPath(specsRoot, resolveProjectPath(cwd, specRel), "Goal Spec path")
    : "";
  const specContent = specAbs && existsSync(specAbs) ? readFileSync(specAbs, "utf8") : "";
  const deliveryPolicy = status.deliveryPolicy || deliveryPolicyDetails(goalContent);
  const deliveryPolicyErrors = deliveryPolicyValidationErrors(deliveryPolicy);
  if (deliveryPolicyErrors.length) {
    throw new Error(`Delivery State policy validation failed:\n${deliveryPolicyErrors.map((error) => `- ${error}`).join("\n")}`);
  }
  if (args.phase === "completed") {
    if (status.acceptanceMapRequired && (!goalPath || !existsSync(goalPath))) {
      throw new Error("Completed batch runs require a readable goal with Source Task Acceptance Map evidence.");
    }
    const milestoneCompletionRequired = Boolean(status.milestoneCompletionMapRequired || status.stageCompletionMapRequired);
    if (milestoneCompletionRequired && (!goalPath || !existsSync(goalPath))) {
      throw new Error("Completed milestone runs require a readable goal with Milestone Completion Map evidence.");
    }
    if (goalContent) {
      const acceptanceMap = acceptanceMapDetails(goalContent, specContent);
      const acceptanceMapErrors = acceptanceMapValidationErrors(acceptanceMap, { completed: true });
      if (acceptanceMapErrors.length) {
        throw new Error(`Source Task Acceptance Map validation failed:\n${acceptanceMapErrors.map((error) => `- ${error}`).join("\n")}`);
      }
      const stageCompletionMap = stageCompletionMapDetails(goalContent, specContent);
      const stageCompletionMapErrors = stageCompletionMapValidationErrors(stageCompletionMap, { completed: true });
      if (stageCompletionMapErrors.length) {
        throw new Error(`Milestone Completion Map validation failed:\n${stageCompletionMapErrors.map((error) => `- ${error}`).join("\n")}`);
      }
      const specChecklist = specAcceptanceChecklistDetails(goalContent, specContent);
      const checklistErrors = evidenceItemValidationErrors(specChecklist, {
        sectionTitle: "Spec Acceptance Checklist",
        itemTitle: "Item",
        requireAcceptance: true,
        completed: true,
        requiredLabels: specChecklist.items.map((item) => item.label)
      });
      if (checklistErrors.length) {
        throw new Error(`Spec Acceptance Checklist validation failed:\n${checklistErrors.map((error) => `- ${error}`).join("\n")}`);
      }
      const requiredGates = Array.isArray(status.requiredGates) ? status.requiredGates : [];
      const gateEvidence = gateEvidenceDetails(goalContent, specContent);
      if (requiredGates.length && !gateEvidence.section) {
        throw new Error(`Required Gate Evidence must include adapter-required gate(s): ${requiredGates.join(", ")}.`);
      }
      const gateErrors = evidenceItemValidationErrors(gateEvidence, {
        sectionTitle: "Required Gate Evidence",
        itemTitle: "Gate",
        completed: true,
        requiredLabels: requiredGates
      });
      if (gateErrors.length) {
        throw new Error(`Required Gate Evidence validation failed:\n${gateErrors.map((error) => `- ${error}`).join("\n")}`);
      }
    }
    const deliveryTargetFailures = deliveryTargetErrors(deliveryPolicy, deliveryState);
    if (deliveryTargetFailures.length) {
      throw new Error(`Delivery target gate failed:\n${deliveryTargetFailures.map((error) => `- ${error}`).join("\n")}`);
    }
  }
  const nextStatus = {
    ...status,
    phase: args.phase,
    updatedAt: now,
    summary: args.summary,
    verificationSummary: args.verification || status.verificationSummary || "",
    gateEvidence: args.gateEvidence || status.gateEvidence || "",
    deliveryState,
    deliveryPolicy,
    executionDag: dagState || status.executionDag
  };
  const logsDir = artifactPath(runDir, "logs", "Run logs path");
  mkdirSync(logsDir, { recursive: true });
  const logPath = join(logsDir, `${runTimestamp()}-${args.phase}.md`);
  const logContent = `# Run ${titleCase(args.phase)} Summary

Updated: ${now}
Run: \`${displayPath(cwd, runDir)}\`
Goal: \`${status.goalPath || "unknown"}\`

## Summary

${args.summary}

## Verification

${args.verification || "Not recorded."}

## Gate Evidence

${args.gateEvidence || "Not recorded."}

## Delivery State

- State: \`${deliveryState.state}\`
- Target: \`${deliveryPolicy.target}\`
- Delivery intent: \`${deliveryPolicy.deliveryIntent}\`
- Working tree dirty: \`${deliveryState.workingTreeDirty}\`
- Branch: \`${deliveryState.branch || "none"}\`
- Commit: \`${deliveryState.commit}\`
- Push: \`${deliveryState.push}\`
- Review: \`${deliveryState.review || deliveryState.pr}\`
- Integration: \`${deliveryState.integration || deliveryState.merge}\`
- Release: \`${deliveryState.release}\`
- Commit authorized: \`${deliveryPolicy.commitAuthorized}\`
- Push authorized: \`${deliveryPolicy.pushAuthorized}\`
- Review authorized: \`${deliveryPolicy.reviewAuthorized}\`
- Integration authorized: \`${deliveryPolicy.integrationAuthorized}\`
- Release authorized: \`${deliveryPolicy.releaseAuthorized}\`

A completed run must reach Target delivery state. If actual state is below target after gates pass, continue the authorized delivery pipeline and rerun \`run record\` with review / integration / release evidence when applicable.
`;

  writeFileSync(statusPath, `${JSON.stringify(nextStatus, null, 2)}\n`);
  writeFileSync(logPath, logContent);

  const payload = {
    run: displayPath(cwd, runDir),
    status: displayPath(cwd, statusPath),
    log: displayPath(cwd, logPath),
    phase: args.phase,
    summary: args.summary,
    verificationSummary: nextStatus.verificationSummary,
    gateEvidence: nextStatus.gateEvidence,
    deliveryState,
    deliveryPolicy
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Recorded run ${args.phase}: ${displayPath(cwd, runDir)}`);
  console.log(`Status: ${displayPath(cwd, statusPath)}`);
  console.log(`Log: ${displayPath(cwd, logPath)}`);
  console.log(`Delivery state: ${deliveryState.state}`);
}

function runStatus(args) {
  const cwd = targetCwd(args);
  const context = resolveHarnessContext(cwd);
  if (!args.run) {
    throw new Error("Usage: agent-harness run status --run <run-dir> [--cwd PATH]");
  }

  const runDir = configuredRunDir(cwd, context, args.run);
  const statusPath = artifactPath(runDir, "status.json", "Run status path");
  if (!existsSync(statusPath)) {
    throw new Error(`Missing ${displayPath(cwd, statusPath)}`);
  }

  const status = JSON.parse(readFileSync(statusPath, "utf8"));
  const expectedFiles = status.files || ["run.md", "prompt.md", "subagents.md", "status.json"];
  const missing = expectedFiles.filter((file) => !existsSync(artifactPath(runDir, file, "Run artifact path")));
  const dag = readExecutionDag(runDir);
  const dagState = dag ? executionDagSnapshot(dag, runDir) : status.executionDag || null;

  const payload = {
    run: displayPath(cwd, runDir),
    phase: status.phase || "unknown",
    goalPath: status.goalPath || "unknown",
    workMode: status.workMode || "unknown",
    executionRole: status.executionRole || "unknown",
    conversationRoute: status.conversationRoute || "unknown",
    executionContextLock: status.executionContextLock || null,
    deliveryState: status.deliveryState || null,
    deliveryPolicy: status.deliveryPolicy || null,
    milestoneCompletionMap: {
      required: Boolean(status.milestoneCompletionMapRequired || status.stageCompletionMapRequired),
      source: status.milestoneCompletionMapSource || status.stageCompletionMapSource || "",
      itemCount: status.milestoneCompletionMapItemCount || status.stageCompletionMapItemCount || 0,
      requiredLabels: status.milestoneCompletionMapRequiredLabels || status.stageCompletionMapRequiredLabels || []
    },
    stageCompletionMap: {
      required: Boolean(status.stageCompletionMapRequired || status.milestoneCompletionMapRequired),
      source: status.stageCompletionMapSource || status.milestoneCompletionMapSource || "",
      itemCount: status.stageCompletionMapItemCount || status.milestoneCompletionMapItemCount || 0,
      requiredLabels: status.stageCompletionMapRequiredLabels || status.milestoneCompletionMapRequiredLabels || []
    },
    taskSize: status.taskSize || "unknown",
    updatedAt: status.updatedAt || "unknown",
    files: {
      expected: expectedFiles,
      missing
    },
    executionDag: dagState
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Run: ${displayPath(cwd, runDir)}`);
  console.log(`Phase: ${status.phase || "unknown"}`);
  console.log(`Goal: ${status.goalPath || "unknown"}`);
  console.log(`Work mode: ${status.workMode || "unknown"}`);
  console.log(`Execution role: ${status.executionRole || "unknown"}`);
  console.log(`Conversation route: ${status.conversationRoute || "unknown"}`);
  if (status.executionContextLock) {
    console.log(`Execution cwd: ${status.executionContextLock.executionCwd || "unknown"}`);
    console.log(`Execution branch: ${status.executionContextLock.executionBranch || "unknown"}`);
    console.log(`Conversation lane: ${status.executionContextLock.conversationLane || "unknown"}`);
  }
  if (status.deliveryState) {
    console.log(`Delivery state: ${status.deliveryState.state || "unknown"}`);
    console.log(`Working tree dirty: ${status.deliveryState.workingTreeDirty || "unknown"}`);
    console.log(`Commit: ${status.deliveryState.commit || "none"}`);
    console.log(`Push: ${status.deliveryState.push || "none"}`);
    console.log(`Review: ${status.deliveryState.review || status.deliveryState.pr || "none"}`);
    console.log(`Integration: ${status.deliveryState.integration || status.deliveryState.merge || "none"}`);
    console.log(`Release: ${status.deliveryState.release || "none"}`);
  }
  if (status.deliveryPolicy) {
    console.log(`Delivery intent: ${status.deliveryPolicy.deliveryIntent || "unknown"}`);
    console.log(`Target delivery state: ${status.deliveryPolicy.target || "unknown"}`);
    console.log(`Commit authorized: ${status.deliveryPolicy.commitAuthorized || "unknown"}`);
    console.log(`Push authorized: ${status.deliveryPolicy.pushAuthorized || "unknown"}`);
    console.log(`Review authorized: ${status.deliveryPolicy.reviewAuthorized || status.deliveryPolicy.prAuthorized || "unknown"}`);
    console.log(`Integration authorized: ${status.deliveryPolicy.integrationAuthorized || status.deliveryPolicy.mergeAuthorized || "unknown"}`);
    console.log(`Release authorized: ${status.deliveryPolicy.releaseAuthorized || "unknown"}`);
  }
  console.log(`Task size: ${status.taskSize || "unknown"}`);
  console.log(`Updated: ${status.updatedAt || "unknown"}`);
  console.log(`Files: ${missing.length ? `missing ${missing.join(", ")}` : "ok"}`);
  if (dagState) {
    console.log(`DAG enforcement: ${dagState.enforcement || "unknown"}`);
    console.log(`Ready nodes: ${dagState.readyNodes.join(", ") || "none"}`);
    console.log(`Running nodes: ${dagState.runningNodes.join(", ") || "none"}`);
    console.log(`Waiting nodes: ${dagState.waitingNodes.join(", ") || "none"}`);
    console.log(`Completed nodes: ${dagState.completedNodes.join(", ") || "none"}`);
    console.log(`Blocked nodes: ${dagState.blockedNodes.join(", ") || "none"}`);
  }
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
      maintainTasks(args);
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
    } else if (command === "goal" && subcommand === "create") {
      goalCreate(args);
    } else if (command === "goal" && subcommand === "list") {
      goalList(args);
    } else if (command === "goal" && subcommand === "inspect") {
      goalInspect(args);
    } else if (command === "goal" && subcommand === "validate") {
      goalValidate(args);
    } else if (command === "run" && subcommand === "prepare") {
      runPrepare(args);
    } else if (command === "run" && subcommand === "node" && args._[2] === "record") {
      runNodeRecord(args);
    } else if (command === "run" && subcommand === "record") {
      runRecord(args);
    } else if (command === "run" && subcommand === "status") {
      runStatus(args);
    } else {
      usage(args.language);
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
