---
name: harness-run
description: Prepare and inspect Agent Harness run packets from confirmed goal handoffs.
---

# Harness Run

Use this skill when the user asks to execute, prepare, inspect, or continue a
goal run using Agent Harness.

## Workflow

1. Read the goal file and its referenced spec before implementation.
2. Resolve harness contract and paths:

```bash
node <plugin-root>/scripts/agent-harness.mjs config inspect --cwd <project>
```

3. Read `.agent-harness/config.json` when it exists.
4. In the adapter contract, read the configured project adapter and relevant
   installed plugin references.
5. Read the configured task index and any configured state files that exist.
6. Inspect git state with:

```bash
git status --short
git worktree list --porcelain
```

7. Prepare a run packet when the user wants a controlled execution handoff:

```bash
node <plugin-root>/scripts/agent-harness.mjs run prepare --cwd <project> --goal <goal-file>
```

8. Inspect an existing run packet with:

```bash
node <plugin-root>/scripts/agent-harness.mjs run status --cwd <project> --run <run-dir>
```

9. Use `subagents.md` as bounded guidance:
   - `small`: keep the task in the main context.
   - `medium`: split explorer/worker or worker/verification only when useful.
   - `large`: split by non-overlapping file ownership.
   - `ask`: pause before splitting.
10. Execute the goal manually in the selected checkout or worktree.
11. Run verification and update configured state records when the adapter
    requires state sync.

## Rules

- `run prepare` does not start Codex, create daemons, push, deploy, publish, or
  open PRs.
- Do not automatically create worktrees; follow the goal and project worktree
  policy first.
- Preserve fixed path behavior for `contract: "fixed"`.
- In the adapter contract, use configured artifact paths instead of assuming
  `.agent-harness/goals/` or `.agent-harness/runs/`.
- Keep subagent ownership explicit and non-overlapping.
- Report to the user in the user's language while preserving code, commands,
  paths, package names, skill names, API names, model names, abbreviations, and
  Git commit messages in English.
- Stop if the goal conflicts with repo instructions, production constraints, or
  newer user instructions.
