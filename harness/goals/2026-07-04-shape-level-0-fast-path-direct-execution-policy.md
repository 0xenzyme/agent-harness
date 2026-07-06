# Goal: Shape Level 0 Fast Path Direct Execution Policy

Spec: harness/specs/2026-07-04-level-0-fast-path-direct-execution-policy.md
Status: Completed with validated-local gate-only Controller evidence.

## Source Task

- `harness/tasks.md`: `P2 Shape Level 0 Fast Path direct-execution policy.`

`harness-rule:terminology-boundary`: user-facing hierarchy is
`Roadmap -> Milestone -> Goal -> Task -> Run`. `P0` / `P1` / `P2` / `P3`
are priorities only, `M*` identifies roadmap milestones, and Runs are
execution attempts rather than threads or sessions.

## Source Task Acceptance Map

- Task: `Shape Level 0 Fast Path direct-execution policy.`
  - Acceptance: `Define when a small Goal can be executed directly without full Harness Goal/Run ceremony or sub worker delegation; include risk thresholds, execution role boundaries, verification, and pause conditions.`
  - Evidence: `Added harness-rule:level-0-fast-path across docs/HARNESSES.md, docs/project-contract.md, plugins/agent-harness/references/task-routing.md, plugins/agent-harness/skills/execute/SKILL.md, execution-role guidance, goal/worker templates, generated run/prompt text, scripts/test-suites.mjs, and tests/smoke.mjs. Run .harness/runs/20260704-181600-shape-level-0-fast-path-direct-execution-policy/ records explorer, cli-contract-worker, docs-skill-worker, and verification nodes.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. `harness/specs/2026-07-04-level-0-fast-path-direct-execution-policy.md`
7. `plugins/agent-harness/skills/execute/SKILL.md`
8. `plugins/agent-harness/references/task-routing.md`
9. `plugins/agent-harness/references/worker-runner-contract.md`
10. `plugins/agent-harness/references/controller-communication.md`
11. `plugins/agent-harness/references/gate-results.md`
12. `plugins/agent-harness/skills/execute/references/completion-evidence.md`
13. `plugins/agent-harness/skills/execute/references/adversarial-acceptance.md`
14. `plugins/agent-harness/skills/execute/references/user-facing-closeout.md`
15. `docs/project-contract.md`
16. `docs/HARNESSES.md`
17. `plugins/agent-harness/templates/goal.md`
18. `plugins/agent-harness/templates/worker-prompt.md`
19. `plugins/agent-harness/scripts/agent-harness.mjs`
20. `scripts/test-suites.mjs`
21. `tests/smoke.mjs`

## Work Mode Recommendation

Use `local`.

The user delegated this thread to execute the current recommended Goal in the
current checkout and did not authorize a branch, worktree, commit, push,
review, integration, release, deploy, daemon, watcher, credential, paid API,
production, or destructive action. Existing checkout changes must be preserved.

## Execution Role

Use `gate-only`.

- The current thread is the Controller and acceptance lane.
- The current thread may create/validate control artifacts, dispatch worker
  implementation, inspect candidate output, run verification, request fixes,
  and record accepted state after evidence review.
- The current thread must not directly edit implementation files for this
  policy because the user framed the thread as Controller and this Goal changes
  Controller / worker routing behavior.
- Worker output is candidate evidence until this Controller validates it.

## Conversation Route

Use `current-thread`.

- `current-thread`: this conversation owns Controller decisions, run
  preparation, worker dispatch, verification, acceptance, and state sync in the
  locked cwd.
- `slot-thread`: not used.
- `remote-control-worktree`: not used.

## Execution Context Lock

- Conversation lane: `current-thread-controller-gate-only`
- Parent controller thread: `source-thread 019f2416-b02a-7201-a8db-ba2c4eaf3f3b`
- Controller thread: `current-thread`
- Accepted-state owner: `current-thread`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
- Execution branch: `main`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Delivery State

- Delivery intent: `validated-local-policy`
- Target delivery state: `validated-local`
- Commit authorized: `no`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

This Goal stops at validated local implementation plus Harness evidence.
Commit, push, review, integration, publish, release, deploy, and production
delivery are outside this Goal.

## Execution DAG

Use `run prepare` after this goal validates. Because the goal is `gate-only`,
implementation should be routed to the default bounded worker surface and the
Controller should record worker candidate output before acceptance.

## Route Explanation

- Why this is the right next mode: The split Goal has accepted shape scope, but
  changing direct-execution policy affects default routing behavior and role
  boundaries, so it needs a spec, goal, run evidence, worker implementation,
  verification, and Controller acceptance.
- Confirmation boundary: The work is limited to Level 0 Fast Path policy and
  aligned guidance/tests. EnvContext focus, broader intent routing,
  control-theory research, schema/storage migration, and delivery above
  `validated-local` are excluded.

## Spec Acceptance Checklist

- Item: `Fast Path threshold`
  - Acceptance: Protocol docs define concrete Level 0 criteria for direct
    execution, including local scope, low risk, reversibility, verification,
    and no product/source-of-truth/default-routing impact.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`, `plugins/agent-harness/references/task-routing.md`, and `plugins/agent-harness/skills/execute/SKILL.md` define `harness-rule:level-0-fast-path` as a narrow exception for small, local, reversible, low-risk fixes and exclude product/project semantics, source-of-truth policy, public protocol contracts, schemas, storage, adapter contracts, default routing behavior, external systems, and other high-risk work.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Execution role boundary`
  - Acceptance: Docs state that `gate-only` Controller threads cannot use Level
    0 to edit implementation files; direct execution requires `implementer` or
    explicitly accepted `mixed`.
  - Evidence: `plugins/agent-harness/references/task-routing.md`, `docs/project-contract.md`, `plugins/agent-harness/skills/execute/SKILL.md`, `plugins/agent-harness/skills/execute/references/execution-roles.md`, `plugins/agent-harness/templates/goal.md`, and generated text in `plugins/agent-harness/scripts/agent-harness.mjs` state that direct execution requires `implementer` or explicitly accepted `mixed`, and that `gate-only` cannot use Level 0 to edit implementation files.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Ceremony skip boundary`
  - Acceptance: Docs define when Level 0 can skip spec/goal/run/worker
    ceremony and when existing Harness artifacts, adapter gates, or user
    requests require normal Harness execution.
  - Evidence: `plugins/agent-harness/references/task-routing.md`, `docs/project-contract.md`, `docs/HARNESSES.md`, `plugins/agent-harness/templates/goal.md`, `plugins/agent-harness/templates/worker-prompt.md`, and generated run/prompt guidance in `plugins/agent-harness/scripts/agent-harness.mjs` define that Level 0 may skip ceremony only when no accepted Harness artifact, adapter gate, Controller/gate role, or larger Goal/Milestone obligation applies.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Verification and closeout`
  - Acceptance: Docs require lightweight route explanation, concrete
    verification, Delivery State, `Need user`, and `Remaining` even when Level
    0 skips durable ceremony.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`, `plugins/agent-harness/references/task-routing.md`, `plugins/agent-harness/skills/execute/SKILL.md`, and generated run/prompt guidance in `plugins/agent-harness/scripts/agent-harness.mjs` require route reason, scoped diff summary, concrete verification, Delivery State, `Need user`, and `Remaining` for Level 0 closeout.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Deterministic coverage`
  - Acceptance: Protocol and smoke checks protect the new Fast Path rule and
    generated guidance where implementation touches CLI/template output.
  - Evidence: `scripts/test-suites.mjs` protects `harness-rule:level-0-fast-path` and Level 0 invariants; `tests/smoke.mjs` asserts the capability matrix, task routing reference, execute skill, CLI generator, generated run packet, and generated execution prompt. Verification passed with node syntax checks, `npm run test:protocol`, `npm run test:smoke`, `npm run validate:plugin`, `git diff --check`, `goal validate`, and run status.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `controller-acceptance`
  - Required: `yes`
  - Evidence: `Gate-only Controller reviewed explorer, cli-contract-worker, and docs-skill-worker candidate packets, inspected scoped diffs, recorded all DAG nodes in .harness/runs/20260704-181600-shape-level-0-fast-path-direct-execution-policy/, and passed node --check plugins/agent-harness/scripts/agent-harness.mjs, node --check scripts/test-suites.mjs, node --check tests/smoke.mjs, npm run test:protocol, npm run test:smoke, npm run validate:plugin, git diff --check, goal validate, and run status.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Land the Level 0 Fast Path direct-execution policy in task routing and
  supporting protocol docs.
