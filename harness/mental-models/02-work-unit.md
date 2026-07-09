# Goal Work Unit Model

This model answers what one harness-managed unit of work is.

The reusable adapter formula is:

```text
goal with tasks + spec + run + gate + evidence
```

## Components

- goal: the primary Harness work unit; users confirm direction, scope,
  acceptance, and pause conditions here
- tasks: concrete breakdown inside a Goal, such as checklist items, worker
  nodes, or implementation subparts
- status: current state, priority, blockers, and latest verification
- spec: accepted intent, boundaries, risks, and validation when ambiguity is high
- DAG: dependencies, Tasks, Milestones, gates, deferred work, or follow-up
  ordering
- run: one execution attempt and evidence record for a Goal
- gate: evidence that the work is ready to proceed, pause, merge, or close

Not every small Goal needs every component as a separate file. The model still
applies: Codex should know which parts are implicit, which are recorded, and
which are missing enough to pause.

## Terminology Hierarchy

```text
Roadmap -> Milestone -> Goal -> Task -> Run
```

- `Milestone` is a roadmap-level outcome. It usually requires multiple Goals.
- `Goal` is the main planning, execution, and acceptance unit.
- `Task` is Goal-internal breakdown. A Goal can contain multiple Tasks.
- `Run` is an execution attempt for a Goal. Most Goals should complete in one
  Run, but a blocked or repaired Goal can have multiple Runs.

## Artifact Mapping

- Goal index records what work exists and its current user-facing state
- status file records the bounded current operating picture for the repository,
  not an append-only history log
- specs record decisions and boundaries before execution
- goals record runnable handoffs for a bounded Goal
- milestones and deferred registers record roadmap-level ordering and later
  work
- run logs record execution packets, command summaries, and gate evidence
- mental models record reusable invariants that should survive one Goal
