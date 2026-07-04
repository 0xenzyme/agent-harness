# Goal: Shape Lightweight Human Verification Checklist And Need User Digest

Spec: harness/specs/2026-07-04-lightweight-human-verification-checklist-need-user-digest.md
Status: Completed with validated-local mixed Controller evidence.

## Source Task

- `harness/tasks.md`: `P2 Shape lightweight human-verification checklist and Need-user digest.`

## Source Task Acceptance Map

- Task: `Shape lightweight human-verification checklist and Need-user digest.`
  - Acceptance: `Define the user-facing checklist / closeout shape for manual verification, Need user, and Remaining so routine closeouts say when no human action is needed and only true pause triggers ask for confirmation.`
  - Evidence: `plugins/agent-harness/skills/execute/references/user-facing-closeout.md`, `docs/project-contract.md`, generated run packet `.harness/runs/20260704-170345-shape-lightweight-human-verification-checklist-and-need-user-digest/`, `scripts/test-suites.mjs`, and `tests/smoke.mjs` define and verify the explicit Need-user digest shape.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. `harness/specs/2026-07-04-lightweight-human-verification-checklist-need-user-digest.md`
7. `plugins/agent-harness/skills/execute/SKILL.md`
8. `plugins/agent-harness/skills/execute/references/user-facing-closeout.md`
9. `plugins/agent-harness/skills/execute/references/completion-evidence.md`
10. `plugins/agent-harness/skills/execute/references/adversarial-acceptance.md`
11. `plugins/agent-harness/references/controller-communication.md`
12. `plugins/agent-harness/references/gate-results.md`
13. `plugins/agent-harness/references/task-routing.md`
14. `plugins/agent-harness/templates/goal.md`
15. `plugins/agent-harness/scripts/agent-harness.mjs`
16. `scripts/test-suites.mjs`
17. `tests/smoke.mjs`

## Work Mode Recommendation

Use `local`.

The user asked to execute in the current checkout and did not authorize a
branch, worktree, commit, push, review, integration, release, deploy, daemon,
watcher, credential, paid API, production, or destructive action. The checkout
already contains unrelated validated-local changes, so this goal must preserve
them and edit only the bounded closeout / Need-user surfaces.

## Execution Role

Use `mixed`.

- The current thread is the Controller and owns final acceptance for this
  goal.
- The user explicitly allowed same-thread implementation when the scope is
  bounded, local, and safe and the rationale is recorded.
- Direct editing is acceptable here because the scoped surfaces are local
  protocol docs, skill references, templates, CLI-generated run text,
  deterministic tests, and Harness state records.
- No production, credential, paid API, destructive operation, daemon, watcher,
  commit, push, review, integration, release, deployment, or publication step
  is authorized.

## Conversation Route

Use `current-thread`.

- The current conversation owns Controller decisions, implementation edits,
  verification, acceptance, and state sync in the locked cwd.
- No slot thread, remote-control worktree, forked inherited context, or visible
  child controller is used for this local closeout-shaping pass.

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

- Delivery intent: `validated-local-closeout-protocol`
- Target delivery state: `validated-local`
- Commit authorized: `no`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

This goal stops at validated local implementation plus Harness evidence. Commit,
push, review, integration, publish, release, deploy, and production delivery are
outside this goal.

## Execution DAG

Use `run prepare` after this goal validates. Because the goal is `mixed` and
foreground-local, the run may use a current-thread implementation node instead
of dispatching a worker. All DAG nodes must still be recorded before the run is
completed.

## Spec Acceptance Checklist

