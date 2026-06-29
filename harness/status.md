# Project Status

## Focus

- Current focus: Activation snippet and read-only orientation / next-action
  workflow are implemented and verified. Next recommended P1 is completing the
  goal toolchain unless the user selects a different follow-up.

## Git

- Preferred work mode: local for foreground contract/documentation cleanup unless
  the user asks for an isolated worktree.
- Current branch: main
- Worktree notes: Work was done in the current checkout; no worktree, branch,
  push, PR, deploy, daemon, or Codex session launch was created.

## Verification

- Last checked: 2026-06-29
- Last commands:
  - `git diff --check`
  - `npm run validate:plugin`
  - `npm run test:smoke`
  - `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`
  - `node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd .`
- Result: passed. `agent-harness activation snippet` prints an `AGENTS.md`
  preview without writing files, and `agent-harness orient next` summarizes
  status/tasks with a recommended next action and confirmation check. Current
  project resolves as `contract: "adapter"` with required and optional harness
  paths present.

## Blockers

- None recorded.
