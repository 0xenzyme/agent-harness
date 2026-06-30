# Controller Communication Reference

Use these packet formats when a controller thread coordinates execution
threads or records gate outcomes.

The controller thread is the acceptance lane. Other threads, automation,
proposal competition, and inbox notes may produce candidate evidence, but they
do not update accepted task/status/run state until the controller validates the
evidence and records the decision.

Idea Inbox notes should return raw context plus intake recommendations.
Competition notes should return route candidates plus risks. Neither packet is
an execution order until the controller accepts it and records the next state.

## Status Snapshot

```text
Status Snapshot

Milestone:
Current gate:
Running threads:
DAG ready nodes:
DAG blocked nodes:
Done:
Blocked:
Next executable:
Need user:
```

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
Controller thread:
Conversation route:
Conversation lane:
Execution cwd:
Execution branch:
Execution slot:
Remote-control worktree:
Return channel:
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
Return contract:
Notify on:
```

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
Needs review:
Commit:
Delivery state:
Target delivery state:
Working tree dirty:
Push:
PR:
Merge:
Release:
Controller notified:
Worktree:
Base commit:
Head commit:
Commit status:
Actual model:
Actual reasoning effort:
Gate self-check:
Deferred items:
```

Validation and known risks must be concrete. If nothing was found, write
`None identified` instead of leaving fields blank.

State changes should point to inspectable evidence: changed files, command
summaries, run records, gate reports, or human review notes.

For DAG execution, the controller launches only ready nodes. A worker must not
start or claim completion for a node whose dependencies have not been recorded
as completed. Independent ready nodes may run in parallel through fresh Codex
threads or Codex CLI subagents. Fork is not the default worker surface and
requires explicit controller approval.

For worktree execution, the launch packet must include the conversation route
and execution context lock. If a worker is remote-controlling a worktree, the
packet must say so and name the locked cwd / branch. Workers must not apply
patches in the control-lane cwd when it differs from the locked execution cwd.

Delivery state is separate from implementation status. Local verification may
return `validated-local`, but it must not be reported as pushed, PR-open,
merged, released, or shipped unless those fields contain evidence.

For `gate-only` acceptance, the controller must cite implementer output and
gate evidence before marking a run completed. If that evidence is absent, the
merge decision should be `request-fix`, `blocked`, or `hold-for-user`.

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
Merge decision:
State update:
```

`Merge decision` must be one of `merge`, `request-fix`, `blocked`, or
`hold-for-user`.
