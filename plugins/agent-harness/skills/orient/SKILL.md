---
name: orient
description: Inspect Agent Harness state and recommend the next public entry without mutation. Use for status, blockers, stale artifacts, or route questions; not setup, intake recording, or authorized execution. / 只读检查状态与下一入口，不用于 setup、记录或执行。
---

# Harness Orient

Use this skill to understand the current project and recommend the next route
without starting implementation.

## Reference Map

- Use [Route Decision](references/route-decision.md) when recommending the next
  harness mode.
- Use [Read-Only Boundary](references/read-only-boundary.md) when the request
  mixes orientation with mutation or execution language.
- Use [User-Facing Summary](references/user-facing-summary.md) before the final
  response to translate route evidence into a concise user decision prompt.
- Use [Route To Public Entry Mapping](../../references/route-entry-mapping.md)
  before naming `shape`, `goal`, `competition`, or `ask`.

## Workflow

1. Read repo instructions such as `AGENTS.md`.
2. Resolve harness contract and configured paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
node <plugin-root>/scripts/agent-harness.mjs config validate --cwd <project>
```

3. Read `.harness/config.json` when it exists.
4. In the adapter contract, read the configured project adapter, task index,
   status file, and relevant mental models.
   Apply `harness-rule:context-focus-routing` before reading broadly:
   normalize user intent to `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or
   `Spec`, then use the `orient` focus preset. Read entry/channel, dialog,
   project/world, and self/control context first; add modality and capability
   context only when the request input or route safety needs it. Keep old run
   logs and implementation files summarized unless they explain current state,
   stale artifacts, blockers, or the next safe action.
   Apply `harness-rule:cybernetic-stability`: identify the target selected by
   intent (`harness-rule:intent-setpoint-selection`), prefer fresh observations
   over stale artifacts (`harness-rule:sensor-freshness`), form a lightweight
   measurement snapshot (`harness-rule:measurement-snapshot`), state the
   remaining gap (`harness-rule:remaining-gap`), and route to ask/shape/pause
   when feedback is weak or the loop is saturated
   (`harness-rule:feedback-quality`, `harness-rule:stability-saturation`).
5. Run or mirror the read-only orientation command:

```bash
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project>
```

6. Reconcile artifact state with the current conversation before recommending
   a route. If the active control thread contains a newer explicit user or
   controller decision, treat that conversation-confirmed state as the current
   route context even when task, milestone, spec, or goal artifacts still show
   the older plan. Name the stale artifact risk and recommend `intake`,
   `shape`, `goal`, or `ask` to sync durable state before execution; do not
   recommend executing the superseded artifact as the active path.
7. If the user brings a new idea, requirement, or capture-thread note, preview
   it with intake and recommend whether it should be recorded:

```bash
node <plugin-root>/scripts/agent-harness.mjs intake idea --cwd <project> --idea "<idea text>"
```

8. Recommend one internal route and always map it to a published skill or exact
   user action with [Route To Public Entry Mapping](../../references/route-entry-mapping.md).
9. Explain the route choice briefly and state what confirmation is needed
   before any mutation or implementation. The explanation should name the
   observable reason, such as task state, missing spec, ambiguity, risk,
   dirty checkout, stale artifacts, or user intent.
10. For ambiguous route selection, read
   [Task Routing](../../references/task-routing.md) and use its route decision
   fields without mutating project state.
11. Before the final answer, read
    [User-Facing Summary](references/user-facing-summary.md) and compress the
    control evidence into the current situation, stop reason, and exact user
    choice. Do not paste a full route packet unless the user asks for audit or
    handoff detail.

## Boundaries

- Do not implement, create branches, create worktrees, push, open PRs, deploy,
  publish, start daemons, or launch background sessions.
- Do not mutate task state unless the user explicitly asks to record an intake
  item.
- Do not turn a recommendation into goal creation, run preparation, or
  execution without explicit user intent.
- Treat proposal competition as an optional shaping protocol for ambiguous
  work, not as the default route.
- Treat subagent, automation, inbox, and competition output as candidate
  evidence. Orientation may summarize it, but accepted state belongs to the
  control lane after validation.
- Do not silently let older artifacts override newer conversation-confirmed
  state from the active control thread. Until the newer decision is recorded,
  report the mismatch and route to state sync, shaping, goal creation, intake,
  or user confirmation.
- Preserve project-specific rules in the adapter and repo instructions, not in
  plugin core.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
