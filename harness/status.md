# Project Status

## Focus

- Current focus: Harness directory naming and observe task protocol are aligned
  across plugin defaults, references, and the current project adapter.

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
  required paths under `harness/`, machine paths under `.harness/`, and
  `observe` task state semantics defined in harness references.

## Blockers

- None recorded.
