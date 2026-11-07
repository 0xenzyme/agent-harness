import { existsSync, readFileSync } from "node:fs";
import { dirname } from "node:path";

export function createStateMaintenance(s) {
  function snapshot(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    const indexRef = context.paths.taskIndex || context.paths.tasks;
    const text = readFileSync(s.configuredPath(cwd, indexRef), "utf8");
    const tasks = s.parseTasks(text), done = tasks.filter(s.isDoneTask);
    const archive = context.config.artifactPolicy?.tasks?.archive || "";
    const keepDone = context.config.artifactPolicy?.tasks?.keepDone ?? 10;
    const recency = task => {
      const dates = [...task.details.join(" ").matchAll(/20\d{2}-?\d{2}-?\d{2}/g)].map(match => Number(match[0].replace(/-/g, ""))).filter(Number.isFinite);
      return dates.length ? Math.max(...dates) : 0;
    };
    const candidates = archive ? [...done].sort((left, right) => recency(right) - recency(left) || right.line - left.line).slice(keepDone).sort((left, right) => left.line - right.line) : [];
    return { cwd, context, indexRef, text, archive, keepDone, candidates, writes: [] };
  }
  function block(text, task) {
    const lines = text.split("\n"), start = task.line - 1;
    let end = start + 1;
    while (end < lines.length && !/^##\s+/.test(lines[end]) && !/^- \[[ xX]\]\s+/.test(lines[end])) end++;
    return { start, end, text: lines.slice(start, end).join("\n").trimEnd() };
  }
  function compact(args) {
    const state = snapshot(args);
    if (!args.record || !state.candidates.length) return state;
    const blocks = state.candidates.map(task => block(state.text, task));
    const existing = existsSync(s.configuredPath(state.cwd, state.archive)) ? readFileSync(s.configuredPath(state.cwd, state.archive), "utf8") : "# Task Archive\n";
    const additions = blocks.filter(item => !existing.includes(item.text));
    if (additions.length) {
      s.atomicWriteFile(s.configuredPath(state.cwd, state.archive), `${existing.trimEnd()}\n\n${additions.map(item => item.text).join("\n\n")}\n`);
      state.writes.push(state.archive);
    }
    const lines = state.text.split("\n");
    for (const item of [...blocks].sort((a, b) => b.start - a.start)) lines.splice(item.start, item.end - item.start);
    s.atomicWriteFile(s.configuredPath(state.cwd, state.indexRef), `${lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd()}\n`);
    state.writes.push(state.indexRef);
    return state;
  }
  function inspect(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    const status = context.paths.status, index = context.paths.taskIndex || context.paths.tasks;
    const statusText = existsSync(s.configuredPath(cwd, status)) ? readFileSync(s.configuredPath(cwd, status), "utf8") : "";
    const limit = context.config.artifactPolicy?.status?.maxLines || 160;
    return { ok: statusText.split("\n").length <= limit, status, taskIndex: index, statusLines: statusText.split("\n").length, maxStatusLines: limit, writes: [] };
  }
  function maintain(args) {
    const cwd = s.targetCwd(args), context = s.resolveHarnessContext(cwd);
    const index = context.paths.taskIndex || context.paths.tasks, tasks = s.parseTasks(readFileSync(s.configuredPath(cwd, index), "utf8"));
    const payload = { taskIndex: index, status: context.paths.status, total: tasks.length, active: tasks.filter(task => !s.isDoneTask(task)).length, done: tasks.filter(s.isDoneTask).length, writes: [] };
    if (args.record) {
      const text = existsSync(s.configuredPath(cwd, context.paths.status)) ? readFileSync(s.configuredPath(cwd, context.paths.status), "utf8") : "# Project Status\n";
      s.atomicWriteFile(s.configuredPath(cwd, context.paths.status), s.replaceMarkdownSection(text, "Harness Tasks", `- Active: ${payload.active}\n- Done: ${payload.done}\n- Execution history: host session\n- Updated: ${new Date().toISOString()}`));
      payload.writes.push(context.paths.status);
    }
    return payload;
  }
  function emit(args, payload) {
    const output = { ok: true, ...payload, writesFiles: payload.writes.length > 0, cwd: undefined, context: undefined, text: undefined, candidates: payload.candidates?.map(task => task.title) };
    if (args.json) console.log(JSON.stringify(output, null, 2));
    else console.log(`OK: ${output.writes.length ? output.writes.join(", ") : "delivery state inspected; host owns execution history"}`);
  }
  return { inspect: args => emit(args, inspect(args)), compact: args => emit(args, compact(args)), maintain: args => emit(args, maintain(args)) };
}
