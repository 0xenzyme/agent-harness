#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const pluginRoot = resolve(dirname(__filename), "..");
const templateRoot = join(pluginRoot, "templates");

const configRelPath = ".harness/config.json";
const agentHarnessConfigRelPath = ".agent-harness/config.json";
const configRelPathCandidates = [configRelPath, agentHarnessConfigRelPath];

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

function parseArgs(argv) {
  const args = { _: [] };
  const valueOptions = new Set([
    "adapterDocs",
    "adapter-docs",
    "cwd",
    "goal",
    "idea",
    "lang",
    "contract",
    "mode",
    "phase",
    "priority",
    "projectName",
    "project-name",
    "run",
    "section",
    "summary",
    "spec",
    "taskIndex",
    "task-index",
    "task",
    "verification",
    "workMode",
    "work-mode"
  ]);
  const booleanOptions = new Set(["dryRun", "dry-run", "force", "help", "json", "record"]);

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
  agent-harness config import [--cwd PATH] [--task-index PATH] [--dry-run] [--force] [--json]
  agent-harness adapter inspect [--cwd PATH] [--json]
  agent-harness worktree recommend [--cwd PATH] [--json] [--lang CODE]
  agent-harness goal create --task <title-or-id> [--cwd PATH] [--spec PATH] [--work-mode local|worktree|ask] [--dry-run] [--force]
  agent-harness goal list [--cwd PATH] [--json]
  agent-harness goal inspect --goal <goal-file> [--cwd PATH] [--json]
  agent-harness goal validate --goal <goal-file> [--cwd PATH] [--json]
  agent-harness run prepare --goal <goal-file> [--cwd PATH]
  agent-harness run record --run <run-dir> --phase completed|blocked --summary <text> [--verification <text>] [--cwd PATH] [--json]
  agent-harness run status --run <run-dir> [--cwd PATH]`,
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
  agent-harness config import [--cwd PATH] [--task-index PATH] [--dry-run] [--force] [--json]
  agent-harness adapter inspect [--cwd PATH] [--json]
  agent-harness worktree recommend [--cwd PATH] [--json] [--lang CODE]
  agent-harness goal create --task <title-or-id> [--cwd PATH] [--spec PATH] [--work-mode local|worktree|ask] [--dry-run] [--force]
  agent-harness goal list [--cwd PATH] [--json]
  agent-harness goal inspect --goal <goal-file> [--cwd PATH] [--json]
  agent-harness goal validate --goal <goal-file> [--cwd PATH] [--json]
  agent-harness run prepare --goal <goal-file> [--cwd PATH]
  agent-harness run record --run <run-dir> --phase completed|blocked --summary <text> [--verification <text>] [--cwd PATH] [--json]
  agent-harness run status --run <run-dir> [--cwd PATH]`,
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
  const specs = firstExistingPath(cwd, [adapterContract.specs, "docs/specs"]);
  const goals = firstExistingPath(cwd, [adapterContract.goals, "docs/goals"]);
  const milestones = firstExistingPath(cwd, [adapterContract.milestones, "docs/milestones"]);
  const hasAdapterArtifacts = Boolean(adapterDocs && (taskIndex || specs || goals || milestones));

  return {
    detected: hasAdapterArtifacts,
    adapterDocs,
    taskIndex,
    specs,
    goals,
    milestones
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
  payload.paths.mentalModelIndex = discovery.mentalModelIndex || payload.paths.mentalModelIndex || adapterContract.mentalModelIndex;

  return payload;
}

function normalizeHarnessContract(config) {
  const rawContract = typeof config.contract === "string" ? config.contract.trim().toLowerCase() : "";
  if (rawContract) {
    if (rawContract === "fixed" || rawContract === "adapter") {
      return rawContract;
    }
    throw new Error(`Unsupported harness contract in ${configRelPath}: ${config.contract}`);
  }

  const rawMode = typeof config.mode === "string" ? config.mode.trim().toLowerCase() : "";
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
    .replace("- Task index: `harness/tasks.md`", `- Task index: \`${paths.taskIndex}\``)
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
  const absPath = join(cwd, relPath);
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

  if (paths.mentalModelIndex && writeIfMissing(join(cwd, paths.mentalModelIndex), readTemplate("mental-models.md"), force)) {
    created.push(paths.mentalModelIndex);
  }

  for (const [fileName, templateName] of mentalModelTemplates) {
    const relPath = join(mentalModelsDir, fileName);
    if (writeIfMissing(join(cwd, relPath), readTemplate(templateName), force)) {
      created.push(relPath);
    }
  }
}

function ensureImportSupportArtifacts(cwd, paths, created) {
  if (writeIfMissing(join(cwd, paths.status), readTemplate("status.md"))) {
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

function init(args) {
  const cwd = targetCwd(args);
  const lang = args.language;
  const projectName = args.projectName || basename(cwd);
  const created = [];
  const plan = initPlan(args, cwd, projectName);
  const { mode, configPayload, paths } = plan;

  const taskTemplate = mode === "adapter" ? "task-index.md" : "tasks.md";
  const tasksPath = join(cwd, paths.taskIndex);
  if (writeIfMissing(tasksPath, readTemplate(taskTemplate), args.force)) {
    created.push(paths.taskIndex);
  }

  const configPath = join(cwd, paths.config);
  if (plan.writeConfig && writeIfMissing(configPath, `${JSON.stringify(configPayload, null, 2)}\n`, args.force)) {
    created.push(paths.config);
  }

  const statusPath = join(cwd, paths.status);
  if (writeIfMissing(statusPath, readTemplate("status.md"), args.force)) {
    created.push(paths.status);
  }

  if (mode === "adapter") {
    const adapterPath = join(cwd, paths.adapterDocs);
    if (writeIfMissing(adapterPath, renderAdapterTemplate(paths), args.force)) {
      created.push(paths.adapterDocs);
    }
  }

  const dirs = mode === "adapter"
    ? [paths.specs, paths.goals, paths.milestones, paths.runs, paths.mentalModels]
    : [paths.goals, paths.runs];
  for (const dir of dirs) {
    mkdirSync(join(cwd, dir), { recursive: true });
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
  const configPath = join(cwd, configRelPath);
  const activeConfigRelPath = findConfigRelPath(cwd);
  const discovery = discoverAdapterProject(cwd, {
    taskIndex: args.taskIndex,
    adapterDocs: args.adapterDocs
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
  const paths = resolvedAdapterPaths(configPayload, configRelPath);

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
  const required = context.requiredPaths;
  const missing = required.filter((path) => !existsSync(join(cwd, path)));
  const gitRoot = git(args, ["rev-parse", "--show-toplevel"]);
  const status = git(args, ["status", "--short"]);
  const worktrees = git(args, ["worktree", "list", "--porcelain"]);

  console.log(`${t(lang, "doctorProject")}: ${cwd}`);
  console.log(`Harness contract: ${context.contract}`);
  console.log(`Config source: ${context.configSource}`);
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
  return {
    contract: context.contract,
    defaultPolicy: workMode.defaultPolicy || worktree.defaultPolicy || "ask",
    autoRules: Array.isArray(worktree.autoRules) ? worktree.autoRules : []
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

  for (const rule of config.autoRules) {
    const when = typeof rule?.when === "string" ? rule.when : "";
    const use = typeof rule?.use === "string" ? rule.use : "";

    if (!validWorkModes.has(use)) {
      reasons.push({
        source: "config",
        code: "invalid_auto_rule_use",
        rule: when,
        use,
        detail: "expected local, worktree, or ask"
      });
      continue;
    }

    if (when === "local_checkout_has_unrelated_changes") {
      if (gitState.dirty) {
        matchedRule = when;
        reasons.push({
          source: "config",
          code: "auto_rule_matched",
          rule: when,
          use
        });
        if (validWorkModes.has(config.defaultPolicy)) {
          reasons.push({
            source: "config",
            code: "default_policy_not_used",
            use: config.defaultPolicy,
            detail: `defaultPolicy=${config.defaultPolicy}`
          });
        }
        return {
          contract: config.contract || config.mode || "fixed",
          cwd,
          recommendation: use,
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
        code: "auto_rule_not_matched",
        rule: when,
        use,
        detail: "checkout is clean"
      });
      continue;
    }

    reasons.push({
      source: "config",
      code: "auto_rule_skipped",
      rule: when,
      use,
      detail: "not observable by this command"
    });
  }

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
  const payload = {
    contract: context.contract,
    cwd,
    configSource: context.configSource,
    configPath: context.paths.config,
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
  console.log("Paths:");
  for (const [key, value] of Object.entries(payload.paths)) {
    console.log(`- ${key}: ${value}`);
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
- Preserve existing project instructions. Pause before product-direction decisions, \`AGENTS.md\` changes, credentials, paid APIs, production access, destructive operations, branch/worktree changes, push, PR, deploy, release, daemons, watchers, or background automation.
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
  const recommendation = recommendationTask
    ? {
      title: recommendationTask.title,
      reason: ready[0] === recommendationTask
        ? "highest-priority ready task from the configured task index"
        : inProgress[0] === recommendationTask
          ? "no ready task found; continue the active in-progress task"
          : "no ready or in-progress task found; unblock the highest-priority blocked task",
      startPrompt: `Use harness to work on: ${recommendationTask.title}`,
      goalCommand: `agent-harness goal create --cwd . --task "${recommendationTask.title}"`
    }
    : {
      title: "",
      reason: "no parsed tasks found in the configured task index",
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
        "push, PR, deploy, release, daemon, watcher, credentials, paid API, production, or destructive actions"
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
    console.log(`- To start: ${payload.recommendation.startPrompt}`);
    console.log(`- Goal command: ${payload.recommendation.goalCommand}`);
  } else {
    console.log(`- ${payload.recommendation.reason}`);
  }
  console.log("");
  console.log("Confirmation check:");
  console.log("- This command is read-only and did not start implementation.");
  console.log("- Ask before moving into implementation, activation changes, branch/worktree changes, push/PR/deploy/release, credentials, paid APIs, production, destructive operations, daemons, or automation.");
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
    return "Create a goal from the accepted task, implement the bounded change, verify it, and sync harness state.";
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
  return /^\|\s*Task\s*\|/im.test(content);
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
  const taskIndexAbs = join(payload.cwd, payload.taskIndex);
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
  const statusAbs = join(payload.cwd, statusPath);
  const statusContent = existsSync(statusAbs) ? readFileSync(statusAbs, "utf8") : "# Project Status\n";

  const taskCompletions = payload.proposed.actions.filter((action) => action.kind === "task-completion");
  if (taskCompletions.length) {
    if (payload.tasks.tableBased) {
      payload.record.taskIndexRefused = true;
      payload.record.taskIndexRefusalReason = "table-based task index";
    } else if (payload.paths.taskIndex) {
      const taskIndexAbs = join(payload.cwd, payload.paths.taskIndex);
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
      const isHeader = cells[0]?.toLowerCase() === "task";
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

function buildGoalContent({ task, context, specPath, workMode }) {
  const heading = titleCase(task.title);
  const paths = context.paths;
  const taskIndexPath = paths.taskIndex || paths.tasks;
  const statusPath = paths.status;
  const source = detailValue(task, "Source") || taskIndexPath;
  const acceptance = detailValue(task, "Acceptance") || "Define concrete acceptance before implementation.";
  const notes = detailValue(task, "Notes");
  const spec = specPath || detailValue(task, "Spec") || "TBD";
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
    spec !== "TBD" ? spec : "",
    ...linkedDocs
  ]);

  const adapterRequirements = adapterRequirementLists(context);
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

  return `# Goal: ${heading}

Spec: ${spec}
Status: ${spec !== "TBD" ? "Ready for execution from confirmed spec." : "Draft goal handoff; execute only after the spec is confirmed by the user."}

## Source Task

- \`${taskIndexPath}\`: \`${task.priority ? `${task.priority} ` : ""}${task.title}\`

## Read First

${readFirstList}

## Work Mode Recommendation

Use \`${selectedWorkMode}\` until the goal has a confirmed spec and clear file ownership.

## Scope

- ${acceptance}

## Non-Goals

- Do not push, deploy, publish, or open a PR unless separately requested.
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

- The source task acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- Update configured state records (${formatInlinePathList(stateSyncPathList)}) when the project adapter requires state sync.

## Pause Conditions

- The referenced spec is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The work requires credentials, paid APIs, production access, destructive commands, push, PR, or release.
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
    throw new Error("Usage: agent-harness goal create --task <title-or-id> [--cwd PATH] [--spec PATH] [--work-mode local|worktree|ask] [--dry-run]");
  }
  if (args.workMode && !validWorkModes.has(args.workMode)) {
    throw new Error(`Invalid --work-mode: ${args.workMode}`);
  }
  if (context.mode === "adapter" && !args.spec) {
    throw new Error("Adapter goal creation requires --spec <spec-path>.");
  }

  const taskIndexRelPath = paths.taskIndex || paths.tasks;
  const tasksPath = join(cwd, taskIndexRelPath);
  if (!existsSync(tasksPath)) {
    throw new Error(`Missing ${taskIndexRelPath}`);
  }
  if (args.spec && !existsSync(join(cwd, args.spec))) {
    throw new Error(`Spec file not found: ${args.spec}`);
  }

  const task = findTask(parseTasks(readFileSync(tasksPath, "utf8")), taskQuery, taskIndexRelPath);
  const slug = slugify(task.title);
  const goalRelPath = join(paths.goals, `${todayStamp()}-${slug}.md`);
  const goalPath = join(cwd, goalRelPath);
  const content = buildGoalContent({
    task,
    context,
    specPath: args.spec,
    workMode: args.workMode
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

function resolveProjectPath(cwd, relPath) {
  const cleaned = cleanLinkedTarget(relPath);
  return cleaned ? resolve(cwd, cleaned) : "";
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

  return {
    path: displayPath(cwd, goalPath),
    title: goalTitle(content, goalPath),
    status: extractStatusLine(content),
    spec,
    specPath: specInProject && specAbs ? displayPath(cwd, specAbs) : spec,
    specExists,
    specStatus: specStatus(specContent),
    workMode,
    sections: {
      sourceTask: Boolean(extractSection(content, "Source Task")),
      readFirst: Boolean(extractSection(content, "Read First")),
      workModeRecommendation: Boolean(extractSection(content, "Work Mode Recommendation")),
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
  if (!spec || spec.toLowerCase() === "tbd") {
    errors.push("Spec must point to a repo-local spec file, not TBD.");
  } else {
    const specAbs = resolveProjectPath(cwd, spec);
    if (!isInsideProject(cwd, specAbs)) {
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
  if (spec && spec.toLowerCase() !== "tbd" && !readFirst.includes(spec)) {
    errors.push("Read First must include the referenced spec path.");
  }

  if (!validWorkModes.has(metadata.workMode)) {
    errors.push(`Work Mode Recommendation must use one of local, worktree, or ask; found ${metadata.workMode || "(missing)"}.`);
  }

  const verification = extractSection(content, "Verification");
  const verificationCommands = extractVerificationCommands(verification);
  if (!verificationCommands.length && !sectionHasManualVerification(verification)) {
    errors.push("Verification must include executable commands or explain the manual verification evidence.");
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
  const goalsDir = join(cwd, goalsRelPath);
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
  if (!args.goal) {
    throw new Error("Usage: agent-harness goal inspect --goal <goal-file> [--cwd PATH] [--json]");
  }

  const goalPath = resolve(cwd, args.goal);
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
  console.log(`Validation: ${validation.ok ? "ok" : "failed"}`);
  for (const error of validation.errors) {
    console.log(`- ${error}`);
  }
}

function goalValidate(args) {
  const cwd = targetCwd(args);
  if (!args.goal) {
    throw new Error("Usage: agent-harness goal validate --goal <goal-file> [--cwd PATH] [--json]");
  }

  const goalPath = resolve(cwd, args.goal);
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
  return config.workMode?.defaultPolicy || config.worktree?.defaultPolicy || "ask";
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

function buildRunMarkdown({ context, createdAt, cwd, goalPath, goalContent, runDir, taskSize, workMode }) {
  const relGoal = displayPath(cwd, goalPath);
  const relRunDir = displayPath(cwd, runDir);
  const stateSyncPathList = stateSyncPaths(context);
  const adapterPath = context.paths.adapterDocs || "";
  const adapterRequirements = adapterRequirementLists(context);
  const spec = extractInlinePath(goalContent, "Spec") || "Not specified";
  const sourceTask = extractSection(goalContent, "Source Task") || "Not specified";
  const verification = extractSection(goalContent, "Verification") || "No explicit verification section was found in the goal.";
  const adapterRequirementLines = context.mode === "adapter"
    ? [
      adapterPath ? `Read \`${adapterPath}\` before editing.` : "",
      "Apply project adapter boundaries for credentials, paid calls, production, Admin CLI, DB, destructive actions, PRs, deploys, and releases.",
      ...adapterRequirements.preflight.map((item) => `Preflight: ${item}`),
      ...adapterRequirements.stateSync.map((item) => `State sync: ${item}`)
    ].filter(Boolean)
    : [];

  return `# Agent Harness Run

Created: ${createdAt}
Phase: prepared
Goal: \`${relGoal}\`
Spec: \`${spec}\`
Run directory: \`${relRunDir}\`
Harness contract: \`${context.contract}\`
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
6. Update configured state records (${formatInlinePathList(stateSyncPathList)}) after completion when the project adapter requires state sync.

${adapterRequirementLines.length ? `## Project Adapter Requirements\n\n${formatBulletList(adapterRequirementLines)}\n\n` : ""}
## Verification

${verification}

## Boundaries

- This prepared run packet does not start Codex, create a daemon, push, deploy, publish, or open a PR.
- Direct execution remains manual until a stable Codex CLI file-prompt contract is confirmed.
- Stop if the goal conflicts with repository instructions, production constraints, or newer user instructions.
`;
}

function buildPromptMarkdown({ context, cwd, goalPath, goalContent }) {
  const relGoal = displayPath(cwd, goalPath);
  const spec = extractInlinePath(goalContent, "Spec") || "the spec referenced by the goal";
  const stateSyncPathList = stateSyncPaths(context);
  const adapterPath = context.paths.adapterDocs || "";

  return `# Goal Execution Prompt

In \`${cwd}\`, execute this goal:

\`${relGoal}\`

Requirements:

- Read \`${relGoal}\` and \`${spec}\` before making edits.
- ${context.mode === "adapter" && adapterPath ? `Read \`${adapterPath}\` and apply its project-specific hard boundaries, preflight requirements, and state-sync rules.` : "Follow the repository instructions and configured harness paths."}
- Follow the goal's Scope, Non-Goals, Work Mode Recommendation, Verification, Completion Conditions, and Pause Conditions.
- Do not push, deploy, publish, open a PR, start a daemon, or automatically launch additional Codex sessions unless the user explicitly asks.
- If the checkout is dirty with unrelated work, use the worktree policy from the goal and project docs.
- After implementation, run the goal's verification commands and update configured state records (${formatInlinePathList(stateSyncPathList)}) when the project adapter requires state sync.

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
  const context = resolveHarnessContext(cwd);
  const paths = context.paths;
  if (!args.goal) {
    throw new Error("Usage: agent-harness run prepare --goal <goal-file> [--cwd PATH]");
  }

  const goalPath = resolve(cwd, args.goal);
  if (!existsSync(goalPath)) {
    throw new Error(`Goal file not found: ${args.goal}`);
  }

  const validation = validateGoal(cwd, goalPath);
  if (!validation.ok) {
    throw new Error(`Goal validation failed:\n${validation.errors.map((error) => `- ${error}`).join("\n")}`);
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
    context,
    createdAt,
    cwd,
    goalPath,
    goalContent,
    runDir,
    taskSize,
    workMode
  }));
  writeFileSync(join(runDir, "prompt.md"), buildPromptMarkdown({ context, cwd, goalPath, goalContent }));
  writeFileSync(join(runDir, "subagents.md"), buildSubagentsMarkdown({ cwd, goalPath, taskSize }));
  writeFileSync(join(runDir, "status.json"), `${JSON.stringify({
    harnessContract: context.contract,
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

const recordableRunPhases = new Set(["completed", "blocked"]);

function runRecord(args) {
  const cwd = targetCwd(args);
  if (!args.run) {
    throw new Error("Usage: agent-harness run record --run <run-dir> --phase completed|blocked --summary <text> [--verification <text>] [--cwd PATH] [--json]");
  }
  if (!recordableRunPhases.has(args.phase)) {
    throw new Error(`Invalid --phase: ${args.phase || "(missing)"}`);
  }
  if (!args.summary) {
    throw new Error("Missing --summary <text>");
  }

  const runDir = resolve(cwd, args.run);
  const statusPath = join(runDir, "status.json");
  if (!existsSync(statusPath)) {
    throw new Error(`Missing ${displayPath(cwd, statusPath)}`);
  }

  const now = new Date().toISOString();
  const status = JSON.parse(readFileSync(statusPath, "utf8"));
  const nextStatus = {
    ...status,
    phase: args.phase,
    updatedAt: now,
    summary: args.summary,
    verificationSummary: args.verification || status.verificationSummary || ""
  };
  const logsDir = join(runDir, "logs");
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
`;

  writeFileSync(statusPath, `${JSON.stringify(nextStatus, null, 2)}\n`);
  writeFileSync(logPath, logContent);

  const payload = {
    run: displayPath(cwd, runDir),
    status: displayPath(cwd, statusPath),
    log: displayPath(cwd, logPath),
    phase: args.phase,
    summary: args.summary,
    verificationSummary: nextStatus.verificationSummary
  };

  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  console.log(`Recorded run ${args.phase}: ${displayPath(cwd, runDir)}`);
  console.log(`Status: ${displayPath(cwd, statusPath)}`);
  console.log(`Log: ${displayPath(cwd, logPath)}`);
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
