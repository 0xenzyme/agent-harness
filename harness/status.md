# Project Status

## Focus

- Current focus: Automated task maintenance has been implemented as
  `agent-harness maintain tasks`. The command previews current git state,
  configured task/status paths, and recent run records without writing by
  default; `--record` writes a conservative maintenance snapshot and only
  applies exact completed-run task updates when the task index can be safely
  edited.

## Git

- Preferred work mode: local for foreground contract/documentation cleanup unless
  the user asks for an isolated worktree.
- Current branch: main
- Worktree notes: Work was done in the current checkout; no worktree, branch,
  push, PR, deploy, daemon, watcher, or Codex session launch was created.

## Verification

- Last checked: 2026-06-29
- Last commands:
  - Added `agent-harness maintain tasks [--record] [--json]`.
  - Added read-only maintenance preview from current git state, configured
    task/status paths, and recent run records.
  - Added explicit `--record` status snapshot writing and exact completed-run
    task completion for safe markdown task indexes.
  - Updated README, Chinese README, install docs, `harness:execute`,
    `harness-tasks`, `harness-run`, smoke tests, and the task goal/spec
    artifacts.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - `npm run validate:plugin`
  - `npm run test:smoke`
  - `node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-29-add-automated-task-maintenance-from-recent-git-diff-and-run-logs.md --json`
  - `node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd . --json`
  - `node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd . --record --json`
- Result: passed. Task maintenance CLI is implemented and verified. The
  worktree is dirty as expected with the implementation, docs, tests, spec,
  goal, task, and status updates from this run.

## Blockers

- None recorded.

## Maintenance Snapshot

- Generated: 2026-06-29T15:35:57.724Z
- Task index: `harness/tasks.md`
- Status file: `harness/status.md`
- Runs: `.harness/runs`
- Git: main...origin/main; ahead=11; behind=0; dirty=yes; changedPaths=12
- Ready tasks: 7
- In-progress tasks: 0
- Blocked tasks: 0
- Recent changed files:
  - README.md
  - README.zh-CN.md
  - docs/install.md
  - harness/status.md
  - harness/tasks.md
  - plugins/agent-harness/scripts/agent-harness.mjs
  - plugins/agent-harness/skills/execute/SKILL.md
  - plugins/agent-harness/skills/harness-run/SKILL.md
  - plugins/agent-harness/skills/harness-tasks/SKILL.md
  - tests/smoke.mjs
  - harness/goals/2026-06-29-add-automated-task-maintenance-from-recent-git-diff-and-run-logs.md
  - harness/specs/2026-06-29-automated-task-maintenance-design.md
- Recent runs:
  - .harness/runs/20260629-190656-idea-requirement-intake-flow (completed, goal=harness/goals/2026-06-29-idea-requirement-intake-flow.md, summary=Implemented intake idea preview and explicit record workflow.)
  - .harness/runs/20260629-185515-complete-goal-toolchain (completed, goal=harness/goals/2026-06-21-complete-goal-toolchain.md, summary=Implemented goal list/inspect/validate, run prepare validation gate, and run record.)
- Proposed sync actions:
  - update-status: Record maintenance snapshot in configured status file
- Record result: statusWritten=yes; taskIndexWritten=no
