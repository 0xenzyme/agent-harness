# Agent Harness Architecture

Agent Harness has three layers:

1. Project contract: stable files that every downstream repo can adopt.
2. Codex skills: reusable workflows that tell Codex how to use the contract.
3. CLI scripts: deterministic helpers for initialization and checks.

## Control Plane

The project control plane is intentionally file-based. Files are easy for
humans to review, easy for Codex to read, and portable across machines.

```text
tasks.md
.agent-harness/
  config.json
  status.md
  goals/
  runs/
```

## Loop Model

A development loop should always have:

- input: task from `tasks.md` or explicit user request
- context: repo instructions, config, relevant files, current git state
- action: implementation, review, triage, or report-only check
- verification: tests, typecheck, browser proof, logs, or manual review
- state update: tasks, status, goal file, or run log
- stop condition: done, blocked, budget reached, or decision needed

## Worktree Policy

The harness does not assume a branch or worktree for every goal. It classifies
work by risk and context:

- `local`: small, foreground, user explicitly wants no branch/worktree
- `worktree`: parallel work, dirty checkout, broad code change, automation
- `ask`: destructive action, production impact, unclear product direction

Codex should explain the chosen mode before making edits.
