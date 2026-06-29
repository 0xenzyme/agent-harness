# Work Mode Policy Reference

Agent Harness does not assume every goal needs a new branch or worktree.

## Modes

- `local`: current checkout is appropriate.
- `worktree`: use a separate checkout before editing.
- `ask`: pause for user direction.

Every work mode recommendation should include a short reason. The reason
should mention the observable input that mattered, such as checkout cleanliness,
scope, parallelism, production risk, credentials, destructive impact, or user
instruction.

## Local

Use local mode when the task is small, foreground, explicitly local, or depends
on the current editor/server state.

## Worktree

Use worktree mode when the checkout is dirty with unrelated work, the task is
broad, work is parallel or unattended, or the result should become a separate
PR.

## Ask

Ask when the task may be destructive, touches production or paid services,
requires credentials, or has unclear product/project direction.

The CLI recommendation command is read-only. It does not create branches,
worktrees, daemons, sessions, PRs, or deployments.

Work mode is not final acceptance. The control lane still owns validation,
evidence review, and state sync before marking work done.
