# Using Agent Harness in a Project

This page answers one question: after Agent Harness is installed or adopted in a project, what can you type into Codex to move work forward?

This is not an installation guide or the full protocol. For setup, CLI, goal/run/evidence boundaries, see [`install.md`](install.md) and [`cli.md`](cli.md). 中文版见 [`usage.zh-CN.md`](usage.zh-CN.md)。

## Common One-Liners

```text
Use harness to check the next step in this project.
```

```text
Use harness as the controller and finish this task.
```

```text
Use harness to record this idea, but do not implement it yet: <idea>
```

```text
Use harness to execute <goal path>, verify it, and sync state.
```

```text
Use the current thread as controller and carry the spec through to completion.
```

```text
Use the current thread as a gate-only controller and review evidence only.
```

```text
Wrap up today's work with harness so I can continue tomorrow.
```

## Check Progress And Next Step

When you open a project and are not sure what should happen next:

```text
Use harness to check the current project state and tell me the safest next step. Do not change files yet.
```

If the project is not the current directory:

```text
Use harness in /path/to/project and tell me what can be executed now and what still needs my confirmation.
```

If a round of implementation just finished:

```text
The implementation is done. Use harness to tell me what is next.
```

## Record An Idea

When you have a requirement, bug, improvement, or rough idea and only want to put it into the project queue:

```text
Use harness to record this idea, but do not implement it yet:
<idea>
```

If you want Codex to preview where it would go before recording it:

```text
Use harness to preview where this idea belongs. Record it only after I confirm:
<idea>
```

## Ask What Needs Human Confirmation

When the task is large, or you are not sure whether Harness can proceed automatically:

```text
Use harness to tell me what still needs human confirmation.
```

For a specific task, milestone, or spec:

```text
Use harness to check what still needs human confirmation for <task/milestone/spec path>.
```

## Execute Confirmed Work

When a goal, spec, or accepted scope is ready:

```text
Use harness to execute <goal path>, then verify it and sync state.
```

If you have a spec instead of a goal:

```text
Use harness to proceed from <spec path>. Create or reuse the needed goal/run artifacts according to the project rules.
```

If you want to complete a milestone rather than the next small item:

```text
Use harness to check what remains for <milestone id>, then move the next confirmed item forward.
```

## Use The Current Thread As Controller

When you want the current thread to coordinate, break down, dispatch, and accept work without directly editing implementation files:

```text
Use the current thread as controller and carry the spec through to completion.
```

A more natural variant:

```text
Use harness with the current thread as controller and finish this task.
```

If the controller should only review evidence and not implement:

```text
Use the current thread as a gate-only controller. Use harness to move spec1 forward, review evidence only, and do not edit implementation files.
```

If you want a separate visible controller thread:

```text
Start a new Thread as controller for this task.
```

If you want the current thread to edit code directly, say implementation instead of controller:

```text
Use harness to implement spec1, verify it, and sync state.
```

## Wrap Up And Continue Tomorrow

When the day's work needs to be recorded for later continuation:

```text
Wrap up today's work with harness so I can continue tomorrow.
```

If you want to check for documentation, state, or acceptance leftovers:

```text
Use harness to check what still needs wrap-up, especially docs, state, and acceptance records.
```

If implementation is complete but human acceptance remains:

```text
Use harness to create a lightweight acceptance checklist, record it, and wrap up.
```

## Check Whether Work Is Really Done

When you want to know whether a task can be closed:

```text
Use harness to check whether <goal/task/milestone> is really complete and what remains.
```

If implementation is done but state is not synced:

```text
Use harness to verify the completed work for <goal path> and sync task/status/run evidence.
```
