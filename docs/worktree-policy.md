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

The default policy is `ask`. A harnessed project can set an explicit default,
but the agent must still report the reason for the selected mode before editing
files. Fixed contract config reads `worktree.defaultPolicy`; adapter contract config may use
`workMode.defaultPolicy`.

`agent-harness run prepare` records the recommended mode from the goal and
project config. It does not create a worktree by itself; the executing agent or
user still chooses and explains the actual work mode before editing files.

## Recommendation Command

Use `agent-harness worktree recommend --cwd <project>` before execution when
the current checkout state matters. The command is read-only: it reports
`local`, `worktree`, or `ask` with reasons from `git status` and
`.agent-harness/config.json`, but it does not create branches, create
worktrees, modify files, or start Codex sessions.

For automation, use `--json` to get a stable machine-readable result. The
first supported observable rule is
`local_checkout_has_unrelated_changes -> worktree`, where a dirty checkout is
treated as the conservative signal. User intent, parallel work, production
risk, and destructive operations still require explicit context or a separate
spec.
