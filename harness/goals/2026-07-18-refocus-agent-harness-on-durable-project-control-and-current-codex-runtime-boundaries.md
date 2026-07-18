# Goal: Refocus Agent Harness On Durable Project Control And Current Codex Runtime Boundaries.

Spec: harness/specs/2026-07-18-refocus-agent-harness-on-durable-project-control.md
Status: Completed at `validated-local`.

## Source Task

- `harness/tasks.md`: `Refocus Agent Harness on durable project control and current Codex runtime boundaries.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `harness/specs/2026-07-18-refocus-agent-harness-on-durable-project-control.md`

## Work Mode Recommendation

Use `local`. The user accepted the reviewed full scope and delegated this
visible thread as the child controller and sole accepted-state owner.

## Execution Role

Use `gate-only`; implementation is delegated and returned as candidate
evidence. This child controller owns verification, acceptance, and durable
state sync for this Goal.

- `gate-only`: the current thread reviews candidate output and verification evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.

## Conversation Route

Use `current-thread`.

- `current-thread`: the current conversation owns execution in the locked cwd.
- `slot-thread`: hand off to a dedicated slot conversation before editing.
- `remote-control-worktree`: the current conversation may control a different locked worktree only when explicitly approved.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Accepted-state owner: child controller
- Execution cwd: `D:\project\skills\agent-harness`
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

Generated Goals are local-only by default. Commit, push, review, integration,
release, and ship targets require fresh explicit authorization in the current
conversation or accepted source spec; never infer them from stale status text.

The locked Execution branch records where implementation happens. It is not
automatically the integration target, and Harness core does not assume a branch
named `main`.

## Execution DAG

The Run records dependencies, ready nodes, scope ownership, verification, and
candidate evidence. Codex runtime chooses delegation, concurrency,
cancellation, model, and execution surface.

## Durable Control Invariants

Apply the nine canonical invariants in `docs/HARNESSES.md`: path containment,
Run/DAG ownership, candidate-versus-accepted evidence, local delivery ceiling,
Run-scoped delivery, state-sync evidence, bounded status, project-neutral core,
and the durable-tier boundary.


## Spec Acceptance Checklist

- Item: Complete accepted implementation scope
  - Acceptance: all acceptance criteria in the referenced spec are satisfied.
  - Evidence: corrected worker candidate plus controller syntax, security,
    locale, routing, plugin, skill, config, delivery, and diff verification.
  - Status: satisfied
  - Unblocker: N/A
- Item: Preserve core durable control value
  - Acceptance: adapter paths, repository Goal/Run/DAG evidence, delivery
    layering, and candidate/accepted-state boundaries remain inspectable.
  - Evidence: controller confirmed adapter paths, durable Goal/Run/DAG,
    candidate acceptance, required gates, and layered Delivery State remain
    implemented and covered by deterministic tests.
  - Status: satisfied
  - Unblocker: N/A

## Required Gate Evidence

- Gate: spec
  - Required: yes
  - Evidence: accepted user direction and referenced accepted spec.
  - Status: satisfied
  - Unblocker: N/A
- Gate: execution
  - Required: yes
  - Evidence: explorer, worker, and verification nodes completed sequentially
    in `.harness/runs/20260718-083037-refocus-agent-harness-on-durable-project-control-and-current-codex-runtime-boundaries/`.
  - Status: satisfied
  - Unblocker: N/A
- Gate: integration
  - Required: yes
  - Evidence: controller independently reran all required validation, reviewed
    residual protocol and correctness gaps, and accepted the corrected local
    result; forbidden delivery and plugin-cache operations were not run.
  - Status: satisfied
  - Unblocker: N/A

## Scope

- Implement the complete accepted scope in
  `harness/specs/2026-07-18-refocus-agent-harness-on-durable-project-control.md`.
- Preserve deterministic adapter paths, durable Goal/Run/DAG evidence,
  candidate/accepted-state separation, and controller gates while simplifying
  default execution behavior.

## Non-Goals

- Do not release, deploy, publish, or launch workers outside the run packet DAG unless separately requested.
- Do not execute delivery steps above the Delivery State policy.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: harness/tasks.md


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
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
node --check evals/run-agent-harness-eval.mjs
npm run test:all
npm run test:eval
npm run validate:plugin
git diff --check
```

Also run `quick_validate.py` for each of the four plugin skills and the added
security and locale regression cases through the deterministic suites.

## Completion Conditions

- The source Goal/work item acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- State-sync evidence or State Sync Notes are produced as part of Goal/Task Done.
- Status-file updates use a bounded current-state snapshot; replace status
  sections instead of appending historical focus logs.
- Update configured state records (`harness/tasks.md`, `harness/status.md`) when the project adapter requires state sync.

## Acceptance Evidence

- Added write-before-containment and regression coverage for configured paths,
  Run arguments, Goal/Spec references, DAG artifacts, and symlink escapes.
- Follow-up gate correction also constrains `run record` status Goal references
  to configured `paths.goals` and non-empty Goal Spec references to configured
  `paths.specs`; project-internal paths outside those roots fail before Run
  status or log writes.
- Delivery State now compares Run start HEAD/branch/upstream/dirty snapshot to
  current state and explicit evidence; clean historical upstream state and
  cross-branch commits cannot promote the Run.
- Reduced public execution ceremony, roles, routes, rules, worker/model policy,
  config surface, references, docs, and tests while preserving durable project
  control and adapter contracts.
- `npm run test:all`, `npm run test:eval`, `npm run validate:plugin`, four
  skill validators, zh-CN regressions, syntax checks, and `git diff --check`
  passed under controller verification.
- Delivery remained `validated-local`; no commit, push, review, integration,
  release, deploy, or plugin-cache refresh was performed.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The measurement snapshot cannot identify a reliable observed state, feedback quality is insufficient for completion, or the remaining gap is not shrinking.
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
