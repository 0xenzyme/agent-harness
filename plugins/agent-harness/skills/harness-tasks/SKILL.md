---
name: harness-tasks
description: Maintain a project-level tasks.md backlog as the source of truth for Codex goals and loop engineering.
---

# Harness Tasks

Use this skill when the user asks to update, summarize, clean up, or derive next
actions from a project's `tasks.md`.

## Workflow

1. Read `.agent-harness/config.json` if present.
2. Read root `tasks.md`.
3. Inspect only the project files needed to understand task status.
4. Update `tasks.md` with:
   - current `Now` tasks;
   - accepted follow-ups in `Next`;
   - lower-priority ideas in `Later`;
   - completed items in `Done`.
5. If work was performed, update `.agent-harness/status.md`.

## Rules

- Treat `tasks.md` as the human-readable source of truth.
- Keep task titles short and concrete.
- Add acceptance notes when a task will become a `/goal`.
- Do not silently delete tasks; move stale items to `Later` or ask.
- Do not create separate todo files.
