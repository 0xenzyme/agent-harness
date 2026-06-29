#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const pluginRoot = resolve(dirname(__filename), "..");
const templateRoot = join(pluginRoot, "templates");

const configRelPath = ".agent-harness/config.json";

const fixedContract = {
  contract: "fixed",
  tasks: "tasks.md",
  taskIndex: "tasks.md",
  config: configRelPath,
  status: ".agent-harness/status.md",
  goals: ".agent-harness/goals",
  runs: ".agent-harness/runs"
};

const adapterContract = {
  contract: "adapter",
  taskIndex: "tasks.md",
  config: configRelPath,
  adapterDocs: "docs/harness/README.md",
  status: ".agent-harness/status.md",
  specs: "docs/specs",
  goals: "docs/goals",
  milestones: "docs/milestones",
  runs: ".agent-harness/runs",
  gateRecords: ".agent-harness/runs",
  deferredRegister: "docs/milestones",
  mentalModel: "docs/mental-model.md"
};

const commonTaskIndexCandidates = [
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
    "lang",
    "contract",
    "mode",
    "projectName",
    "project-name",
    "run",
    "spec",
    "taskIndex",
    "task-index",
    "task",
    "workMode",
    "work-mode"
  ]);
  const booleanOptions = new Set(["dryRun", "dry-run", "force", "help", "json"]);

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
  agent-harness config inspect [--cwd PATH] [--json]
  agent-harness config import [--cwd PATH] [--task-index PATH] [--dry-run] [--force] [--json]
  agent-harness adapter inspect [--cwd PATH] [--json]
  agent-harness worktree recommend [--cwd PATH] [--json] [--lang CODE]
  agent-harness goal create --task <title-or-id> [--cwd PATH] [--spec PATH] [--work-mode local|worktree|ask] [--dry-run] [--force]
  agent-harness run prepare --goal <goal-file> [--cwd PATH]
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
  agent-harness config inspect [--cwd PATH] [--json]
  agent-harness config import [--cwd PATH] [--task-index PATH] [--dry-run] [--force] [--json]
  agent-harness adapter inspect [--cwd PATH] [--json]
  agent-harness worktree recommend [--cwd PATH] [--json] [--lang CODE]
  agent-harness goal create --task <title-or-id> [--cwd PATH] [--spec PATH] [--work-mode local|worktree|ask] [--dry-run] [--force]
  agent-harness run prepare --goal <goal-file> [--cwd PATH]
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

