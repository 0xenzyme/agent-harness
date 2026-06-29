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
```

## Goal Launch Packet

```text
Goal Launch Packet

Goal:
Thread role:
Controller thread:
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
Commit expectation:
Return contract:
Notify on:
```

## Execution Result Packet

```text
Execution Result Packet

Goal:
Thread:
Status:
State change:
Changed files:
Summary:
Validation:
Known risks:
Needs review:
Commit:
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
