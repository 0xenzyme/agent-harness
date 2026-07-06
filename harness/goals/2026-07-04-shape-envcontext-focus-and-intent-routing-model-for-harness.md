# Goal: Shape EnvContext Focus And Intent-Routing Model For Harness

Spec: harness/specs/2026-07-04-envcontext-focus-and-intent-routing-model.md
Status: Completed with validated-local gate-only Controller evidence.

## Source Task

- `harness/tasks.md`: `P2 Shape EnvContext focus and intent-routing model for Harness.`

`harness-rule:terminology-boundary`: user-facing hierarchy is
`Roadmap -> Milestone -> Goal -> Task -> Run`. `P0` / `P1` / `P2` / `P3`
are priorities only, `M*` identifies roadmap milestones, and Runs are
execution attempts rather than threads or sessions.

## Source Task Acceptance Map

- Task: `Shape EnvContext focus and intent-routing model for Harness.`
  - Acceptance: `Define which context layers Harness should expose for orient, intake, shape, goal, and execute; include focus presets, token/noise controls, and how intent normalization routes user language to Milestone, Goal, Task, Run, Priority, or Spec.`
  - Evidence: `Implemented and verified as internal context focus routing:
    docs/project-contract.md and plugins/agent-harness/references/task-routing.md
    define context layers, focus presets, token/noise controls, and
    intent-before-focus; plugins/agent-harness/scripts/agent-harness.mjs,
    scripts/test-suites.mjs, and tests/smoke.mjs add generated guidance and
    deterministic coverage. Run
    .harness/runs/20260704-190518-shape-envcontext-focus-and-intent-routing-model-for-harness/
    records explorer, cli-contract-worker, docs-skill-worker, and verification
    nodes.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Read First

1. `AGENTS.md`
2. `.harness/config.json`
3. `harness/README.md`
4. `harness/tasks.md`
5. `harness/status.md`
6. `harness/specs/2026-07-04-envcontext-focus-and-intent-routing-model.md`
7. `docs/HARNESSES.md`
8. `docs/project-contract.md`
9. `plugins/agent-harness/references/task-routing.md`
10. `plugins/agent-harness/references/controller-communication.md`
11. `plugins/agent-harness/references/worker-runner-contract.md`
12. `plugins/agent-harness/references/gate-results.md`
13. `plugins/agent-harness/skills/orient/SKILL.md`
14. `plugins/agent-harness/skills/intake/SKILL.md`
15. `plugins/agent-harness/skills/execute/SKILL.md`
16. `plugins/agent-harness/templates/goal.md`
17. `plugins/agent-harness/templates/worker-prompt.md`
18. `plugins/agent-harness/scripts/agent-harness.mjs`
19. `scripts/test-suites.mjs`
20. `tests/smoke.mjs`

## Work Mode Recommendation

Use `local`.

The user accepted the shape in the current thread and did not authorize a
branch, worktree, commit, push, review, integration, release, deploy, daemon,
watcher, credential, paid API, production, or destructive action. Existing
checkout changes must be preserved.

## Execution Role

Use `gate-only`.

- The current thread is the Controller and acceptance lane.
- The current thread may create and validate control artifacts, dispatch worker
  implementation, inspect candidate output, run verification, request fixes,
  and record accepted state after evidence review.
- The current thread must not directly edit implementation files for this
  policy because the accepted recommendation keeps the current thread
  `gate-only` and this Goal changes routing behavior.
- Worker output is candidate evidence until this Controller validates it.

## Conversation Route

Use `current-thread`.

- `current-thread`: this conversation owns Controller decisions, run
  preparation, worker dispatch, verification, acceptance, and state sync in
  the locked cwd.
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

- Delivery intent: `validated-local-context-focus-protocol`
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

- Why this is the right next mode: The user accepted the recommended shape, and
  the task has `Needs spec=yes`; the next safe action is a durable spec, goal,
  run packet, worker implementation, verification, Controller acceptance, and
  state sync.
- Confirmation boundary: The accepted scope is limited to internal context
  focus / intent-routing protocol guidance and aligned docs/templates/generated
  guidance/tests. Public `EnvContext`, `--focus`, schema/config migration,
  activation changes, control-theory research, and delivery above
  `validated-local` are excluded.

## Spec Acceptance Checklist

- Item: `Public concept boundary`
  - Acceptance: Protocol docs explain that `EnvContext` is an internal design
    reference and public guidance uses context focus / focus presets instead.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`,
    `plugins/agent-harness/references/task-routing.md`,
    `plugins/agent-harness/templates/goal.md`, and
    `plugins/agent-harness/templates/spec.md` keep public wording on
    context focus / focus presets and state that `EnvContext` remains internal
    design language only.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Focus presets`
  - Acceptance: Docs or generated guidance define default focus presets for
    `orient`, `intake`, `shape`, `goal`, and `execute`.
  - Evidence: `docs/project-contract.md`,
    `plugins/agent-harness/references/task-routing.md`,
    `plugins/agent-harness/skills/orient/SKILL.md`,
    `plugins/agent-harness/skills/intake/SKILL.md`,
    `plugins/agent-harness/skills/execute/SKILL.md`,
    `plugins/agent-harness/templates/goal.md`, and generated guidance in
    `plugins/agent-harness/scripts/agent-harness.mjs` define workflow focus
    presets for `orient`, `intake`, `shape`, `goal`, and `execute`.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Intent before focus`
  - Acceptance: Routing guidance states that intent normalization to
    `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec` runs before
    selecting context focus.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`,
    `plugins/agent-harness/references/task-routing.md`,
    `plugins/agent-harness/templates/goal.md`,
    `plugins/agent-harness/templates/worker-prompt.md`, and generated
    goal/run/prompt text in `plugins/agent-harness/scripts/agent-harness.mjs`
    all carry `harness-rule:context-focus-routing`.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Token and noise controls`
  - Acceptance: Guidance defines how agents limit broad docs, historical run
    logs, and irrelevant artifacts for each workflow.
  - Evidence: `docs/project-contract.md`,
    `plugins/agent-harness/references/task-routing.md`,
    `plugins/agent-harness/skills/orient/SKILL.md`,
    `plugins/agent-harness/skills/intake/SKILL.md`,
    `plugins/agent-harness/skills/execute/SKILL.md`, and generated run/prompt
    guidance define current-state-first reading, historical-log summaries, and
    route-local source-of-truth placement.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `No first-version API expansion`
  - Acceptance: The implementation does not add a public `EnvContext` API,
    `--focus` CLI parameter, schema field, persistent config, or storage
    migration.
  - Evidence: `Verification worker and Controller checks confirmed CLI help,
    plugins/agent-harness/scripts/agent-harness.mjs, docs/cli.md,
    docs/cli.zh-CN.md, .harness/config.json, and
    plugins/agent-harness/schemas/config.schema.json do not expose a
    first-version public --focus or focus config/schema surface.`
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Deterministic coverage`
  - Acceptance: Protocol and smoke checks protect the new context focus and
    intent-routing guidance where implementation touches public docs, skill
    references, templates, or generated packets.
  - Evidence: `scripts/test-suites.mjs` protects the
    `harness-rule:context-focus-routing` anchor and no public `--focus`
    surface; `tests/smoke.mjs` asserts docs, task routing, templates, CLI
    source, generated goals, run packets, execution prompts, and worker
    prompts. Verification passed with node syntax checks, `npm run
    test:protocol`, `npm run test:smoke`, `npm run validate:plugin`, `git
    diff --check`, goal validation, and run status.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `controller-acceptance`
  - Required: `yes`
  - Evidence: `Gate-only Controller reviewed explorer,
    cli-contract-worker, docs-skill-worker, and verification candidate
    packets, inspected scoped diffs, recorded all DAG nodes in
    .harness/runs/20260704-190518-shape-envcontext-focus-and-intent-routing-model-for-harness/,
    and passed node --check for agent-harness.mjs/test-suites.mjs/smoke.mjs,
    npm run test:protocol, npm run test:smoke, npm run validate:plugin, git
    diff --check, goal validate, and run status --json.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Scope

