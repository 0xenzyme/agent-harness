# Project Tasks

## Now

- [ ] P1 Test Agent Harness on one real downstream project
  - Source: Current loop engineering discussion
  - Acceptance: `tasks.md`, `.agent-harness/config.json`, and `.agent-harness/status.md` are created in the target project without overwriting existing project context.
  - Notes: Start with report-only mode; do not auto-fix or auto-branch yet.

## Next

- [ ] P1 Add a smarter worktree recommendation command
  - Source: Codex branch/worktree behavior should be explicit and contextual.
  - Acceptance: CLI reports `local`, `worktree`, or `ask` with reasons from git status and config.

## Later

- [ ] P2 Add automated task maintenance from recent git diff and run logs.
- [ ] P3 Add JSON schema validation for `.agent-harness/config.json`.
- [ ] P3 Add examples for `wiki`, `agentlaunch`, and `dailymemorygame` style projects.

## Done

- [x] Add language-aware command output
  - Completed: CLI user-facing output for `init`, `doctor`, and help/usage supports `en` and `zh-CN` through `--lang`, `AGENT_HARNESS_LANG`, optional `language.default`, system locale, and fallback `en`.
  - Goal: `.agent-harness/goals/2026-06-21-language-aware-command-output.md`
  - Run: `.agent-harness/runs/20260621-200856-language-aware-command-output/`
- [x] Add run workflow and subagent task splits
  - Completed: `agent-harness run prepare` creates `.agent-harness/runs/<timestamp>-<slug>/` packets with `run.md`, `prompt.md`, `subagents.md`, `status.json`, and `logs/`.
  - Goal: `.agent-harness/goals/2026-06-21-harness-run-subagent-workflow.md`
- [x] Add a goal file generator command
  - Completed: `agent-harness goal create --task <title-or-id>` can generate goal handoffs; `--dry-run` previews without writing.
- [x] Scaffold local marketplace-backed Codex plugin
- [x] Initialize Agent Harness
- [x] Add an install guide for other machines
