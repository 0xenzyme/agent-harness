# Goal: Add Reusable Codex Custom-Agent Templates For Harness Execution Roles.

Spec: TBD
Spec Policy: allow-no-spec
Status: Completed; delivery state `pushed`; local plugin cache deployed.

## Source Task

- `harness/tasks.md`: `Add reusable Codex custom-agent templates for Harness execution roles.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`

## Work Mode Recommendation

Use `local`. The user accepted the scope and assigned the current thread as
controller; implementation must return candidate evidence before this thread
accepts state.

## Execution Role

Use `gate-only`.

- `gate-only`: the current thread reviews candidate output and verification evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.
- `mixed`: the current thread may both edit and gate only after recording why the tradeoff is acceptable.
- `harness-rule:level-0-fast-path`: Level 0 Fast Path direct execution is only for tiny low-risk local reversible work. It can skip spec/goal/run/worker ceremony only when no existing Harness Goal/Run or adapter-required gate requires state sync. Level 0 direct execution requires `implementer` or explicitly accepted `mixed`; `gate-only` cannot use Level 0 to edit implementation files. Verification, Delivery State, `Need user`, and `Remaining` still apply.
- `harness-rule:bounded-direct-execution`: Accepted finite single-thread work may execute without creating a Goal/Run/DAG when it needs no durable recovery or handoff, worker/DAG, multi-stage or broad implementation, important runtime/schema behavior change, acceptance or Milestone map, or adapter-required gate. Docs-only clarification of an existing contract is eligible. Sync only relevant pre-existing Harness artifacts; delivery authorization alone does not select durable orchestration. Once this durable Goal exists, do not downgrade its checklist, gate, or state-sync obligations to the bounded tier.

## Conversation Route

Use `current-thread`.

- `current-thread`: the current conversation owns execution in the locked cwd.
- `slot-thread`: hand off to a dedicated slot conversation before editing.
- `remote-control-worktree`: the current conversation may control a different locked worktree only when explicitly approved.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Accepted-state owner: `current-thread`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
- Execution branch: `main`
- Execution slot: `N/A`
- Remote-control worktree: `no`

## Delivery State

- Delivery intent: `local-validation`
- Target delivery state: `pushed`
- Commit authorized: `yes` (fresh user authorization on 2026-07-13)
- Push authorized: `yes` (fresh user authorization on 2026-07-13)
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`
- Plugin-cache deployment authorized: `yes` (fresh user authorization on 2026-07-13)

Generated Goals are local-only by default. Commit, push, review, integration,
release, and ship targets require fresh explicit authorization in the current
conversation or accepted source spec; never infer them from stale status text.

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

- Add project-neutral TOML templates for `harness_explorer`,
  `harness_implementer`, and `harness_reviewer` under the plugin templates
  tree. Their instructions must preserve the controller-only acceptance
  boundary and use the role/model/reasoning/sandbox policy accepted in this
  conversation.
- Add English and zh-CN installation guidance for copying the templates to a
  project `.codex/agents/` directory or to `~/.codex/agents/`, then launching
  a named worker explicitly.
- Integrate the templates with the existing model-routing and worker packet
  references without claiming that an advisory packet field changes Codex's
  actual model routing.
- Add deterministic smoke coverage for template presence, required TOML fields,
  and the documented named-agent boundary.
- Preserve the current dirty model-routing, worker-packet, worker-prompt, and
  smoke-test changes as in-scope prior candidate evidence.

## Non-Goals

- Do not release, deploy, publish, or launch workers outside the run packet DAG unless separately requested.
- Do not execute delivery steps above the Delivery State policy.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: User accepted the custom-agent intake on 2026-07-13 and assigned
  the current thread as controller.
- Accepted initial roles: read-only `harness_explorer` on `gpt-5.6-terra` with
  `low` reasoning; `harness_implementer` on `gpt-5.6` with `medium`
  reasoning; and read-only `harness_reviewer` on `gpt-5.6` with `high`
  reasoning.
- Non-goal clarification: do not add an automatic model router or have the
  Harness plugin write into an adopting project's `.codex/agents/` directory.


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
npm run test:smoke
npm run test:protocol
npm run validate:plugin
git diff --check
```

## Completion Conditions

- The source Goal/work item acceptance is satisfied.
- Verification commands pass or any failure is documented with next steps.
- State-sync evidence or State Sync Notes are produced as part of Goal/Task Done.
- Status-file updates use a bounded current-state snapshot; replace status
  sections instead of appending historical focus logs.
- Update configured state records (`harness/tasks.md`, `harness/status.md`) when the project adapter requires state sync.

## Acceptance Evidence

- Added canonical project-neutral templates for `harness_explorer`,
  `harness_implementer`, and `harness_reviewer` under
  `plugins/agent-harness/templates/codex-agents/`.
- Added English and zh-CN project/user-scoped installation instructions and
  explicit named-worker launch guidance.
- Verified TOML policy fields and candidate-evidence/controller-only state
  boundaries; `npm run test:smoke`, `npm run test:protocol`,
  `npm run validate:plugin`, and `git diff --check` passed locally.
- Committed as `6b4460c` (`feat: add reusable Codex custom agent templates`),
  pushed to `origin/main`, and refreshed the local `harness@personal` plugin
  cache at `/Users/liuyj/.codex/plugins/cache/personal/harness/0.6.0`.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The measurement snapshot cannot identify a reliable observed state, feedback quality is insufficient for completion, or the remaining gap is not shrinking.
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
