# Goal: Apply Impeccable-Inspired Harness Productization Improvements

Spec: None
Spec Policy: allow-no-spec
Status: Completed with validated-local controller evidence.

## Source Task

- `harness/tasks.md`: `Apply Impeccable-inspired harness productization improvements.`

## Source Task Acceptance Map

- Task: `Apply Impeccable-inspired harness productization improvements.`
  - Acceptance: Add a project-neutral Harness capability matrix, introduce stable protocol rule IDs plus deterministic validation for critical contracts, and add/align lightweight test-suite routing so verification can scale with changed surfaces.
  - Evidence: `Added docs/HARNESSES.md, stable harness-rule anchors across canonical docs/references/templates, scripts/test-suites.mjs protocol checks, package test:protocol/test:all routing, smoke coverage, and README/install/CLI/project-contract links. DAG nodes explorer, worker, and verification completed in .harness/runs/20260701-235053-apply-impeccable-inspired-harness-productization-improvements/.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Read First

1. `AGENTS.md`
2. `harness/tasks.md`
3. `harness/README.md`
4. `.harness/config.json`
5. `harness/status.md`
6. `docs/project-contract.md`
7. `plugins/agent-harness/skills/execute/SKILL.md`
8. `plugins/agent-harness/references/adapter-harness.md`
9. `plugins/agent-harness/references/worker-runner-contract.md`
10. `plugins/agent-harness/references/controller-communication.md`

## Work Mode Recommendation

Use `local`.

The user asked to use the current thread as the Harness controller. The checkout
already contains pre-existing local changes, so this goal stays on the current
cwd and branch and does not create an additional worktree unless newer user
instructions require it.

## Execution Role

Use `gate-only`.

- `gate-only`: the current thread reviews candidate output and verification
  evidence, but does not directly edit implementation files.
- `implementer`: the current thread may edit files inside the accepted scope.
- `mixed`: the current thread may both edit and gate only after recording why
  the tradeoff is acceptable.

## Conversation Route

Use `current-thread`.

- `current-thread`: the current conversation owns control, run preparation,
  worker dispatch, verification, acceptance, and state sync in the locked cwd.
- `slot-thread`: not used for this goal.
- `remote-control-worktree`: not used for this goal.

## Execution Context Lock

- Conversation lane: `current-thread`
- Controller thread: `current-thread`
- Execution cwd: `/Users/liuyj/project/skills/agent-harness`
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

Completed runs must reach `validated-local`: implementation exists in the local
checkout, deterministic verification has passed, and Harness state records have
been synchronized. Commit, push, review, integration, publish, and release are
outside this goal.

## Execution DAG

Use `run prepare` to generate the run packet. Worker nodes should use the
default `codex-cli-subagent` surface when available. New visible Codex threads,
forked inherited contexts, and remote worktrees are not part of this goal.

## Route Explanation

- Why this is the right next mode: The work is implementation-heavy but the user
  explicitly framed the current thread as main control. `gate-only` preserves the
  controller/worker split while still moving the accepted improvement batch to
  verified local completion.
- Confirmation boundary: Scope is limited to the accepted Impeccable-inspired
  improvements already identified in the study pass; any release, publication,
  provider build migration, hooks/bootstrap change, or broader product direction
  decision pauses for user confirmation.

## Spec Acceptance Checklist

No separate spec exists. The source task acceptance map is the acceptance source
of truth for this goal.

## Required Gate Evidence

- Gate: `controller-acceptance`
  - Required: `yes`
  - Evidence: `Controller reviewed worker diff for capability matrix, rule anchors, deterministic protocol checks, suite routing, and documentation links; verification node passed node --check scripts/test-suites.mjs, node --check tests/smoke.mjs, node --check plugins/agent-harness/scripts/agent-harness.mjs, npm run test:protocol, npm run test:smoke, npm run test:all, npm run validate:plugin, git diff --check, goal validate, and run status --json.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Add a project-neutral capability matrix inspired by Impeccable's
  `docs/HARNESSES.md`, covering Agent Harness runtime/control surfaces,
  applicability, defaults, boundaries, and verification expectations.
- Introduce stable `harness-rule:*` protocol IDs for critical Harness contracts
  such as gate-only controller behavior, local delivery ceilings, worker-surface
  defaults, project-neutrality, and state sync.
- Add deterministic validation for those stable protocol IDs so missing or
  drifted critical contract anchors fail smoke verification.
- Add or align lightweight test-suite routing so maintainers can run
  surface-appropriate validation without relying on one monolithic smoke entry.
- Keep README, project contract docs, workflow skill guidance, templates, CLI
  gates, and adapter docs aligned where the new matrix or rule IDs create a
  user-visible contract.
- Update Harness state (`harness/tasks.md`, `harness/status.md`, goal/run
  evidence) after implementation and verification.

## Non-Goals

- Do not migrate Agent Harness to Impeccable's multi-provider source build or
  generated output structure.
- Do not add plugin hooks, startup bootstrap behavior, network services,
  daemons, watchers, deployments, releases, or publishing flows.
- Do not create or switch branches/worktrees.
- Do not commit, push, open review, integrate, publish, or release.
- Do not change downstream-project contracts in a way that assumes one specific
  project shape.
- Do not edit unrelated pre-existing dirty work except where required to align
  this goal's accepted scope.

## Project Adapter Requirements

- Read `harness/README.md` for project-specific hard boundaries, validation
  rules, preflight requirements, and state-sync requirements.
- Preflight: read `AGENTS.md` before editing repository files.
- Preflight: validate plugin changes with `npm run validate:plugin`.
- State sync: update `harness/tasks.md` after meaningful task state changes.
- State sync: update `harness/status.md` after execution or verification.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check tests/smoke.mjs
npm run test:smoke
npm run validate:plugin
git diff --check
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /Users/liuyj/project/skills/agent-harness --goal harness/goals/2026-07-01-apply-impeccable-inspired-harness-productization-improvements.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /Users/liuyj/project/skills/agent-harness --run <run-dir> --json
```

If new test-runner scripts are added, also run `node --check <new-script>` and
the relevant package script.

## Evidence And State Sync

- Candidate evidence: worker output plus changed-file list.
- Accepted evidence: controller-reviewed diff, completed DAG nodes, passing
  verification commands, and completed run record with gate evidence.
- State records to update: `harness/tasks.md`, `harness/status.md`, this goal,
  and the generated `.harness/runs/<run-id>/` packet.

## Completion Conditions

- The source task acceptance map is `satisfied` with concrete evidence.
- `controller-acceptance` gate evidence is `satisfied`.
- Capability matrix, stable rule IDs, deterministic validation, and test-suite
  routing are implemented or explicitly narrowed with recorded justification.
- Verification commands pass, or any failure is documented with a blocker and
  follow-up.
- Harness task/status/goal/run records are synchronized.
- Delivery state is `validated-local`; no commit/push/review/integration/release
  action has been performed.

## Pause Conditions

- The goal conflicts with accepted scope, repo instructions, adapter
  requirements, production constraints, or newer user instructions.
- Requirements become unclear in a way that affects compatibility, project
  contracts, product direction, or user-visible behavior.
- Credentials, paid APIs, production access, destructive operations, network
  services, daemons, watchers, plugin hooks/bootstrap changes, or delivery above
  `validated-local` are required.
- Current dirty checkout changes conflict with this goal's files in a way the
  controller cannot safely isolate.
