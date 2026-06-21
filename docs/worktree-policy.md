# Worktree Policy

Codex worktrees are useful, but they should not be automatic for every goal.
Agent Harness treats the worktree choice as a policy decision.

## Modes

### `local`

Use local mode when:

- the user explicitly asks not to create a branch or worktree
- the task is small and foreground
- the checkout is clean or the edits are limited to notes/config
- the user needs the existing dev server or IDE state

### `worktree`

Use worktree mode when:

- the user wants parallel work
- the local checkout is dirty with unrelated changes
- the goal may touch many files
- the work is unattended automation
- the change should become a separate PR

### `ask`

Ask before choosing when:

- the task may be destructive
- production credentials or paid APIs are involved
- product direction is unclear
- the user gave conflicting branch/worktree instructions

## Smart Default

The default policy is `ask`. A harnessed project can opt into `auto`, but the
agent must still report the reason for the selected mode before editing files.
