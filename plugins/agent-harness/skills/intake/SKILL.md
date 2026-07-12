---
name: intake
description: Preview or record rough Agent Harness ideas, requirements, bugs, and inbox notes without implementation. Use before scope is accepted; not for read-only status, setup, or authorized execution. / 收集未确认事项，不执行。
---

# Harness Intake

Use this skill when the user brings a new idea or requirement while another
workflow may already be in progress.

## Reference Map

- Use [User-Facing Communication](../../references/user-facing-communication.md)
  for the effective commentary policy before reporting intake progress.
- Use [Capture Boundary](references/capture-boundary.md) when deciding whether a
  message belongs in intake.
- Use [Promotion Rules](references/promotion-rules.md) before recording or
  routing an intake candidate toward execution.

## Workflow

1. Read repo instructions such as `AGENTS.md`.
2. Resolve harness contract and Goal-index path:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

Apply `harness-rule:context-focus-routing` before previewing or recording:
normalize the request to `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or
`Spec`, then use the `intake` focus preset. Read the raw idea, entry/channel,
modality when supplied, dialog context, related project/world artifacts, and
the capability boundary for supported Goal-index writes. Avoid historical run
logs and execution artifacts unless they prove duplication, dependency, or an
already accepted scope.

Apply `harness-rule:cybernetic-stability` during intake by separating raw user
signal from target / setpoint selection (`harness-rule:intent-setpoint-selection`),
checking whether related artifacts are fresh enough to trust
(`harness-rule:sensor-freshness`), and reporting whether the remaining gap is a
research note, spec, goal, ask, or no-op (`harness-rule:remaining-gap`). Weak or
stale feedback should lead to preview / ask, not execution
(`harness-rule:feedback-quality`, `harness-rule:stability-saturation`).

3. Preview the intake candidate first:

```bash
node <plugin-root>/scripts/agent-harness.mjs intake idea --cwd <project> --idea "<idea text>"
```

4. Report the candidate title, priority, target section, related existing
   Goals/artifacts, acceptance hint, and whether a spec is likely needed.
5. Record only when the user explicitly asks to add it:

```bash
node <plugin-root>/scripts/agent-harness.mjs intake idea --cwd <project> --idea "<idea text>" --record --priority P2 --section Next
```

6. If the Goal index format is unsupported for automatic writes, give the exact
   entry to add and leave execution to a later confirmed goal.
7. If the user wants to implement the idea immediately, route to `execute`
   only after the scope and confirmation boundary are clear.
8. For Idea Inbox Thread promotion, preserve the raw note, summarize only what
   is needed for the Goal index, and make the control thread accept the route
   before spec, goal, run, or execution work starts.

## Boundaries

- Intake is capture, triage, and optional record. It is not execution.
- For read-only project state or next-action requests, route to `orient`.
- For harness setup or adoption, route to `init`.
- Do not mutate the Goal index unless `--record` behavior or equivalent user
  approval is explicit.
- Do not overwrite, delete, or reorganize existing Goals during intake.
- Do not create specs, goals, runs, branches, worktrees, PRs, or deployments
  unless the user separately asks for that next workflow.
- Preserve raw capture-thread intent; do not turn rough ideas into accepted
  scope without user or control-lane confirmation.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
