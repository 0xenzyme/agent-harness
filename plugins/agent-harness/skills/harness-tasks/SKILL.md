---
name: harness-tasks
description: Maintain the configured project task index used by Agent Harness goals and loop engineering.
---

# Harness Tasks

Use this skill when the user asks to update, summarize, clean up, or derive next
actions from a project's harness task index.

## Workflow

1. Resolve harness contract and paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

2. Read `.agent-harness/config.json` when it exists.
3. In the adapter contract, read the configured project adapter.
4. Read the configured task index.
5. Inspect only the project files needed to understand task status.
6. Update the task index according to its configured format. Fixed
   `tasks.md` uses:
   - current `Now` tasks;
   - accepted follow-ups in `Next`;
   - lower-priority ideas in `Later`;
   - completed items in `Done`.
7. If work was performed, update configured state records when state sync is
   required.

## Rules

- Treat `tasks.md` as the fixed source of truth.
- In the adapter contract, treat the configured task index, such as `todolist.md`,
  as the source of truth.
- Keep task titles short and concrete.
- Add acceptance notes when a task will become a `/goal`.
- Do not silently delete tasks; move stale items to `Later` or ask.
- Do not create alternate task files unless the project adapter/config
  explicitly defines them.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
