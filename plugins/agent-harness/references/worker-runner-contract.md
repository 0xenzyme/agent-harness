# Worker Runner Contract

Use this reference before launching, prompting, recording, or accepting a
worker, subagent, automation run, or external coding-agent result.

## Purpose

Keep delegation bounded and inspectable. A worker is an execution surface that
returns candidate evidence to the controller; it is not the acceptance lane.

## Worker Surfaces

- `codex-cli-subagent`: default bounded worker surface when available.
- `codex-app-thread`: explicit, visible, long-lived handoff lane.
- `command`: adapter- or operator-provided agent runner command.
- `none`: no suitable worker exists; stay in foreground execution or route to
  `ask`.

`harness-rule:worker-surface-default`: use `codex-cli-subagent` as the default
bounded worker surface when available. Codex App threads are explicit
long-lived handoff lanes, and fork is not a default worker surface.

`harness-rule:degraded-execution-provenance`: if the default worker surface is
unavailable, skipped, or replaced by `manual-foreground`, record visible
provenance instead of presenting the result as normal delegated execution.
Name the actual execution method, unavailable or skipped surface, fallback
reason, candidate-evidence boundary, and verification evidence.

`harness-rule:controller-cancellation-boundary`: cancellation, supersession,
drain, and pause-after-current are cooperative control-plane signals, not
runtime kill guarantees. A controller may stop new dependent launches,
quarantine late output, reject stale candidate evidence, or switch to
manual-foreground fallback with degraded provenance, but it must not treat the
signal itself as proof that a worker runtime stopped.

Use capability and safety to choose the surface. Do not treat worker
availability as permission to broaden scope, skip verification, or change the
controller's execution role.

`harness-rule:parallel-worker-isolation`: launch workers sequentially by
default. Parallel writers require separate locked worktrees/cwds. Parallel
read-only workers or writers with proven non-overlapping file ownership may run
together only when every launch packet records the evidence. Without isolation
evidence, launch at most one ready node.

## Launch Requirements

Every worker launch must name:

- controller thread or lane
- goal, run, and DAG node
- worker surface
- named Codex agent and model policy, when a model must be pinned
- execution cwd, branch, and slot
- prompt artifact or launch packet
- parallel isolation evidence or `sequential`
- allowed scope and forbidden scope
- required docs and source of truth
- validation command or evidence requirement
- return channel and output artifact, when applicable
- stop conditions

If any item is missing and it affects scope, authority, verification, or state
sync, do not launch the worker. Shape the goal/run or ask for confirmation.

## Worker Rules

- Work only inside the locked execution cwd and allowed scope.
- Do not modify the controller cwd when it differs from the execution cwd.
- Do not touch forbidden scope, credentials, paid APIs, production, destructive
  operations, release, deploy, publish, or daemon launch unless the goal and
  controller explicitly authorize it.
- Do not start dependent DAG nodes.
- Do not update accepted Goal, Task, status, run, gate, or release state.
- Do not mark work complete or promote candidate evidence to accepted evidence.
- Return concrete changed files, validation, known risks, dirty state, delivery
  state, State Sync Notes, degraded provenance when applicable, and deferred
  items.
- Treat State Sync Notes as part of Goal/Task Done: name the Goal, Task,
  status, or run records that should change, the suggested state, and the
  evidence. These notes remain candidate evidence until the accepted-state
  owner records them.
- If the controller sends a cancellation or supersession notice, stop expanding
  scope when possible and return a partial result or stop report. If you return
  later, mark the output as late candidate evidence for controller review.

## Controller Rules

- Treat worker output as candidate evidence only.
- Record worker output before launching dependent nodes.
- Run or inspect verification before accepting state.
- Verify State Sync Notes before marking a task, goal, run, node, or gate
  complete.
- Use adversarial acceptance before marking a task, goal, run, node, or gate
  complete.
- Record accepted state only from the controller lane.
- Snapshot active workers before changing same-scope execution. Do not launch
  dependents or record completed state while active worker state is unresolved.
- Do not launch multiple ready writers without recorded isolation evidence.
- Quarantine late output after cancellation or supersession until the
  controller rejects it or revalidates it as candidate evidence.

## Failure Rule

If the worker cannot prove scope, verification, or state sync, record
`request-fix`, `blocked`, or `delivery pending`; do not convert the result into
completed state.

If worker delegation degrades to foreground execution, the result may still be
useful candidate evidence, but the controller must see the degraded provenance
before accepting or rejecting it.
