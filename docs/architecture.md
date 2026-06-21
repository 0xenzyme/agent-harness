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
    YYYYMMDD-HHMMSS-<slug>/
      run.md
      prompt.md
      subagents.md
      status.json
      logs/
```

## Loop Model

A development loop should always have:

- input: task from `tasks.md` or explicit user request
- context: repo instructions, config, relevant files, current git state
- action: implementation, review, triage, or report-only check
- verification: tests, typecheck, browser proof, logs, or manual review
- state update: tasks, status, goal file, or run log
- stop condition: done, blocked, budget reached, or decision needed

## Goal And Run Boundary

`goal` and `run` are separate steps:

- `goal`: create a durable handoff under `.agent-harness/goals/`.
- `run`: prepare or record execution for one goal under `.agent-harness/runs/`.

The first run implementation is intentionally manual. `agent-harness run
prepare` creates a packet with a ready prompt and subagent guidance, but it does
not start Codex or launch background sessions. Direct execution should wait
until the local Codex CLI has a stable file-prompt or stdin contract.

## Worktree Policy

The harness does not assume a branch or worktree for every goal. It classifies
work by risk and context:

- `local`: small, foreground, user explicitly wants no branch/worktree
- `worktree`: parallel work, dirty checkout, broad code change, automation
- `ask`: destructive action, production impact, unclear product direction

Codex should explain the chosen mode before making edits.
