# Project Tasks

## Now

- [ ] P1 Complete the goal toolchain
  - Source: User identified that the loop engineering skeleton exists, but goal-related tooling is still insufficient.
  - Acceptance: CLI and skills cover goal generation from a confirmed spec, goal listing/inspection/validation, run preparation, and recording execution outcomes with deterministic state updates.
  - Spec: `docs/specs/2026-06-21-complete-goal-toolchain-design.md`
  - Goal: `docs/goals/2026-06-21-complete-goal-toolchain.md`
  - Notes: Do not add auto Codex session launch, daemons, push/PR/deploy, or downstream-repo-specific assumptions.

## Next

- [ ] P2 Add automated task maintenance from recent git diff and run logs.

## Later

- [ ] P3 Add JSON schema validation for `.agent-harness/config.json`.
- [ ] P3 Add examples for representative downstream project shapes.

## Done

- [x] Align harness repository with adapter directory defaults
  - Completed: Current project specs, goals, and mental model now use the
    adapter template paths: `docs/specs/`, `docs/goals/`, and
    `docs/mental-model.md`.
  - Verification: `npm run validate:plugin`, `npm run test:smoke`, and
    `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`.
- [x] Normalize harness contract terminology and apply adapter contract
  - Completed: Public docs, skills, references, templates, CLI help, tests, and
    current project config now use `fixed` and `adapter` contract terminology.
  - Spec: `docs/specs/2026-06-29-agent-harness-adapter-contract-design.md`
  - Goal: `docs/goals/2026-06-29-agent-harness-adapter-contract.md`
  - Adapter: `docs/harness/README.md`
  - Verification: `npm run validate:plugin`, `npm run test:smoke`, and
    `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`.
- [x] Add a smarter worktree recommendation command
  - Completed: `agent-harness worktree recommend` reports `local`, `worktree`, or `ask` with git/config reasons and optional `--json` output.
  - Spec: `docs/superpowers/specs/2026-06-21-smarter-worktree-recommendation-command-design.md`
  - Goal: `docs/goals/2026-06-21-add-a-smarter-worktree-recommendation-command.md`
  - Run: `.agent-harness/runs/20260621-215607-add-a-smarter-worktree-recommendation-command/`
  - Verification: `npm run validate:plugin`, current-repo recommend/doctor checks, and temporary-project checks for `local`, `worktree`, `ask`, non-git, and invalid config.
- [x] Test Agent Harness on one real downstream project
  - Completed: report-only init test used a local downstream project; first `doctor` showed all harness files missing, `init` created only `tasks.md`, `.agent-harness/config.json`, `.agent-harness/status.md`, and harness directories.
  - Verification: repeated `init` reported no file changes and hashes for the three generated files stayed unchanged, confirming no overwrite behavior.
- [x] Add language-aware command output
  - Completed: CLI user-facing output for `init`, `doctor`, and help/usage supports `en` and `zh-CN` through `--lang`, `AGENT_HARNESS_LANG`, optional `language.default`, system locale, and fallback `en`.
  - Goal: `docs/goals/2026-06-21-language-aware-command-output.md`
  - Run: `.agent-harness/runs/20260621-200856-language-aware-command-output/`
- [x] Add run workflow and subagent task splits
  - Completed: `agent-harness run prepare` creates `.agent-harness/runs/<timestamp>-<slug>/` packets with `run.md`, `prompt.md`, `subagents.md`, `status.json`, and `logs/`.
  - Goal: `docs/goals/2026-06-21-harness-run-subagent-workflow.md`
- [x] Add a goal file generator command
  - Completed: `agent-harness goal create --task <title-or-id>` can generate goal handoffs; `--dry-run` previews without writing.
- [x] Scaffold local marketplace-backed Codex plugin
- [x] Initialize Agent Harness
- [x] Add an install guide for other machines
