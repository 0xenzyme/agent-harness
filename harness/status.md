# Project Status

## Focus

- Current focus: Agent Harness version metadata is aligned at `0.4.0` in the
  local checkout after the Impeccable-inspired productization improvements.
  README, README.zh-CN, and `docs/versioning.md` now document the `0.4.0`
  version line for the capability matrix, stable `harness-rule:*` anchors, and
  suite-routing surface. Delivery remains local metadata/docs sync only; no
  publish, release, commit, push, review, or integration action was performed.

- Current focus: Impeccable-inspired Agent Harness productization improvements
  are implemented and accepted in the local checkout. The work added the
  project-neutral capability matrix `docs/HARNESSES.md`, stable
  `harness-rule:*` anchors, deterministic protocol validation, and lightweight
  suite routing through `npm run test:protocol` / `npm run test:all`. The
  current thread acted as `gate-only` controller; implementation and
  verification ran through the prepared DAG at
  `.harness/runs/20260701-235053-apply-impeccable-inspired-harness-productization-improvements/`.
  Delivery state remains local validation only; commit, push, review,
  integration, publish, and release are not authorized.

- Current focus: Stage completion coverage gate for parent roadmap stages is
  implemented in the local checkout. The fix adds `Stage Completion Map` support
  so a request such as `推进完成M5` is treated as whole-stage completion, and a
  parent stage cannot be closed after only `M5-S0` source-spec acceptance while
  `M5-D*` implementation items remain pending. Delivery state remains local;
  commit, push, review, integration, publish, and release are not authorized.

- Current focus: Agent Harness adapter migration ergonomics in the current
  checkout. The current thread was explicitly authorized as `mixed` for this
  local implementation/control pass after geocn adapter migration review.
  Implemented `orient next` task-state routing, `config import` path
  overrides, and controlled `goal create --allow-no-spec` support. Table-based
  task-index writeback remains deferred with a documented implementation
  boundary. The prior docs engineering audit also remains in the same local
  dirty checkout: spec
  `harness/specs/2026-07-01-docs-engineering-audit.md`, goal
  `harness/goals/2026-07-01-agent-harness-docs-engineering-audit.md`, and run
  `.harness/runs/20260701-120641-agent-harness-docs-engineering-audit/` have
  completed their DAG nodes, passed verification, and recorded completed run
  evidence. A follow-up added lightweight Chinese install and usage docs
  without creating a full Chinese contract mirror. Another follow-up decoupled
  integration-line wording from branch name `main`. Final delivery state
  remains local documentation changes; commit, push, review, integration,
  publish, and release are not authorized.

## Git

- Preferred work mode: local for foreground contract / CLI / documentation
  work unless the user asks for an isolated worktree.
- Current branch: main
- Worktree notes: Work is in the current checkout per user instruction; no
  additional worktree, branch, review request, deploy, daemon, watcher, or
  release action was created. `main` is the current execution branch for this
  repository, not a core Harness assumption about every project's integration
  line. Worker implementation was routed through the run DAG and accepted by
  the control lane after verification.

## Verification

