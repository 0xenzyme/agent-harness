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

## Control Records And User Closeout

Control packets and final answers serve different readers.

- `Route Decision`, `Execution Result Packet`, `Gate Result`, and similar
  packet formats are control-plane records. They preserve route reasoning,
  evidence, acceptance, and handoff state for another controller or worker.
- Final answers are user-facing closeouts. They should translate the packet into
  the current situation, verification state, delivery state, blocker, and exact
  user choice or next action.
- Workflow skills should define their closeout shape at the point where agents
  repeatedly fail: `orient` returns a decision prompt, `execute` returns a
  delivery-state closeout, `init` separates read-only audit from setup writes,
  and `intake` preserves the preview / record boundary.
- References should be added to constrain repeated model failure modes, not to
  turn every response into a long template.

The operating principle is: keep the control plane rigorous and the user
surface clear. Packets belong to acceptance and handoff; final answers belong to
human decision-making.

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
