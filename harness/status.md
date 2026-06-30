# Project Status

## Focus

- Current focus: Root README CLI relocation is complete from
  `harness/goals/2026-06-30-root-readme-cli-relocation.md`. Detailed CLI
  command examples now live in `docs/cli.md` and `docs/cli.zh-CN.md`; root
  README files keep only short references and remain coding-agent-first.

## Git

- Preferred work mode: local for foreground contract / CLI / documentation
  work unless the user asks for an isolated worktree.
- Current branch: main
- Worktree notes: Work was done in the current checkout; no worktree, branch,
  push, PR, deploy, daemon, watcher, or Codex session launch was created.

## Verification

- Last checked: 2026-06-30
- Last commands:
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
- Result: passed. Run evidence is completed at
  `.harness/runs/20260630-163748-root-readme-cli-relocation/`.

## Blockers

- None recorded.
