# Goal: Document Adapter Language Configuration And Artifact-Language Boundaries.

Spec: TBD
Spec Policy: allow-no-spec
Status: Completed; delivery state `pushed`; local plugin cache deployed.

## Source Task

- `harness/tasks.md`: `Document adapter language configuration and artifact-language boundaries.`

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

- Delivery intent: `push-and-deploy-local-plugin`
- Target delivery state: `pushed`
- Commit authorized: `yes`
- Push authorized: `yes`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

The user's current 2026-07-12 instruction authorizes commit, push to the current
branch, and local plugin cache deployment. Review, integration, release, and
ship remain unauthorized.

The locked Execution branch records where implementation happens. It is not
automatically the integration target, and Harness core does not assume a branch
named `main`.

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

- Document language precedence and the adapter-owned `language.default`
  configuration in README, install, CLI, and project contract docs.
- State the current boundary: language selection localizes supported CLI
  messages, while deterministic generated artifacts and base templates remain
  English until localized renderers exist.
- Document `auto`, `en`, and `zh-CN`, plus technical-term preservation.
- Add a Language Policy section to adapter templates and canonical references.
- Add deterministic tests that prevent documentation from overstating current
  artifact localization support.
- Commit, push the current branch, and deploy the local plugin cache.

## Non-Goals

- Do not implement localized Goal/Spec/Run/template rendering in this Goal.
- Do not add a second language field under the `adapter` object.
- Do not release, deploy, publish, or launch workers outside the run packet DAG unless separately requested.
- Do not execute delivery steps above the Delivery State policy.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: Current conversation on 2026-07-12; user requested language docs,


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
npm run validate:plugin
npm run test:protocol
npm run test:smoke
npm run test:all
git diff --check
```

After commit and push, run `npm run deploy:local-plugin` and verify the installed
cache sentinels plus the refreshed plugin source.

## Completion Conditions

- Docs identify `.harness/config.json` `language.default` as adapter-owned
  machine-readable policy and show `auto`, `en`, and `zh-CN` examples.
- Docs state the exact selection precedence and fallback.
- Docs clearly distinguish localized CLI messages from currently English-only
  generated artifacts/templates.
- Adapter template/reference record the human-readable Language Policy.
- Tests and plugin validation pass; commit and push succeed; local plugin cache
  deployment succeeds.
- Verification commands pass or any failure is documented with next steps.
- State-sync evidence or State Sync Notes are produced as part of task Done.
- Status-file updates use a bounded current-state snapshot; replace status
  sections instead of appending historical focus logs.
- Update configured state records (`harness/tasks.md`, `harness/status.md`) when the project adapter requires state sync.

## Result

- Documented adapter-owned `language.default` configuration in English/zh-CN
  README, install, CLI, and project contract docs.
- Documented `auto`, `en`, `zh-CN`, exact CLI selection precedence, and
  technical-term preservation.
- Explicitly stated that current localization covers supported CLI messages,
  while deterministic generated artifact bodies and base templates remain
  English.
- Added Language Policy guidance to the adapter reference/template and schema
  descriptions; added deterministic protocol/smoke assertions.
- Verification passed: `npm run validate:plugin`, `npm run test:protocol`,
  `npm run test:smoke`, `npm run test:all`, Goal validation, and
  `git diff --check`.
- Documentation commit `3f40b19` was pushed to `origin/main`.
- `npm run deploy:local-plugin` refreshed
  `/Users/liuyj/.codex/plugins/cache/personal/harness/0.6.0`; validate, smoke,
  reinstall, and cache sentinel checks passed.
- Delivery: `pushed` plus local plugin cache deployment. No review,
  integration, release, production access, paid API, daemon, destructive
  operation, or remote deployment was performed.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The measurement snapshot cannot identify a reliable observed state, feedback quality is insufficient for completion, or the remaining gap is not shrinking.
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
