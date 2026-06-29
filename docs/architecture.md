# Agent Harness Architecture

Agent Harness has three layers:

1. Harness plugin: canonical adapter protocol, references, skills,
   templates, and deterministic CLI helpers.
2. Project adapter: project-specific artifact paths, source-of-truth rules,
   hard boundaries, validation commands, and enabled gates.
3. Documentation artifacts: task indexes, specs, goals, milestones, gate
   records, run logs, status files, and deferred registers.

The core rule is:

```text
Plugin defines protocol. Adapter defines overrides. Artifacts record facts.
```

Fixed-contract projects keep the original fixed file contract.
Adapter-contract projects resolve artifact paths through
`.agent-harness/config.json` and the project adapter.

## Control Plane

The project control plane is intentionally file-based. Files are easy for
humans to review, easy for Codex to read, and portable across machines.

Fixed contract:

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

Adapter contract uses the configured equivalents:

```text
task index
project adapter
specs/
goals/
milestones/
runs/
status file
gate records
deferred register
```

The default adapter paths are supplied by the plugin template, but projects
may override them in `.agent-harness/config.json`.

Existing adapter projects can be discovered before `.agent-harness/config.json`
exists when they already have a project adapter and a known task index such as
`todolist.md`. `config import` persists that mapping without creating another
task source.

## Loop Model

A development loop should always have:

- input: task from the configured task index or explicit user request
- context: repo instructions, adapter, config, relevant files, current git state
- action: implementation, review, triage, or report-only check
- verification: tests, typecheck, browser proof, logs, or manual review
- state update: tasks, status, goal file, or run log
- stop condition: done, blocked, budget reached, or decision needed

## Goal And Run Boundary

`goal` and `run` are separate steps:

- `goal`: create a durable handoff under `.agent-harness/goals/`.
- `run`: prepare or record execution for one goal under `.agent-harness/runs/`.

In the adapter contract, these are the configured goals and runs directories rather
than mandatory literal paths.

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