- Item: `Closeout shape`
  - Acceptance: The default closeout shape includes `Need user` between
    `Delivery state` and `Remaining`.
  - Evidence: `plugins/agent-harness/skills/execute/references/user-facing-closeout.md` and `docs/project-contract.md` define the default shape with `Need user` between `Delivery state` and `Remaining`; `plugins/agent-harness/skills/execute/SKILL.md` requires final answers to include both fields.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Need user semantics`
  - Acceptance: References define that `Need user` lists only concrete human
    decisions, manual verification, authorization, credentials/paid API,
    production, destructive-operation, product-direction, or external-evidence
    needs, and uses `None` when no true pause trigger exists.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`, `plugins/agent-harness/skills/execute/references/user-facing-closeout.md`, `plugins/agent-harness/references/controller-communication.md`, and `plugins/agent-harness/templates/worker-prompt.md` define `Need user: None` and true pause-trigger semantics.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Remaining semantics`
  - Acceptance: References define that `Remaining` is separate from
    `Need user` and uses `None` when no non-user follow-up remains.
  - Evidence: `plugins/agent-harness/skills/execute/references/user-facing-closeout.md`, `docs/project-contract.md`, `plugins/agent-harness/references/controller-communication.md`, and `plugins/agent-harness/templates/goal.md` separate `Remaining` from `Need user` and require `Remaining: None` when no follow-up remains.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Generated run guidance`
  - Acceptance: Prepared run packets and execution prompts tell agents to close
    with explicit `Need user` and `Remaining` values instead of broad
    confirmation questions.
  - Evidence: `plugins/agent-harness/scripts/agent-harness.mjs` emits the guidance; `.harness/runs/20260704-170345-shape-lightweight-human-verification-checklist-and-need-user-digest/run.md` and `prompt.md` contain `Need user: None` / `Remaining: None` closeout instructions.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Deterministic coverage`
  - Acceptance: Protocol and smoke checks protect the closeout contract and
    generated run guidance.
  - Evidence: `scripts/test-suites.mjs` protects `harness-rule:need-user-digest`; `tests/smoke.mjs` asserts the closeout reference, controller packets, worker prompt, generated `run.md`, generated `prompt.md`, and generated worker prompts. Validation passed with node syntax checks, `npm run test:protocol`, `npm run test:smoke`, `npm run validate:plugin`, `git diff --check`, goal validation, and run status.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `controller-acceptance`
  - Required: `yes`
  - Evidence: `Current mixed Controller reviewed the scoped diff, verified that the generated run packet contains the Need-user digest guidance, recorded completed DAG nodes in .harness/runs/20260704-170345-shape-lightweight-human-verification-checklist-and-need-user-digest/, and passed node syntax checks, npm run test:protocol, npm run test:smoke, npm run validate:plugin, git diff --check, goal validate, and run status --json.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Land the accepted closeout shape in `harness:execute` user-facing closeout
  guidance and supporting references.
- Teach `Need user` as concrete user decisions, authorizations, manual
  verification, or true pause triggers only.
- Teach `Remaining` as separate non-user follow-up or blocker state.
- Update generated run packets / execution prompts with explicit closeout
  guidance.
- Add deterministic protocol and smoke checks for the new behavior.
- Update `harness/tasks.md`, `harness/status.md`, this goal, and the prepared
  run packet with concrete evidence.

## Non-Goals

- Do not implement the separate Level 0 Fast Path direct-execution policy.
- Do not implement EnvContext focus or broader intent-routing model changes.
- Do not implement or research control-theory feedback loop changes.
- Do not redesign Delivery State semantics.
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
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /Users/liuyj/project/skills/agent-harness --goal harness/goals/2026-07-04-shape-lightweight-human-verification-checklist-and-need-user-digest.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /Users/liuyj/project/skills/agent-harness --run <run-dir> --json
```

## Evidence And State Sync

- Candidate evidence: implementation diff, generated run text, deterministic
  test output, and run packet status.
- Accepted evidence: Controller-reviewed diff against the spec checklist,
  passing verification, updated checklist/gate evidence, completed DAG node
  records, and completed run record.
- State records to update: `harness/tasks.md`, `harness/status.md`, this goal,
  and `.harness/runs/<run-id>/`.

## Completion Conditions

- The default closeout contract includes `Need user`, `Remaining`, and `None`
  handling for routine closeouts.
- True pause triggers produce concrete `Need user` entries instead of broad
  confirmation questions.
- Agent-performed manual inspection is recorded as verification, while
  user-required inspection is recorded as `Need user`.
- Required deterministic checks pass, or the exact blocker is recorded.
- Every `Spec Acceptance Checklist` item is `satisfied` with concrete evidence.
- `controller-acceptance` gate evidence is `satisfied`.
- Harness task/status/goal/run evidence is synchronized.
- Delivery State is `validated-local`; no commit, push, review, integration,
  release, publish, deploy, or production action is performed.

## Pause Conditions

- The goal conflicts with the spec, adapter, repository instructions,
  production constraints, or newer user instructions.
- Requirements become unclear in a way that affects compatibility, public
  contract semantics, product direction, or routing behavior beyond closeout
  wording.
- The work expands into the separate Level 0 Fast Path, EnvContext, or
  control-theory research goals.
- Credentials, paid APIs, production access, destructive operations, commit,
  push, review, integration, deploy, publish, release, daemons, watchers,
  network services, background sessions, or automations become necessary.
