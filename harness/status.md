# Project Status

## Focus

- Current focus: Conversation routing / execution context lock and
  delivery-target gates are implemented from the M2 GEO App repair defect
  reports. Worktree goals now require route/lock proof, run packets record
  conversation lane and execution cwd/branch, and completed run closeout must
  reach the goal's target delivery state instead of stopping in a passing dirty
  worktree.

## Git

- Preferred work mode: local for foreground contract / CLI / documentation
  work unless the user asks for an isolated worktree.
- Current branch: codex/harden-harness-skills
- Worktree notes: Work was done in the current checkout; no worktree, branch,
  push, PR, deploy, daemon, watcher, or Codex session launch was created.

## Verification

- Last checked: 2026-07-01
- Last commands:
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
