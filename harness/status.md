# Project Status

## Focus

- Current focus: Agent Harness maintenance batch is implemented. The batch
  added config schema validation, evaluation fixture blueprints,
  representative downstream project shape examples, Idea Inbox promotion rules,
  and optional competition routing contracts.

## Git

- Preferred work mode: local for foreground contract / CLI / documentation
  work unless the user asks for an isolated worktree.
- Current branch: main
- Worktree notes: Work was done in the current checkout; no worktree, branch,
  push, PR, deploy, daemon, watcher, or Codex session launch was created.
  The conditional bootstrap / hooks todo was intentionally left out of scope.

## Verification

- Last checked: 2026-06-30
- Last commands:
  - Added `agent-harness config validate` and
    `plugins/agent-harness/schemas/config.schema.json`.
  - Added `evals/` fixture blueprints and
    `docs/examples/downstream-project-shapes.md`.
  - Updated project contracts, public docs, references, templates, and skills
    for Idea Inbox promotion and optional competition routing.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - `npm run validate:plugin`
  - `npm run test:smoke`
  - `node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd . --json`
  - `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .`
  - `node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-agent-harness-maintenance-batch.md --json`
  - `rg -n "b3ehive|~/project|/Users/" README.md README.zh-CN.md docs plugins/agent-harness evals`
- Result: passed. The neutrality grep returned no matches in public docs,
  plugin files, or evaluation docs.

## Blockers

- None recorded.
