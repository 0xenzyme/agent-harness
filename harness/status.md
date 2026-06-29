# Project Status

## Focus

- Current focus: Workflow-controller skill architecture has been implemented
  and verified for `0.2.0`. The installed plugin metadata now exposes
  `harness`, with primary skills `harness:orient`, `harness:intake`,
  `harness:execute`, and `harness:init`. Legacy `harness-*` skills remain as
  compatibility wrappers.

## Git

- Preferred work mode: local for foreground contract/documentation cleanup unless
  the user asks for an isolated worktree.
- Current branch: main
- Worktree notes: Work was done in the current checkout; no worktree, branch,
  push, PR, deploy, daemon, or Codex session launch was created.

## Verification

- Last checked: 2026-06-29
- Last commands:
  - Implemented short workflow skills:
    `plugins/agent-harness/skills/orient/SKILL.md`,
    `plugins/agent-harness/skills/intake/SKILL.md`,
    `plugins/agent-harness/skills/execute/SKILL.md`, and
    `plugins/agent-harness/skills/init/SKILL.md`
  - Converted legacy skills to compatibility wrappers:
    `harness-init`, `harness-adapter`, `harness-tasks`, `harness-goal`, and
    `harness-run`
  - Renamed installed plugin metadata from `agent-harness` to `harness`
  - Bumped `package.json` and
    `plugins/agent-harness/.codex-plugin/plugin.json` to `0.2.0`
  - Updated README, Chinese README, install docs, marketplace metadata, and
    smoke guards
  - Marked skill architecture blueprint as implemented:
    `harness/specs/2026-06-29-agent-harness-skill-architecture-blueprint.md`
  - `quick_validate.py` for all plugin skills
  - `npm run validate:plugin`
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - External-methodology keyword search returned no matches
  - `npm run test:smoke`
  - `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`
- Result: passed. Workflow-controller skills are implemented and verified.
  The worktree is dirty as expected because the current control thread has
  accumulated this implementation plus earlier uncommitted harness changes.

## Blockers

- None recorded.