- Last checked: 2026-07-02
- Last commands:
  - Updated Agent Harness version metadata from `0.3.0` to `0.4.0` in
    `package.json` and `plugins/agent-harness/.codex-plugin/plugin.json`.
  - Updated README, README.zh-CN, and `docs/versioning.md` so the documented
    current version matches the capability matrix, stable `harness-rule:*`
    anchors, and suite-routing work.
  - Version sync verification passed: direct version alignment check,
    `npm run test:protocol`, `npm run test:smoke`, `npm run validate:plugin`,
    and `git diff --check`.
  - Recorded the Impeccable-inspired productization task in
    `harness/tasks.md`.
  - Created and validated spec-less goal
    `harness/goals/2026-07-01-apply-impeccable-inspired-harness-productization-improvements.md`.
  - Prepared run packet
    `.harness/runs/20260701-235053-apply-impeccable-inspired-harness-productization-improvements/`
    with execution role `gate-only`, default worker surface
    `codex-cli-subagent`, and target delivery state `validated-local`.
  - Recorded completed DAG nodes: `explorer`, `worker`, and `verification`.
  - Added `docs/HARNESSES.md` as a project-neutral capability matrix for
    runtime/control surfaces, defaults, boundaries, applicability, and
    suite-routing expectations.
  - Added stable `harness-rule:*` anchors for gate-only controller behavior,
    local delivery ceilings, default worker surface, project-neutral core
    content, and state-sync evidence.
  - Added deterministic protocol validation with
    `scripts/test-suites.mjs`, `npm run test:protocol`, `npm run test:all`, and
    smoke checks for rule anchors and matrix links.
  - Linked the capability matrix and suite-routing guidance from README,
    README.zh-CN, install docs, CLI docs, and project-contract docs.
  - Verification passed: `node --check scripts/test-suites.mjs`,
    `node --check tests/smoke.mjs`,
    `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `npm run test:protocol`, `npm run test:smoke`, `npm run test:all`,
    `npm run validate:plugin`, `git diff --check`, `goal validate`, and
    `run status --json`.
  - Recorded completed run log
    `.harness/runs/20260701-235053-apply-impeccable-inspired-harness-productization-improvements/logs/20260702-001312-completed.md`
    with delivery state `validated-local`.
  - Implemented `Stage Completion Map` parsing and validation in
    `plugins/agent-harness/scripts/agent-harness.mjs`.
  - Updated `goal create --spec` to generate pending stage map items from a
    referenced spec's `Implementation Phasing` headings such as `M5-S0` and
    `M5-D1`.
  - Updated `run prepare`, `run status --json`, and
    `run record --phase completed` so parent-stage runs carry and enforce stage
    completion evidence.
  - Updated stage-completion protocol docs in `docs/project-contract.md`,
    `plugins/agent-harness/skills/execute/SKILL.md`, execute references,
    `plugins/agent-harness/references/gate-results.md`, and goal/spec
    templates.
  - Added smoke coverage for missing, pending, and satisfied
    `Stage Completion Map` cases.
  - Verified the wiki regression: local
    `agent-harness goal validate --cwd /Users/liuyj/project/wiki --goal docs/harness/goals/2026-07-01-m5-diagnosis-actions-briefs-reports.md`
    now fails with `Stage completion goals require a Stage Completion Map`.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `node --check tests/smoke.mjs`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `git diff --check`
  - Switched/confirmed branch `main`; branch is up to date with `origin/main`.
  - Recorded the docs engineering task in `harness/tasks.md`.
  - Created accepted spec
    `harness/specs/2026-07-01-docs-engineering-audit.md`.
  - Created and validated goal
    `harness/goals/2026-07-01-agent-harness-docs-engineering-audit.md`.
  - Prepared run packet
    `.harness/runs/20260701-120641-agent-harness-docs-engineering-audit/`;
    ready node is `explorer`, default worker surface is
    `codex-cli-subagent`.
  - Recorded completed DAG nodes: `explorer`, `cli-contract-worker`,
    `docs-skill-worker`, and `verification`.
  - Updated README files, CLI docs, install docs, project contract docs,
    execute skill docs, plugin references, and the goal template for current
    workflow-controller, delivery-state, subagent, and acceptance-gate
    behavior.
  - Updated goal/spec checklist and required gate evidence to `satisfied`.
  - Verification passed: `git diff --check`, `npm run test:smoke`,
    `npm run validate:plugin`, `goal validate`, and `run status --json`.
  - `npm run test:eval` skipped because eval docs and fixtures were not
    changed.
  - Recorded completed run log
    `.harness/runs/20260701-120641-agent-harness-docs-engineering-audit/logs/20260701-122720-completed.md`
    with delivery state `validated-local`.
  - Added `docs/install.zh-CN.md` and linked it from `README.zh-CN.md` and
    `docs/cli.zh-CN.md`.
  - Verified the Chinese docs follow-up with `git diff --check`,
    `npm run test:smoke`, and `npm run validate:plugin`.
  - Replaced branch-bound integration wording with `target integration line` /
    `complete on the integration line`.
  - Clarified in `docs/project-contract.md`, the goal template, generated goal
    content, task-routing reference, execute skill docs, and Chinese install
    guide that Harness core does not assume the integration line is named
    `main`; branch choices belong to the adapter, confirmed goal, or explicit
    user instruction.
  - Verified the branch-adaptability follow-up with
    `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `git diff --check`, `npm run test:smoke`, and
    `npm run validate:plugin`.
  - Implemented geocn adapter migration ergonomics: `orient next` now avoids
    unusable goal creation recommendations for P0/P1 missing-spec tasks,
    `config import` accepts adapter path overrides and exposes
    `proposedConfig` in `--dry-run --json`, and adapter spec-less goal creation
    is available only through explicit `--allow-no-spec`.
  - Added validation for spec-less goals so they still require Scope,
    Non-Goals, Verification, Completion Conditions, Pause Conditions,
    Execution Role, and Delivery State. Run packets and prompts no longer ask
    workers to read a `TBD` spec for explicit spec-less goals.
  - Documented table-based `maintain tasks --record` task-index writeback as
    deferred until row matching is uniquely by task title, a recognized
    `Status` column, and a bounded status transition.
  - Verified the geocn migration ergonomics follow-up with
    `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `node --check tests/smoke.mjs`, `npm run test:smoke`,
    `git diff --check`, `npm run validate:plugin`, and
    `config validate --json`.
  - Changed generated/manual goal Delivery State defaults from
    `validated-local` to `integrated` with `Delivery intent:
    integrate-after-gates`, commit/push/integration authorized, review
    optional, and release unauthorized.
  - Replaced provider-specific delivery vocabulary with `review-open` and
    `integrated`; kept `PR-open`, `--pr-url`, `Merge authorized`, and
    `--merge-sha` as compatibility aliases.
  - Removed default Non-Goals / Pause Conditions that treated push / review /
    integration as inherently user-blocking; delivery now pauses only when a
    step exceeds the active Delivery State policy.
  - Updated generated run packets, prompts, run record logs/status output,
    `harness:execute`, project contract docs, CLI docs, README files, goal
    template, and smoke tests for provider-neutral delivery.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `node --check tests/smoke.mjs`
  - `npm run test:smoke`
  - `git diff --check`
  - `npm run validate:plugin`
  - Added `Conversation Route`, `Execution Context Lock`, and `Delivery State`
    protocol fields to generated/manual goals, run packets, prompts, status,
    and run record logs.
  - Added `goal validate` checks for `worktree` goals that omit route/lock
    proof or mis-declare remote-control worktree execution.
  - Added delivery-state snapshots to `run prepare`, `run status`, and
    `run record`, including dirty working tree, commit, push, PR, merge, and
    release fields.
  - Added delivery target policy validation: targets above `validated-local`
    require matching authorization, and completed run records fail when actual
    delivery state is below target.
  - Added `--pr-url`, `--merge-sha`, and `--release-ref` evidence fields for
    PR / merge / release delivery states that Git status alone cannot infer.
  - Changed execution DAG worker-surface policy to default to
    `codex-cli-subagent`; new Codex threads are explicit visible handoff lanes,
    not default workers.
  - Added gate-only DAG/run guidance so clear implementation work dispatches to
    worker subagents rather than asking the user whether to switch the control
    thread to `mixed`.
  - Updated `harness:execute`, execution-role guidance, controller packets,
    task routing, project contract docs, CLI docs, templates, and smoke tests.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `npm run test:smoke`
  - `git diff --check`
  - `npm run validate:plugin`
  - Added `evals/skills/agent-harness/trigger_cases.yaml` with 36 activation
    cases: 20 positive, 10 negative, and 6 boundary.
  - Added `evals/skills/agent-harness/task_cases.yaml` with four deterministic
    task cases for new, legacy, non-harness, and messy-realistic project
    shapes.
  - Added `evals/skills/agent-harness/transcript_rubric.md`,
    `evals/run-agent-harness-eval.mjs`, `evals/results/index.md`, and
    `npm run test:eval`.
  - Updated `evals/README.md` with the repeatable skill eval workflow.
  - `node --check evals/run-agent-harness-eval.mjs`
  - `npm run test:eval`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `git diff --check`
  - `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .`
  - Created `harness/specs/2026-06-30-complete-open-task-batch.md`.
  - Created `harness/goals/2026-06-30-complete-open-task-batch.md`.
  - Prepared run packet
    `.harness/runs/20260630-160325-complete-open-task-batch/`.
  - Added `Execution Role` validation to `goal validate`.
  - Propagated execution role into `run.md`, `prompt.md`, and `status.json`.
  - Updated `run record` so completed records require `--verification` and
    completed `gate-only` records require `--gate-evidence`.
  - Added smoke coverage for execution role validation, missing verification,
    `gate-only` gate evidence, bilingual fallback metadata, packaging
    boundary docs, and agent-neutral delegation docs.
  - Updated README files, install docs, project contract docs, plugin
    references, workflow skills, plugin metadata, and the goal template.
  - Rechecked conditional bootstrap with a temporary hook manifest; validation
    still rejects `plugin.json` field `hooks`.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-complete-open-task-batch.md`
  - `node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd . --run .harness/runs/20260630-160325-complete-open-task-batch --phase completed ...`
  - Created
    `harness/specs/2026-06-30-source-task-acceptance-coverage-gate.md`.
  - Created
    `harness/goals/2026-06-30-source-task-acceptance-coverage-gate.md`.
  - Added `Source Task Acceptance Map` parsing and validation.
  - `goal validate` now rejects batch goals without an acceptance map or with
    malformed map items.
  - `run prepare` records acceptance-map metadata in run `status.json`.
  - `run record --phase completed` now rejects batch runs unless every mapped
    item is `satisfied` with concrete evidence.
  - Added smoke coverage for missing, pending, and satisfied acceptance maps.
  - Added the blocked README CLI relocation follow-up back to `harness/tasks.md`.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-source-task-acceptance-coverage-gate.md`
  - `node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd . --run .harness/runs/20260630-162929-source-task-acceptance-coverage-gate --phase completed ...`
  - Created
    `harness/specs/2026-06-30-root-readme-cli-relocation.md`.
  - Created
    `harness/goals/2026-06-30-root-readme-cli-relocation.md`.
  - Prepared run packet
    `.harness/runs/20260630-163748-root-readme-cli-relocation/`.
  - Added `docs/cli.md` and `docs/cli.zh-CN.md`.
  - Removed detailed `agent-harness` CLI command catalog content from
    `README.md` and `README.zh-CN.md`.
  - Updated smoke coverage so root README files must link to `docs/cli*` and
    must not contain the detailed CLI command catalog.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-root-readme-cli-relocation.md`
  - `node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd . --run .harness/runs/20260630-163748-root-readme-cli-relocation --phase completed ...`
  - Created
    `harness/specs/2026-06-30-master-acceptance-and-adapter-gates.md`.
  - Created
    `harness/goals/2026-06-30-master-acceptance-and-adapter-gates.md`.
  - Prepared run packet
    `.harness/runs/20260630-171105-master-acceptance-and-adapter-gates/`.
  - Added config schema and adapter template support for
    `gates.requiredForCompletion` and `gates.blocking`.
  - Added `Spec Acceptance Checklist` and `Required Gate Evidence` parsing,
    goal validation metadata, run metadata, and completed-run blocking checks.
  - Updated `harness:execute`, project contract docs, gate/controller
    references, spec/goal templates, and smoke tests.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-master-acceptance-and-adapter-gates.md`
  - `node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd . --run .harness/runs/20260630-171105-master-acceptance-and-adapter-gates --phase completed ...`
  - Added execution DAG generation to `run prepare`: `dag.json`, `dag.md`, and
    per-node `agents/<node>/prompt.md` / `status.json` artifacts.
  - Added `run node record` with dependency-order checks, required verification
    for completed nodes, worker thread/surface metadata, and run-level
    ready-node updates.
  - Updated `run status --json` to expose execution DAG readiness and updated
    completed-run gating so enforced DAG runs require all nodes to complete.
  - Documented fresh Codex thread / Codex CLI subagent preference, fork as an
    explicit exception, and controller-gated parallel ready-node execution.
  - Added smoke coverage for large-run DAG artifacts, dependency refusal,
    parallel worker release, verification release, and completed-run gating.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `node --check tests/smoke.mjs`
  - `npm run test:smoke`
  - `git diff --check`
  - `npm run validate:plugin`
- Result: passed. Latest eval harness work was validated through eval,
  smoke/plugin, diff, syntax, and doctor checks without creating a new run
  packet. Prior run evidence remains completed at
  `.harness/runs/20260630-171105-master-acceptance-and-adapter-gates/`.

## Blockers

- None recorded.
