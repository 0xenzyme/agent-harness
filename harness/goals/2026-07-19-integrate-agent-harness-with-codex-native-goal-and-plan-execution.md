# Goal: Integrate Agent Harness With Codex-Native Goal And Plan Execution.

Spec: harness/specs/2026-07-19-integrate-agent-harness-with-codex-native-execution.md
Status: Completed at `pushed`; local plugin cache refreshed.

## Source Task

- `harness/tasks.md`: `P0 Integrate Agent Harness with Codex-native Goal and Plan execution.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `harness/specs/2026-07-19-integrate-agent-harness-with-codex-native-execution.md`

## Work Mode Recommendation

Use `local` until the goal has a confirmed spec and clear file ownership.

## Execution Role

Use `implementer`.

- `gate-only`: the current thread reviews candidate output and verification evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.
- Ordinary clear change/build requests use Codex directly. This durable Goal uses only `gate-only` or `implementer` roles.
- `harness-rule:durable-tier-boundary`: ordinary clear change/build uses Codex directly; Harness ceremony is reserved for recovery, audit, persistent state sync, milestones, DAGs, multiple workers, or high-risk control. Once this durable Goal exists, do not downgrade its checklist, gate, or state-sync obligations to the bounded tier.

## Conversation Route

Use `current-thread`.

- `current-thread`: the current conversation owns execution in the locked cwd.
- `slot-thread`: hand off to a dedicated slot conversation before editing.
- `remote-control-worktree`: the current conversation may control a different locked worktree only when explicitly approved.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Execution cwd: `D:\project\skills\agent-harness`
- Execution branch: `main`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Delivery State

- Delivery intent: `push-and-local-plugin-refresh`
- Target delivery state: `pushed`
- Commit authorized: `yes`
- Push authorized: `yes`
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

Use `run prepare` to generate `dag.json`, `dag.md`, and per-node
`agents/<node>/prompt.md` files. The Codex runtime owns worker selection,
delegation, concurrency, and cancellation; Harness records ownership and evidence.

## Context Focus Routing

`harness-rule:project-neutral-core`: Normalize the durable target to `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec`; adapters own downstream paths and facts while plugin core remains project-neutral. `harness-rule:path-containment`: configured writes, Goal/Spec references, Run arguments, and DAG artifacts stay inside configured roots after lexical and existing-parent realpath checks.

## Cybernetic Stability

`harness-rule:state-sync-evidence`: durable completion includes verified State Sync Notes and synchronization of the configured Goal, Task, Run, gate, and bounded status records.

## Codex-Native Execution

- Runtime Goal: established for the accepted long-running controller outcome.
- Codex Plan: used for transient implementation and verification progress.
- Repository Goal/Run: retained for durable acceptance, audit, Delivery State,
  gate evidence, and bounded state sync; transient Plan transitions were not
  mirrored into Git.
- Controller role: outcome and accepted-state owner with foreground
  implementation allowed because no explicit `gate-only` instruction applied.


## Spec Acceptance Checklist

- Item: `Three execution paths and native bridge`
  - Acceptance: Public protocol defines `codex-direct`,
    `codex-direct-postflight`, and `durable-harness`, including runtime
    Goal/Plan ownership and fallback.
  - Evidence: Canonical native-execution reference, public skills, generated
    artifacts, eval routing cases, and behavior traces implement the contract.
  - Status: `satisfied`
- Item: `Controller semantics`
  - Acceptance: Controller wording alone does not imply `gate-only`; only
    explicit review-only direction forbids foreground implementation.
  - Evidence: Execute skill, controller reference, generated Goal/Run prompts,
    trigger cases, and behavior traces agree on the boundary.
  - Status: `satisfied`
- Item: `Durable-only lifecycle and gates`
  - Acceptance: Direct and postflight work create no durable lifecycle
    artifacts or durable gate obligations, while enforced Runs retain them.
  - Evidence: CLI gate resolution, schema descriptions, completion-evidence
    reference, protocol tests, and behavior traces cover both sides.
  - Status: `satisfied`
- Item: `Minimal durable DAG`
  - Acceptance: Future medium/large Runs use `execution -> verification` and
    leave runtime scheduling and delegation to Codex.
  - Evidence: Run generation source and smoke assertions verify the two-node
    DAG; this already-prepared compatibility Run retains its original DAG.
  - Status: `satisfied`
- Item: `Version and public surface alignment`
  - Acceptance: Version metadata, release notes, public docs, tests, and plugin
    metadata agree on `0.8.0`.
  - Evidence: Presentation checks, plugin validation, release documentation,
    and version consistency tests pass.
  - Status: `satisfied`

## Required Gate Evidence

- Gate: `spec`
  - Required: `yes`
  - Evidence: `Accepted spec maps all three execution paths, controller semantics, native capability ownership, durable gate scope, compatibility, versioning, and delivery boundaries to explicit acceptance criteria.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `execution`
  - Required: `yes`
  - Evidence: `Skills, canonical references, CLI generation and enforcement, templates, schema descriptions, eval fixtures/runner, tests, and versioned documentation implement the accepted contract.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `integration`
  - Required: `yes`
  - Evidence: `test:all, deterministic eval, plugin validation, four skill validators, Chinese-locale smoke/eval, syntax checks, and git diff --check pass together in the repository.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Ordinary tasks stay Codex-native; tracked simple work uses bounded postflight
  state sync; durable work retains Goal/Run evidence and completion gates.
