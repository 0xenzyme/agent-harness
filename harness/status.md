# Project Status

This file is a bounded current-state projection. Authoritative accepted phase
belongs to Task/Goal records; historical detail belongs in
`harness/tasks-archive.md`, Goals, milestones, owning-domain docs, and Runs.

## Focus

- Current Goal: None active.
- Recently completed: Simplify completion and remove Git-derived Delivery State.
- Phase: completed.
- Spec: `harness/specs/2026-07-21-simplify-completion-and-remove-git-derived-delivery-state.md`
- Goal: `harness/goals/2026-07-21-simplify-completion-and-remove-git-derived-delivery-state.md`
- Run: `.harness/runs/20260721-110505-simplify-completion-and-remove-git-derived-delivery-state`

## Accepted Result

- Task/Goal is the accepted-state authority with `active`, `completed`, or
  resumable non-complete `blocked` phase.
- Run records execution, DAG, verification, gate, and candidate/accepted
  evidence; status is a bounded projection.
- Completion derives from accepted scope, fresh verification, required durable
  gates, and synchronized authoritative state.
- Canonical Goal/Run generation, validation, maintenance, and status output no
  longer contain Git-derived Delivery State, Run start snapshots, or delivery
  gates.
- Legacy Goal and Run fields remain readable for the `0.10.0` compatibility
  boundary, are ignored by current behavior, and are removed when an old Run is
  recorded again.
- Artifact inspection scans configured durable-evidence roots for local Run
  references; work-mode recommendation follows configured policy.

## Release Surface

- Package and plugin versions: `0.10.0`.
- Release notes: `docs/releases/v0.10.0.md`.
- Canonical templates, skills, references, bilingual CLI docs, capability
  matrix, project contract, README, behavior traces, smoke coverage, and social
  preview are aligned.

## Verification

- Passed: `node --check plugins/agent-harness/scripts/agent-harness.mjs`.
- Passed: `node --check tests/smoke.mjs`.
- Passed: `node --check scripts/test-suites.mjs`.
- Passed: `npm run test:protocol` with 8 canonical invariants.
- Passed: `npm run test:smoke`.
- Passed: `npm run test:all`.
- Passed: `npm run test:eval` with 40 trigger cases, 4 task cases, 8 hard CLI
  checks, and 10 behavior traces.
- Passed: `npm run validate:plugin`.

## Route

- Public entry: `harness:orient` for the next read-only project decision.
- Accepted-state owner: None active.
- Need user: None.
- Remaining: None for the accepted implementation scope.

## Blockers

- None.
