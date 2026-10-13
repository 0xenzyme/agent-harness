import { existsSync, readFileSync, readdirSync, lstatSync, rmSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { createHash } from "node:crypto";

const digest = (value) => createHash("sha256").update(value).digest("hex");
const jsonText = (value) => `${JSON.stringify(value, null, 2)}\n`;
const now = () => new Date().toISOString();
const safeId = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const normalizedFailureLog = value => value.replace(/\x1b\[[0-9;]*m/g, "")
  .replace(/(^[ \t]*(?:#\s*)?duration_ms:?)\s*[0-9.]+.*$/gm, "$1 <elapsed>")
  .replace(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z\b/g, "<timestamp>");
const mapSections = new Map([
  ["Spec Acceptance Checklist", "Item"], ["Milestone Completion Map", "Item"],
  ["Stage Completion Map", "Item"], ["Required Gate Evidence", "Gate"],
  ["Source Task Acceptance Map", "Task"]
]);

// This module owns planned execution only. The injected services keep all path,
// Goal, Run and checkpoint checks shared with the legacy CLI.
export function createPlannedExecution(s) {
  const path = (cwd, ref, label = "Plan artifact") => s.configuredPath(cwd, ref, label);
  const observed = new Map();
  const observations = [];
  function readObserved(absolute) {
    const raw = readFileSync(absolute, "utf8"), hash = digest(raw);
    if (observed.has(absolute) && observed.get(absolute) !== hash) throw new Error(`Artifact changed during inspection; reconcile before writing: ${absolute}`);
    observed.set(absolute, hash);
    return raw;
  }
  const readJson = absolute => JSON.parse(readObserved(absolute));
  const content = (cwd, ref) => readObserved(path(cwd, ref));
  function nodeStatus(directory, node) {
    const absolute = s.artifactPath(directory, node.status, "Planned node status");
    if (!existsSync(absolute)) throw new Error(`Planned node status is missing; inspect executor before recovery: ${node.id}`);
    return readJson(absolute);
  }
  const refPath = (cwd, absolute) => s.displayPath(cwd, absolute);
  const emit = (args, payload) => {
    if (args.json) console.log(jsonText(payload).trimEnd());
    else console.log(payload.action ? `${payload.action}: ${payload.reason}` : `${payload.ok === false ? "Invalid" : "OK"}: ${payload.target?.path || payload.run || payload.plan || "execution"}`);
    return payload;
  };
  const rootFor = (cwd, context, kind) => path(cwd, kind === "goal" ? context.paths.goals : context.paths.milestones);
  function documentPath(cwd, context, kind, ref) {
    return s.assertContainedPath(rootFor(cwd, context, kind), path(cwd, ref), `${kind} document`);
  }
  function object(value, keys, label) {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be an object.`);
    for (const key of Object.keys(value)) if (!keys.includes(key)) throw new Error(`${label} has unknown field '${key}'.`);
  }
  function strings(values, label, { nonempty = false } = {}) {
    if (!Array.isArray(values) || (nonempty && !values.length) || values.some(v => typeof v !== "string" || !v.trim()) || new Set(values).size !== values.length) throw new Error(`${label} must be a ${nonempty ? "nonempty " : ""}unique string array.`);
  }
  function graph(items, label) {
    const ids = new Set();
    for (const item of items) {
      if (typeof item.id !== "string" || !safeId.test(item.id) || ids.has(item.id)) throw new Error(`${label} has a duplicate or invalid id: ${item.id}`);
      ids.add(item.id);
      strings(item.dependsOn, `${label} ${item.id} dependsOn`);
    }
    const byId = new Map(items.map(i => [i.id, i]));
    const visiting = new Set(), visited = new Set();
    function visit(id) {
      if (visiting.has(id)) throw new Error(`${label} dependency cycle at '${id}'.`);
      if (visited.has(id)) return;
      visiting.add(id);
      for (const dep of byId.get(id).dependsOn) {
        if (!ids.has(dep)) throw new Error(`${label} '${id}' has unknown dependency '${dep}'.`);
        visit(dep);
      }
      visiting.delete(id); visited.add(id);
    }
    for (const id of ids) visit(id);
  }
  function verification(cwd, values, label) {
    if (!Array.isArray(values) || !values.length) throw new Error(`${label} needs verification requirements.`);
    const ids = new Set();
    for (const check of values) {
      object(check, ["id", "command", "inputs", "manual"], label);
      if (typeof check.id !== "string" || !safeId.test(check.id) || ids.has(check.id)) throw new Error(`${label} has duplicate or invalid check id.`);
      ids.add(check.id);
      if (typeof check.command !== "string" || s.missingEvidence(check.command)) throw new Error(`${label} needs a concrete command or manual review description.`);
      if (check.manual !== undefined && typeof check.manual !== "boolean") throw new Error(`${label} manual must be boolean.`);
      strings(check.inputs, `${label} inputs`, { nonempty: true });
      for (const input of check.inputs) path(cwd, input, "Verification input");
    }
  }
  const refKey = (ref) => JSON.stringify([ref.path, ref.section, ref.item]);
  function acceptanceItem(cwd, context, ref) {
    object(ref, ["path", "section", "item"], "Acceptance reference");
    if (!mapSections.has(ref.section) || s.missingEvidence(ref.item)) throw new Error("Acceptance reference needs a supported section and concrete item.");
    const absolute = path(cwd, ref.path, "Acceptance document");
    const roots = [context.paths.goals, context.paths.specs || ".", context.paths.milestones].filter(Boolean).map(r => path(cwd, r));
    if (!roots.some(root => s.isPathInside(root, absolute))) throw new Error("Acceptance reference must be inside configured Goal, Spec or Milestone roots.");
    const section = s.extractSection(readObserved(absolute), ref.section);
    const matches = s.parseEvidenceItems(section, mapSections.get(ref.section)).filter(i => i.label === ref.item);
    if (matches.length !== 1) throw new Error(`Acceptance reference must resolve exactly once: ${ref.path} / ${ref.section} / ${ref.item}`);
    return matches[0];
  }
  function immutableDocument(text) {
    let result = text;
    for (const section of mapSections.keys()) {
      const body = s.extractSection(result, section);
      if (body) result = s.replaceMarkdownSection(result, section, body.replace(/^[ \t]+-\s+(Evidence|Status|Unblocker):.*$/gmi, ""));
    }
    return result;
  }
  function milestoneGoalRows(cwd, context, targetPath) {
    const rows = [];
    for (const line of s.extractSection(content(cwd, targetPath), "Goal List").split("\n")) {
      if (!line.trim().startsWith("|")) continue;
      const cells = line.trim().replace(/^\||\|$/g, "").split("|").map(c => s.cleanMapValue(c.trim()));
      if (cells[0]?.toLowerCase() === "goal" || cells.every(c => /^:?-+:?$/.test(c))) continue;
      if (cells.length < 4 || s.missingEvidence(cells[3])) throw new Error("Milestone Goal List rows require a concrete Goal Doc path.");
      const linked = cells[3].match(/^\[[^\]]+\]\(([^)]+)\)$/);
      const goalPath = linked ? linked[1] : cells[3];
      documentPath(cwd, context, "goal", goalPath);
      rows.push({ name: cells[0], path: goalPath, status: cells[1], priority: cells[2], dependsOn: cells[4] || "", gate: cells[5] || "" });
    }
    if (new Set(rows.map(r => r.path)).size !== rows.length) throw new Error("Milestone Goal List has duplicate Goal paths.");
    return rows;
  }
  function targetContract(cwd, plan, context) {
    const text = content(cwd, plan.target.path);
    return {
      target: plan.target,
      ...(plan.target.kind === "milestone" ? { goalList: milestoneGoalRows(cwd, context, plan.target.path).map(({ status, ...row }) => row) } : {}),
      sections: Object.fromEntries(["Objective", "Scope", "Non-Goals", "Required Specs", "Verification", "Completion Conditions", "Pause Conditions"].map(name => [name, s.extractSection(text, name).trim()])),
      acceptance: [...mapSections].map(([name, label]) => [name, s.parseEvidenceItems(s.extractSection(text, name), label).map(i => ({ label: i.label, acceptance: i.acceptance, required: i.required }))])
    };
  }
  function load(cwd, context, planRef) {
    const absolute = path(cwd, planRef, "Execution plan");
    const plan = readJson(absolute);
    object(plan, ["version", "target", "goals", "verification"], "Execution plan");
    if (plan.version !== 1) throw new Error("Execution plan version must be 1.");
    object(plan.target, ["kind", "path"], "Plan target");
    if (!["goal", "milestone"].includes(plan.target.kind)) throw new Error("Plan target kind must be goal or milestone.");
    documentPath(cwd, context, plan.target.kind, plan.target.path);
    if (refPath(cwd, absolute) !== `${plan.target.path}.plan.json`) throw new Error("Execution plan must be beside its target as <target filename>.plan.json.");
    if (s.extractInlinePath(content(cwd, plan.target.path), "Execution Plan") !== planRef) throw new Error("Target Execution Plan reference does not match the plan.");
    if (!Array.isArray(plan.goals) || !plan.goals.length) throw new Error("Execution plan needs at least one Goal.");
    graph(plan.goals, "Goal graph");
    const goalPaths = new Set(), covered = new Set();
    for (const goal of plan.goals) {
      object(goal, ["id", "path", "dependsOn", "milestoneItem", "tasks"], "Planned Goal");
      documentPath(cwd, context, "goal", goal.path);
      if (goalPaths.has(goal.path)) throw new Error("A Goal path occurs more than once in the plan.");
      goalPaths.add(goal.path);
      const goalText = content(cwd, goal.path);
      if (!["active", "completed", "blocked"].includes(s.canonicalGoalStatus(s.extractStatusLine(goalText)))) throw new Error(`Planned Goal ${goal.id} needs Status active, completed or blocked.`);
      const validation = s.validateGoal(cwd, documentPath(cwd, context, "goal", goal.path), { checkCompletion: false });
      if (!validation.ok) throw new Error(`Planned Goal ${goal.id} contract is invalid: ${validation.errors.join("; ")}`);
      if (s.extractInlinePath(goalText, "Execution Plan") !== planRef) throw new Error(`Goal ${goal.id} must reference the same Execution Plan.`);
      if (plan.target.kind === "milestone") {
        if (!goal.milestoneItem || goal.milestoneItem.path !== plan.target.path || goal.milestoneItem.section !== "Milestone Completion Map") throw new Error("Every Goal must map to a target Milestone Completion Map item.");
        acceptanceItem(cwd, context, goal.milestoneItem);
        if (covered.has(refKey(goal.milestoneItem))) throw new Error("Milestone items must map to exactly one Goal.");
        covered.add(refKey(goal.milestoneItem));
      } else if (plan.goals.length !== 1 || goal.path !== plan.target.path || goal.dependsOn.length) throw new Error("Single-Goal plan must contain exactly its target Goal without external dependencies.");
      if (!Array.isArray(goal.tasks) || !goal.tasks.length) throw new Error(`Goal ${goal.id} needs Tasks.`);
      graph(goal.tasks, `Task graph for ${goal.id}`);
      const mapped = new Set();
      const metadata = s.goalMetadata(cwd, documentPath(cwd, context, "goal", goal.path));
      if (metadata.specExists) content(cwd, metadata.specPath);
      for (const task of goal.tasks) {
        object(task, ["id", "label", "dependsOn", "type", "ownership", "acceptance", "verification", "question"], "Planned Task");
        if (!["implementation", "verification", "human"].includes(task.type)) throw new Error(`Task ${task.id} type must be implementation, verification or human.`);
        if (task.label !== undefined && (typeof task.label !== "string" || s.missingEvidence(task.label))) throw new Error("Task label must be a concrete string.");
        if (task.type === "human" && (typeof task.question !== "string" || s.missingEvidence(task.question))) throw new Error("Human Tasks need a concrete question.");
        object(task.ownership, ["read", "write"], "Task ownership");
        strings(task.ownership.read, "Read ownership"); strings(task.ownership.write, "Write ownership");
        if (task.type !== "implementation" && task.ownership.write.length) throw new Error("Verification and human Tasks cannot own source writes.");
        for (const p of [...task.ownership.read, ...task.ownership.write]) path(cwd, p, "Task owned path");
        const controls = [context.paths.goals, context.paths.specs, metadata.specExists ? metadata.specPath : "", context.paths.milestones, context.paths.runs, context.paths.status, context.paths.taskIndex || context.paths.tasks, context.paths.config].filter(Boolean);
        for (const owned of task.ownership.write) {
          const absolute = path(cwd, owned, "Task write scope");
          if (controls.some(p => s.isPathInside(path(cwd, p), absolute))) throw new Error("Task write scope cannot be an authoritative Harness artifact.");
        }
        if (!Array.isArray(task.acceptance) || !task.acceptance.length) throw new Error(`Task ${task.id} needs acceptance mappings.`);
        for (const ref of task.acceptance) {
          if (![goal.path, metadata.specPath].filter(Boolean).includes(ref.path)) throw new Error("Task acceptance must belong to its Goal or referenced Spec.");
          acceptanceItem(cwd, context, ref);
          if (mapped.has(refKey(ref))) throw new Error(`Acceptance item mapped by multiple Tasks: ${ref.item}`);
          mapped.add(refKey(ref));
        }
        verification(cwd, task.verification, `Task ${task.id}`);
        if (task.type === "human" && task.verification.some(c => !c.manual)) throw new Error("Human Task verification must be manual.");
      }
      for (const section of ["Spec Acceptance Checklist", "Required Gate Evidence", "Milestone Completion Map", "Stage Completion Map", "Source Task Acceptance Map"]) {
        const source = s.extractSection(goalText, section) ? goal.path : metadata.specPath;
        if (!source) continue;
        for (const item of s.parseEvidenceItems(s.extractSection(content(cwd, source), section), mapSections.get(section))) {
          if (!mapped.has(refKey({ path: source, section, item: item.label }))) throw new Error(`Missing acceptance mapping: ${source} / ${section} / ${item.label}`);
        }
      }
    }
    if (plan.target.kind === "milestone") {
      const rows = milestoneGoalRows(cwd, context, plan.target.path);
      if (rows.length && (rows.length !== plan.goals.length || rows.some(r => !plan.goals.some(g => g.path === r.path)))) throw new Error("Execution plan must cover every required Goal in Milestone Goal List exactly once.");
      verification(cwd, plan.verification, "Milestone verification");
      for (const item of s.parseEvidenceItems(s.extractSection(content(cwd, plan.target.path), "Milestone Completion Map"), "Item")) {
        if (!covered.has(refKey({ path: plan.target.path, section: "Milestone Completion Map", item: item.label }))) throw new Error(`Unmapped required Milestone item: ${item.label}`);
      }
    } else if (plan.verification !== undefined) {
      verification(cwd, plan.verification, "Target verification");
      for (const required of plan.verification) {
        if (!plan.goals[0].tasks.some(t => t.verification.some(c => JSON.stringify(c) === JSON.stringify(required)))) throw new Error(`Goal target verification must also be assigned to a Task: ${required.id}`);
      }
    }
    return { plan, ref: planRef, absolute, hash: digest(readFileSync(absolute)), targetHash: digest(JSON.stringify(targetContract(cwd, plan, context))) };
  }
  function resolvePlan(cwd, context, goalRef, supplied = "") {
    const bound = s.extractInlinePath(content(cwd, goalRef), "Execution Plan");
    if (supplied && bound && supplied !== bound) throw new Error("Supplied plan conflicts with the target's Execution Plan reference.");
    return supplied || bound ? load(cwd, context, supplied || bound) : null;
  }
  function planValidate(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    try {
      if (!args.plan) throw new Error("plan validate requires --plan PATH.");
      const loaded = load(cwd, context, args.plan);
      return emit(args, { ok: true, plan: args.plan, target: loaded.plan.target, goalCount: loaded.plan.goals.length, taskCount: loaded.plan.goals.reduce((n, g) => n + g.tasks.length, 0), errors: [] });
    } catch (error) { process.exitCode = 1; return emit(args, { ok: false, plan: args.plan || "", errors: [error.message] }); }
  }
  function compile(cwd, goalPath, loaded, communication, workMode, executionRole) {
    const goalRef = refPath(cwd, goalPath), goal = loaded.plan.goals.find(g => g.path === goalRef);
    if (!goal) throw new Error("Goal is not included in the execution plan.");
    const nodes = goal.tasks.map(task => ({
      id: task.id, label: task.label || task.id,
      mode: task.type === "implementation" ? "implementer" : "read/execute",
      dependencies: task.dependsOn, ownership: JSON.stringify(task.ownership),
      expectedOutput: "Candidate JSON receipt, validation logs, input hashes and State Sync Notes for controller review",
      stopConditions: task.question || "accepted scope conflict or concrete missing authority",
      prompt: `agents/${task.id}/prompt.md`, status: `agents/${task.id}/status.json`, result: `agents/${task.id}/result.md`,
      candidate: `agents/${task.id}/candidate.json`, task
    }));
    return {
      version: 1, goalPath: goalRef, taskSize: "planned", workMode, executionRole, communication,
      enforcement: "required-before-run-completion", launchPolicy: "runtime-dispatched",
      runtimeOwnership: "host schedules and observes executors; controller reviews and accepts candidate evidence",
      parallelSafety: { requirement: "separate locked worktrees or proven non-overlapping read/write scope" },
      executionPlan: { path: loaded.ref, sha256: loaded.hash, target: loaded.plan.target, targetContractHash: loaded.targetHash, goalId: goal.id },
      nodes, edges: nodes.flatMap(n => n.dependencies.map(from => ({ from, to: n.id }))), parallelLayers: s.dagParallelLayers(nodes)
    };
  }
  function validateBinding(cwd, context, manifest) {
    if (manifest.manifestVersion !== 2) return;
    if (!manifest.executionPlan) throw new Error("Planned manifest is missing executionPlan binding.");
    let loaded;
    try { loaded = load(cwd, context, manifest.executionPlan.path); }
    catch (error) { throw new Error(`Execution plan or target contract changed after Run preparation; prepare a replacement Run. ${error.message}`); }
    if (loaded.hash !== manifest.executionPlan.sha256 || loaded.targetHash !== manifest.executionPlan.targetContractHash) throw new Error("Execution plan or target contract changed after Run preparation; prepare a replacement Run.");
    const goal = loaded.plan.goals.find(g => g.id === manifest.executionPlan.goalId);
    if (!goal || goal.path !== manifest.goalPath) throw new Error("Planned Run Goal binding is invalid.");
    return loaded;
  }
  function snapshot(cwd, context, inputs) {
    const out = {};
    const excluded = [".git", "node_modules", ...[context.paths.runs, context.paths.goals, context.paths.specs, context.paths.milestones, context.paths.config, refPath(cwd, journalPath(cwd, context)), refPath(cwd, join(controlRoot(cwd, context), ".harness-record.lock")), context.paths.status, context.paths.taskIndex || context.paths.tasks].filter(Boolean)].map(p => path(cwd, p));
    function hashPath(absolute) {
      s.assertContainedPath(cwd, absolute, "Verification input");
      if (!existsSync(absolute)) return digest("missing");
      const stat = lstatSync(absolute);
      if (stat.isSymbolicLink()) throw new Error("Verification inputs cannot contain symbolic links.");
      if (stat.isDirectory()) {
        return digest(JSON.stringify(readdirSync(absolute).sort().filter(name => !excluded.some(p => s.isPathInside(p, join(absolute, name)))).map(name => [name, hashPath(join(absolute, name))])));
      }
      if (!stat.isFile()) throw new Error("Verification input must be a regular file or directory.");
      return digest(readFileSync(absolute));
    }
    for (const ref of [...new Set(inputs)].sort()) {
      const absolute = path(cwd, ref, "Verification input");
      if (excluded.some(p => s.isPathInside(p, absolute))) throw new Error("Verification inputs cannot be mutable Harness control artifacts.");
      out[ref] = hashPath(absolute);
    }
    observations.push(() => {
      for (const [ref, expected] of Object.entries(out)) if (hashPath(path(cwd, ref, "Verification input")) !== expected) throw new Error(`Verification input changed during review: ${ref}`);
    });
    return out;
  }
  function evidenceChecks(cwd, context, receipt, requirements, { allowFailure = false, earliest = 0, runRoot = "" } = {}) {
    if (!Array.isArray(receipt.checks)) throw new Error("Evidence receipt needs checks.");
    const ids = new Set();
    for (const check of receipt.checks) {
      if (ids.has(check.id)) throw new Error("Evidence contains duplicate check ids.");
      ids.add(check.id);
    }
    for (const required of requirements) {
      const check = receipt.checks.find(c => c.id === required.id);
      if (!check || check.command !== required.command || !Number.isInteger(check.exitCode) || (!allowFailure && check.exitCode !== 0)) throw new Error(`Missing or failed verification: ${required.id}`);
      if (!Number.isFinite(Date.parse(check.observedAt)) || Date.parse(check.observedAt) > Date.now() + 5000 || Date.parse(check.observedAt) < earliest) throw new Error("Verification observedAt must be a valid non-future timestamp.");
      if (!check.inputs || JSON.stringify(Object.entries(check.inputs).sort()) !== JSON.stringify(Object.entries(snapshot(cwd, context, required.inputs)).sort())) throw new Error(`Verification inputs changed; revalidate ${required.id}.`);
      const log = path(cwd, check.log, "Verification log");
      if (!s.isPathInside(runRoot || path(cwd, context.paths.runs), log)) throw new Error("Verification logs must be recorded under their bound Run.");
      if (!existsSync(log) || !lstatSync(log).isFile() || lstatSync(log).isSymbolicLink() || digest(readFileSync(log)) !== check.logHash) throw new Error(`Verification log missing or changed: ${required.id}`);
      if (s.missingEvidence(readFileSync(log, "utf8"))) throw new Error("Verification logs must contain concrete evidence.");
      observations.push(() => {
        if (!existsSync(log) || digest(readFileSync(log)) !== check.logHash) throw new Error(`Verification log changed during review: ${required.id}`);
      });
      if (required.manual && s.missingEvidence(check.humanDecision)) throw new Error("Manual verification requires a recorded humanDecision.");
    }
  }
  function runState(cwd, context, runRef, { checkContract = true, recovering = false } = {}) {
    const directory = s.configuredRunDir(cwd, context, runRef), status = readJson(s.artifactPath(directory, "status.json"));
    const manifestState = s.runManifestState(directory, status);
    if (!manifestState.managed) throw new Error(manifestState.error);
    const manifest = manifestState.manifest, dag = s.readExecutionDag(directory);
    readObserved(s.artifactPath(directory, "checkpoint.json", "Planned checkpoint"));
    for (const node of dag.nodes) nodeStatus(directory, node);
    const checkpoint = s.readRunCheckpoint({ cwd, context, runDir: directory, status, manifest, requireTerminalConsistency: !recovering });
    if (checkpoint.errors.length) throw new Error(checkpoint.errors.join("; "));
    if (checkContract) {
      const goalContext = s.runGoalContext(cwd, context, status);
      s.assertPreparedRunContract({ cwd, context, runDir: directory, status, dag, ...goalContext });
    }
    return { directory, ref: runRef, status, manifest, dag, checkpoint: checkpoint.checkpoint };
  }
  function runsFor(cwd, context, goalRef, loaded) {
    const root = path(cwd, context.paths.runs), matches = [];
    if (!existsSync(root)) return matches;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.isSymbolicLink() || entry.name.startsWith(".")) continue;
      const directory = s.assertContainedPath(root, join(root, entry.name), "Run directory");
      const statusPath = s.artifactPath(directory, "status.json");
      if (!existsSync(statusPath)) continue;
      const status = readJson(statusPath);
      if (status.goalPath !== goalRef) continue;
      const manifestPath = s.artifactPath(directory, "manifest.json");
      if (!existsSync(manifestPath)) continue;
      const manifest = readJson(manifestPath);
      if (manifest.manifestVersion !== 2 || manifest.executionPlan?.path !== loaded.ref) continue;
      const checkpointPath = s.artifactPath(directory, "checkpoint.json");
      if (existsSync(checkpointPath) && readJson(checkpointPath).controlState === "superseded") continue;
      matches.push({ directory, ref: refPath(cwd, directory), status, manifest });
    }
    return matches;
  }
  function acceptedReceipt(cwd, context, run, node) {
    const status = nodeStatus(run.directory, node);
    if (status.phase !== "completed" || status.review?.decision !== "accepted") throw new Error(`Task ${node.id} has not been accepted by the controller.`);
    const receiptPath = s.artifactPath(run.directory, status.review.receipt, "Accepted receipt");
    const raw = readFileSync(receiptPath, "utf8");
    if (digest(raw) !== status.review.sha256) throw new Error(`Accepted receipt changed for ${node.id}.`);
    const receipt = JSON.parse(raw);
    if (receipt.version !== 1 || receipt.run !== run.ref || receipt.goal !== run.status.goalPath || receipt.node !== node.id || JSON.stringify(receipt.target) !== JSON.stringify(run.manifest.executionPlan.target)) throw new Error("Accepted receipt identity no longer matches the Run.");
    evidenceChecks(cwd, context, receipt, node.task.verification, { earliest: Date.parse(run.manifest.createdAt), runRoot: run.directory });
    return receipt;
  }
  function completionErrors(cwd, context, goalRef, runRef = "", { closing = false } = {}) {
    const errors = [];
    try {
      const loaded = resolvePlan(cwd, context, goalRef);
      if (!loaded) return errors;
      const matches = runsFor(cwd, context, goalRef, loaded);
      const boundRun = runRef || s.extractInlinePath(content(cwd, goalRef), "Completion Run");
      const selected = matches.find(r => r.ref === boundRun);
      if (!selected) throw new Error("Completed planned Goal requires its accepted Run.");
      const run = runState(cwd, context, selected.ref);
      for (const node of run.dag.nodes) acceptedReceipt(cwd, context, run, node);
      if (!closing && (run.status.phase !== "completed" || run.checkpoint.controlState !== "completed")) throw new Error("Completed Goal requires completed Run/checkpoint and synchronized state.");
      const goal = loaded.plan.goals.find(g => g.path === goalRef);
      for (const dependency of goal.dependsOn) {
        const dep = loaded.plan.goals.find(g => g.id === dependency);
        if (s.canonicalGoalStatus(s.extractStatusLine(content(cwd, dep.path))) !== "completed") throw new Error(`Goal dependency is not accepted: ${dependency}`);
        const depErrors = s.goalEvidenceErrors(cwd, context, dep.path);
        if (depErrors.length) throw new Error(`Goal dependency evidence invalid: ${dependency}: ${depErrors.join("; ")}`);
        const fresh = completionErrors(cwd, context, dep.path);
        if (fresh.length) throw new Error(fresh.join("; "));
      }
      if (!closing) {
        const index = content(cwd, context.paths.taskIndex || context.paths.tasks);
        const source = s.goalSourceTask(content(cwd, goalRef));
        const tasks = s.parseTasks(index).filter(t => s.normalizedTaskTitle(t.title) === s.normalizedTaskTitle(source.title));
        if (tasks.length !== 1 || !s.isDoneTask(tasks[0])) throw new Error("Completed Goal task index is not synchronized.");
        if (loaded.plan.target.kind === "milestone") {
          const row = milestoneGoalRows(cwd, context, loaded.plan.target.path).find(row => row.path === goalRef);
          if (row && s.canonicalGoalStatus(row.status) !== "completed") throw new Error("Completed Goal Milestone Goal List status is not synchronized.");
        }
        if (existsSync(journalPath(cwd, context))) throw new Error("Project has unfinished state synchronization.");
        const status = content(cwd, context.paths.status);
        const projection = s.extractSection(status, "Harness Execution");
        if (!projection.includes("State sync: verified") || status.split("\n").length > (context.config.artifactPolicy?.status?.maxLines || 160)) throw new Error("Completed Goal bounded status is not synchronized.");
        // Status projects the current target. Later accepted work may replace
        // that projection without reopening historical completed Goals.
        if (projection.includes(`Target: \`${loaded.plan.target.path}\``) && loaded.plan.target.kind === "goal" && !projection.includes("Phase: completed")) throw new Error("Completed Goal status phase is not synchronized.");
      }
    } catch (error) { errors.push(error.message); }
    return errors;
  }
  function prepareDependencies(cwd, context, goalPath, loaded) {
    if (!loaded) return;
    if (targetBlocked(content(cwd, loaded.plan.target.path))) throw new Error("Blocked target requires accepted recovery before Run preparation.");
    const goal = loaded.plan.goals.find(g => g.path === refPath(cwd, goalPath));
    if (!goal) throw new Error("Goal is not a member of the selected plan.");
    if (s.canonicalGoalStatus(s.extractStatusLine(content(cwd, goal.path))) === "blocked") throw new Error("Blocked Goal must be explicitly recovered before Run preparation.");
    if (s.extractCheckpointPolicyRaw(content(cwd, goal.path)) !== "enforced") throw new Error("Planned Runs require Checkpoint Policy: enforced before preparation.");
    for (const id of goal.dependsOn) {
      const dependency = loaded.plan.goals.find(g => g.id === id);
      if (s.canonicalGoalStatus(s.extractStatusLine(content(cwd, dependency.path))) !== "completed") throw new Error(`Cannot prepare Goal before accepted dependency: ${id}`);
      const errors = [...s.goalEvidenceErrors(cwd, context, dependency.path), ...completionErrors(cwd, context, dependency.path)];
      if (errors.length) throw new Error(`Dependency ${id} cannot be accepted: ${errors.join("; ")}`);
    }
    for (const existing of runsFor(cwd, context, goal.path, loaded)) {
      if (existing.status.phase === "completed") continue;
      const checkpoint = readJson(s.artifactPath(existing.directory, "checkpoint.json"));
      if (!["replan-required", "superseded"].includes(checkpoint.controlState)) throw new Error(`Existing planned Run must be inspected or superseded before preparing another: ${existing.ref}`);
    }
  }

  function controlRoot(cwd, context) {
    return dirname(path(cwd, context.paths.config || ".harness/config.json"));
  }
  function journalPath(cwd, context) { return s.assertContainedPath(cwd, join(controlRoot(cwd, context), "execution-sync.json"), "Synchronization journal"); }
  function expected(run, args) {
    const revision = Number(args.expectedRevision);
    if (!Number.isInteger(revision) || revision < 0 || String(revision) !== String(args.expectedRevision)) throw new Error("Planned mutation requires --expected-revision <non-negative integer>.");
    if (run.checkpoint?.revision !== revision) throw new Error(`Stale checkpoint revision: expected ${revision}, current ${run.checkpoint?.revision}.`);
  }
  function projectLock(cwd, context, args, fn) {
    // Previews do not create even transient lock files.
    if (args.dryRun) return fn();
    return s.withRunLock(controlRoot(cwd, context), fn);
  }
  function allowedSyncPath(cwd, context, run, loaded, ref) {
    const absolute = path(cwd, ref, "Synchronization destination");
    const documents = new Set([loaded.plan.target.path, context.paths.taskIndex || context.paths.tasks, context.paths.status,
      ...loaded.plan.goals.flatMap(g => [g.path, ...g.tasks.flatMap(t => t.acceptance.map(a => a.path))])]);
    if (documents.has(ref)) return absolute;
    if (ref === `${loaded.plan.target.path}.completion.json`) return absolute;
    const local = relative(run.directory, absolute).replaceAll("\\", "/");
    if (["status.json", "checkpoint.json"].includes(local)) return absolute;
    if (/^logs\/goal-complete-[0-9]+\.md$/.test(local)) return absolute;
    for (const node of run.dag.nodes) {
      if (local === node.status || local === node.result || new RegExp(`^agents/${node.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/reviews/[0-9]+\\.json$`).test(local)) return absolute;
    }
    throw new Error(`Synchronization destination is not a configured completion record: ${ref}`);
  }
  function transact(cwd, context, run, loaded, changes, operation, args) {
    const journal = journalPath(cwd, context);
    if (existsSync(journal)) throw new Error("Unfinished project synchronization must be resumed with run sync before another mutation.");
    for (const verify of observations) verify();
    for (const [absolute, expectedHash] of observed) {
      const currentHash = existsSync(absolute) ? digest(readFileSync(absolute)) : null;
      if (currentHash !== expectedHash) throw new Error(`Artifact changed during inspection; reconcile before writing: ${absolute}`);
    }
    const entries = [...changes].map(([ref, next]) => {
      const absolute = allowedSyncPath(cwd, context, run, loaded, ref);
      if (existsSync(absolute) && lstatSync(absolute).isSymbolicLink()) throw new Error("Synchronization cannot replace a symbolic link.");
      const beforeHash = existsSync(absolute) ? digest(readFileSync(absolute)) : null;
      if (observed.has(absolute) && observed.get(absolute) !== beforeHash) throw new Error(`Synchronization conflict; artifact changed after inspection: ${ref}`);
      if (!observed.has(absolute) && beforeHash !== null && /\/(?:reviews\/[0-9]+\.json|logs\/goal-complete-[0-9]+\.md)$/.test(ref)) throw new Error(`Revisioned evidence already exists: ${ref}`);
      return { path: ref, beforeHash, afterHash: digest(next), content: next };
    });
    const payload = { version: 1, operation, run: run.ref, plan: loaded.ref, planHash: loaded.hash,
      revision: run.checkpoint.revision, entries };
    payload.integrity = digest(JSON.stringify(payload));
    if (!args.dryRun) {
      s.atomicWriteFile(journal, jsonText(payload));
      applyJournal(cwd, context, payload, run, loaded);
    }
    return { ok: true, dryRun: Boolean(args.dryRun), run: run.ref, operation, writes: entries.map(e => e.path), previousRevision: run.checkpoint.revision,
      revision: entries.some(e => e.path === `${run.ref}/checkpoint.json`) ? run.checkpoint.revision + 1 : run.checkpoint.revision };
  }
  function applyJournal(cwd, context, payload, run, loaded, { dryRun = false } = {}) {
    const { integrity, ...body } = payload;
    if (!["node-record", "node-review", "goal-complete", "milestone-complete", "run-record"].includes(payload.operation) || (!Number.isInteger(payload.revision) || payload.revision < 0) || payload.version !== 1 || digest(JSON.stringify(body)) !== integrity || payload.plan !== loaded.ref || payload.planHash !== loaded.hash || payload.run !== run.ref) throw new Error("Synchronization journal contract is invalid.");
    if (!Array.isArray(payload.entries) || !payload.entries.length || new Set(payload.entries.map(e => e.path)).size !== payload.entries.length) throw new Error("Synchronization journal entries are invalid.");
    // Validate every destination/hash before replaying any remaining write.
    const pending = [];
    for (const entry of payload.entries) {
      const absolute = allowedSyncPath(cwd, context, run, loaded, entry.path);
      if (typeof entry.content !== "string" || digest(entry.content) !== entry.afterHash) throw new Error("Synchronization journal content hash is invalid.");
      const actual = existsSync(absolute) ? digest(readFileSync(absolute)) : null;
      if (actual === entry.afterHash) continue;
      if (actual !== entry.beforeHash) throw new Error(`Synchronization conflict; preserve and reconcile intervening changes: ${entry.path}`);
      pending.push({ absolute, entry });
    }
    if (dryRun) return;
    for (const { absolute, entry } of pending) {
      const actual = existsSync(absolute) ? digest(readFileSync(absolute)) : null;
      if (actual === entry.afterHash) continue;
      if (actual !== entry.beforeHash) throw new Error(`Synchronization conflict; preserve and reconcile intervening changes: ${entry.path}`);
      s.atomicWriteFile(absolute, entry.content);
      observed.set(absolute, entry.afterHash);
    }
    for (const entry of payload.entries) if (digest(readFileSync(allowedSyncPath(cwd, context, run, loaded, entry.path))) !== entry.afterHash) throw new Error("Synchronization consistency check failed.");
    rmSync(journalPath(cwd, context));
  }
  function sync(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    return projectLock(cwd, context, args, () => {
      const file = journalPath(cwd, context);
      if (!existsSync(file)) return emit(args, { ok: true, run: args.run || "", writes: [], reason: "No unfinished synchronization." });
      const payload = readJson(file);
      if (args.run !== payload.run) throw new Error("Select the Run recorded by the pending synchronization.");
      const run = runState(cwd, context, args.run, { checkContract: false, recovering: true });
      expected(run, args);
      const loaded = load(cwd, context, payload.plan);
      validateBinding(cwd, context, run.manifest);
      if (![payload.revision, payload.revision + 1].includes(run.checkpoint.revision)) throw new Error("Synchronization checkpoint revision no longer matches the journal.");
      const checkpointEntry = payload.entries?.find(e => e.path === `${run.ref}/checkpoint.json`);
      if (run.checkpoint.revision !== payload.revision && (!checkpointEntry || digest(readFileSync(s.artifactPath(run.directory, "checkpoint.json"))) !== checkpointEntry.afterHash)) throw new Error("Synchronization checkpoint changed independently of the journal.");
      applyJournal(cwd, context, payload, run, loaded, { dryRun: Boolean(args.dryRun) });
      return emit(args, { ok: true, dryRun: Boolean(args.dryRun), run: args.run, writes: payload.entries.map(e => e.path), revision: args.dryRun ? (payload.entries.find(e => e.path === `${run.ref}/checkpoint.json`) ? JSON.parse(payload.entries.find(e => e.path === `${run.ref}/checkpoint.json`).content).revision : run.checkpoint.revision) : readJson(s.artifactPath(run.directory, "checkpoint.json")).revision });
    });
  }
  function patchedItem(cwd, ref, values, sourceText) {
    let text = sourceText ?? content(cwd, ref.path);
    const section = s.extractSection(text, ref.section), label = mapSections.get(ref.section);
    const lines = section.split("\n");
    let active = false, found = false;
    for (let i = 0; i < lines.length; i++) {
      const item = lines[i].match(new RegExp(`^-\\s+${label}:\\s*(.+)$`));
      if (item) { active = s.cleanMapValue(item[1]) === ref.item; if (active) found = true; }
      if (!active) continue;
      const field = lines[i].match(/^(\s+-\s+)(Evidence|Status|Unblocker):/);
      if (field && values[field[2]] !== undefined) lines[i] = `${field[1]}${field[2]}: ${values[field[2]]}`;
    }
    if (!found) throw new Error("Acceptance mapping disappeared before synchronization.");
    for (const key of Object.keys(values)) {
      const item = s.parseEvidenceItems(lines.join("\n"), label).find(i => i.label === ref.item);
      if (item?.[key.toLowerCase()] !== values[key]) throw new Error(`Acceptance item lacks ${key} field: ${ref.item}`);
    }
    return s.replaceMarkdownSection(text, ref.section, lines.join("\n").trim());
  }
  function changedCheckpoint(run, fields) {
    return { ...run.checkpoint, ...fields, revision: run.checkpoint.revision + 1, updatedAt: now() };
  }
  function plannedRecord(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    return projectLock(cwd, context, args, () => {
      const run = runState(cwd, context, args.run);
      if (run.manifest.manifestVersion !== 2) throw new Error("This path requires a planned Run.");
      expected(run, args);
      if (args.phase === "completed") throw new Error("Planned nodes require run node review --decision accepted; completed recording cannot bypass review.");
      if (!["running", "blocked"].includes(args.phase) || s.missingEvidence(args.summary)) throw new Error("Planned node recording needs running|blocked and a concrete summary.");
      if (!["active", "waiting", "blocked"].includes(run.checkpoint.controlState)) throw new Error("Checkpoint requires recovery before node mutation.");
      if (run.status.phase === "completed") throw new Error("Completed Runs cannot record further node transitions.");
      const node = run.dag.nodes.find(n => n.id === args.node);
      if (!node) throw new Error("Unknown planned node.");
      const state = s.executionDagSnapshot(run.dag, run.directory), previous = nodeStatus(run.directory, node);
      if (previous.phase === "completed") throw new Error("Accepted nodes require revalidation through review, not running transition.");
      if (args.phase === "running") {
        if (targetBlocked(content(cwd, run.status.goalPath)) || targetBlocked(content(cwd, run.manifest.executionPlan.target.path))) throw new Error("Blocked target requires accepted recovery before Task execution.");
        if (node.dependencies.some(id => !state.completedNodes.includes(id))) throw new Error("Cannot start before accepted dependencies.");
        for (const id of node.dependencies) acceptedReceipt(cwd, context, run, run.dag.nodes.find(n => n.id === id));
        if (previous.phase === "running" && (args.thread || previous.thread) !== previous.thread) throw new Error("Inspect/cancel previous executor before changing ownership.");
        if (state.runningNodes.some(id => id !== node.id) && s.missingEvidence(args.isolationEvidence)) throw new Error("Parallel start requires explicit isolation evidence.");
      }
      const executorState = args.executorState || (args.phase === "running" ? "running" : "unknown");
      if (!["running", "completed", "unknown"].includes(executorState)) throw new Error("Invalid --executor-state.");
      const observedAt = args.observedAt || now();
      if (!Number.isFinite(Date.parse(observedAt)) || Date.parse(observedAt) > Date.now() + 5000 || Date.parse(observedAt) < Date.parse(run.manifest.createdAt)) throw new Error("Executor observation timestamp is invalid.");
      if (args.observedSource !== undefined && s.missingEvidence(args.observedSource)) throw new Error("Executor observation needs a concrete source.");
      const next = { ...previous, node: node.id, phase: args.phase, summary: args.summary, updatedAt: now(),
        thread: args.thread || previous.thread || "current-session", surface: args.surface || previous.surface || "current-host",
        isolationEvidence: args.isolationEvidence || previous.isolationEvidence || "sequential", result: node.result,
        executor: { status: executorState, observedAt, observedSource: args.observedSource || "controller foreground start" } };
      const changes = new Map([
        [`${run.ref}/${node.status}`, jsonText(next)],
        [`${run.ref}/status.json`, jsonText({ ...run.status, phase: "running", updatedAt: now() })],
        [`${run.ref}/checkpoint.json`, jsonText(changedCheckpoint(run, { controlState: "active", pauseReason: null, nextAction: "inspect accepted dependencies, results and executor state" }))]
      ]);
      return emit(args, transact(cwd, context, run, validateBinding(cwd, context, run.manifest), changes, "node-record", args));
    });
  }
  function nodeReview(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    return projectLock(cwd, context, args, () => {
      const run = runState(cwd, context, args.run);
      if (run.manifest.manifestVersion !== 2) throw new Error("Node review requires a planned Run.");
      expected(run, args);
      if (!["accepted", "request-fix", "blocked"].includes(args.decision)) throw new Error("Review decision must be accepted, request-fix or blocked.");
      if (!["active", "waiting", "blocked"].includes(run.checkpoint.controlState) || run.status.phase === "completed") throw new Error("Recover or replace this Run before reviewing candidates.");
      const loaded = validateBinding(cwd, context, run.manifest), node = run.dag.nodes.find(n => n.id === args.node);
      if (!node) throw new Error("Unknown planned node.");
      const evidencePath = s.assertContainedPath(run.directory, path(cwd, args.evidence, "Candidate receipt"), "Candidate receipt");
      const raw = readFileSync(evidencePath, "utf8"), receipt = JSON.parse(raw);
      const previous = nodeStatus(run.directory, node);
      if (receipt.version !== 1 || JSON.stringify(receipt.target) !== JSON.stringify(loaded.plan.target) || receipt.goal !== run.status.goalPath || receipt.run !== run.ref || receipt.node !== node.id) throw new Error("Candidate receipt target/Goal/Run/node binding is invalid.");
      if (typeof receipt.summary !== "string" || typeof receipt.stateSyncNotes !== "string" || s.missingEvidence(receipt.summary) || s.missingEvidence(receipt.stateSyncNotes) || !Array.isArray(receipt.changedFiles) || !Array.isArray(receipt.risks) || !Array.isArray(receipt.remaining)) throw new Error("Candidate receipt needs summary, changedFiles, stateSyncNotes, risks and remaining.");
      strings(receipt.changedFiles, "Candidate changedFiles");
      strings(receipt.risks, "Candidate risks"); strings(receipt.remaining, "Candidate remaining");
      if (receipt.needUser !== null && (typeof receipt.needUser !== "string" || s.missingEvidence(receipt.needUser))) throw new Error("needUser must be null or a concrete decision.");
      if (receipt.executor?.status !== "completed" || typeof receipt.executor.observedSource !== "string" || !Number.isFinite(Date.parse(receipt.executor.observedAt)) || Date.parse(receipt.executor.observedAt) > Date.now() + 5000 || Date.parse(receipt.executor.observedAt) < Date.parse(run.manifest.createdAt) || s.missingEvidence(receipt.executor.observedSource)) throw new Error("Confirm the previous executor completed before accepting or reopening its work.");
      if (previous.phase === "running" && previous.thread && previous.thread !== "current-session" && receipt.executor.thread !== previous.thread) throw new Error("Candidate must confirm the recorded executor identity before review.");
      if (args.decision === "accepted" && (receipt.needUser !== null || receipt.remaining.length)) throw new Error("Accepted candidate cannot leave required work or a user decision unresolved.");
      for (const changed of receipt.changedFiles) {
        const absolute = path(cwd, changed, "Changed file");
        if (!node.task.ownership.write.some(p => s.isPathInside(path(cwd, p), absolute))) throw new Error(`Changed file outside owned scope: ${changed}`);
        const metadata = s.goalMetadata(cwd, documentPath(cwd, context, "goal", run.status.goalPath));
        const controls = [context.paths.goals, context.paths.specs, metadata.specExists ? metadata.specPath : "", context.paths.milestones, context.paths.runs, context.paths.status, context.paths.taskIndex || context.paths.tasks, context.paths.config].filter(Boolean);
        if (controls.some(p => s.isPathInside(path(cwd, p), absolute))) throw new Error("Workers cannot change authoritative Harness artifacts.");
      }
      evidenceChecks(cwd, context, receipt, node.task.verification, { allowFailure: args.decision !== "accepted", earliest: Date.parse(run.manifest.createdAt), runRoot: run.directory });
      const before = s.executionDagSnapshot(run.dag, run.directory);
      if (node.dependencies.some(id => !before.completedNodes.includes(id))) throw new Error("Cannot review before accepted Task dependencies.");
      for (const id of node.dependencies) acceptedReceipt(cwd, context, run, run.dag.nodes.find(n => n.id === id));
      if (previous.review?.sha256 === digest(raw) && previous.review.decision === args.decision) return emit(args, { ok: true, run: run.ref, node: node.id, revision: run.checkpoint.revision, writes: [], idempotent: true });
      const progress = digest(JSON.stringify(receipt.checks.map(c => c.inputs)));
      const failure = digest(JSON.stringify(receipt.checks.filter(c => c.exitCode !== 0).map(c => [c.id, c.command, c.exitCode, digest(normalizedFailureLog(content(cwd, c.log)))])));
      const stalled = args.decision === "request-fix" && previous.failure?.signature === failure && previous.failure?.progress === progress ? previous.failure.count + 1 : 1;
      const blocked = args.decision === "blocked" || (args.decision === "request-fix" && stalled >= 3);
      const phase = args.decision === "accepted" ? "completed" : blocked ? "blocked" : "prepared";
      const receiptRef = `agents/${node.id}/reviews/${run.checkpoint.revision + 1}.json`;
      const next = { ...previous, node: node.id, phase, updatedAt: now(), summary: receipt.summary,
        verificationSummary: receipt.checks.map(c => `${c.id}: exit ${c.exitCode}`).join("; "), result: node.result,
        executor: receipt.executor, needUser: receipt.needUser,
        review: { decision: args.decision, receipt: receiptRef, sha256: digest(raw) },
        failure: args.decision === "request-fix" ? { signature: failure, progress, count: stalled } : null };
      const changes = new Map([
        [`${run.ref}/${receiptRef}`, raw], [`${run.ref}/${node.status}`, jsonText(next)],
        [`${run.ref}/${node.result}`, `# Controller review: ${args.decision}\n\n${receipt.summary}\n\nEvidence: ${run.ref}/${receiptRef}\n\nState Sync Notes: ${receipt.stateSyncNotes}\n`]
      ]);
      for (const ref of node.task.acceptance) {
        changes.set(ref.path, patchedItem(cwd, ref, { Status: phase === "completed" ? "satisfied" : phase === "blocked" ? "blocked" : "pending", Evidence: `${run.ref}/${receiptRef}`, Unblocker: blocked ? receipt.needUser || "repair repeated verification failure" : "N/A" }, changes.get(ref.path)));
      }
      const all = run.dag.nodes.every(n => n.id === node.id ? phase === "completed" : nodeStatus(run.directory, n).phase === "completed");
      changes.set(`${run.ref}/status.json`, jsonText({ ...run.status, phase: all ? "ready-for-gate" : "running", updatedAt: now() }));
      changes.set(`${run.ref}/checkpoint.json`, jsonText(changedCheckpoint(run, { controlState: "active", pauseReason: null, nextAction: "query execute next for the whole accepted target" })));
      return emit(args, { ...transact(cwd, context, run, loaded, changes, "node-review", args), node: node.id, decision: args.decision, nodePhase: phase, noProgressAttempts: args.decision === "request-fix" ? stalled : 0 });
    });
  }

  function updatedIndex(cwd, context, goalRef) {
    const ref = context.paths.taskIndex || context.paths.tasks, text = content(cwd, ref);
    const source = s.goalSourceTask(content(cwd, goalRef));
    if (source.path !== ref) throw new Error("Goal Source Task must reference the configured task index.");
    const matches = s.parseTasks(text).filter(t => s.normalizedTaskTitle(t.title) === s.normalizedTaskTitle(source.title));
    if (matches.length !== 1) throw new Error("Goal Source Task must resolve exactly once in the configured task index.");
    const task = matches[0], lines = text.split("\n"), line = lines[task.line - 1];
    if (/^- \[[ xX]\]/.test(line)) {
      lines[task.line - 1] = line.replace(/^- \[[ xX]\]/, "- [x]");
      for (let i = task.line; i < lines.length && lines[i].startsWith("  - "); i++) {
        if (/^  - Status:/.test(lines[i])) lines[i] = "  - Status: completed";
      }
    } else if (line.trim().startsWith("|")) {
      const cells = line.trim().replace(/^\||\|$/g, "").split("|").map(c => c.trim());
      cells[2] = "done"; lines[task.line - 1] = `| ${cells.join(" | ")} |`;
    } else throw new Error("Unsupported task index row; preserve it and repair the adapter mapping.");
    return [ref, lines.join("\n")];
  }
  function statusProjection(cwd, context, target, phase, runRef) {
    const ref = context.paths.status;
    if (!existsSync(path(cwd, ref))) observed.set(path(cwd, ref), null);
    const text = existsSync(path(cwd, ref)) ? content(cwd, ref) : "# Project Status\n";
    const next = s.replaceMarkdownSection(text, "Harness Execution", `- Target: \`${target.path}\`\n- Phase: ${phase}\n- Run evidence: \`${runRef}\`\n- State sync: verified\n- Need user: none\n- Updated: ${now()}`);
    if (next.split("\n").length > (context.config.artifactPolicy?.status?.maxLines || 160)) throw new Error("Status snapshot exceeds its configured bound; compact it before completion.");
    return [ref, next];
  }
  function withInline(text, key, value) {
    const regex = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:.*$`, "m");
    return regex.test(text) ? text.replace(regex, `${key}: ${value}`) : text.replace(/^(# .+)$/m, `$1\n\n${key}: ${value}`);
  }
  function targetBlocked(text) {
    const status = s.extractStatusLine(text) || s.extractSection(text, "Current Status").match(/^- Status:\s*(.+)$/m)?.[1] || "";
    return s.canonicalGoalStatus(status) === "blocked";
  }
  function updatedGoalList(text, goals) {
    const section = s.extractSection(text, "Goal List");
    if (!section) return text;
    const lines = section.split("\n");
    for (let i = 0; i < lines.length; i++) if (lines[i].trim().startsWith("|")) {
      const cells = lines[i].trim().replace(/^\||\|$/g, "").split("|");
      const doc = s.cleanMapValue(cells[3]?.trim() || "");
      const linked = doc.match(/^\[[^\]]+\]\(([^)]+)\)$/);
      if (goals.some(g => g.path === (linked ? linked[1] : doc))) {
        cells[1] = " completed "; lines[i] = `|${cells.join("|")}|`;
      }
    }
    return s.replaceMarkdownSection(text, "Goal List", lines.join("\n"));
  }
  function goalComplete(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    return projectLock(cwd, context, args, () => {
      documentPath(cwd, context, "goal", args.goal);
      const run = runState(cwd, context, args.run);
      if (run.manifest.manifestVersion !== 2 || run.status.goalPath !== args.goal) throw new Error("Goal completion requires its planned Run.");
      expected(run, args);
      const loaded = validateBinding(cwd, context, run.manifest);
      if (existsSync(journalPath(cwd, context))) throw new Error("Resume pending state synchronization before completion.");
      if (s.canonicalGoalStatus(s.extractStatusLine(content(cwd, args.goal))) === "completed" && run.status.phase === "completed") {
        const errors = [...s.goalEvidenceErrors(cwd, context, args.goal), ...completionErrors(cwd, context, args.goal, args.run)];
        if (errors.length) throw new Error(errors.join("; "));
        return emit(args, { ok: true, goal: args.goal, run: args.run, revision: run.checkpoint.revision, idempotent: true, writes: [] });
      }
      if (!["active", "waiting", "completed"].includes(run.checkpoint.controlState)) throw new Error("Recover the checkpoint before Goal completion.");
      if (!["active", "completed"].includes(s.canonicalGoalStatus(s.extractStatusLine(content(cwd, args.goal))))) throw new Error("Blocked or invalid Goals require recovery before completion.");
      const errors = [...s.goalEvidenceErrors(cwd, context, args.goal, { skipSync: true }), ...completionErrors(cwd, context, args.goal, args.run, { closing: true })];
      if (errors.length) throw new Error(`Goal completion rejected: ${errors.join("; ")}`);
      const state = s.executionDagSnapshot(run.dag, run.directory);
      if (!state.allNodesCompleted) throw new Error("Every required Task must be accepted before Goal completion.");
      let goalText = withInline(content(cwd, args.goal), "Status", "completed.");
      goalText = withInline(goalText, "Completion Run", args.run);
      goalText = s.replaceMarkdownSection(goalText, "State Sync Notes", `- Accepted-state records: \`${args.goal}\` and \`${context.paths.taskIndex || context.paths.tasks}\` synchronized by the controller.\n- Run evidence: \`${args.run}\` contains accepted receipts for every Task.\n- Bounded status update: \`${context.paths.status}\` records verified completion.`);
      const changes = new Map([[args.goal, goalText], updatedIndex(cwd, context, args.goal), statusProjection(cwd, context, loaded.plan.target, loaded.plan.target.kind === "goal" ? "completed" : "active", args.run)]);
      if (loaded.plan.target.kind === "milestone") {
        changes.set(loaded.plan.target.path, updatedGoalList(content(cwd, loaded.plan.target.path), [{ path: args.goal }]));
      }
      const summary = `Controller accepted all ${state.nodeCount} Tasks and synchronized Goal/index/status.`;
      changes.set(`${args.run}/status.json`, jsonText({ ...run.status, phase: "completed", completedAt: now(), summary, verificationSummary: "All required receipt checks pass against current inputs", updatedAt: now(), executionDag: state }));
      changes.set(`${args.run}/checkpoint.json`, jsonText(changedCheckpoint(run, { controlState: "completed", pauseReason: null, nextAction: "query execute next for remaining Goals or whole-target completion" })));
      changes.set(`${args.run}/logs/goal-complete-${run.checkpoint.revision + 1}.md`, `# Goal completion\n\nGoal: ${args.goal}\nRun: ${args.run}\n\n${summary}\n`);
      return emit(args, { ...transact(cwd, context, run, loaded, changes, "goal-complete", args), goal: args.goal });
    });
  }
  function milestoneAnchor(cwd, context, loaded) {
    const completedRuns = loaded.plan.goals.map(goal => {
      const ref = s.extractInlinePath(content(cwd, goal.path), "Completion Run");
      const run = runState(cwd, context, ref);
      if (run.status.phase !== "completed") throw new Error("Milestone requires completed synchronization anchor Runs.");
      return run;
    });
    const earliest = Math.max(...completedRuns.map(run => Date.parse(run.status.completedAt || run.status.updatedAt)));
    if (!Number.isFinite(earliest)) throw new Error("Goal completion observation timestamp is missing.");
    return { run: completedRuns.at(-1), earliest };
  }
  function milestoneComplete(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    return projectLock(cwd, context, args, () => {
      documentPath(cwd, context, "milestone", args.milestone);
      const loaded = resolvePlan(cwd, context, args.milestone, args.plan);
      if (!loaded || loaded.plan.target.kind !== "milestone" || loaded.plan.target.path !== args.milestone) throw new Error("Milestone completion requires its bound plan.");
      if (targetBlocked(content(cwd, args.milestone))) throw new Error("Blocked Milestone requires accepted recovery before completion.");
      if (existsSync(journalPath(cwd, context))) throw new Error("Resume pending synchronization before Milestone completion.");
      for (const goal of loaded.plan.goals) {
        if (s.canonicalGoalStatus(s.extractStatusLine(content(cwd, goal.path))) !== "completed") throw new Error(`Required Goal remains incomplete: ${goal.id}`);
        const errors = [...s.goalEvidenceErrors(cwd, context, goal.path), ...completionErrors(cwd, context, goal.path)];
        if (errors.length) throw new Error(errors.join("; "));
      }
      const raw = readFileSync(path(cwd, args.evidence, "Milestone receipt"), "utf8"), receipt = JSON.parse(raw);
      if (receipt.version !== 1 || JSON.stringify(receipt.target) !== JSON.stringify(loaded.plan.target) || s.missingEvidence(receipt.stateSyncNotes)) throw new Error("Milestone receipt target and State Sync Notes are required.");
      const { run, earliest } = milestoneAnchor(cwd, context, loaded);
      evidenceChecks(cwd, context, receipt, loaded.plan.verification, { earliest, runRoot: run.directory });
      expected(run, args);
      const evidenceRef = `${args.milestone}.completion.json`;
      if (s.canonicalGoalStatus(s.extractStatusLine(content(cwd, args.milestone))) === "completed" && existsSync(path(cwd, evidenceRef)) && digest(readFileSync(path(cwd, evidenceRef))) === digest(raw)) {
        const next = nextPayload({ ...args, goal: undefined, milestone: args.milestone });
        if (next.action !== "done") throw new Error(`Completed Milestone needs reconciliation: ${next.reason}`);
        return emit(args, { ok: true, target: loaded.plan.target, idempotent: true, revision: run.checkpoint.revision, writes: [] });
      }
      const changes = new Map([[evidenceRef, raw]]);
      let targetText = content(cwd, args.milestone);
      for (const goal of loaded.plan.goals) targetText = patchedItem(cwd, goal.milestoneItem, { Status: "satisfied", Evidence: `${goal.path}; ${s.extractInlinePath(content(cwd, goal.path), "Completion Run")}`, Unblocker: "N/A" }, targetText);
      targetText = withInline(targetText, "Status", "completed.");
      targetText = withInline(targetText, "Completion Evidence", evidenceRef);
      targetText = withInline(targetText, "Completion Evidence Hash", digest(raw));
      const currentStatus = s.extractSection(targetText, "Current Status");
      if (currentStatus) targetText = s.replaceMarkdownSection(targetText, "Current Status", currentStatus.replace(/^- Status:.*$/m, "- Status: completed"));
      targetText = s.replaceMarkdownSection(targetText, "State Sync Notes", `- Accepted Goal records: ${loaded.plan.goals.map(g => `\`${g.path}\``).join(", ")}.\n- Stage verification: \`${evidenceRef}\`.\n- Bounded status update: \`${context.paths.status}\` synchronized.`);
      changes.set(args.milestone, updatedGoalList(targetText, loaded.plan.goals));
      changes.set(...statusProjection(cwd, context, loaded.plan.target, "completed", run.ref));
      changes.set(`${run.ref}/checkpoint.json`, jsonText(changedCheckpoint(run, { nextAction: "whole target completed; no remaining required work" })));
      return emit(args, { ...transact(cwd, context, run, loaded, changes, "milestone-complete", args), target: loaded.plan.target });
    });
  }
  function nextPayload(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    if (Boolean(args.goal) === Boolean(args.milestone)) throw new Error("Select exactly one --goal or --milestone.");
    const selectedTarget = { kind: args.goal ? "goal" : "milestone", path: args.goal || args.milestone };
    documentPath(cwd, context, selectedTarget.kind, selectedTarget.path);
    const base = { target: selectedTarget, goal: "", run: "", node: "", checkpointRevision: null, requiredEvidence: [], needUser: null };
    const action = (kind, reason, fields = {}) => ({ ...base, action: kind, reason, ...fields });
    if (existsSync(journalPath(cwd, context))) {
      const pending = readJson(journalPath(cwd, context));
      const cp = readJson(s.artifactPath(s.configuredRunDir(cwd, context, pending.run), "checkpoint.json"));
      return action("sync", "Resume unfinished project synchronization before any implementation.", { run: pending.run, checkpointRevision: cp.revision });
    }
    if (targetBlocked(content(cwd, selectedTarget.path))) return action("reconcile", "The selected target is explicitly blocked; inspect accepted recovery authority before execution.", { requiredEvidence: [selectedTarget.path] });
    let loaded;
    try { loaded = resolvePlan(cwd, context, selectedTarget.path, args.plan); }
    catch (error) { return action("replan", error.message); }
    if (!loaded) return action("replan", "Prepare and bind an explicit execution plan for the accepted target.");
    const goals = selectedTarget.kind === "goal" ? loaded.plan.goals.filter(g => g.path === selectedTarget.path) : loaded.plan.goals;
    if (!goals.length || (selectedTarget.kind === "milestone" && loaded.plan.target.path !== selectedTarget.path)) throw new Error("Selected target is not in the bound plan.");
    const readyActions = [], reviews = [], closeouts = [], waits = [], decisions = [], blockers = [];
    let remaining = 0;
    for (const goal of goals) {
      const goalPhase = s.canonicalGoalStatus(s.extractStatusLine(content(cwd, goal.path)));
      const allRuns = runsFor(cwd, context, goal.path, loaded);
      if (goalPhase === "completed") {
        const errors = [...s.goalEvidenceErrors(cwd, context, goal.path), ...completionErrors(cwd, context, goal.path)];
        if (errors.length) return action("replan", `Completed Goal evidence needs recovery: ${errors.join("; ")}`, { goal: goal.path });
        continue;
      }
      remaining++;
      if (goalPhase === "blocked") {
        blockers.push(action("reconcile", "Goal is explicitly blocked; inspect the pause reason and accepted recovery authority before execution.", { goal: goal.path, requiredEvidence: [goal.path] }));
        continue;
      }
      const active = allRuns.filter(r => r.status.phase !== "completed");
      if (active.length > 1) return action("reconcile", "Multiple active planned Runs require authoritative selection or superseding.", { goal: goal.path, requiredEvidence: active.map(r => r.ref) });
      const failedDependencies = goal.dependsOn.filter(id => {
        const dep = loaded.plan.goals.find(g => g.id === id);
        return s.canonicalGoalStatus(s.extractStatusLine(content(cwd, dep.path))) !== "completed" || s.goalEvidenceErrors(cwd, context, dep.path).length || completionErrors(cwd, context, dep.path).length;
      });
      if (failedDependencies.length) { blockers.push(action("reconcile", `Waiting for accepted Goal dependencies: ${failedDependencies.join(", ")}`, { goal: goal.path })); continue; }
      if (!active.length) {
        const completed = allRuns.filter(r => r.status.phase === "completed");
        if (completed.length === 1) {
          try {
            const run = runState(cwd, context, completed[0].ref);
            const errors = [...s.goalEvidenceErrors(cwd, context, goal.path, { skipSync: true }), ...completionErrors(cwd, context, goal.path, run.ref, { closing: true })];
            if (errors.length) throw new Error(errors.join("; "));
            closeouts.push(action("complete-goal", "Run evidence is complete; close and synchronize its still-active Goal.", { goal: goal.path, run: run.ref, checkpointRevision: run.checkpoint.revision }));
          } catch (error) { return action("replan", error.message, { goal: goal.path, run: completed[0].ref }); }
        } else if (completed.length > 1) return action("reconcile", "Select the accepted completed Run before closing its Goal.", { goal: goal.path, requiredEvidence: completed.map(r => r.ref) });
        else readyActions.push(action("prepare-run", "Prepare the next dependency-ready Goal with its bound plan.", { goal: goal.path, requiredEvidence: [loaded.ref] }));
        continue;
      }
      let run;
      try { run = runState(cwd, context, active[0].ref); }
      catch (error) { return action("replan", error.message, { goal: goal.path, run: active[0].ref }); }
      const fields = { goal: goal.path, run: run.ref, checkpointRevision: run.checkpoint.revision };
      if (run.checkpoint.controlState === "reconciliation-required") return action("reconcile", run.checkpoint.nextAction, { ...fields, requiredEvidence: run.checkpoint.requiredEvidence });
      if (run.checkpoint.controlState === "replan-required") return action("replan", run.checkpoint.nextAction, fields);
      if (run.checkpoint.controlState === "blocked") {
        const decision = run.dag.nodes.map(n => nodeStatus(run.directory, n)).find(n => n.needUser)?.needUser;
        (decision ? decisions : blockers).push(action(decision ? "need-user" : "reconcile", run.checkpoint.pauseReason, { ...fields, needUser: decision || null })); continue;
      }
      const state = s.executionDagSnapshot(run.dag, run.directory);
      for (const node of run.dag.nodes) {
        const ns = nodeStatus(run.directory, node), nodeFields = { ...fields, node: node.id };
        if (ns.phase === "completed") {
          try { acceptedReceipt(cwd, context, run, node); }
          catch (error) { reviews.push(action("verify-node", error.message, { ...nodeFields, requiredEvidence: checksSnapshot(cwd, context, node.task.verification) })); }
          continue;
        }
        const candidate = s.artifactPath(run.directory, node.candidate, "Candidate result");
        if (existsSync(candidate) && digest(readFileSync(candidate)) !== ns.review?.sha256 && node.dependencies.every(id => state.completedNodes.includes(id))) {
          reviews.push(action("review-node", "A candidate result is ready for controller verification and acceptance.", { ...nodeFields, requiredEvidence: [refPath(cwd, candidate)] })); continue;
        }
        if (ns.phase === "blocked") {
          const blocked = action(ns.needUser ? "need-user" : "reconcile", (ns.failure?.count >= 3 ? `No progress after ${ns.failure.count} identical verification failures: ` : "") + (ns.summary || "Task is blocked without progress."), { ...nodeFields, needUser: ns.needUser || null, requiredEvidence: ns.review?.receipt ? [`${run.ref}/${ns.review.receipt}`] : [] });
          (ns.needUser ? decisions : blockers).push(blocked); continue;
        }
        if (ns.phase === "running") {
          if (!ns.executor || ns.executor.status === "unknown") return action("reconcile", "Inspect executor liveness before continuing foreground or delegated work.", { ...nodeFields, requiredEvidence: [ns.thread || "recorded executor identity"] });
          if (ns.thread === "current-session") readyActions.push(action("execute-node", "Continue the foreground Task, then return a candidate receipt.", nodeFields));
          else if (ns.executor?.status === "running" && Date.now() - Date.parse(ns.executor.observedAt) <= 60000) waits.push(action("wait", "Wait on the executor using the host; refresh its observed state before retrying.", { ...nodeFields, requiredEvidence: [ns.thread] }));
          else if (ns.executor?.status === "completed") readyActions.push(action("verify-node", "Inspect the completed executor and collect its missing candidate receipt.", nodeFields));
          else return action("reconcile", "Inspect executor liveness and identity before resuming or replacing work.", { ...nodeFields, requiredEvidence: [ns.thread || "recorded executor identity"] });
          continue;
        }
        if (state.readyNodes.includes(node.id)) {
          if (node.task.type === "human") {
            const recorded = node.task.acceptance.every(ref => {
              const item = acceptanceItem(cwd, context, ref);
              return item.status === "satisfied" && !s.missingEvidence(item.evidence);
            });
            if (recorded) reviews.push(action("verify-node", "Verify existing accepted approval evidence and record it without asking again.", { ...nodeFields, requiredEvidence: node.task.acceptance }));
            else decisions.push(action("need-user", node.task.question, { ...nodeFields, needUser: node.task.question }));
          }
          else readyActions.push(action(node.task.type === "verification" ? "verify-node" : "execute-node", "Execute a Task whose recorded dependencies have been accepted.", { ...nodeFields, requiredEvidence: checksSnapshot(cwd, context, node.task.verification) }));
        }
      }
      if (state.allNodesCompleted && !reviews.some(a => a.run === run.ref)) closeouts.push(action("complete-goal", "All Tasks are accepted; validate and synchronize Goal completion.", fields));
    }
    if (reviews.length) return reviews[0];
    if (closeouts.length) return closeouts[0];
    if (readyActions.length) return readyActions[0];
    if (waits.length) return waits[0];
    if (decisions.length) return decisions[0];
    if (remaining) return blockers[0] || action("reconcile", "No dependency-ready work remains; inspect blocked evidence.");
    if (selectedTarget.kind === "milestone") {
      const targetText = content(cwd, selectedTarget.path), evidenceRef = s.extractInlinePath(targetText, "Completion Evidence");
      if (s.canonicalGoalStatus(s.extractStatusLine(targetText)) === "completed" && evidenceRef) {
        try {
          const raw = readFileSync(path(cwd, evidenceRef), "utf8");
          if (digest(raw) !== s.extractInlinePath(targetText, "Completion Evidence Hash")) throw new Error("Milestone accepted receipt changed.");
          const receipt = JSON.parse(raw);
          if (JSON.stringify(receipt.target) !== JSON.stringify(loaded.plan.target)) throw new Error("Milestone completion receipt binding changed.");
          const { run: anchor, earliest } = milestoneAnchor(cwd, context, loaded);
          evidenceChecks(cwd, context, receipt, loaded.plan.verification, { earliest, runRoot: anchor.directory });
          for (const goal of goals) {
            const item = acceptanceItem(cwd, context, goal.milestoneItem);
            if (item.status !== "satisfied" || s.missingEvidence(item.evidence) || !item.evidence.includes(goal.path)) throw new Error("Milestone acceptance state is not synchronized.");
          }
          const projection = s.extractSection(content(cwd, context.paths.status), "Harness Execution");
          if (!projection.includes("State sync: verified") || content(cwd, context.paths.status).split("\n").length > (context.config.artifactPolicy?.status?.maxLines || 160)) throw new Error("Milestone status projection is not synchronized.");
          if (projection.includes(`Target: \`${selectedTarget.path}\``) && !projection.includes("Phase: completed")) throw new Error("Milestone status projection phase is not synchronized.");
          return action("done", "All required Goals, stage verification and state synchronization are complete.");
        } catch (error) { return action("replan", error.message); }
      }
      const { run: anchorRun } = milestoneAnchor(cwd, context, loaded);
      const anchor = anchorRun.ref;
      return action("complete-milestone", "All required Goals are complete; run stage verification and synchronize the Milestone.", { run: anchor, checkpointRevision: anchorRun.checkpoint.revision, requiredEvidence: checksSnapshot(cwd, context, loaded.plan.verification) });
    }
    return action("done", "Accepted scope, verification and synchronized Goal completion are satisfied.");
  }
  function checksSnapshot(cwd, context, requirements) {
    return requirements.map(check => ({ id: check.id, command: check.command, inputs: snapshot(cwd, context, check.inputs), manual: Boolean(check.manual) }));
  }
  function inputs(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    if (args.run) {
      const run = runState(cwd, context, args.run), node = run.dag.nodes.find(n => n.id === args.node);
      if (!node?.task) throw new Error("Select a planned Task with --node.");
      return emit(args, { ok: true, run: args.run, node: node.id, checks: checksSnapshot(cwd, context, node.task.verification) });
    }
    const loaded = load(cwd, context, args.plan);
    return emit(args, { ok: true, target: loaded.plan.target, checks: checksSnapshot(cwd, context, loaded.plan.verification || loaded.plan.goals[0].tasks.flatMap(t => t.verification)) });
  }
  function recordRun(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    return projectLock(cwd, context, args, () => {
      const run = runState(cwd, context, args.run); expected(run, args);
      const loaded = validateBinding(cwd, context, run.manifest);
      if (s.missingEvidence(args.summary) || !["blocked", "completed"].includes(args.phase)) throw new Error("Run record needs completed|blocked and a concrete summary.");
      if (args.phase === "completed") {
        if (!["active", "completed"].includes(s.canonicalGoalStatus(s.extractStatusLine(content(cwd, run.status.goalPath))))) throw new Error("Blocked or invalid Goals cannot complete a Run.");
        const errors = [...s.goalEvidenceErrors(cwd, context, run.status.goalPath), ...completionErrors(cwd, context, run.status.goalPath, args.run, { closing: true })];
        if (errors.length || run.checkpoint.controlState !== "completed" || s.missingEvidence(args.verification)) throw new Error(`Run completion rejected: ${errors.join("; ") || "checkpoint/verification is not complete"}`);
      } else if (["completed", "superseded"].includes(run.checkpoint.controlState)) throw new Error("Terminal Run cannot move back to blocked.");
      const changes = new Map([
        [`${args.run}/status.json`, jsonText({ ...run.status, phase: args.phase, summary: args.summary, verificationSummary: args.verification || "", updatedAt: now() })],
        [`${args.run}/checkpoint.json`, jsonText(changedCheckpoint(run, { controlState: args.phase === "completed" ? "completed" : "blocked", pauseReason: args.phase === "blocked" ? args.summary : null, nextAction: args.phase === "blocked" ? "inspect recorded Run blocker" : "query execute next for the whole target" }))]
      ]);
      return emit(args, transact(cwd, context, run, loaded, changes, "run-record", args));
    });
  }
  return { load, resolvePlan, planValidate, compile, validateBinding, immutableDocument, prepareDependencies,
    completionErrors, nodeReview, plannedRecord, goalComplete, milestoneComplete, nextPayload,
    next: args => emit(args, nextPayload(args)), inputs, sync, recordRun, snapshot };
}
