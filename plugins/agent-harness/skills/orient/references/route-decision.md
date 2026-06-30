# Route Decision

Use this reference when orientation needs to recommend the next harness mode.

## Inputs

- current task state
- configured harness contract and paths
- relevant adapter, status, task index, specs, goals, runs, and mental models
- dirty checkout or unrelated work
- user intent: question, discussion, review, intake, setup, or execution
- external risk: credentials, paid APIs, production data, destructive changes

## Output Shape

```text
Route Decision

Mode:
Reason:
Required docs:
Required gates:
Execution role:
Execution mode:
Validation:
Escalation triggers:
Confirmation needed:
```

## Mode Hints

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
