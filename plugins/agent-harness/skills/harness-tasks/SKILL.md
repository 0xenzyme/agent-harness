---
name: harness-tasks
description: Legacy compatibility wrapper for Agent Harness task-index work. Prefer harness:orient for task summaries, harness:intake for new ideas, and harness:execute for state sync after work.
---

# Harness Tasks

This is a compatibility wrapper for the older task-index entry. New work should
route through the workflow skills:

- `harness:orient` for task summaries and next-step recommendations.
- `harness:intake` for new ideas, requirements, bugs, and capture-thread notes.
- `harness:execute` for task/status/run sync after confirmed work.

## Compatibility Workflow

1. Resolve harness contract and configured paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

2. For read-only state or next-action requests:

```bash
node <plugin-root>/scripts/agent-harness.mjs orient next --cwd <project>
```

3. For a new idea or requirement, preview before editing:

```bash
node <plugin-root>/scripts/agent-harness.mjs intake idea --cwd <project> --idea "<idea text>"
```

4. Record only when the user explicitly confirms:

```bash
node <plugin-root>/scripts/agent-harness.mjs intake idea --cwd <project> --idea "<idea text>" --record
```

5. After confirmed execution, update the configured task index and status file
   according to the project adapter.

## Rules

- Treat the configured task index as the source of truth; in fixed-contract
  projects this is `harness/tasks.md`.
- Treat `orient next` and `intake idea` as read-only unless explicit record or
  edit intent is present.
- Do not silently delete tasks or create alternate task files.
- Preserve task `kind` separately from task `state`.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
