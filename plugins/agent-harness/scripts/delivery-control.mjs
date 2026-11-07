import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

const mapSections = new Map([
  ["Spec Acceptance Checklist", "Item"],
  ["Milestone Completion Map", "Item"],
  ["Stage Completion Map", "Item"],
  ["Required Gate Evidence", "Gate"],
  ["Source Task Acceptance Map", "Task"]
]);

// Delivery control records outcomes, not execution history. The host owns
// sessions, workers, resume, terminals and full verification output.
export function createDeliveryControl(s) {
  const path = (cwd, ref, label = "Delivery artifact") => s.configuredPath(cwd, ref, label);
  const content = (cwd, ref) => readFileSync(path(cwd, ref), "utf8");
  const now = () => new Date().toISOString();
  const emit = (args, payload) => {
    if (args.json) console.log(JSON.stringify(payload, null, 2));
    else console.log(payload.action ? `${payload.action}: ${payload.reason}` : `OK: ${payload.goal || payload.target?.path || payload.plan || "delivery"}`);
    return payload;
  };
  function targetDocument(cwd, context, kind, ref) {
    const root = path(cwd, kind === "goal" ? context.paths.goals : context.paths.milestones);
    return s.assertContainedPath(root, path(cwd, ref), `${kind} document`);
  }
  function load(cwd, context, planRef) {
    const plan = JSON.parse(content(cwd, planRef));
    if (plan.version !== 1 || !["goal", "milestone"].includes(plan.target?.kind) || !Array.isArray(plan.goals) || !plan.goals.length) throw new Error("Execution plan needs version 1, a Goal/Milestone target and Goals.");
    if (planRef !== `${plan.target.path}.plan.json`) throw new Error("Execution plan must be adjacent to its target.");
    targetDocument(cwd, context, plan.target.kind, plan.target.path);
    if (s.extractInlinePath(content(cwd, plan.target.path), "Execution Plan") !== planRef) throw new Error("Target Execution Plan reference does not match the plan.");
    for (const goal of plan.goals) {
      targetDocument(cwd, context, "goal", goal.path);
      const validation = s.validateGoal(cwd, path(cwd, goal.path), { checkCompletion: false });
      if (!validation.ok) throw new Error(`Goal contract is invalid: ${goal.path}: ${validation.errors.join("; ")}`);
      if (s.extractInlinePath(content(cwd, goal.path), "Execution Plan") !== planRef) throw new Error(`Goal must reference its target plan: ${goal.path}`);
      if (!Array.isArray(goal.tasks) || !goal.tasks.length || !Array.isArray(goal.dependsOn)) throw new Error(`Goal needs Tasks and dependencies: ${goal.path}`);
      graph(plan.goals, "Goal");
      graph(goal.tasks, `Task ${goal.path}`);
      const mapped = new Set();
      for (const task of goal.tasks) {
        if (!task.id || !Array.isArray(task.dependsOn) || !Array.isArray(task.acceptance) || !task.acceptance.length) throw new Error(`Task needs identity, dependencies and acceptance: ${task.id || goal.path}`);
        for (const check of task.verification || []) {
          if (!check.id || typeof check.command !== "string" || s.missingEvidence(check.command)) throw new Error(`Task ${task.id} needs a concrete verification command or manual review description.`);
        }
        for (const ref of task.acceptance) {
          acceptanceItem(cwd, context, ref);
          const key = JSON.stringify([ref.path, ref.section, ref.item]);
          if (mapped.has(key)) throw new Error(`Acceptance item is assigned more than once: ${ref.item}`);
          mapped.add(key);
        }
      }
      const metadata = s.goalMetadata(cwd, path(cwd, goal.path));
      const goalText = content(cwd, goal.path), specText = metadata.specExists ? content(cwd, metadata.specPath) : "";
      for (const [section, label] of mapSections) {
        const source = s.extractSection(goalText, section) ? goal.path : metadata.specExists && s.extractSection(specText, section) ? metadata.specPath : "";
        if (!source) continue;
        for (const item of s.parseEvidenceItems(s.extractSection(content(cwd, source), section), label)) {
          if (!mapped.has(JSON.stringify([source, section, item.label]))) throw new Error(`Acceptance mapping is missing: ${source} / ${section} / ${item.label}`);
        }
      }
    }
    for (const check of plan.verification || []) {
      if (!check.id || typeof check.command !== "string" || s.missingEvidence(check.command)) throw new Error("Target verification needs concrete commands or manual review descriptions.");
    }
    if (plan.target.kind === "milestone") {
      const rows = s.extractSection(content(cwd, plan.target.path), "Goal List").split("\n").filter(line => line.trim().startsWith("|")).map(line => line.trim().replace(/^\||\|$/g, "").split("|").map(cell => s.cleanMapValue(cell.trim()))).filter(cells => cells[0]?.toLowerCase() !== "goal" && !cells.every(cell => /^:?-+:?$/.test(cell)));
      const listed = rows.map(cells => cells[3]?.match(/^\[[^\]]+\]\(([^)]+)\)$/)?.[1] || cells[3]).filter(Boolean);
      if (listed.length !== plan.goals.length || listed.some(ref => !plan.goals.some(goal => goal.path === ref))) throw new Error("Delivery plan must cover every Goal List Doc exactly once.");
      const mapped = new Set(plan.goals.map(goal => goal.milestoneItem ? JSON.stringify([goal.milestoneItem.path, goal.milestoneItem.section, goal.milestoneItem.item]) : ""));
      if (mapped.has("")) throw new Error("Every Milestone Goal needs a milestoneItem acceptance mapping.");
      const items = s.parseEvidenceItems(s.extractSection(content(cwd, plan.target.path), "Milestone Completion Map"), "Item");
      if (items.length !== mapped.size || items.some(item => !mapped.has(JSON.stringify([plan.target.path, "Milestone Completion Map", item.label])))) throw new Error("Milestone completion items must map to exactly one Goal.");
      if (!plan.verification?.length) throw new Error("Milestone needs whole-target verification.");
    }
    return { plan, ref: planRef };
  }
  function graph(items, label) {
    const byId = new Map(items.map(item => [item.id, item]));
    if (byId.size !== items.length) throw new Error(`${label} contains duplicate or missing ids.`);
    const visiting = new Set(), visited = new Set();
    function visit(id) {
      if (visiting.has(id)) throw new Error(`${label} dependency cycle at ${id}.`);
      if (visited.has(id)) return;
      visiting.add(id);
      for (const dependency of byId.get(id).dependsOn) {
        if (!byId.has(dependency)) throw new Error(`${label} has unknown dependency ${dependency}.`);
        visit(dependency);
      }
      visiting.delete(id);
      visited.add(id);
    }
    for (const id of byId.keys()) visit(id);
  }
  function resolvePlan(cwd, context, ref, supplied = "") {
    const bound = s.extractInlinePath(content(cwd, ref), "Execution Plan");
    if (supplied && bound && bound !== supplied) throw new Error("Supplied plan conflicts with the target binding.");
    return supplied || bound ? load(cwd, context, supplied || bound) : null;
  }
  function acceptanceItem(cwd, context, ref) {
    if (!mapSections.has(ref?.section) || typeof ref.item !== "string") throw new Error("Acceptance reference is invalid.");
    const roots = [context.paths.goals, context.paths.specs, context.paths.milestones].filter(Boolean).map(root => path(cwd, root));
    const absolute = path(cwd, ref.path);
    if (!roots.some(root => s.isPathInside(root, absolute))) throw new Error("Acceptance must reference a configured Goal, Spec or Milestone.");
    const matches = s.parseEvidenceItems(s.extractSection(readFileSync(absolute, "utf8"), ref.section), mapSections.get(ref.section)).filter(item => item.label === ref.item);
    if (matches.length !== 1) throw new Error(`Acceptance reference must resolve exactly once: ${ref.path} / ${ref.section} / ${ref.item}`);
    return matches[0];
  }
  function goalAcceptance(cwd, context, goal) {
    return goal.tasks.flatMap(task => task.acceptance.map(ref => ({ task, ref, item: acceptanceItem(cwd, context, ref) })));
  }
  function verificationRequirements(plan, goal = null, stage = false) {
    const checks = stage ? plan.verification || [] : (goal ? goal.tasks : plan.goals.flatMap(item => item.tasks)).flatMap(task => task.verification || []);
    return [...checks, ...(!stage && !goal ? plan.verification || [] : [])].map(({ id, command, manual }) => ({ id, command, manual: Boolean(manual) }));
  }
  function verificationSummary(args, requirements) {
    if (typeof args.verification !== "string" || s.missingEvidence(args.verification)) throw new Error("Completion requires --verification with actual commands/review results and uncovered gaps.");
    if (!requirements.length) throw new Error("The accepted target must declare verification before completion.");
    for (const required of requirements) if (!args.verification.includes(required.id)) throw new Error(`Verification summary must report the actual result for ${required.id}; the CLI does not infer that a command ran.`);
    return args.verification.trim();
  }
  function withInline(text, key, value) {
    const pattern = new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:.*$`, "m");
    return pattern.test(text) ? text.replace(pattern, `${key}: ${value}`) : text.replace(/^(# .+)$/m, `$1\n\n${key}: ${value}`);
  }
  function patchedItem(cwd, ref, values) {
    const text = content(cwd, ref.path), lines = s.extractSection(text, ref.section).split("\n");
    let active = false;
    for (let index = 0; index < lines.length; index++) {
      const item = lines[index].match(new RegExp(`^-\\s+${mapSections.get(ref.section)}:\\s*(.+)$`));
      if (item) active = s.cleanMapValue(item[1]) === ref.item;
      if (!active) continue;
      const field = lines[index].match(/^(\s+-\s+)(Evidence|Status|Unblocker):/);
      if (field && values[field[2]] !== undefined) lines[index] = `${field[1]}${field[2]}: ${values[field[2]]}`;
    }
    return [ref.path, s.replaceMarkdownSection(text, ref.section, lines.join("\n").trim())];
  }
  function updatedIndex(cwd, context, goalRef) {
    const ref = context.paths.taskIndex || context.paths.tasks, text = content(cwd, ref);
    const source = s.goalSourceTask(content(cwd, goalRef));
    const matches = s.parseTasks(text).filter(task => s.normalizedTaskTitle(task.title) === s.normalizedTaskTitle(source.title));
    if (source.path !== ref || matches.length !== 1) throw new Error("Goal Source Task must resolve exactly once in the configured task index.");
    const task = matches[0], lines = text.split("\n"), line = lines[task.line - 1];
    if (/^- \[[ xX]\]/.test(line)) {
      lines[task.line - 1] = line.replace(/^- \[[ xX]\]/, "- [x]");
      for (let index = task.line; index < lines.length && lines[index].startsWith("  - "); index++) if (/^  - Status:/.test(lines[index])) lines[index] = "  - Status: completed";
    } else if (line.trim().startsWith("|")) {
      const cells = line.trim().replace(/^\||\|$/g, "").split("|").map(cell => cell.trim());
      cells[2] = "done";
      lines[task.line - 1] = `| ${cells.join(" | ")} |`;
    } else throw new Error("Unsupported task index row; preserve it and update the adapter mapping.");
    return [ref, lines.join("\n")];
  }
  function statusProjection(cwd, context, target, phase, verification) {
    const ref = context.paths.status, text = existsSync(path(cwd, ref)) ? content(cwd, ref) : "# Project Status\n";
    const next = s.replaceMarkdownSection(text, "Harness Execution", `- Target: \`${target.path}\`\n- Phase: ${phase}\n- Verification: ${verification}\n- State sync: verified\n- Need user: none\n- Updated: ${now()}`);
    if (next.split("\n").length > (context.config.artifactPolicy?.status?.maxLines || 160)) throw new Error("Status snapshot exceeds its configured bound; compact it before completion.");
    return [ref, next];
  }
  function updatedGoalList(text, goalPath) {
    const lines = s.extractSection(text, "Goal List").split("\n");
    for (let index = 0; index < lines.length; index++) if (lines[index].trim().startsWith("|")) {
      const cells = lines[index].trim().replace(/^\||\|$/g, "").split("|");
      const doc = s.cleanMapValue(cells[3]?.trim() || "");
      if ((doc.match(/^\[[^\]]+\]\(([^)]+)\)$/)?.[1] || doc) === goalPath) {
        cells[1] = " completed ";
        lines[index] = `|${cells.join("|")}|`;
      }
    }
    return s.replaceMarkdownSection(text, "Goal List", lines.join("\n"));
  }
  function commit(cwd, context, loaded, changes, args) {
    const root = dirname(path(cwd, context.paths.config || ".harness/config.json"));
    const write = () => {
      const allowed = new Set([loaded.plan.target.path, context.paths.taskIndex || context.paths.tasks, context.paths.status,
        ...loaded.plan.goals.flatMap(goal => [goal.path, ...goal.tasks.flatMap(task => task.acceptance.map(ref => ref.path))])]);
      for (const [ref, text] of changes) {
        if (!allowed.has(ref)) throw new Error(`Delivery state cannot write outside accepted state records: ${ref}`);
        const absolute = path(cwd, ref);
        if (existsSync(absolute) && content(cwd, ref) !== text) {
          if (!args.dryRun) s.atomicWriteFile(absolute, text);
        } else if (!existsSync(absolute) && !args.dryRun) s.atomicWriteFile(absolute, text);
      }
    };
    if (args.dryRun) write();
    else s.withStateLock(root, write);
  }
  function goalComplete(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    targetDocument(cwd, context, "goal", args.goal);
    const loaded = resolvePlan(cwd, context, args.goal, args.plan);
    if (!loaded) throw new Error("Goal completion requires its accepted delivery plan.");
    const goal = loaded.plan.goals.find(item => item.path === args.goal);
    if (!goal) throw new Error("Selected Goal is outside the accepted plan.");
    const requirements = verificationRequirements(loaded.plan, goal);
    if (loaded.plan.target.kind === "milestone" && s.canonicalGoalStatus(s.extractStatusLine(content(cwd, loaded.plan.target.path))) === "blocked") throw new Error("Blocked Milestone requires an accepted scope decision.");
    if (s.canonicalGoalStatus(s.extractStatusLine(content(cwd, args.goal))) === "completed") {
      const errors = completionErrors(cwd, context, args.goal);
      if (errors.length) throw new Error(errors.join("; "));
      return emit(args, { ok: true, goal: args.goal, idempotent: true, writes: [] });
    }
    const summary = verificationSummary(args, requirements);
    for (const task of goal.tasks) for (const dependency of task.dependsOn) {
      const accepted = goal.tasks.find(item => item.id === dependency)?.acceptance.every(ref => {
        const item = acceptanceItem(cwd, context, ref);
        return item.status === "satisfied" && !s.missingEvidence(item.evidence);
      });
      if (!accepted) throw new Error(`Task dependency is not accepted for ${task.id}: ${dependency}`);
    }
    const pending = goalAcceptance(cwd, context, goal).filter(({ item }) => item.status !== "satisfied" || s.missingEvidence(item.evidence));
    if (pending.length) throw new Error(`Acceptance is not satisfied: ${pending.map(({ ref }) => ref.item).join(", ")}. Record verified outcomes, not Run artifacts.`);
    const gateErrors = s.goalEvidenceErrors(cwd, context, args.goal, { skipSync: true });
    if (gateErrors.length) throw new Error(gateErrors.join("; "));
    const phase = loaded.plan.target.kind === "goal" ? "completed" : "active";
    let targetText = withInline(content(cwd, args.goal), "Status", "completed.");
    targetText = s.replaceMarkdownSection(targetText, "State Sync Notes", `- Accepted-state records: \`${args.goal}\` and \`${context.paths.taskIndex || context.paths.tasks}\` synchronized by the controller.\n- Verification: ${summary}\n- Bounded status update: \`${context.paths.status}\` records the current result.`);
    const changes = new Map([[args.goal, targetText], updatedIndex(cwd, context, args.goal), statusProjection(cwd, context, loaded.plan.target, phase, summary)]);
    if (loaded.plan.target.kind === "milestone") changes.set(loaded.plan.target.path, updatedGoalList(content(cwd, loaded.plan.target.path), args.goal));
    commit(cwd, context, loaded, changes, args);
    return emit(args, { ok: true, goal: args.goal, dryRun: Boolean(args.dryRun), writes: [...changes.keys()] });
  }
  function milestoneComplete(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    targetDocument(cwd, context, "milestone", args.milestone);
    const loaded = resolvePlan(cwd, context, args.milestone, args.plan);
    if (!loaded || loaded.plan.target.kind !== "milestone") throw new Error("Milestone completion requires its bound plan.");
    if (s.canonicalGoalStatus(s.extractStatusLine(content(cwd, args.milestone))) === "completed") {
      if (nextPayload({ ...args, goal: undefined, milestone: args.milestone }).action !== "done") throw new Error("Completed Milestone delivery state needs reconciliation.");
      return emit(args, { ok: true, target: loaded.plan.target, idempotent: true, writes: [] });
    }
    const summary = verificationSummary(args, verificationRequirements(loaded.plan, null, true));
    const changes = new Map();
    let targetText = content(cwd, args.milestone);
    for (const goal of loaded.plan.goals) {
      if (s.canonicalGoalStatus(s.extractStatusLine(content(cwd, goal.path))) !== "completed") throw new Error(`Required Goal remains incomplete: ${goal.id}`);
      const errors = completionErrors(cwd, context, goal.path);
      if (errors.length) throw new Error(errors.join("; "));
      if (!goal.milestoneItem) throw new Error(`Goal has no Milestone acceptance mapping: ${goal.id}`);
      const milestoneItem = acceptanceItem(cwd, context, goal.milestoneItem);
      if (milestoneItem.status === "satisfied" && !milestoneItem.evidence.includes(goal.path)) throw new Error("Accepted Milestone evidence must identify its Goal.");
      const [ref, text] = patchedItem(cwd, goal.milestoneItem, { Status: "satisfied", Evidence: `${goal.path}; ${summary}`, Unblocker: "N/A" });
      if (ref === args.milestone) targetText = text;
      else changes.set(ref, text);
    }
    targetText = withInline(targetText, "Status", "completed.");
    const current = s.extractSection(targetText, "Current Status");
    if (current) targetText = s.replaceMarkdownSection(targetText, "Current Status", current.replace(/^- Status:.*$/m, "- Status: completed"));
    targetText = s.replaceMarkdownSection(targetText, "State Sync Notes", `- Accepted Goal records: ${loaded.plan.goals.map(goal => `\`${goal.path}\``).join(", ")}.\n- Whole-target verification: ${summary}\n- Bounded status update: \`${context.paths.status}\` synchronized.`);
    changes.set(args.milestone, updatedGoalList(targetText, ""));
    changes.set(...statusProjection(cwd, context, loaded.plan.target, "completed", summary));
    commit(cwd, context, loaded, changes, args);
    return emit(args, { ok: true, target: loaded.plan.target, dryRun: Boolean(args.dryRun), writes: [...changes.keys()] });
  }
  function completionErrors(cwd, context, goalRef) {
    const errors = [];
    try {
      const loaded = resolvePlan(cwd, context, goalRef);
      if (!loaded || s.canonicalGoalStatus(s.extractStatusLine(content(cwd, goalRef))) !== "completed") return errors;
      errors.push(...s.goalEvidenceErrors(cwd, context, goalRef));
      const ref = context.paths.taskIndex || context.paths.tasks, source = s.goalSourceTask(content(cwd, goalRef));
      let tasks = s.parseTasks(content(cwd, ref)).filter(task => s.normalizedTaskTitle(task.title) === s.normalizedTaskTitle(source.title));
      const archive = context.config.artifactPolicy?.tasks?.archive;
      if (!tasks.length && archive && existsSync(path(cwd, archive))) tasks = s.parseTasks(content(cwd, archive)).filter(task => s.normalizedTaskTitle(task.title) === s.normalizedTaskTitle(source.title));
      if (source.path !== ref || tasks.length !== 1 || !s.isDoneTask(tasks[0])) throw new Error("Completed Goal task index is not synchronized.");
      if (tasks[0].details.some(detail => detail.startsWith("Doc:") && !detail.includes(goalRef))) throw new Error("Archived task Doc must identify its completed Goal.");
      if (loaded.plan.target.kind === "milestone") {
        const rows = s.extractSection(content(cwd, loaded.plan.target.path), "Goal List").split("\n").filter(line => line.trim().startsWith("|"));
        const row = rows.find(line => line.includes(goalRef));
        if (row && s.canonicalGoalStatus(row.replace(/^\||\|$/g, "").split("|")[1]) !== "completed") throw new Error("Completed Goal Milestone Goal List status is not synchronized.");
      }
      const status = content(cwd, context.paths.status), projection = s.extractSection(status, "Harness Execution");
      if (!projection.includes("State sync: verified")) throw new Error("Completed Goal bounded status is not synchronized.");
    } catch (error) { errors.push(error.message); }
    return errors;
  }
  function planValidate(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    try {
      const loaded = load(cwd, context, args.plan);
      return emit(args, { ok: true, plan: args.plan, target: loaded.plan.target, errors: [] });
    } catch (error) {
      process.exitCode = 1;
      return emit(args, { ok: false, plan: args.plan || "", errors: [error.message] });
    }
  }
  function nextPayload(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    if (Boolean(args.goal) === Boolean(args.milestone)) throw new Error("Select exactly one --goal or --milestone.");
    const target = { kind: args.goal ? "goal" : "milestone", path: args.goal || args.milestone };
    targetDocument(cwd, context, target.kind, target.path);
    const base = { target, goal: "", node: "", requiredEvidence: [], needUser: null };
    const action = (kind, reason, fields = {}) => ({ ...base, action: kind, reason, ...fields });
    let loaded;
    try { loaded = resolvePlan(cwd, context, target.path, args.plan); }
    catch (error) { return action("replan", error.message); }
    if (!loaded) return action("replan", "Bind an accepted delivery plan beside the target; the host owns execution.");
    const goals = target.kind === "goal" ? loaded.plan.goals.filter(goal => goal.path === target.path) : loaded.plan.goals;
    for (const goal of goals) {
      const phase = s.canonicalGoalStatus(s.extractStatusLine(content(cwd, goal.path)));
      if (phase === "completed") {
        const errors = completionErrors(cwd, context, goal.path);
        if (errors.length) return action("reconcile", `Repair the accepted delivery state: ${errors.join("; ")}`, { goal: goal.path });
        continue;
      }
      if (phase === "blocked") return action("reconcile", "The Goal is paused for an accepted scope, authority or verification decision.", { goal: goal.path });
      const dependencies = goal.dependsOn.filter(id => {
        const dependency = loaded.plan.goals.find(item => item.id === id);
        return !dependency || s.canonicalGoalStatus(s.extractStatusLine(content(cwd, dependency.path))) !== "completed";
      });
      if (dependencies.length) return action("wait", `Complete accepted Goal dependencies first: ${dependencies.join(", ")}`, { goal: goal.path });
      const pending = goalAcceptance(cwd, context, goal).filter(({ item }) => item.status !== "satisfied" || s.missingEvidence(item.evidence));
      const human = pending.find(({ task }) => task.type === "human");
      if (human) return action("need-user", human.task.question, { goal: goal.path, node: human.task.id, needUser: human.task.question });
      if (pending.length) return action(pending[0].task.type === "verification" ? "verify-node" : "execute-node", "Deliver and verify this accepted scope in the current host; record only the verified outcome.", { goal: goal.path, node: pending[0].task.id, requiredEvidence: verificationRequirements(loaded.plan, goal) });
      return action("complete-goal", "Acceptance is satisfied; record the actual verification summary and synchronize delivery state.", { goal: goal.path, requiredEvidence: verificationRequirements(loaded.plan, goal) });
    }
    if (target.kind === "milestone") {
      if (s.canonicalGoalStatus(s.extractStatusLine(content(cwd, target.path))) !== "completed") return action("complete-milestone", "Run whole-target verification and record its result in delivery state.", { requiredEvidence: verificationRequirements(loaded.plan, null, true) });
      const projection = s.extractSection(content(cwd, context.paths.status), "Harness Execution");
      if (!projection.includes("State sync: verified")) return action("sync", "Synchronize the bounded current delivery status.");
    }
    return action("done", "Accepted outcomes, verification summaries and delivery state are complete.");
  }
  return {
    planValidate, goalComplete, milestoneComplete, completionErrors,
    next: args => emit(args, nextPayload(args)), nextPayload
  };
}
