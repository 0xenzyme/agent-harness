# One-entry Goal and Milestone Execution

Status: accepted

Date: 2026-10-13

## Source

The user explicitly requested implementation of the accepted one-entry execution
plan in this conversation. The source scenario repeatedly required a human to
relay completed work and trigger the next already accepted development item.

## Objective

One controller completes an accepted Goal or multi-Goal Milestone without
requiring pure continuation prompts between implementation items. Completion
means verified implementation and synchronized Harness state. Runtime
continuation belongs to the host; interruption recovery is durable and does
not introduce a scheduler.

## Scope

- Versioned two-level execution plans beside configured Goal/Milestone files.
- Plan validation and compilation of real Task DAGs into per-Goal Runs.
- Deterministic next actions scoped to the accepted Goal or Milestone.
- Controller review of candidates, freshness checks, and bounded repair.
- Shared completion checks and resumable, lock-protected state sync.
- Manifest v2 for planned Runs; compatibility with manifest v1 and unplanned work.
- Four skills, host guidance, bilingual docs, templates, and capability alignment.
- Deterministic regressions and a separate explicitly opted-in live development evaluator.
- Configurable plugin validator location with truthful missing-tool diagnostics.

## Execution Defaults

- Current controller may implement and owns accepted state.
- Local checkout; default sequential execution and explicit ownership for concurrency.
- Host delegation is permitted for disjoint implementation/documentation work.
- Native runtime Goal is explicitly authorized for this development run.
- New one-entry Goals use enforced checkpoints; existing Runs are not rebound.
- No version change, commit, push, visible chat creation, deployment, release,
  persistent daemon, or background scheduler.

## Required Behavior

1. Plan target and every Goal/Task reference stay in configured roots.
2. Goal and Task graphs reject duplicate IDs, missing dependencies and cycles.
3. Plans map all required acceptance and gate items; labels need no M-number pattern.
4. Goal dependencies gate Run preparation; Task dependencies gate execution.
5. Candidate output does not release dependencies before controller acceptance.
6. Failed verification requests repair within accepted scope; identical failure
   with no progress on three attempts blocks that item while other ready work continues.
7. Executor liveness is observed through the host; unknown state is inspected first.
8. Evidence binds validation logs and verification inputs to current file content.
9. A completed leaf never implies parent Goal/Milestone completion.
10. Completion checks reject pending requirements, placeholders, stale evidence,
    incomplete dependencies and unfinished state sync.
11. Checklist and standard table indexes synchronize without erasing unrelated work.
12. Interrupted multi-file sync is resumed before implementation and never
    overwrites intervening user edits.
13. Planned mutations require checkpoint expected revision; old Run behavior remains readable.
14. Contract drift uses replacement, not mutation of the old manifest.
15. The next action selects inspection/recovery, review/revalidation, closeout,
    ready execution, wait, or a concrete user decision; done means whole target done.

## Public Interfaces

- `plan validate --plan PATH`
- `run prepare --goal PATH --plan PATH`
- `execute next --goal PATH` or `--milestone PATH`
- `run node review --run PATH --node ID --evidence PATH --decision accepted|request-fix|blocked`
- `goal complete --goal PATH --run PATH`
- `milestone complete --milestone PATH --evidence PATH`
- Completed `goal validate` applies full completion checks.
- Target-scoped `orient next` shares next-action computation.
- Mutation previews use `--dry-run`; machine output uses `--json`.

## Verification

```bash
npm run test:all
npm run test:routing-classification
npm run validate:plugin
git diff --check
```

New deterministic tests cover dependencies, map coverage, candidate review,
repair, freshness, completed-state validation, whole-stage closeout, sync
interruption/conflict, liveness, revision drift and legacy compatibility.
The live evaluator must implement a temporary project with real code checks,
record runtime provenance and refuse to claim autonomous execution from static
traces. It remains opt-in and is not silently run by default checks.

## Pause Conditions

- Accepted scope conflicts with repository facts or newer user instructions.
- Product direction, ownership or existing project contracts cannot be resolved.
- Credentials, paid API, production, destructive or external actions outside
  this scope become necessary.
- A required environment-dependent check cannot be honestly completed.

## Completion Conditions

All implementation slices, documentation and deterministic checks pass; the
live evaluator is implemented and validated without claiming an unobserved
model run; Goal, task index, status and Run evidence are synchronized.
