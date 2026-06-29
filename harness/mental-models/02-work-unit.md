# Work Unit Model

This model answers what one harness-managed unit of work is.

The reusable adapter formula is:

```text
task with status + spec + DAG + goal + gate
```

## Components

- task: the durable backlog item or explicit user request
- status: current state, priority, blockers, and latest verification
- spec: accepted intent, boundaries, risks, and validation when ambiguity is high
- DAG: dependencies, milestones, gates, deferred work, or follow-up ordering
- goal: executable handoff for one focused work slice
- gate: evidence that the work is ready to proceed, pause, merge, or close

Not every small task needs every component as a separate file. The model still
applies: Codex should know which parts are implicit, which are recorded, and
which are missing enough to pause.

## Artifact Mapping

- task index records what work exists and its current user-facing state
- status file records the current operating picture for the repository
- specs record decisions and boundaries before execution
- goals record runnable handoffs for a bounded slice of work
- milestones and deferred registers record ordering and later work
- run logs record execution packets, command summaries, and gate evidence
- mental models record reusable invariants that should survive one task