- Long-running controller work bridges to runtime Goal and Plan without
  duplicating transient runtime state in repository artifacts.
- Version and public documentation are synchronized at `0.8.0`.

## Non-Goals

- Do not release, deploy, publish, or launch workers outside the run packet DAG unless separately requested.
- Do not execute delivery steps above the Delivery State policy.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: current user decision
- Notes: target version is `0.8.0`; preserve the pre-existing uncommitted
  deploy-helper sentinel correction. The user subsequently authorized commit,
  push, and local plugin-cache refresh; tag, publish, release, review,
  integration, and production deployment remain unauthorized.

## Project Adapter Requirements

- Read `harness/README.md` for project-specific hard boundaries, validation rules, preflight requirements, and state-sync requirements.
- If a linked Doc is a goal prompt, read the spec and context documents referenced by that goal before editing.
- Agent Harness plugin references: adapter-harness, task-routing, and work-mode-policy.
- Preflight: Read AGENTS.md before editing repository files.
- Preflight: Validate plugin changes with npm run validate:plugin.
- State sync: Update harness/tasks.md after meaningful task state changes.
- State sync: Update harness/status.md after execution or verification.


## Verification

Passed:

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

The four plugin skills also passed the current Codex `quick_validate.py`.
Smoke and routing classification passed with `LANG` and `LC_ALL` set to
`zh_CN.UTF-8`.

Deterministic eval evidence: 40 trigger cases, 4 task cases, 8 hard CLI
checks, and 10 behavior traces passed.

## State Sync Notes

- The source Task is recorded Done with the Spec, Goal, Run, verification, and
  Delivery State.
- `harness/status.md` is replaced with the bounded `0.8.0` accepted result.
- The Run records all DAG nodes and originally closed at `validated-local`.
- Fresh user authorization promoted delivery to `pushed`: implementation commit
  `67b94cc` is on `origin/main`.
- Local `harness@agent-harness-local` `0.8.0` cache was refreshed and verified
  against source: 44/44 files with zero SHA-256 differences.
- No review, integration, release, publish, tag, or production deployment was
  performed.

## Completion Conditions

- The source Goal/work item acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- State-sync evidence or State Sync Notes are produced as part of Goal/Task Done.
- Status-file updates use a bounded current-state snapshot; replace status
  sections instead of appending historical focus logs.
- Update configured state records (`harness/tasks.md`, `harness/status.md`) when the project adapter requires state sync.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The measurement snapshot cannot identify a reliable observed state, feedback quality is insufficient for completion, or the remaining gap is not shrinking.
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
