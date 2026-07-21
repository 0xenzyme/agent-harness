# Goal: Simplify Completion And Remove Git-Derived Delivery State.

Spec: `harness/specs/2026-07-21-simplify-completion-and-remove-git-derived-delivery-state.md`
Status: completed.

## Source Task

- `harness/tasks.md`: `P0 Simplify completion and remove Git-derived Delivery State.`

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/specs/2026-07-21-simplify-completion-and-remove-git-derived-delivery-state.md`
5. `harness/status.md`

## Work Mode Recommendation

Use `local` in the current checkout and branch, as explicitly accepted for the
current controller task.

## Execution Role

Use `implementer`. The current thread is controller, outcome owner, and
accepted-state owner; it may edit inside accepted scope.

## Codex-Native Execution

- Runtime Goal: established for this long-running controller outcome.
- Codex Plan: owns transient implementation and verification progress.
- Repository Goal/Run: owns durable recovery, evidence, gates, and state sync.
- Runtime execution remains in the current thread; no worker delegation is
  required by the accepted scope.

## Conversation Route

Use `current-thread`.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Accepted-state owner: `current-thread`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
- Execution branch: `main`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Durable Control Invariants

- `harness-rule:path-containment`
- `harness-rule:run-dag-ownership`
- `harness-rule:candidate-accepted-evidence`
- `harness-rule:state-sync-evidence`
- `harness-rule:bounded-status-snapshot`
- `harness-rule:project-neutral-core`
- `harness-rule:durable-tier-boundary`

## Spec Acceptance Checklist

- Item: `Authoritative completion model`
  - Acceptance: Task/Goal uses active, completed, or blocked; blocked is
    resumable and non-complete; Run is evidence; status is a projection.
  - Evidence: Core protocol, Goal/Run generation, Run record/status, templates,
    skills, and docs make Task/Goal authoritative; Run is evidence and status
    is a bounded projection.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Git-derived lifecycle removal`
  - Acceptance: Canonical lifecycle generation, validation, completion, and
    output contain no implicit Git-derived state or gates.
  - Evidence: Core CLI removed implicit checkout inspection, Git start
    snapshots, delivery parsing/gates/output, and checkout-derived maintenance;
    work-mode recommendation now follows configured policy.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Legacy read compatibility`
  - Acceptance: Existing Delivery State and Run-start fields remain readable
    for one release but are ignored by current behavior.
  - Evidence: Smoke fixtures load legacy Goal/Run delivery fields without
    exposing them in current validation/status output, and Run record removes
    ignored fields when updating a legacy Run.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Protocol alignment`
  - Acceptance: Code, schema, templates, skills, docs, tests, version metadata,
    and dogfood state describe the same positive completion contract.
  - Evidence: Core code, config schema descriptions, canonical templates,
    skills/references, bilingual docs, behavior traces, smoke/protocol suites,
    release notes, social preview, and version metadata agree at `0.10.0`.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `spec`
  - Required: `yes`
  - Evidence: Accepted Spec above records the completed user discussion.
  - Status: `satisfied`
- Gate: `execution`
  - Required: `yes`
  - Evidence: Core lifecycle, compatibility boundary, artifact evidence-root
    scanning, protocol surfaces, tests, and dogfood state were implemented in
    the current controller lane; DAG node `main-agent` records the result.
  - Status: `satisfied`
- Gate: `integration`
  - Required: `yes`
  - Evidence: JavaScript syntax, `npm run test:protocol`, `npm run test:smoke`,
    `npm run test:all`, `npm run test:eval`, and
    `npm run validate:plugin` all passed together.
  - Status: `satisfied`

## Scope

- Implement the accepted Spec across core behavior and all current public
  protocol surfaces.
- Preserve legacy read compatibility without emitting or gating on old fields.
- Record fresh verification and bounded state synchronization.

## Non-Goals

- Do not rewrite historical artifacts or add anti-Git configuration language.
- Do not perform external side effects, access production, or use credentials.
- Do not perform destructive Run pruning or unrelated repository changes.

## Verification

Passed:

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check tests/smoke.mjs
node --check scripts/test-suites.mjs
npm run test:all
npm run test:eval
npm run validate:plugin
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd . --json
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-07-21-simplify-completion-and-remove-git-derived-delivery-state.md --json
```

## State Sync Notes

- `harness/tasks.md` moves the accepted source Task from active to completed.
- This Goal records satisfied acceptance items, required gates, verification,
  and completed authoritative phase.
- Run `.harness/runs/20260721-110505-simplify-completion-and-remove-git-derived-delivery-state`
  records controller execution, DAG evidence, verification, and acceptance.
- `harness/status.md` is replaced with the bounded `0.10.0` accepted-result
  projection; it does not define completion.
- Current generation and status output use no legacy delivery fields. Existing
  historical artifacts remain unchanged; the active bootstrap Run is migrated
  when its completion record is written.

## Completion Conditions

- Every Spec checklist item and required gate is satisfied with fresh evidence.
- Task/Goal authoritative state, Run evidence, and status projection agree.
- Package/plugin version `0.10.0` and all validation surfaces agree.

## Pause Conditions

- Accepted scope conflicts with repository facts or newer instructions.
- Historical compatibility would require destructive rewriting.
- Credentials, production, destructive operations, publishing, or external
  product direction is required.
- Evidence cannot validate the accepted objective.