function languageFromConfig(cwd) {
  const configPath = join(cwd, configRelPath);
  if (!existsSync(configPath)) {
    return "";
  }

  try {
    const config = JSON.parse(readFileSync(configPath, "utf8"));
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
  const configPath = join(cwd, configRelPath);
  if (!existsSync(configPath)) {
    return {};
  }

  try {
    return JSON.parse(readFileSync(configPath, "utf8"));
  } catch (error) {
    throw new Error(`Could not parse ${configRelPath}: ${error.message}`);
  }
}

function pathExists(cwd, relPath) {
  return Boolean(relPath && existsSync(join(cwd, relPath)));
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
    || (pathExists(cwd, adapterContract.adapterDocs) ? adapterContract.adapterDocs : "");
  const taskIndex = chooseExistingTaskIndex(cwd, options.taskIndex || "");
  const specs = pathExists(cwd, adapterContract.specs) ? adapterContract.specs : "";
  const goals = pathExists(cwd, adapterContract.goals) ? adapterContract.goals : "";
  const milestones = pathExists(cwd, adapterContract.milestones) ? adapterContract.milestones : "";
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
  payload.paths.mentalModel = discovery.mentalModel || payload.paths.mentalModel || adapterContract.mentalModel;

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

function resolvedAdapterPaths(config) {
  const paths = config.paths || {};
  const adapter = config.adapter || {};
  return {
    taskIndex: paths.taskIndex || paths.tasks || adapterContract.taskIndex,
    tasks: paths.taskIndex || paths.tasks || adapterContract.taskIndex,
    config: configRelPath,
    adapterDocs: adapter.docs || adapterContract.adapterDocs,
    status: paths.status || adapterContract.status,
    specs: paths.specs || adapterContract.specs,
    goals: paths.goals || adapterContract.goals,
    milestones: paths.milestones || adapterContract.milestones,
    runs: paths.runs || adapterContract.runs,
    gateRecords: paths.gateRecords || paths.runs || adapterContract.gateRecords,
    deferredRegister: paths.deferredRegister || paths.milestones || adapterContract.deferredRegister,
    mentalModel: paths.mentalModel || adapterContract.mentalModel
  };
}

function resolveHarnessContext(cwd) {
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
    const resolvedPaths = resolvedAdapterPaths(config);
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
        resolvedPaths.mentalModel
      ]
      : [
        resolvedPaths.gateRecords,
        resolvedPaths.deferredRegister,
        resolvedPaths.mentalModel
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
    config: configRelPath,
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

function fixedPathsFromConfig(config) {
  const paths = config.paths || {};
  return {
    taskIndex: paths.tasks || paths.taskIndex || fixedContract.taskIndex,
    config: configRelPath,
    status: paths.status || fixedContract.status,
    goals: paths.goals || fixedContract.goals,
    runs: paths.runs || fixedContract.runs
  };
}

function configExists(cwd) {
  return existsSync(join(cwd, configRelPath));
}

function renderAdapterTemplate(paths) {
  return readTemplate("adapter.md")
    .replace("- Task index: `tasks.md`", `- Task index: \`${paths.taskIndex}\``)
    .replace("- Status file: `.agent-harness/status.md`", `- Status file: \`${paths.status}\``)
    .replace("- Specs: `docs/specs/`", `- Specs: \`${paths.specs}/\``)
    .replace("- Goals: `docs/goals/`", `- Goals: \`${paths.goals}/\``)
    .replace("- Milestones: `docs/milestones/`", `- Milestones: \`${paths.milestones}/\``)
    .replace("- Runs / logs: `.agent-harness/runs/`", `- Runs / logs: \`${paths.runs}/\``)
    .replace("- Gate records: `.agent-harness/runs/`", `- Gate records: \`${paths.gateRecords}/\``)
    .replace("- Deferred register: `docs/milestones/`", `- Deferred register: \`${paths.deferredRegister}/\``);
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

function ensureImportSupportArtifacts(cwd, paths, created) {
  if (writeIfMissing(join(cwd, paths.status), readTemplate("status.md"))) {
    created.push(paths.status);
  }
  for (const dir of [paths.specs, paths.goals, paths.milestones, paths.runs]) {
    ensureDir(cwd, dir, created);
  }
}

function initPlan(args, cwd, projectName) {
  if (configExists(cwd)) {
    const config = loadProjectConfig(cwd);
    const existingMode = normalizeHarnessContract(config);
    if (hasRequestedContract(args)) {
      const requested = requestedContract(args);
      if (requested !== existingMode) {
        throw new Error(
          `Existing ${configRelPath} is ${existingMode}; requested init contract is ${requested}. Use a migration command instead of init.`
        );
      }
    }
    return {
      mode: existingMode,
      configPayload: config,
      paths: existingMode === "adapter"
        ? resolvedAdapterPaths(config)
        : fixedPathsFromConfig(config),
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
    ? [paths.specs, paths.goals, paths.milestones, paths.runs]
    : [paths.goals, paths.runs];
  for (const dir of dirs) {
    mkdirSync(join(cwd, dir), { recursive: true });
  }

  console.log(t(lang, "initDone", { cwd }));
  console.log(created.length ? t(lang, "initCreated", { files: created.join(", ") }) : t(lang, "initNoChanges"));
}

function configImport(args) {
  const cwd = targetCwd(args);
  const projectName = args.projectName || basename(cwd);
  const configPath = join(cwd, configRelPath);
  const discovery = discoverAdapterProject(cwd, {
    taskIndex: args.taskIndex,
    adapterDocs: args.adapterDocs
  });

  if (!discovery.detected) {
    throw new Error(
      `No existing project adapter found. Expected ${adapterContract.adapterDocs} plus an existing task index such as todolist.md or tasks.md.`
    );
  }
  if (!discovery.adapterDocs || !existsSync(join(cwd, discovery.adapterDocs))) {
    throw new Error("Could not find an existing project adapter. Pass --adapter-docs <path> to import one explicitly.");
  }
  if (!discovery.taskIndex || !existsSync(join(cwd, discovery.taskIndex))) {
    throw new Error("Could not find an existing task index. Pass --task-index <path> to import one explicitly.");
  }
  if (existsSync(configPath) && !args.force) {
    throw new Error(`${configRelPath} already exists. Use --force to overwrite.`);
  }

  const configPayload = buildAdapterConfigPayload(projectName, discovery);
  const paths = resolvedAdapterPaths(configPayload);

  const payload = {
    dryRun: Boolean(args.dryRun),
    wouldCreate: [
      configRelPath,
      paths.status,
      paths.specs,
      paths.goals,
      paths.milestones,
      paths.runs
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
            done: ["done", "cancelled"].includes(status.toLowerCase()),
            priority,
            title,
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

function findTask(tasks, query, taskIndexPath = "tasks.md") {
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
Status: Draft goal handoff; execute only after the spec is confirmed by the user.

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

## Completion Conditions

- The source task acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- Update configured state records (${formatInlinePathList(stateSyncPathList)}) when the project adapter requires state sync.

## Pause Conditions

- The spec has not been confirmed by the user.
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
    } else if (command === "run" && subcommand === "prepare") {
      runPrepare(args);
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
