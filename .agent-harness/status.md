# Project Status

## Focus

- Current focus: Current repository adapter paths now match the adapter
  template defaults and can serve as the reference example.

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
  required paths under `docs/specs`, `docs/goals`, and `docs/mental-model.md`.

## Blockers

- None recorded.
