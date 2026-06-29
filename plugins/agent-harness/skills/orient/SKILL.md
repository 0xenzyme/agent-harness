---
name: orient
description: Read-only Agent Harness orientation. Use when the user asks for current project state, todolist/tasks, blockers, next step, harness readiness, or which workflow mode to use before execution.
---

# Harness Orient

Use this skill to understand the current project and recommend the next route
without starting implementation.

## Workflow

1. Read repo instructions such as `AGENTS.md`.
2. Resolve harness contract and configured paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

3. Read `.harness/config.json` when it exists.
4. In the adapter contract, read the configured project adapter, task index,
   status file, and relevant mental models.
5. Run or mirror the read-only orientation command:

```bash
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project>
```

6. If the user brings a new idea, requirement, or capture-thread note, preview
   it with intake and recommend whether it should be recorded:

```bash
node <plugin-root>/scripts/agent-harness.mjs intake idea --cwd <project> --idea "<idea text>"
```

7. Recommend one next mode: `orient`, `intake`, `shape`, `goal`, `execute`,
   `competition`, or `ask`.
8. Explain the route choice briefly and state what confirmation is needed
   before any mutation or implementation.

## Boundaries

- Do not implement, create branches, create worktrees, push, open PRs, deploy,
  publish, start daemons, or launch background sessions.
- Do not mutate task state unless the user explicitly asks to record an intake
  item.
- Do not turn a recommendation into goal creation, run preparation, or
  execution without explicit user intent.
- Treat proposal competition as an optional shaping protocol for ambiguous
  work, not as the default route.
- Preserve project-specific rules in the adapter and repo instructions, not in
  plugin core.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