- Land the accepted EnvContext/focus shape as internal context focus and
  intent-routing guidance.
- Add a stable protocol anchor if needed by the capability matrix and protocol
  checks.
- Define context layers and default focus presets for `orient`, `intake`,
  `shape`, `goal`, and `execute`.
- Clarify that intent normalization happens before focus selection.
- Define token/noise and lost-in-the-middle controls.
- Align docs, workflow skill guidance, templates, generated run/prompt text,
  and deterministic checks where needed.
- Update `harness/tasks.md`, `harness/status.md`, this goal, and the prepared
  run packet with concrete evidence after Controller acceptance.

## Non-Goals

- Do not expose `EnvContext` as a formal public concept.
- Do not add `--focus`, schema/config fields, persistent config, storage
  migration, activation behavior, or external EnvContext dependencies.
- Do not implement the separate control-theory research Goal.
- Do not weaken existing terminology, Level 0 Fast Path, Need-user digest,
  gate-only, worker-surface, Delivery State, checklist, or gate evidence
  requirements.
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
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /Users/liuyj/project/skills/agent-harness --goal harness/goals/2026-07-04-shape-envcontext-focus-and-intent-routing-model-for-harness.md
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

- The accepted shape is reflected in scoped docs, workflow guidance,
  templates, generated text, and deterministic checks.
- Default focus presets and token/noise controls are explicit.
- Intent normalization to `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or
  `Spec` is documented as the step before context focus selection.
- No first-version API expansion is introduced.
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
- The work expands into public `EnvContext`, `--focus`, schema/config changes,
  activation behavior, control-theory research, downstream-specific
  assumptions, or delivery above `validated-local`.
- Credentials, paid APIs, production access, destructive operations, commit,
  push, review, integration, deploy, publish, release, daemons, watchers,
  network services, background sessions, or automations become necessary.
