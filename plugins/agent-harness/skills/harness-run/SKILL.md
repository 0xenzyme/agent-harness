---
name: harness-run
description: Prepare and inspect Agent Harness run packets from confirmed goal handoffs.
---

# Harness Run

Use this skill when the user asks to execute, prepare, inspect, or continue a
goal run using Agent Harness.

## Workflow

1. Read the goal file and its referenced spec before implementation.
2. Read `tasks.md`, `.agent-harness/config.json`, and `.agent-harness/status.md`.
3. Inspect git state with:

```bash
git status --short
git worktree list --porcelain
```

4. Prepare a run packet when the user wants a controlled execution handoff:

```bash
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
```

5. Inspect an existing run packet with:

```bash
node <plugin-root>/scripts/agent-harness.mjs run status --cwd <project> --run <run-dir>
```

6. Use `subagents.md` as bounded guidance:
   - `small`: keep the task in the main context.
   - `medium`: split explorer/worker or worker/verification only when useful.
   - `large`: split by non-overlapping file ownership.
   - `ask`: pause before splitting.
7. Execute the goal manually in the selected checkout or worktree.
8. Run verification and update `tasks.md` plus `.agent-harness/status.md`.

## Rules

- `run prepare` does not start Codex, create daemons, push, deploy, publish, or
  open PRs.
- Do not automatically create worktrees; follow the goal and project worktree
  policy first.
- Keep subagent ownership explicit and non-overlapping.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
- Stop if the goal conflicts with repo instructions, production constraints, or
  newer user instructions.
