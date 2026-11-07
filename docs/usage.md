# Using Agent Harness

Ask the current coding-agent host to deliver accepted work. See
[`install.md`](install.md) and [`cli.md`](cli.md) for setup and commands.
中文版见 [`usage.zh-CN.md`](usage.zh-CN.md)。

```text
Use harness to check the next step in this project.
Use harness to record this idea, but do not implement it yet: <idea>
Use harness to execute <goal path>, verify it, and sync state.
```

Ordinary clear changes belong directly in the host. For already tracked simple
work, request a bounded postflight update to existing Task/Goal/status records.

For an accepted Goal or Milestone, keep the whole target selected. The
controller reads its adjacent plan, performs or delegates work in the host,
checks candidate output, and records actual changed files and verification
results in acceptance items. `execute next` continues until complete or a
genuine pause condition occurs.

Close satisfied Goals and the Milestone with `goal complete` or
`milestone complete` plus `--verification`. Use one exact
`<check-id>: <actual result>` entry per declared check, separated by semicolons
or newlines. These commands update delivery state only.

Do not create Runs, receipts, checkpoints, hashes, log copies or session
transcripts for Harness. Resume with the host's session/history mechanisms.
Later code edits are normal: verify the new change without reopening an old
Goal or comparing its old inputs.

For review-only control, explicitly request `gate-only`. For long-running work,
use the host runtime outcome and transient plan when exposed. Authorization
for a session/worker is not authorization for a worktree, commit, push, deploy
or release.
