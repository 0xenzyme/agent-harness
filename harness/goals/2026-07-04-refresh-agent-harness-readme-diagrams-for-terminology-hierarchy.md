# Goal: Refresh Agent Harness README Diagrams For Terminology Hierarchy.

Spec: harness/specs/2026-07-04-agent-harness-readme-diagram-refresh.md
Status: Completed with validated-local docs diagram evidence.

## Source Task

- `harness/tasks.md`: `P2 Refresh Agent Harness README diagrams for terminology hierarchy.`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `harness/specs/2026-07-04-agent-harness-readme-diagram-refresh.md`

## Work Mode Recommendation

Use `local`. The user explicitly asked the current thread to act as Controller
and complete the docs improvement task in the current checkout.

## Execution Role

Use `mixed`.

- `gate-only`: the current thread reviews candidate output and verification evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.
- `mixed`: the current thread may both edit and gate only after recording why the tradeoff is acceptable.

Mixed role is acceptable because the scope is narrow, local, and document/image
asset focused: README diagram sources, regenerated PNGs, and deterministic
presentation/smoke checks. The Controller remains responsible for visual
inspection, deterministic verification, and Harness state sync before
completion.

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

- Delivery intent: `local-validation-only`
- Target delivery state: `validated-local`
- Commit authorized: `no`
- Push authorized: `no`
- Review authorized: `no`
- Integration authorized: `no`
- Release authorized: `no`

Completed development runs must reach Target delivery state. By default,
gate-passing implementation work is committed and integrated into the
target integration line declared by the project adapter, confirmed goal, or
explicit user instruction; release / ship remains out of scope unless the
delivery policy explicitly authorizes it. Lower the target to `validated-local`
only for local-only spikes, audits, or explicitly uncommitted work.

The locked Execution branch records where implementation happens. It is not
automatically the integration target, and Harness core does not assume a branch
named `main`.

## Execution DAG

Use `run prepare` to generate `dag.json`, `dag.md`, and per-node
`agents/<node>/prompt.md` files. Prefer Codex CLI subagents for worker nodes.
Create a new Codex thread only when the controller explicitly needs a visible,
long-lived handoff lane. Fork is not the default worker surface; use it only
when the controller explicitly approves inherited context.


## Spec Acceptance Checklist

- Item: `Adapter model diagram`
  - Acceptance: `docs/assets/readme/adapter-model.png` is regenerated from a maintained SVG source and presents Roadmap, Milestone, Goal, Task, Run, and Evidence.
  - Evidence: `Added docs/assets/readme/adapter-model.svg and regenerated docs/assets/readme/adapter-model.png with sips at 1672x941. Visual inspection confirmed Roadmap, Milestones, Goals, Tasks, Runs, and Evidence are legible and not task-first framed.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Execution model diagram`
  - Acceptance: `docs/assets/readme/adapter-execution-model.png` is regenerated from a maintained SVG source and presents accepted direction flowing through Roadmap, Milestone, Goal, Tasks, Run, verification, gate, and sync.
  - Evidence: `Added docs/assets/readme/adapter-execution-model.svg and regenerated docs/assets/readme/adapter-execution-model.png with sips at 1672x941. Visual inspection confirmed Roadmap, Milestone, Goal, Tasks, Run, Execute, Verify, Gate, and Sync are legible.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Artifact map inspection`
  - Acceptance: `docs/assets/readme/adapter-artifact-map.png` is inspected and left unchanged only if it already uses `Milestones` and does not use outdated `Stage` terminology.
  - Evidence: `adapter-artifact-map.png was inspected during the docs asset pass and left unchanged because it already uses Milestones and does not show Stage; sips confirmed it remains 1672x941.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Diagram terminology tests`
  - Acceptance: Presentation or smoke checks protect the regenerated diagram source terminology and reject the previous task-first phrase.
  - Evidence: `scripts/test-suites.mjs now protects README diagram references and SVG terminology; tests/smoke.mjs reads both SVG sources, asserts Roadmap/Milestone/Goal/Tasks/Run terms, and rejects tasks, specs, goals, runs in adapter-model.svg.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Harness evidence`
  - Acceptance: Harness run evidence records render method, visual inspection, and deterministic verification results.
  - Evidence: `Run .harness/runs/20260704-160154-refresh-agent-harness-readme-diagrams-for-terminology-hierarchy recorded explorer and worker node evidence; verification node and final run record capture passed checks and state sync.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `deterministic-verification`
  - Required: `yes`
  - Evidence: `Passed sips dimension check, node --check scripts/test-suites.mjs, node --check tests/smoke.mjs, npm run test:presentation, npm run test:protocol, npm run test:smoke, npm run validate:plugin, and git diff --check.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `visual-inspection`
  - Required: `yes`
  - Evidence: `Visual inspection of adapter-model.png and adapter-execution-model.png confirmed legible text, no obvious overlap, and current Roadmap -> Milestone -> Goal -> Task -> Run terminology.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Gate: `harness-state-sync`
  - Required: `yes`
  - Evidence: `harness/tasks.md, harness/status.md, this goal, and run evidence were updated for the diagram refresh goal.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- `docs/assets/readme/adapter-model.svg`
