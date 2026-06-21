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

Each prepared run uses a separate directory:

```text
.agent-harness/runs/
  YYYYMMDD-HHMMSS-<slug>/
    run.md
    prompt.md
    subagents.md
    status.json
    logs/
```

Rules:

- `run.md` records source goal, work mode, manual checkpoints, and verification.
- `prompt.md` is the ready-to-use prompt for `/goal` or a new Codex session.
- `subagents.md` gives bounded split guidance for `small`, `medium`, `large`,
  and `ask` tasks.
- `status.json` stores machine-readable run state.
- `logs/` is reserved for command output summaries and automation logs.
- `run prepare` must not start daemons, spawn Codex sessions, push, deploy, or
  open PRs.

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
