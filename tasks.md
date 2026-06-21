# Project Tasks

## Now

- [ ] P1 Test Agent Harness on one real downstream project
  - Source: Current loop engineering discussion
  - Acceptance: `tasks.md`, `.agent-harness/config.json`, and `.agent-harness/status.md` are created in the target project without overwriting existing project context.
  - Notes: Start with report-only mode; do not auto-fix or auto-branch yet.

## Next

- [ ] P1 Add a goal file generator command
  - Source: Need controlled `/goal` handoffs.
  - Acceptance: CLI can create `.agent-harness/goals/YYYY-MM-DD-<slug>.md` from a selected task.
- [ ] P1 Add a smarter worktree recommendation command
  - Source: Codex branch/worktree behavior should be explicit and contextual.
  - Acceptance: CLI reports `local`, `worktree`, or `ask` with reasons from git status and config.
- [ ] P2 Add an install guide for other machines
  - Source: Project must be shareable and reusable.
  - Acceptance: README documents `codex plugin marketplace add <repo>` path after the repo is published.

## Later

- [ ] P2 Add automated task maintenance from recent git diff and run logs.
- [ ] P3 Add JSON schema validation for `.agent-harness/config.json`.
- [ ] P3 Add examples for `wiki`, `agentlaunch`, and `dailymemorygame` style projects.

## Done

- [x] Scaffold local marketplace-backed Codex plugin
- [x] Initialize Agent Harness
