# Goal: Source Task Acceptance Coverage Gate

Spec: harness/specs/2026-06-30-source-task-acceptance-coverage-gate.md
Status: Ready for execution from confirmed spec.

## Source Task

- `harness/tasks.md`: direct user request to fix the harness bug that allowed
  batch completion without preserving every source task acceptance.

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. `harness/specs/2026-06-30-source-task-acceptance-coverage-gate.md`
7. `docs/project-contract.md`
8. `plugins/agent-harness/references/gate-results.md`
9. `plugins/agent-harness/references/controller-communication.md`

## Work Mode Recommendation

Use `local` because this is a foreground harness contract/test fix in the
current checkout.

## Execution Role

Use `implementer`.

- The current thread may edit files inside the accepted scope.
- Final acceptance must cite deterministic verification and state sync.

## Source Task Acceptance Map

- Task: `Fix batch completion acceptance coverage bug`
  - Acceptance: Batch or merged goals preserve each source task's original
    acceptance and cannot record completed state unless every mapped item is
    satisfied with concrete evidence.
  - Evidence: CLI now requires `Source Task Acceptance Map` for batch goals,
    blocks completed batch run records until every mapped item is `satisfied`
    with concrete evidence, and smoke tests cover missing, pending, and
    satisfied maps.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Implement the accepted spec for source task acceptance coverage.
- Keep changes scoped to CLI validation, tests, docs/templates/references, and
  harness state evidence.
- Do not fix the README CLI relocation issue here.

## Non-Goals

- Do not push, deploy, publish, release, open a PR, start a daemon, or launch
  background sessions.
- Do not modify `AGENTS.md`.
- Do not add product-specific README policy to plugin core.

## Context

- The previous open-task batch closed a source task without satisfying its
  original README CLI relocation acceptance. This goal fixes the control-layer
  gate that allowed that to happen.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
git diff --check
npm run test:smoke
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-source-task-acceptance-coverage-gate.md
```

## Completion Conditions

- Batch goals without an acceptance map fail validation.
- Completed batch run records require every mapped item to be `satisfied` with
  concrete evidence.
- Tests and docs cover the bug.
- `harness/tasks.md`, `harness/status.md`, and run evidence are updated.

## Pause Conditions

- The referenced spec conflicts with code, production constraints, repo
  instructions, or newer user instructions.
- The work requires credentials, paid APIs, production access, destructive
  commands, push, PR, deploy, publish, or release.
- Product direction or README content policy becomes the main question instead
  of the harness gate bug.
