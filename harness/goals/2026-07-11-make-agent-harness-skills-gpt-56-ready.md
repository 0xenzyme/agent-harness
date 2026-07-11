# Goal: Make Agent Harness Skills GPT-5.6-Ready.

Spec: harness/specs/2026-07-11-gpt-5-6-skill-compatibility-repair.md
Status: Completed; delivery state `committed`.

## Source Task

- `harness/tasks.md`: `P1 Make Agent Harness skills GPT-5.6-ready.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `harness/specs/2026-07-11-gpt-5-6-skill-compatibility-repair.md`

## Work Mode Recommendation

Use `local`; the spec is confirmed and the current thread owns the scoped files.

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

- Delivery intent: `local-commit`
- Target delivery state: `committed`
- Commit authorized: `yes` (fresh user authorization on 2026-07-12)
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

`harness-rule:local-delivery-ceiling`: the user's 2026-07-12 follow-up
authorizes one local commit for this Goal. It does not authorize push, review,
integration, release, or plugin-cache deployment.

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

- Item: `route mapping`
  - Acceptance: `Every internal route maps to a published skill or explicit user action.`
  - Evidence: `plugins/agent-harness/references/route-entry-mapping.md plus README/install/skill routing checks.`
  - Status: `satisfied`
- Item: `skill discovery`
  - Acceptance: `Every skill description is at most 300 characters.`
  - Evidence: `Smoke test enforces <=300 characters; measured 207-254 characters across all four skills.`
  - Status: `satisfied`
- Item: `progressive disclosure`
  - Acceptance: `execute is smaller and loads path-specific references.`
  - Evidence: `plugins/agent-harness/skills/execute/SKILL.md reduced to 131 lines with path-specific references.`
  - Status: `satisfied`
- Item: `parallel isolation`
  - Acceptance: `Parallel writers require isolated worktrees or proven non-overlap.`
  - Evidence: `DAG readyNodes default to one; run node record --phase running rejects concurrent workers without --isolation-evidence; smoke coverage passes.`
  - Status: `satisfied`
- Item: `eval provenance`
  - Acceptance: `Static eval and live GPT-5.6 evidence cannot be confused.`
  - Evidence: `Static runner states Model activation measured: no; opt-in live runner requires runtime-reported model evidence.`
  - Status: `satisfied`
- Item: `authorization freshness`
  - Acceptance: `Generated goals and current status do not invent or inherit delivery authorization.`
  - Evidence: `Goal dry-run and smoke tests show validated-local with commit/push/review/integration/release authorization all no.`
  - Status: `satisfied`

## Required Gate Evidence

- Gate: `spec`
  - Required: `yes`
  - Evidence: `Accepted spec at harness/specs/2026-07-11-gpt-5-6-skill-compatibility-repair.md.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `execution`
  - Required: `yes`
  - Evidence: `Explorer, worker, and verification DAG nodes completed with inspectable verification evidence.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `integration`
  - Required: `yes`
  - Evidence: `Protocol, smoke, deterministic eval, plugin validation, skill validation, node checks, and diff checks pass; external Git integration is outside the validated-local target.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Implement the accepted spec completely across skills, references, CLI,
  documentation, evals, tests, and project state.

## Non-Goals

- Do not add public `shape`, `goal`, or `competition` skills.
- Do not change storage schemas or rename existing Goal artifacts.
- Do not commit, push, open a PR, publish, release, deploy, or use credentials.
- Do not pin model routing to a concrete GPT-5.6 alias.

## Context

- Source: Intake idea: Make Agent Harness skills GPT-5.6-ready by removing internal-route dead ends, shortening skill discovery metadata, reducing execute context load, requiring safe parallel-worker isolation, adding live activation evaluation, and synchronizing stale project status.


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
node --check evals/run-live-skill-activation.mjs
npm run validate:plugin
npm run test:protocol
npm run test:eval
npm run test:smoke
npm run test:all
git diff --check
```

## Completion Conditions

- Every internal route has a deterministic public entry mapping.
- Skill descriptions are at most 300 characters.
- `execute` uses progressive disclosure and preserves all hard boundaries.
- Parallel worker launch has a mechanical isolation/collision gate.
- Static eval output cannot be reported as live GPT-5.6 evidence.
- New goals default to `validated-local` without invented delivery authority.
- All verification passes and task/status/run records are synchronized.

## Result

- Completed: Mapped every internal route to one of the four published skills
  or an exact user action.
- Completed: Shortened all discovery descriptions and added per-skill
  `agents/openai.yaml` metadata.
- Completed: Reduced `harness:execute` from 319 to 131 lines and moved detailed
  decisions to path-specific references.
- Completed: Generated Goals now default to `validated-local` with every
  delivery authorization `no`; higher targets require fresh explicit authority.
- Completed: DAG workers launch sequentially by default; concurrent workers
  require recorded `--isolation-evidence`.
- Follow-up correction: DAG node completion now preserves launch `thread`,
  `surface`, and `isolationEvidence`; the Goal template no longer contradicts
  local-only defaults; and `orient next` distinguishes an all-completed task
  index from a parse failure.
- Completed: Deterministic eval now disclaims model activation; the live runner
  is opt-in and refuses GPT-5.6 claims without runtime-reported model evidence.
- Run:
  `.harness/runs/20260711-235825-make-agent-harness-skills-gpt-56-ready/`
- Verification: `node --check`, `npm run test:all`, `npm run test:eval`,
  `npm run validate:plugin`, `git diff --check`, four skill
  `quick_validate.py` checks, and a Goal dry-run all passed.
- Live GPT-5.6 activation: not run because model/cost authorization was not
  separately granted; no live compatibility claim is made.
- Delivery: `committed` under the user's 2026-07-12 follow-up authorization;
  no push, review, integration, publish, release, deploy, credentials, paid
  API, production, daemon, or destructive operation was performed.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The measurement snapshot cannot identify a reliable observed state, feedback quality is insufficient for completion, or the remaining gap is not shrinking.
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
