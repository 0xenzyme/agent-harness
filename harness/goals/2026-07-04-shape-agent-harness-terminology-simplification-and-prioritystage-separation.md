# Goal: Agent Harness Terminology Simplification And Priority/Milestone Separation

Spec: harness/specs/2026-07-04-agent-harness-terminology-simplification.md
Status: Completed with validated-local mixed Controller evidence.

## Source Task

- `harness/tasks.md`: `P2 Shape Agent Harness terminology simplification and priority/stage separation.`

## Source Task Acceptance Map

- Task: `Shape Agent Harness terminology simplification and priority/stage separation.`
  - Acceptance: `Hold a dedicated terminology discussion before drafting the spec; then define scope, non-goals, validation, pause conditions, and whether task-index priority should be separated from task titles.`
  - Evidence: `User supplied confirmed terminology decisions on 2026-07-04; accepted spec harness/specs/2026-07-04-agent-harness-terminology-simplification.md records scope, non-goals, validation, pause conditions, and priority/milestone separation.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. `harness/specs/2026-07-04-agent-harness-terminology-simplification.md`
7. `README.md`
8. `README.zh-CN.md`
9. `docs/project-contract.md`
10. `plugins/agent-harness/skills/execute/SKILL.md`
11. `plugins/agent-harness/skills/execute/references/completion-evidence.md`
12. `plugins/agent-harness/skills/execute/references/adversarial-acceptance.md`
13. `plugins/agent-harness/references/task-routing.md`
14. `plugins/agent-harness/references/gate-results.md`
15. `plugins/agent-harness/references/controller-communication.md`
16. `plugins/agent-harness/templates/goal.md`
17. `plugins/agent-harness/templates/spec.md`
18. `plugins/agent-harness/scripts/agent-harness.mjs`
19. `scripts/test-suites.mjs`
20. `tests/smoke.mjs`

## Work Mode Recommendation

Use `local`.

The user asked to use the current checkout and did not authorize a branch,
worktree, commit, push, review, integration, release, deploy, daemon, or
production action. The current checkout already has unrelated local edits, so
this goal must preserve them and only add scoped terminology changes.

## Execution Role

Use `mixed`.

- The current thread is the Controller and owns final acceptance for this
  goal.
- The user explicitly allowed direct editing when the reason, scope,
  verification, completion conditions, and pause conditions are recorded.
- Direct editing is acceptable here because the scoped surfaces are local docs,
  templates, CLI text/compatibility parsing, deterministic tests, and Harness
  state records in the current checkout.
- No production, credential, paid API, destructive operation, daemon, watcher,
  commit, push, review, integration, release, or deployment step is authorized.

## Conversation Route

Use `current-thread`.

- The current conversation owns Controller decisions, implementation edits,
  verification, acceptance, and state sync in the locked cwd.
- No slot thread, remote-control worktree, forked inherited context, or visible
  child controller is used for this local terminology pass.

## Execution Context Lock

- Conversation lane: `current-thread-controller-mixed`
- Parent controller thread: `source-thread 019f2416-b02a-7201-a8db-ba2c4eaf3f3b`
- Controller thread: `current-thread`
- Accepted-state owner: `current-thread`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
- Execution branch: `main`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Delivery State

- Delivery intent: `validated-local-terminology-protocol`
- Target delivery state: `validated-local`
- Commit authorized: `no`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

This goal stops at validated local implementation plus Harness evidence.
Commit, push, review, integration, publish, release, deploy, and production
delivery are outside this goal.

## Execution DAG

Use `run prepare` after this goal validates. Because the goal is `mixed` and
foreground-local, the run may use a current-thread implementation node instead
of dispatching a worker. All DAG nodes must still be recorded before the run is
completed.

## Spec Acceptance Checklist

- Item: `Terminology hierarchy`
  - Acceptance: New user-facing docs and templates present `Roadmap -> Milestone -> Goal -> Task -> Run`, with `Goal` as the main Harness work unit and `Task` as Goal-internal breakdown.
  - Evidence: `README.md`, `README.zh-CN.md`, `docs/project-contract.md`, `docs/cli.md`, `docs/cli.zh-CN.md`, `docs/install.zh-CN.md`, `plugins/agent-harness/references/task-routing.md`, and `plugins/agent-harness/templates/goal.md` now define the hierarchy and Goal/Task boundary.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Milestone replaces Stage`
  - Acceptance: New docs, templates, CLI output, and tests use `Milestone` instead of `Stage` for formal roadmap phase completion; legacy `Stage` remains only as a migration/compatibility note.
  - Evidence: `plugins/agent-harness/scripts/agent-harness.mjs` now generates and reports `Milestone Completion Map`, keeps `Stage Completion Map` as a legacy alias, and `tests/smoke.mjs` verifies both the new milestone path and legacy compatibility. Docs/templates use `Milestone` with only migration notes for `Stage`.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Priority separation`
  - Acceptance: Documentation and tests state that `P0` / `P1` / `P2` / `P3` are priorities only, not task, stage, or milestone names.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`, `docs/cli.md`, `docs/cli.zh-CN.md`, `plugins/agent-harness/references/task-routing.md`, `plugins/agent-harness/templates/task-index.md`, `scripts/test-suites.mjs`, and `tests/smoke.mjs` protect priority-only wording.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Intent normalization`
  - Acceptance: Routing references document how common English and Chinese phrases map to `Goal`, `Tasks`, `Milestone`, `Run`, `Priority`, and `Spec`.
  - Evidence: `docs/project-contract.md` and `plugins/agent-harness/references/task-routing.md` document intent normalization, including Chinese phrases such as `用 harness 做这个任务`; `tests/smoke.mjs` asserts the routing reference includes that rule.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Run/thread boundary`
  - Acceptance: User-facing docs preserve that a `Run` is an execution attempt and evidence record, not a thread or session identity.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`, `docs/cli.md`, `docs/cli.zh-CN.md`, `docs/install.md`, `docs/install.zh-CN.md`, and `plugins/agent-harness/references/task-routing.md` state that Runs are evidence attempts rather than threads/sessions; `tests/smoke.mjs` guards the contract wording.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `controller-acceptance`
  - Required: `yes`
  - Evidence: `Current mixed Controller reviewed the scoped diff, preserved pre-existing child-controller-boundary dirty changes, and verified with node --check for agent-harness.mjs/test-suites.mjs/smoke.mjs, npm run test:protocol, npm run test:smoke, npm run validate:plugin, and git diff --check.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Land the confirmed terminology hierarchy and intent-normalization rules in
  README surfaces, project contract docs, relevant references, templates, CLI
  output, and deterministic checks.
