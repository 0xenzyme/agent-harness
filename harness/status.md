# Project Status

This file is a bounded current-state projection. Authoritative accepted phase
belongs to Task/Goal records; historical detail belongs in
`harness/tasks-archive.md`, Goals, milestones, owning-domain docs, and Runs.

## Focus

- Current Goal: None active.
- Recently completed: Refresh stale documentation and project state after
  post-0.10 hardening.
- Phase: completed.
- Source: User-requested documentation audit and follow-up repair on 2026-08-28.
- Execution path: `codex-direct`; no repository Goal or Run was created for
  this bounded documentation maintenance.

## Accepted Result

- `0.10.0` is described consistently as release preparation rather than a
  published Git tag or GitHub Release; July/August hardening remains under
  `Unreleased` until a separately authorized release assigns a version.
- The capability matrix and public guidance now include
  `harness-rule:pre-delegation-work-mode`, including thread, worktree, conflict,
  `ask`, and `startingState` boundaries.
- Validation guidance now includes the regression suite and accurately states
  that `npm run test:all` runs presentation, protocol, smoke, and regressions.
- Deterministic checks now require every canonical invariant in the capability
  matrix and protect the documented `test:all` / `test:regressions` commands.
- The Goal index is bounded at 10 completed items; two older completed records
  moved intact to `harness/tasks-archive.md` under `Archived 2026-08-28`.

## Release Surface

- Package and plugin versions: `0.10.0`.
- Release preparation notes: `docs/releases/v0.10.0.md`.
- Remote verification on 2026-08-28 found no `v0.10.0` Git tag or GitHub
  Release; publishing remains outside this task.
- `CHANGELOG.md`, bilingual README/usage/CLI guidance, capability matrix,
  worktree policy, project contract, and durable project state are aligned.

## Verification

- Passed: `git diff --check`.
- Passed: Markdown local-link validation across 148 files.
- Passed: `npm run test:all` with presentation, 9 protocol invariants, smoke,
  and regression coverage.
- Passed: `npm run test:eval` with 40 trigger cases, 4 task cases, 8 hard CLI
  checks, and 10 behavior traces.
- Passed: `npm run validate:plugin`.
- Passed: project `doctor` and config validation.
- Passed: artifact-compaction preview with 10/10 retained Done items, no
  remaining candidates, and status below its 160-line limit.

## Route

- Public entry: `harness:orient` for the next read-only project decision.
- Accepted-state owner: None active.
- Need user: None.
- Remaining: None for the accepted implementation scope.

## Blockers

- None.
