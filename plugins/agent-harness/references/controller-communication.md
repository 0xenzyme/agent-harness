# Controller Communication Reference

Use these packet formats when a controller thread coordinates execution
threads or records gate outcomes.

The controller thread is the acceptance lane for its authorized scope. Other
threads, automation, proposal competition, and inbox notes may produce
candidate evidence, but they do not update accepted task/status/run state until
the controller validates the evidence and records the decision.

`harness-rule:child-controller-boundary`: a visible long-lived thread must
declare whether it is a child controller or an execution worker before work
starts. A child controller may own accepted state only inside the authorized
scope named by the launch packet. The parent controller keeps portfolio,
roadmap, or milestone visibility through snapshots, decision requests, and
final result packets; it must not repeat same-scope acceptance unless it
explicitly supersedes the child controller's authority and records the stale
state risk.

Use [Worker Runner Contract](worker-runner-contract.md) before launching,
prompting, recording, or accepting worker output. Worker output is candidate
evidence only; accepted state is written by the controller after verification
and gate review.

Idea Inbox notes should return raw context plus intake recommendations.
Competition notes should return route candidates plus risks. Neither packet is
an execution order until the controller accepts it and records the next state.

## Status Snapshot

```text
Status Snapshot

Milestone:
Current gate:
Running threads:
Child controllers:
DAG ready nodes:
DAG blocked nodes:
Done:
Blocked:
Next executable:
Need user:
```

Use `Need user: None` when no true pause trigger or concrete user action is
needed. This is `harness-rule:need-user-digest`; do not turn routine snapshots
or closeouts into broad confirmation requests.

## Decision Request

```text
Decision Request

Question:
Why it matters:
Options:
- Recommended:
- Alternative:
Default if no decision:
Supersedes:
Artifacts to update:
```

When a controller accepts a revised plan, `Supersedes` should name the older
milestone, spec, goal, route, or task state it replaces. `Artifacts to update`
should list durable records that still reflect the old plan so later
orientation does not treat stale artifacts as the active route.

## Goal Launch Packet

```text
Goal Launch Packet

Goal:
DAG node:
Thread role:
Parent controller thread:
Controller thread:
Accepted-state owner:
Worker surface:
Conversation route:
Conversation lane:
Execution cwd:
Execution branch:
Execution slot:
Remote-control worktree:
Return channel:
Parent return channel:
Prompt artifact:
Output artifact:
Recommended model:
Recommended reasoning effort:
Why this level:
Fallback allowed:
Must read:
Allowed scope:
Forbidden scope:
Dependency notes:
Validation:
Expected worktree reporting:
Expected delivery state:
Target delivery state:
Delivery authorization:
Commit expectation:
Allowed state writes:
Return contract:
Report cadence:
Notify on:
```

`Thread role` must distinguish `child-controller` from `execution-worker` when
the surface is a visible long-lived thread. Use `Accepted-state owner` and
`Allowed state writes` to name exactly which lane may update accepted
task/status/goal/run/gate state. For a child controller, `Parent return channel`
is for parent-level status sync and true-gate escalation, not for duplicate
same-scope acceptance. For an execution worker, the result remains candidate
evidence only.

## Execution Result Packet

```text
Execution Result Packet

Goal:
Thread:
Node:
Status:
State change:
Changed files:
Summary:
Validation:
Known risks:
Need user:
Remaining:
Needs review:
Commit:
Delivery state:
Target delivery state:
Working tree dirty:
Push:
Review:
Integration:
Release:
Controller notified:
Parent controller notified:
Worktree:
Base commit:
Head commit:
Commit status:
Actual model:
Actual reasoning effort:
Gate self-check:
Deferred items:
```

Validation, known risks, `Need user`, and `Remaining` must be concrete. If
nothing was found, write `None identified` for risks and `None` for `Need user`
or `Remaining` instead of leaving fields blank.

State changes should point to inspectable evidence: changed files, command
summaries, run records, gate reports, or human review notes.

For DAG execution, the controller launches only ready nodes. A worker must not
start or claim completion for a node whose dependencies have not been recorded
as completed. Independent ready nodes may run in parallel through Codex CLI
subagents. Fresh Codex threads are explicit, visible, long-lived handoff lanes,
not the default worker surface. Fork is not the default worker surface and
requires explicit controller approval.

Worker prompts should follow `templates/worker-prompt.md`: the worker identity,
controller, execution context lock, allowed scope, forbidden scope, validation,
stop conditions, and return contract must be explicit. A worker must not update
accepted task, status, goal, run, gate, or release state.

For worktree execution, the launch packet must include the conversation route
and execution context lock. If a worker is remote-controlling a worktree, the
packet must say so and name the locked cwd / branch. Workers must not apply
patches in the control-lane cwd when it differs from the locked execution cwd.

Delivery state is separate from implementation status. Local verification may
return `validated-local`, but it must not be reported as pushed, `review-open`,
`integrated`, released, or shipped unless those fields contain evidence.
`PR-open` and `merged` are compatibility aliases for provider-specific inputs.

For `gate-only` acceptance, the controller must cite implementer output and
gate evidence before marking a run completed. If that evidence is absent, the
integration decision should be `request-fix`, `blocked`, or `hold-for-user`.
Worker self-tests, narrative summaries, and unreviewed result packets are not
accepted state.

For batch or merged source-task work, the controller must preserve a
`Source Task Acceptance Map`. Aggregate run evidence is not enough; each source
task acceptance needs its own status and evidence before accepted state moves
to Done.

For spec-heavy or adapter-gated work, the controller must preserve a
`Spec Acceptance Checklist` and `Required Gate Evidence`. Candidate output,
technical verification, and smoke checks can support review, but accepted
completion requires every relevant checklist item and adapter-required gate to
be satisfied with concrete evidence.

## Integration Gate Report

```text
Integration Gate Report

Thread:
Goal:
Result:
Validation checked:
Scope check:
Forbidden scope check:
State sync:
Secrets / provider / paid calls:
Invariants:
Deferred items:
Follow-up tasks:
Need user:
Remaining:
Integration decision:
State update:
```

`Integration decision` must be one of `integrate`, `request-fix`, `blocked`,
or `hold-for-user`.
