# Goal: Improve README Presentation And First-Use Clarity.

Spec: TBD
Spec Policy: allow-no-spec
Status: Completed; delivery state `pushed`.

## Source Task

- `harness/tasks.md`: `Improve README presentation and first-use clarity.`

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

- Delivery intent: `push-current-branch`
- Target delivery state: `pushed`
- Commit authorized: `yes`
- Push authorized: `yes`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

The user's current 2026-07-12 instruction authorizes commit and push for this
Goal. Review, integration, release, and ship remain unauthorized.

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

- Move install, first-use prompts, and public skill selection directly below
  the README hero.
- Remove the embedded social preview from README content while preserving it
  as GitHub presentation metadata.
- Merge repetitive value, workflow, architecture, and design sections into a
  shorter scannable hierarchy.
- Align the English and zh-CN README structures and localize zh-CN headings.
- Reference lightweight SVG diagrams, create a correct Artifact Map, and show
  Spec constraints before Goal execution.
- Update presentation/smoke checks to enforce the new display contract.

## Non-Goals

- Do not change plugin runtime behavior, storage schema, or public skill names.
- Do not remove historical PNG assets referenced by earlier Goal evidence.
- Do not release, deploy, publish, or launch workers outside the run packet DAG unless separately requested.
- Do not execute delivery steps above the Delivery State policy.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: Current conversation on 2026-07-12; user accepted the read-only
  presentation review and requested implementation of its recommendations.
- Observed state: README installation began near line 338, skill selection near
  line 211, the social preview consumed the first screen, PNG diagrams added
  roughly 2.3 MB, and the Artifact Map used `.agent-harness/config.json`.


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
xmllint --noout docs/assets/readme/*.svg docs/assets/github/social-preview.svg
npm run test:presentation
npm run test:protocol
npm run test:smoke
npm run validate:plugin
git diff --check
```

Render all README SVG diagrams at their native dimensions and visually inspect
text fit, hierarchy, arrows, palette consistency, and clipping.

## Completion Conditions

- English and zh-CN READMEs surface install, prompts, and skill selection before
  long-form architecture details.
- Both READMEs are materially shorter and do not embed the social preview.
- Both READMEs reference SVG diagrams rather than PNG diagrams.
- Artifact Map uses `.harness/config.json`; Execution Model makes Spec an
  upstream constraint on Goal execution.
- Presentation tests encode these requirements and all verification passes.
- Verification commands pass or any failure is documented with next steps.
- State-sync evidence or State Sync Notes are produced as part of task Done.
- Status-file updates use a bounded current-state snapshot; replace status
  sections instead of appending historical focus logs.
- Update configured state records (`harness/tasks.md`, `harness/status.md`) when the project adapter requires state sync.

## Result

- English and zh-CN READMEs now place install, first-use prompts, and public
  skill selection immediately below the hero.
- README.md was reduced from 396 to 223 lines; README.zh-CN.md was reduced from
  370 to 211 lines.
- The social preview is reserved for GitHub presentation metadata, and README
  diagrams now use lightweight SVG sources.
- Added `docs/assets/readme/adapter-artifact-map.svg` with the correct
  `.harness/config.json` path.
- Updated the Execution Model so Spec visibly constrains Goal before execution;
  updated the social preview to the canonical terminology hierarchy.
- Updated presentation and smoke checks to enforce the new presentation
  contract.
- Verification passed: native-dimension SVG visual inspection, `xmllint`,
  README relative-link checks, `npm run validate:plugin`, `npm run test:all`,
  and `git diff --check`.
- Delivery: `pushed` to `origin/main` under fresh user authorization; no review,
  integration, publish, release, deploy, credentials, paid API, production,
  daemon, or destructive operation was performed.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The measurement snapshot cannot identify a reliable observed state, feedback quality is insufficient for completion, or the remaining gap is not shrinking.
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
- Product direction, file ownership, or worktree policy is unclear.
- User gives new instructions that conflict with this goal.
