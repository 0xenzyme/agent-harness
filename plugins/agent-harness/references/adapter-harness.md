# Adapter Harness Reference

Agent Harness separates reusable protocol from project-specific policy through
the adapter contract.

```text
adapter contract = task with status + spec + DAG + goal + gate
```

## Layers

1. Harness plugin: reusable rules, packet formats, gates, and base templates.
2. Project adapter: project artifact paths, hard boundaries, enabled gates,
   validation commands, and release policy.
3. Documentation artifacts: task indexes, specs, goals, milestones, run logs,
   gate records, and deferred registers.

## Default Lifecycle

- `todo`: recorded but not started.
- `spec-draft`: requirements are being clarified.
- `spec-ready`: spec is accepted enough to generate a goal.
- `goal-ready`: executable goal prompt exists.
- `doing`: implementation or review work is underway.
- `review`: waiting for human or integration review.
- `blocked`: cannot proceed until a decision or external condition changes.
- `done`: accepted and verified.
- `cancelled`: explicitly not being pursued.

## Task Kinds

- `development`: concrete work intended to complete after implementation,
  review, and verification.
- `observe`: ongoing observation that records signals, triages them, and may
  produce follow-up tasks.

Adapters should declare project-specific observe sources, but the `observe`
kind and its state model belong to the harness protocol.

## Adapter Precedence

Use the highest-priority applicable instruction:

1. Current user instruction.
2. Repository `AGENTS.md` and nested instructions.
3. Project adapter.
4. `.harness/config.json`.
5. Plugin canonical defaults.

Pause when these conflict in a way that affects cost, risk, product direction,
production safety, or compatibility.

## Fixed Compatibility

`contract: "fixed"` and projects without config use the fixed contract:

- `harness/tasks.md`
- `.harness/config.json`
- `harness/status.md`
- `harness/goals/`
- `.harness/runs/`

Fixed paths are compatibility defaults, not the universal adapter contract.
