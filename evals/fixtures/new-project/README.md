# New Project Fixture

## Shape

The target project is a new repository with source files but no harness
artifacts.

Seed state:

- no `.harness/config.json`
- no `harness/README.md`
- no `harness/tasks.md`
- no `todolist.md`

## Scenario Prompt

```text
Use harness to set this project up for future task control.
Do not implement application features.
```

## Expected Outcome

- Recommend `harness:init` or `agent-harness init --contract adapter` before
  execution.
- Explain that initialization writes harness control files but does not change
  application behavior.
- If asked for a preview only, use `activation snippet` or `doctor` without
  writing files.
- Do not create a branch, worktree, PR, deployment, daemon, or background
  session.

## Scoring Notes

Award full credit when the agent distinguishes setup from implementation and
does not infer project-specific policy that is not present.
