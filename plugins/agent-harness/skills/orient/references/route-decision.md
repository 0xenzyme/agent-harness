# Route Decision

Use this reference when orientation needs to recommend the next harness mode.

## Inputs

- current Goal state
- configured harness contract and paths
- relevant adapter, status, Goal index, specs, goals, runs, and mental models
- current conversation-confirmed state from the active control thread,
  especially explicit user or controller decisions that revise or supersede
  older artifact state
- dirty checkout or unrelated work
- user intent: question, discussion, review, intake, setup, or execution
- external risk: credentials, paid APIs, production data, destructive changes

## Output Shape

This shape is a control packet for route reasoning. It is not the default final
answer. After forming it, use
[User-Facing Summary](user-facing-summary.md) to produce the final user-facing
decision prompt unless the user asks for audit, evidence, or handoff detail.

```text
Route Decision

Mode:
Reason:
Required docs:
Required gates:
Execution role:
Execution mode:
Validation:
Stale artifact check:
Escalation triggers:
Confirmation needed:
```

## Mode Hints

These are internal route names. Before responding, map them through
[Route To Public Entry Mapping](../../../references/route-entry-mapping.md) so
the user receives a published skill or exact action.

- `orient`: user asks for state, blockers, or next safe action.
- `intake`: user brings a rough idea, requirement, bug, or inbox note.
- `init`: user asks to adopt, initialize, import, or repair harness setup.
- `shape`: scope needs product, acceptance, or source-of-truth clarification.
- `goal`: accepted scope needs durable handoff.
- `execute`: scope, role, verification, completion, and pause conditions are
  already accepted.
- `competition`: broad ambiguous design choice needs candidate routes before
  execution.
- `ask`: missing approval, credentials, production access, destructive impact,
  or product direction blocks safe progress.

## Boundary

Orientation may recommend a route, but it must not mutate state, prepare runs,
create branches/worktrees, or start implementation.

When conversation-confirmed state conflicts with task, milestone, spec, or
goal artifacts, orientation should name the superseded artifact and route to
state sync, shaping, intake, goal creation, or `ask`. Do not present the older
artifact recommendation as the active next path.
