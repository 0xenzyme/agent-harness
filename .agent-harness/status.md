# Project Status

## Focus

- Current focus: Adapter contract terminology cleanup and current-project
  adapter setup completed.

## Git

- Preferred work mode: local for foreground contract/documentation cleanup unless
  the user asks for an isolated worktree.
- Current branch: main
- Worktree notes: Work was done in the current checkout; no worktree, branch,
  push, PR, deploy, daemon, or Codex session launch was created.

## Verification

- Last checked: 2026-06-29
- Last commands:
  - `npm run validate:plugin`
  - `npm run test:smoke`
  - `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`
- Result: passed. Current project resolves as `contract: "adapter"` with
  required and optional harness paths present.

## Blockers

- None recorded.
