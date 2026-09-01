# Project Status

This file is a bounded current-state projection. Authoritative accepted phase
belongs to Task/Goal records; historical detail belongs in
`harness/tasks-archive.md`, Goals, milestones, owning-domain docs, and Runs.

## Focus

- Current Goal: Implement Run Checkpoint and Recovery Protocol.
- Goal: `harness/goals/2026-09-01-implement-run-checkpoint-and-recovery-protocol.md`.
- Spec: `harness/specs/2026-09-01-run-checkpoint-and-recovery-protocol.md` (`accepted`).
- Run: `.harness/runs/20260901-164310-implement-run-checkpoint-and-recovery-protocol`.
- Phase: completed; implementation and verification evidence are recorded in
  the durable Run.
- Execution path: `durable-harness`, `current-thread`, `local`, `implementer`.

## Accepted Result

- Managed prepared Runs can explicitly enforce an independent, schema-bound
  `checkpoint.json` with lock/atomic/CAS mutation, finite control/stage state,
  drift/replacement recovery, reconciliation evidence, and L0/L1 orientation.
- Checkpoint-disabled Runs, Codex fast paths, v1 manifests, and legacy Runs
  remain compatible; nonterminal recovery state remains prune-protected.
- Core CLI, config/schema/templates, skills, references, bilingual docs,
  capability matrix, CHANGELOG, tests, evals, and project state are aligned.
- Checkpoint/Run completion does not complete Goal authority. RC-D1 through
  RC-D6 remain deferred and were not silently absorbed.

## Verification

- Passed: JavaScript syntax, focused protocol/regression coverage,
  `npm run test:all`, `npm run test:eval`, and `npm run validate:plugin`.
- Passed: config, Goal, and Run validation; project doctor; artifact inspect,
  compact, and prune previews; final `git diff --check`.

## Route

- Public next entry: `harness:orient` for a new project decision.
- Accepted-state owner: none active after this completed Run.
- Need user: None.
- Delivery ceiling: validated local changes only; no version bump, commit,
  push, publish, release, deploy, or production operation is authorized.
- Remaining: None for the accepted implementation scope.

## Blockers

- None.
