# Project Status

This file is a bounded current-state snapshot. Historical detail belongs in
`harness/tasks-archive.md`, Goals, milestones, owning-domain docs, and Runs.

## Focus

- Current Goal: None active.
- Recently completed: bounded artifact lifecycle and retention.
- Spec: `harness/specs/2026-07-20-bounded-artifact-lifecycle-and-retention.md`
- Goal: `harness/goals/2026-07-20-fix-bounded-artifact-lifecycle-and-retention.md`
- Run: `.harness/runs/20260720-105524-fix-bounded-artifact-lifecycle-and-retention`

## Accepted Result

- `artifactPolicy` configures tracked/local-only Runs, retention windows,
  latest-Run protection, status line limits, task archive, recent-Done window,
  and durable evidence roots.
- `artifacts inspect` audits bounded state, Run count/bytes/phases, lifecycle
  inconsistencies, and tracked references without writing.
- `artifacts compact` previews by default and writes exact task blocks to the
  archive before replacing the active index only with `--record`.
- `artifacts prune` previews by default. `--apply` requires local-only policy,
  terminal/expired/unprotected Runs, configured-root containment, and a Goal
  reference with non-empty State Sync Notes.
- Active/unknown Runs and Runs without durable evidence remain protected.

## Dogfood State

- `harness/tasks.md`: bounded to ten recent Done records including this Goal.
- `harness/tasks-archive.md`: 55 exact historical task blocks retained.
- `harness/status.md`: bounded below the configured 160-line limit.
- `.harness/runs/`: 23 Runs inspected; no Run was deleted.
- Existing tracked local-Run references remain visible as an audit warning.

## Git And Delivery

- Branch: `main`
- Work mode: `local`
- Delivery state: `committed`
- Implementation/release-prep commit: `e38a746`
- Local plugin cache: refreshed at
  `/Users/liuyj/.codex/plugins/cache/agent-harness-local/harness/0.9.0`;
  source/cache are 45/45 files with no `diff -qr` differences
- Push/review/integration/Git tag/GitHub Release/remote publish: not authorized
- Production/credentials/paid APIs/destructive Run cleanup: not used

## Verification

- Passed: JavaScript syntax checks, `npm run test:all`, `npm run test:eval`,
  `npm run validate:plugin`, four skill validators, config/Goal validation,
  lifecycle inspect/compact/prune previews, and `git diff --check`.
- Local deployment passed source validation and smoke again; package/plugin
  versions are `0.9.0`, and the installed cache matches the plugin source.
- Final inspect after state sync: status 64/160 lines, ten Done tasks with zero
  lifecycle issues, 23 Runs retained, zero compact candidates, and zero prune
  candidates/deletions.

## Route

- Public entry: `harness:orient` for the next read-only project decision.
- Accepted-state owner: None active.
- Need user: None.
- Remaining: None for the authorized local commit and plugin-cache deployment.

## Blockers

- None.
