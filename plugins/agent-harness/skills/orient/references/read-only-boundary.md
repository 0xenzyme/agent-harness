# Read-Only Boundary

Use this reference when an orientation request includes tempting execution
language.

## Allowed

- Read repo instructions and harness config.
- Inspect Goal/status/spec/goal/run artifacts.
- Run read-only commands such as `doctor`, `config inspect`, `config validate`,
  and `orient next`.
- Summarize blockers, ready work, stale state, and missing evidence.
- Preview intake candidates without recording them.

## Not Allowed

- Edit source files.
- Create branches or worktrees.
- Prepare goals or runs.
- Record Goal/status/run state.
- Start daemons, background sessions, deployments, releases, pushes, or PRs.
- Turn a recommendation into execution without explicit user intent.

## If The User Mixes Intents

- New rough idea -> preview with `intake`; record only after explicit approval.
- Setup request -> route to `init`.
- Confirmed implementation -> route to `execute`.
- Missing product direction or approval -> route to `ask`.
