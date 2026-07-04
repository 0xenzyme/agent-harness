---
name: intake
description: Capture and triage ideas, requirements, bugs, or Idea Inbox notes without implementing them. Use for rough or not-yet-accepted work items. Do not use for read-only orientation, harness setup, or confirmed implementation. / 收集并分流想法、需求、bug 或 Idea Inbox notes，但不直接实现；用于粗略或尚未接受的工作项；不要用于只读定位、harness setup 或已确认执行。
---

# Harness Intake

Use this skill when the user brings a new idea or requirement while another
workflow may already be in progress.

## Reference Map

- Use [Capture Boundary](references/capture-boundary.md) when deciding whether a
  message belongs in intake.
- Use [Promotion Rules](references/promotion-rules.md) before recording or
  routing an intake candidate toward execution.

## Workflow

1. Read repo instructions such as `AGENTS.md`.
2. Resolve harness contract and task-index path:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

3. Preview the intake candidate first:

```bash
node <plugin-root>/scripts/agent-harness.mjs intake idea --cwd <project> --idea "<idea text>"
```

4. Report the candidate title, priority, target section, related existing
   tasks/artifacts, acceptance hint, and whether a spec is likely needed.
5. Record only when the user explicitly asks to add it:

```bash
node <plugin-root>/scripts/agent-harness.mjs intake idea --cwd <project> --idea "<idea text>" --record --priority P2 --section Next
```

6. If the task index format is unsupported for automatic writes, give the exact
   entry to add and leave execution to a later confirmed goal.
7. If the user wants to implement the idea immediately, route to `execute`
   only after the scope and confirmation boundary are clear.
8. For Idea Inbox Thread promotion, preserve the raw note, summarize only what
   is needed for the task index, and make the control thread accept the route
   before spec, goal, run, or execution work starts.

## Boundaries

- Intake is capture, triage, and optional record. It is not execution.
- For read-only project state or next-action requests, route to `orient`.
- For harness setup or adoption, route to `init`.
- Do not mutate the task index unless `--record` behavior or equivalent user
  approval is explicit.
- Do not overwrite, delete, or reorganize existing tasks during intake.
- Do not create specs, goals, runs, branches, worktrees, PRs, or deployments
  unless the user separately asks for that next workflow.
- Preserve raw capture-thread intent; do not turn rough ideas into accepted
  scope without user or control-lane confirmation.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