- Rename new user-facing `Stage Completion Map` protocol language to
  `Milestone Completion Map`.
- Preserve compatibility for existing `Stage Completion Map` artifacts as a
  legacy alias with a migration note.
- Clarify that `P0` / `P1` / `P2` / `P3` are priorities only and that `M*`
  identifiers belong to roadmap milestones.
- Clarify that a `Run` is an execution attempt and evidence record, not a
  thread/session identity.
- Update `harness/tasks.md`, `harness/status.md`, this goal, and the prepared
  run packet with concrete evidence.

## Non-Goals

- Do not redesign the whole task index schema or remove priority sorting.
- Do not rewrite historical completed tasks, historical goals, or historical
  run logs solely to remove legacy terminology.
- Do not modify `AGENTS.md`.
- Do not remove legacy `Stage Completion Map` compatibility.
- Do not bind Runs to Codex threads, sessions, or one worker surface.
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
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /Users/liuyj/project/skills/agent-harness --goal harness/goals/2026-07-04-shape-agent-harness-terminology-simplification-and-prioritystage-separation.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /Users/liuyj/project/skills/agent-harness --run <run-dir> --json
```

## Evidence And State Sync

- Candidate evidence: implementation diff, compatibility checks, CLI output
  changes, and deterministic test output.
- Accepted evidence: Controller-reviewed diff against the spec checklist,
  passing verification, updated checklist/gate evidence, completed DAG node
  records, and completed run record.
- State records to update: `harness/tasks.md`, `harness/status.md`, this goal,
  and `.harness/runs/<run-id>/`.

## Completion Conditions

- The confirmed terminology decisions are reflected in scoped docs,
  references, templates, CLI output, and deterministic checks.
- Legacy `Stage Completion Map` artifacts remain readable, while new generated
  artifacts and CLI output use `Milestone Completion Map`.
- Every `Spec Acceptance Checklist` item is `satisfied` with concrete evidence.
- `controller-acceptance` gate evidence is `satisfied`.
- Required verification commands pass, or the run records the exact blocker.
- Harness task/status/goal/run evidence is synchronized.
- Delivery State is `validated-local`; no commit, push, review, integration,
  release, publish, deploy, or production action is performed.

## Pause Conditions

- The goal conflicts with the spec, adapter, repository instructions,
  production constraints, or newer user instructions.
- Requirements become unclear in a way that affects compatibility, public
  contract semantics, product direction, or user-visible terminology.
- Legacy `Stage Completion Map` compatibility would be broken.
- Credentials, paid APIs, production access, destructive operations, commit,
  push, review, integration, deploy, publish, release, daemons, watchers,
  network services, background sessions, or automations become necessary.
