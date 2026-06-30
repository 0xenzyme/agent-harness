# Spec: Source Task Acceptance Coverage Gate

Created: 2026-06-30
Status: accepted

## Background

The open-task batch exposed a harness control bug: multiple source tasks were
merged into one batch, but the batch spec and goal did not preserve each
source task's original acceptance text. The run was completed with aggregate
evidence, while one source task's specific acceptance was not satisfied.

The important fix is not the README content. The fix is to prevent future
batch goals from losing source-task acceptance coverage.

## Goal

Add a deterministic batch acceptance map gate so merged or batch goals must
carry source-task acceptance coverage through goal validation and run
completion.

## Scope

- Define a `Source Task Acceptance Map` section for goals/specs that merge
  multiple source tasks or describe batch completion.
- Update `goal validate` to require and validate that map when batch signals
  are present.
- Update `run prepare` to carry acceptance-map metadata into `status.json` and
  run guidance.
- Update `run record --phase completed` so batch runs cannot complete unless
  every mapped source task is `satisfied` and has concrete evidence.
- Add smoke coverage for missing maps, pending maps, and satisfied maps.
- Document the protocol in templates and project/reference docs.

## Non-Goals

- Do not move README CLI material as part of this bug fix.
- Do not add network services, daemons, background workers, push, PR, deploy,
  publish, or release behavior.
- Do not make project-specific README content policy part of plugin core.
- Do not modify `AGENTS.md`.

## Key Decisions

- Batch detection is conservative and text-based: goals/specs that use words
  such as `batch`, `source tasks`, `multiple source tasks`, or `unfinished
  tasks` must provide an acceptance map.
- The map may live in the goal or the referenced spec. Goal-local maps are
  preferred because they can be updated with execution evidence before
  recording a run.
- `pending` map items are valid before execution. Completed runs require all
  items to be `satisfied`.

## Task Routing

- Level: `execute`
- Reason: user explicitly asked to fix the harness bug after confirming the
  root cause.
- Required docs: `AGENTS.md`, `.harness/config.json`, `harness/README.md`,
  this spec, `docs/project-contract.md`, and plugin references.
- Required gates: goal validation, smoke tests, plugin validation, and final
  state sync.
- Optional competition needed: no.
- Idea Inbox input: none.
- Escalation triggers: changing README product content, adding new persistent
  automation, destructive operations, push, PR, deploy, publish, or release.

## Evidence Plan

- Accepted evidence:
  - CLI validation code
  - smoke tests for missing/pending/satisfied acceptance maps
  - docs/templates describing the map protocol
  - `node --check`
  - `git diff --check`
  - `npm run test:smoke`
  - `npm run validate:plugin`
- Candidate evidence sources:
  - current failed retrospective example from the open-task batch
  - generated run packet metadata
- State records to update:
  - `harness/tasks.md`
  - `harness/status.md`
  - `.harness/runs/`

## Source Task Acceptance Map

- Task: `Fix batch completion acceptance coverage bug`
  - Acceptance: Batch or merged goals preserve each source task's original
    acceptance and cannot record completed state unless every mapped item is
    satisfied with concrete evidence.
  - Evidence: `TBD`
  - Status: `pending`
  - Unblocker: `N/A`

## Adapter References

- Project adapter: `harness/README.md`
- Source of truth: `harness/tasks.md`, `harness/status.md`
- Hard boundaries: keep plugin contracts stable and explicit; validate plugin
  changes with `npm run validate:plugin`.

## Acceptance Criteria

- Batch goals without `Source Task Acceptance Map` fail `goal validate`.
- Batch goals with malformed map items fail `goal validate`.
- Batch goals with `pending` map items pass `goal validate` and `run prepare`
  but fail `run record --phase completed`.
- Batch goals with all map items `satisfied` and concrete evidence can record
  completion.
- Generated run status exposes whether an acceptance map is required and how
  many items it contains.
- Templates and docs tell agents not to mark merged source tasks Done without
  per-task evidence mapping.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run test:smoke
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-source-task-acceptance-coverage-gate.md
```

## Pause Conditions

- This spec conflicts with code, production constraints, repo instructions, or
  newer user instructions.
- Requirements are unclear in a way that affects cost, risk, compatibility, or
  product direction.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, or release are required.
