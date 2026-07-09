# Goal: Upgrade Agent Harness To 0.6.0 And Update Release Docs.

Spec: N/A
Spec Policy: allow-no-spec
Status: Completed; delivery state `validated-local`.

## Source Task

- `harness/tasks.md`: `Upgrade Agent Harness to 0.6.0 and update release docs.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`

## Work Mode Recommendation

Use `local` until the goal has accepted scope and clear file ownership.

## Execution Role

Use `implementer`.

- `gate-only`: the current thread reviews candidate output and verification evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.
- `mixed`: the current thread may both edit and gate only after recording why the tradeoff is acceptable.
- `harness-rule:level-0-fast-path`: Level 0 Fast Path direct execution is only for tiny low-risk local reversible work. It can skip spec/goal/run/worker ceremony only when no existing Harness Goal/Run or adapter-required gate requires state sync. Level 0 direct execution requires `implementer` or explicitly accepted `mixed`; `gate-only` cannot use Level 0 to edit implementation files. Verification, Delivery State, `Need user`, and `Remaining` still apply.

## Conversation Route

Use `current-thread`.

- `current-thread`: the current conversation owns execution in the locked cwd.
- `slot-thread`: hand off to a dedicated slot conversation before editing.
- `remote-control-worktree`: the current conversation may control a different locked worktree only when explicitly approved.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
- Execution branch: `main`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Delivery State

- Delivery intent: `local-validation`
- Target delivery state: `validated-local`
- Commit authorized: `no`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

`harness-rule:local-delivery-ceiling`: `validated-local` is local verification
evidence only; it is not commit, push, review, integration, release, or ship
evidence.

## Execution DAG

Use `run prepare` to generate `dag.json`, `dag.md`, and per-node
`agents/<node>/prompt.md` files. Prefer Codex CLI subagents for worker nodes.
Create a new Codex thread only when the controller explicitly needs a visible,
long-lived handoff lane. Fork is not the default worker surface; use it only
when the controller explicitly approves inherited context.

## Context Focus Routing

`harness-rule:context-focus-routing`: Normalize user intent to `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec` before choosing context focus. Use the smallest useful workflow focus preset (`orient`, `intake`, `shape`, `goal`, and `execute`) and prefer current confirmed state, accepted specs/goals/runs, adapter/config/status, then broad docs or historical logs. For execution, use the `execute` focus preset: goal/spec/run packet, execution DAG, allowed and forbidden scope, implementation-relevant files, verification commands, delivery target, and state-sync requirements.

## Cybernetic Stability

`harness-rule:cybernetic-stability`: control toward an explicit target using `harness-rule:intent-setpoint-selection`, `harness-rule:sensor-freshness`, `harness-rule:measurement-snapshot`, `harness-rule:remaining-gap`, `harness-rule:feedback-quality`, and `harness-rule:stability-saturation`. Before closeout, state the selected target, observed state, evidence, stale/conflict risks, Delivery State, user-decision state, gap closed, remaining gap, feedback quality, and whether the stable next action is continue, pause, ask, or close.


## Spec Acceptance Checklist

Add checklist items here when the referenced spec has concrete acceptance
criteria, required page/workflow coverage, or product-quality gates. Candidate
implementation evidence is not accepted completion until relevant checklist
items are satisfied.

## Required Gate Evidence

Add one `Gate` item for each adapter-required completion gate. Technical
verification is necessary but does not replace gate evidence.

## Scope

- Bump `package.json` and
  `plugins/agent-harness/.codex-plugin/plugin.json` to `0.6.0`.
- Update README / README.zh-CN current-version entry points to the `0.6.0`
  release notes.
- Add `docs/releases/v0.6.0.md` and update `CHANGELOG.md`.
- Update GitHub presentation docs, social preview text, versioning examples,
  and deterministic presentation/smoke checks so the current public docs point
  at `0.6.0`.
- Preserve historical `0.5.0` cybernetic-stability docs and release notes as
  prior-version history.

## Non-Goals

- Do not create a Git tag, GitHub Release, commit, push, publish, deploy,
  daemon, watcher, network service, credentialed action, paid API call, or
  destructive operation.
- Do not rewrite historical `0.5.0` release notes or the
  `docs/cybernetic-stability.md` model as if they were newly introduced in
  `0.6.0`.
- Do not change runtime behavior beyond deterministic checks needed to keep
  version and docs metadata aligned.

## Context

- Source: Current conversation on 2026-07-09; user approved upgrading the
  Agent Harness version line to `0.6` after the state-sync completion and
  bounded-status snapshot changes were implemented locally.


## Project Adapter Requirements

- Read `harness/README.md` for project-specific hard boundaries, validation rules, preflight requirements, and state-sync requirements.
- If a linked Doc is a goal prompt, read the spec and context documents referenced by that goal before editing.
- Agent Harness plugin references: adapter-harness, task-routing, and work-mode-policy.
- Preflight: Read AGENTS.md before editing repository files.
- Preflight: Validate plugin changes with npm run validate:plugin.
- State sync: Update harness/tasks.md after meaningful task state changes.
- State sync: Update harness/status.md after execution or verification.


## Verification

```bash
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
node --check plugins/agent-harness/scripts/agent-harness.mjs
npm run test:presentation
npm run test:protocol
npm run test:smoke
npm run validate:plugin
git diff --check
```

## Evidence And State Sync

- Candidate evidence: implementation diff, version metadata, current-version
  README links, changelog, `v0.6.0` release notes, presentation docs, social
  preview source, and deterministic test output.
- Accepted evidence: package and plugin manifest versions match; user-facing
  current docs point at `0.6.0`; historical `0.5.0` docs remain available;
  deterministic checks passed.
- State Sync Notes: update `harness/tasks.md`, bounded `harness/status.md`,
  this goal, and the prepared run packet to completed `validated-local`.
- State records to update: `harness/tasks.md`, `harness/status.md`, this goal,
  and `.harness/runs/20260709-192744-upgrade-agent-harness-to-060-and-update-release-docs/`.

## Completion Conditions

- The source task acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- Package and plugin manifest versions match at `0.6.0`.
- User-facing current-version docs point to `docs/releases/v0.6.0.md`.
- Historical `0.5.0` docs remain available as prior release history.
- State-sync evidence or State Sync Notes are produced as part of task Done.
- Status-file updates use a bounded current-state snapshot; replace status
  sections instead of appending historical focus logs.
- Update configured state records (`harness/tasks.md`, `harness/status.md`) when the project adapter requires state sync.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The measurement snapshot cannot identify a reliable observed state, feedback quality is insufficient for completion, or the remaining gap is not shrinking.
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
