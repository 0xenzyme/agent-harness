# Gate Results Reference

Gate results record why a task, goal, run, or milestone can move forward.

## Generic Format

```text
Gate Result

Gate:
Passed:
Evidence:
State changes:
New tasks:
Deferred to:
Next executable:
```

## Rules

- Evidence must be concrete (`harness-rule:state-sync-evidence`): command
  result, run id, commit id, user review, or other inspectable artifact.
- Completion of work already tracked by Harness includes state-sync evidence or
  State Sync Notes from the executing lane. A gate may accept completion only
  after the authorized accepted-state owner verifies those notes and records or
  cites accepted state. Untracked bounded direct work must not create a Harness
  lifecycle solely to manufacture state-sync evidence.
- Candidate evidence from subagents, automation, inbox notes, or proposal
  competition is not accepted state until the control lane validates it and
  records the gate result.
- Execution DAG node results are candidate evidence until recorded with
  `run node record`; enforced DAG runs cannot be accepted until every node is
  completed and dependency order has been respected.
- In `gate-only` execution (`harness-rule:gate-only-controller`), the control
  lane must cite implementer output and verification evidence before accepting
  state. It should request corrections instead of directly rewriting
  implementation files.
- `harness-rule:degraded-execution-provenance`: when execution falls back from
  the intended worker/controller surface, gate evidence must name the actual
  execution method, unavailable or skipped surface, fallback reason,
  candidate-evidence boundary, and compensating verification before accepting
  state.
- `harness-rule:controller-cancellation-boundary`: cancellation,
  supersession, drain, or pause-after-current is not completion evidence and is
  not proof that a worker runtime stopped. Gate evidence must resolve active
  workers and late output by rejecting, quarantining, or revalidating candidate
  evidence before same-scope accepted state moves.
- Completed run records must include verification evidence. Completed
  `gate-only` records must also include explicit gate evidence that points to
  implementer output and acceptance review.
- Batch or merged source-task runs must include a `Source Task Acceptance Map`.
  The control lane must verify every mapped acceptance item before marking the
  run completed.
- Parent roadmap milestone runs must include a `Milestone Completion Map` when
  implementation phasing declares subitems such as `M5-S0` and `M5-D1`. The
  control lane must verify every mapped milestone item before marking the
  parent milestone completed.
- Goals with `Spec Acceptance Checklist` items must satisfy every checklist
  item before completed run records can be accepted.
- Adapter-required gates declared in `gates.requiredForCompletion` or
  `gates.blocking` must have matching `Required Gate Evidence` with concrete
  evidence and `Status: satisfied`. Technical verification is necessary but
  cannot replace these gates.
- Failed gates create a correction task, move the work back to an earlier
  state, or mark it blocked.
- Deferred items must name where they are deferred and what unblocks them.
- If there is no next executable work, write `None`.
- Gate records should stay project-neutral when they are part of plugin core
  examples or templates; put local facts in project adapters and artifacts.

## Common Gates

- `spec`: spec boundaries are clear enough to generate a goal.
- `execution`: goal exists, dependencies are satisfied, and execution can
  start.
- `integration`: execution result is within scope and verification is accepted.
- `review`: human review passed or recorded actionable follow-up.
- `milestone`: milestone completion conditions are satisfied.
