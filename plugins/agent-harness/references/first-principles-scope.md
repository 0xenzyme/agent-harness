# First-Principles Scope

Use this reference before routing ambiguous work, shaping a spec, or creating a
goal from conversation state.

## Purpose

Reduce the request to the smallest set of facts needed to route safely. Do not
use this as a long user-facing template; use it to decide whether the work can
move forward, needs shaping, or must pause.

## Check

- Objective: what outcome is actually needed?
- Source of truth: which user message, spec, task, adapter, code behavior, or
  production rule controls the decision?
- Hard constraints: what must not be violated?
- Non-goals: what is explicitly out of scope?
- Verification: what inspectable evidence would prove the work is done?
- Pause trigger: what ambiguity changes cost, risk, compatibility, or product
  direction?

## Routing Rule

If objective, source of truth, scope, non-goals, verification, or pause triggers
cannot be stated concretely, route to `intake`, `shape`, `goal`, state sync, or
`ask` before execution.
