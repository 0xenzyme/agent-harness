# Control Loop / Handoff Model

This model answers how Codex enters, executes, verifies, updates state, stops,
and hands work off.

## Loop

A development loop should always have:

- input: task from the configured task index or explicit user request
- context: repo instructions, adapter, config, relevant files, current git state
- action: implementation, review, triage, or report-only check
- verification: tests, typecheck, browser proof, logs, or manual review
- state update: tasks, status, goal file, or run log
- stop condition: done, blocked, budget reached, or decision needed

The loop should stay foreground and auditable by default. Preparing a run packet
is not the same as launching an agent, daemon, watcher, deploy, push, release,
or PR.

## Goal And Run Boundary

`goal` and `run` are separate steps:

- `goal`: create a durable handoff under the configured goals directory
- `run`: prepare or record execution for one goal under the configured runs
  directory

In the adapter contract, these are configured directories rather than mandatory
literal paths.

The first run implementation is intentionally manual. `agent-harness run
prepare` creates a packet with a ready prompt and subagent guidance, but it does
not start Codex or launch background sessions.
