# Project Status

## Focus

- Current focus: Legacy Agent Harness wrapper skills have been removed. The
  installed plugin now exposes only the four workflow skills: `harness:orient`,
  `harness:intake`, `harness:init`, and `harness:execute`.

## Git

- Preferred work mode: local for foreground contract / CLI / documentation
  work unless the user asks for an isolated worktree.
- Current branch: main
- Worktree notes: Work was done in the current checkout; no worktree, branch,
  push, PR, deploy, daemon, watcher, or Codex session launch was created.

## Verification

- Last checked: 2026-06-30
- Last commands:
  - Deleted legacy wrapper skill files under `plugins/agent-harness/skills/`.
  - Kept only `execute`, `init`, `intake`, and `orient` workflow skills.
  - Bumped `package.json` and plugin manifest to `0.3.0`.
  - `git diff --check`
  - `npm run validate:plugin`
  - `npm run test:smoke`
  - `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .`
  - `find plugins/agent-harness/skills -maxdepth 2 -type f -name SKILL.md`
- Result: passed. The plugin now ships four skill files:
  `execute`, `init`, `intake`, and `orient`.

## Blockers

- None recorded.
