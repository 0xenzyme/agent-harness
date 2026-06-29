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

- Evidence must be concrete: command result, run id, commit id, user review, or
  other inspectable artifact.
- Failed gates create a correction task, move the work back to an earlier
  state, or mark it blocked.
- Deferred items must name where they are deferred and what unblocks them.
- If there is no next executable work, write `None`.

## Common Gates

- `spec`: spec boundaries are clear enough to generate a goal.
- `execution`: goal exists, dependencies are satisfied, and execution can
  start.
- `integration`: execution result is within scope and verification is accepted.
- `review`: human review passed or recorded actionable follow-up.
- `milestone`: milestone completion conditions are satisfied.