- `docs/assets/readme/adapter-model.png`
- `docs/assets/readme/adapter-execution-model.svg`
- `docs/assets/readme/adapter-execution-model.png`
- Presentation/smoke checks that protect those diagram sources.
- Harness spec, goal, task, status, and run evidence for this work.

## Non-Goals

- Do not change the accepted terminology decisions.
- Do not rewrite historical run evidence or release notes.
- Do not change CLI semantics, workflow skill behavior, plugin activation,
  package version, or install/deploy behavior.
- Do not release, deploy, publish, or launch workers outside the run packet DAG unless separately requested.
- Do not execute delivery steps above the Delivery State policy.
- Do not make destructive changes without explicit user approval.
- Do not add project-specific assumptions to the core harness contract.

## Context

- Source: User agreed on 2026-07-04 that this Controller thread should finish
  the docs improvement task after inspecting whether diagrams need to be
  redone.
- Notes: Classification=goal; execution role=mixed Controller/implementer;
  target delivery state=`validated-local`; no commit, push, release, deploy,
  credential, paid API, daemon, watcher, or destructive operation.

## Project Adapter Requirements

- Read `harness/README.md` for project-specific hard boundaries, validation rules, preflight requirements, and state-sync requirements.
- If a linked Doc is a goal prompt, read the spec and context documents referenced by that goal before editing.
- Agent Harness plugin references: adapter-harness, task-routing, and work-mode-policy.
- Preflight: Read AGENTS.md before editing repository files.
- Preflight: Validate plugin changes with npm run validate:plugin.
- State sync: Update harness/tasks.md after meaningful task state changes.
- State sync: Update harness/status.md after execution or verification.


## Verification

Manual visual verification:

- Inspect regenerated `docs/assets/readme/adapter-model.png`.
- Inspect regenerated `docs/assets/readme/adapter-execution-model.png`.

```bash
sips -g pixelWidth -g pixelHeight docs/assets/readme/adapter-model.png docs/assets/readme/adapter-execution-model.png
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
npm run test:presentation
npm run test:protocol
npm run test:smoke
npm run validate:plugin
git diff --check
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --goal harness/goals/2026-07-04-refresh-agent-harness-readme-diagrams-for-terminology-hierarchy.md --cwd /Users/liuyj/project/skills/agent-harness --json
node plugins/agent-harness/scripts/agent-harness.mjs run status --run <run-dir> --cwd /Users/liuyj/project/skills/agent-harness --json
```

## Completion Conditions

- The spec acceptance checklist is complete.
- Regenerated diagram PNGs are visually inspected and backed by SVG sources.
- Verification commands pass or any failure is documented with next steps.
- `harness/tasks.md`, `harness/status.md`, and run evidence are synced.
- Delivery remains `validated-local`; no commit, push, release, deploy,
  credential, paid API, daemon, watcher, or destructive operation is performed.

## Pause Conditions

- The referenced spec or accepted scope is missing, unconfirmed, or conflicts with code, production constraints, or newer user instructions.
- The work requires credentials, paid APIs, production access, destructive commands, release, or a delivery step above the Delivery State policy.
- The local render tool cannot generate usable PNGs from SVG sources and no
  acceptable local alternative exists.
- Product direction, file ownership, or worktree policy becomes unclear.
- User gives new instructions that conflict with this goal.
