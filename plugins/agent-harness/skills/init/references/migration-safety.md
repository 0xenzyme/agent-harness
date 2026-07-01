# Migration Safety

Use this reference before importing or repairing an existing harness-like
project.

## Existing Artifacts

Treat these as possible source of truth:

- `.harness/config.json`
- `harness/README.md`
- `harness/tasks.md`
- `todolist.md`
- configured status/spec/goal/run paths
- project adapter docs

## Import Sequence

1. Run `doctor`.
2. Run `config inspect`.
3. Run `config validate` when config exists.
4. For existing task indexes, run `config import --dry-run`.
5. Use import path overrides for existing artifact locations such as custom
   status, specs, goals, milestones, runs, gate records, deferred register, and
   mental-model paths. Prefer `--dry-run --json` when checking these paths.
6. Report planned writes, preserved paths, and the proposed config.
7. Apply import only after the dry-run is clear or the user explicitly approves.

## Never

- Create a second task index when one already exists.
- Change `AGENTS.md` without explicit approval.
- Add hooks, daemons, background sessions, pushes, PRs, deployments, or releases.
- Convert project-specific facts into plugin-core defaults.