- Define concrete risk thresholds for direct execution without full
  spec/goal/run ceremony or sub worker delegation.
- Preserve `gate-only` Controller behavior and worker delegation defaults for
  non-Level 0 or Controller-owned execution.
- Define verification, closeout, and state-sync requirements for Level 0.
- Add deterministic checks for the policy where appropriate.
- Update `harness/tasks.md`, `harness/status.md`, this goal, and the prepared
  run packet with concrete evidence after Controller acceptance.

## Non-Goals

- Do not implement EnvContext focus or broader intent-routing model changes.
- Do not research or implement control-theory feedback-loop changes.
- Do not migrate the task-index storage contract or introduce broad schema
  changes.
- Do not weaken gate-only, worker-surface, Delivery State, checklist, or gate
  evidence requirements for non-Level 0 work.
- Do not modify `AGENTS.md`.
- Do not commit, push, open review, integrate, publish, release, deploy, start
  a daemon/watcher, use credentials, use paid APIs, touch production data, or
  perform destructive operations.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
npm run test:protocol
npm run test:smoke
npm run validate:plugin
git diff --check
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /Users/liuyj/project/skills/agent-harness --goal harness/goals/2026-07-04-shape-level-0-fast-path-direct-execution-policy.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /Users/liuyj/project/skills/agent-harness --run <run-dir> --json
```

## Evidence And State Sync

- Candidate evidence: worker output, implementation diff, generated packet
  text, deterministic test output, and run packet status.
- Accepted evidence: Controller-reviewed diff against the spec checklist,
  passing verification, updated checklist/gate evidence, completed DAG node
  records, and completed run record.
- State records to update: `harness/tasks.md`, `harness/status.md`, this goal,
  and `.harness/runs/<run-id>/`.

## Completion Conditions

- Level 0 Fast Path criteria, risk thresholds, direct-execution role boundary,
  ceremony skip boundary, verification, and pause conditions are documented and
  protected by deterministic checks where appropriate.
- Every `Spec Acceptance Checklist` item is `satisfied` with concrete evidence.
- `controller-acceptance` gate evidence is `satisfied`.
- Harness task/status/goal/run evidence is synchronized.
- Delivery State is `validated-local`; no commit, push, review, integration,
  release, publish, deploy, or production action is performed.

## Pause Conditions

- The goal conflicts with the spec, adapter, repository instructions,
  production constraints, or newer user instructions.
- Requirements become unclear in a way that affects compatibility, public
  protocol semantics, product direction, default routing behavior, or state
  storage migration.
- The work expands into EnvContext focus, broader intent routing,
  control-theory research, downstream-specific assumptions, or delivery above
  `validated-local`.
- Credentials, paid APIs, production access, destructive operations, commit,
  push, review, integration, deploy, publish, release, daemons, watchers,
  network services, background sessions, or automations become necessary.
