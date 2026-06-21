---
name: harness-goal
description: Create or execute controlled Codex goal handoffs using tasks.md, .agent-harness config, and smart local vs worktree policy.
---

# Harness Goal

Use this skill when the user asks to create a `/goal`, execute a goal, or decide
whether a goal should run in local checkout or a worktree.

## Workflow

1. Read root `tasks.md`.
2. Read `.agent-harness/config.json` and `.agent-harness/status.md` if present.
3. Inspect git state with:

```bash
git status --short
git worktree list --porcelain
```

4. Decide the work mode:
   - `local` when the user explicitly wants no branch/worktree or the task is
     small foreground work.
   - `worktree` when local checkout is dirty, the work is parallel, the change
     is broad, or the goal should become a separate PR.
   - `ask` when production, destructive actions, paid APIs, or product direction
     decisions are involved.
5. Create a goal handoff under `.agent-harness/goals/` when the user wants a
   durable prompt.
6. For an existing task, the CLI can draft a goal with:

```bash
node <plugin-root>/scripts/agent-harness.mjs goal create --cwd <project> --task "<task title>"
```

7. After a confirmed goal exists, prepare an execution packet with:

```bash
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
```

8. Include verification, constraints, completion conditions, and pause
   conditions in every goal.

## Goal Shape

Every generated goal should include:

- source task from `tasks.md`;
- files/docs to read first;
- scope and non-goals;
- work mode recommendation;
- verification commands;
- completion conditions;
- pause conditions.

## Rules

- Do not assume Codex should create a new branch for every goal.
- Explain the work mode choice before edits.
- Keep `goal` and `run` separate: goal writes durable handoff files, run writes
  execution packets under `.agent-harness/runs/`.
- Do not automatically start Codex sessions from a prepared run packet.
- If user instructions conflict with config, user instructions win for the
  current run and the config should not be changed without permission.
- Update `tasks.md` and `.agent-harness/status.md` after completing work.
