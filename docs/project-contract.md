# Project Contract

This contract defines the files Agent Harness expects in each downstream
project.

## Required Paths

### `tasks.md`

The source of truth for current project tasks.

Rules:

- Keep it at the repository root.
- Do not create alternate todo files such as `docs/tasks.md` or `.codex/tasks.md`.
- Codex should read it before proposing or executing a new goal.
- Codex should update it after meaningful work.

### `.agent-harness/config.json`

Machine-readable project settings.

Required fields:

- `schemaVersion`
- `projectName`
- `paths`
- `worktree`

### `.agent-harness/status.md`

Human-readable project status.

This is not the backlog. It is a short current-state file for:

- active focus
- current branch/worktree posture
- last verification
- known blockers

### `.agent-harness/goals/`

Generated goal handoff files.

Use this for durable prompts that can be pasted into `/goal` or handed to a
new session.

### `.agent-harness/runs/`

Loop run logs and automation outputs.

Use this for report-only runs, CI triage output, and recurring checks.

## Default Task Format

```md
# Project Tasks

## Now

- [ ] P1 short task title
  - Source:
  - Acceptance:
  - Notes:

## Next

- [ ] P2 short task title

## Later

- [ ] P3 short task title

## Done

- [x] Completed task title
```
