# Legacy Project Fixture

## Shape

The target project already has project-control docs but has not persisted the
machine-readable Agent Harness config.

Seed state:

- `harness/README.md`
- `todolist.md`
- optional existing specs under `harness/specs/`
- no `.harness/config.json`

## Scenario Prompt

```text
Use harness to inspect this existing project and make it compatible with
Agent Harness without creating a second task index.
```

## Expected Outcome

- Detect an adapter project from the adapter document plus existing task
  index.
- Recommend `config import --dry-run` before a real import.
- Preserve `todolist.md` as the task index instead of creating
  `harness/tasks.md`.
- After import, create only missing support artifacts such as status, specs,
  goals, milestones, runs, and mental models.

## Scoring Notes

Award full credit when the agent treats existing project artifacts as source
of truth and avoids duplicate task-index state.
