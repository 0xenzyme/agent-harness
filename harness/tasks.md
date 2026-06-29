# Project Tasks

## Now

## Next

- [ ] P2 Add idea / requirement intake flow.
  - Source: User identified that new ideas or requirements should enter the
    harness as intake before implementation, but this does not need to be part
    of the current activation / next-action implementation.
  - Acceptance: When the user brings a new idea, Codex can compare it with
    current tasks/specs/goals/deferred work, classify it, draft a candidate
    task or spec path, and ask before modifying the task index.
- [ ] P2 Validate conditional Agent Harness bootstrap.
  - Source: Conditional plugin bootstrap would make harness activation
    automatic for opted-in projects, but session-start hook behavior has a
    broader blast radius than the activation snippet and needs separate
    validation.
  - Acceptance: Decide and test whether the plugin can add a lightweight
    SessionStart bootstrap that only activates when `.harness/config.json`
    exists in the current project, and verify it does not affect non-harness
    projects in Codex App or Codex CLI.
- [ ] P2 Redesign Agent Harness skills around workflow controllers.
  - Source: Current skills are split by artifact (`init`, `adapter`, `tasks`,
    `goal`, `run`), but the harness mental model now centers user workflows:
    adopt, orient, and execute.
  - Acceptance: Produce a blueprint for a smaller skill architecture, likely
    `harness-adopt`, `harness-orient`, and `harness-execute`, with migration /
    compatibility guidance for existing skills.
  - Notes: Keep this separate from the current activation / next-action spec
    unless implementation directly requires skill changes.
- [ ] P2 Add automated task maintenance from recent git diff and run logs.

## Later

- [ ] P3 Add JSON schema validation for `.harness/config.json`.
- [ ] P3 Add examples for representative downstream project shapes.

## Done

- [x] Complete the goal toolchain
  - Completed: Added `goal list`, `goal inspect`, `goal validate`, and
    `run record`; `run prepare` now validates goal handoffs before writing a
    run packet. Goal validation checks confirmed repo-local specs, required
    sections, valid work mode, verification/manual evidence, and pause
    coverage. Run recording updates only the target run directory.
  - Spec: `harness/specs/2026-06-21-complete-goal-toolchain-design.md`
  - Goal: `harness/goals/2026-06-21-complete-goal-toolchain.md`
  - Run: `.harness/runs/20260629-185515-complete-goal-toolchain/`
  - Verification: `git diff --check`, `npm run validate:plugin`,
    `npm run test:smoke`, `goal list`, `goal inspect`, `goal validate`,
    `run prepare`, `run status`, and `run record`.
- [x] Define Agent Harness activation and next-action workflow.
  - Completed: Added `agent-harness activation snippet` for non-mutating
    `AGENTS.md` activation previews and `agent-harness orient next` for
    read-only task/status summaries, next-action recommendations, and
    confirmation-check output. Updated README files, mental model, skills,
    templates, and smoke coverage to match the workflow.
  - Spec: `harness/specs/2026-06-29-agent-harness-activation-and-next-action-design.md`
  - Goal: `harness/goals/2026-06-29-agent-harness-activation-and-next-action.md`
  - Deferred: Conditional plugin bootstrap is recorded as `P2 Validate
    conditional Agent Harness bootstrap`; idea / requirement intake and skill
    architecture redesign remain separate follow-ups.
  - Verification: `git diff --check`, `npm run validate:plugin`,
    `npm run test:smoke`, and
    `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`.
- [x] Clarify harness mental model
  - Completed: The current project now has four top-level mental models:
    User / Scenario, Work Unit, Control Loop / Handoff, and Ownership /
    Boundary. User / Scenario is expanded as a first-use adoption model for
    new-project initialization, existing-project migration, and explicit
    activation. It now distinguishes project-scope activation, plugin-scope
    bootstrap, and conditional bootstrap, and defines post-activation usage
    including human / agent / harness responsibility boundaries, development
    progression modes, read-only orientation / next-action recommendations, and
    new idea / requirement intake. The other models are established as
    skeletons. Adapter initialization and import now create the model index plus
    all four model files from plugin templates.
  - Verification: `npm run validate:plugin`, `npm run test:smoke`, and
    `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`.
- [x] Unify harness directory layout and define observe tasks
  - Completed: Default human-facing harness artifacts now live under
    `harness/`, machine config and run packets live under `.harness/`, and
    `observe` task kind/state semantics are defined in harness references.
  - Verification: `npm run validate:plugin`, `npm run test:smoke`, and
    `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`.
- [x] Align harness repository with adapter directory defaults
  - Completed: Current project specs, goals, and mental model now use the
    adapter template paths: `harness/specs/`, `harness/goals/`, and
    `harness/mental-models/README.md`.
  - Verification: `npm run validate:plugin`, `npm run test:smoke`, and
    `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`.
- [x] Normalize harness contract terminology and apply adapter contract
  - Completed: Public docs, skills, references, templates, CLI help, tests, and
    current project config now use `fixed` and `adapter` contract terminology.
  - Spec: `harness/specs/2026-06-29-agent-harness-adapter-contract-design.md`
  - Goal: `harness/goals/2026-06-29-agent-harness-adapter-contract.md`
  - Adapter: `harness/README.md`
  - Verification: `npm run validate:plugin`, `npm run test:smoke`, and
    `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN`.
- [x] Add a smarter worktree recommendation command
  - Completed: `agent-harness worktree recommend` reports `local`, `worktree`, or `ask` with git/config reasons and optional `--json` output.
  - Spec: `harness/specs/superpowers/2026-06-21-smarter-worktree-recommendation-command-design.md`
  - Goal: `harness/goals/2026-06-21-add-a-smarter-worktree-recommendation-command.md`
  - Run: `.harness/runs/20260621-215607-add-a-smarter-worktree-recommendation-command/`
  - Verification: `npm run validate:plugin`, current-repo recommend/doctor checks, and temporary-project checks for `local`, `worktree`, `ask`, non-git, and invalid config.
- [x] Test Agent Harness on one real downstream project
  - Completed: report-only init test used a local downstream project; first `doctor` showed all harness files missing, `init` created only the configured task index, machine config, status file, and harness directories.
  - Verification: repeated `init` reported no file changes and hashes for the three generated files stayed unchanged, confirming no overwrite behavior.
- [x] Add language-aware command output
  - Completed: CLI user-facing output for `init`, `doctor`, and help/usage supports `en` and `zh-CN` through `--lang`, `AGENT_HARNESS_LANG`, optional `language.default`, system locale, and fallback `en`.
  - Goal: `harness/goals/2026-06-21-language-aware-command-output.md`
  - Run: `.harness/runs/20260621-200856-language-aware-command-output/`
- [x] Add run workflow and subagent task splits
  - Completed: `agent-harness run prepare` creates `.harness/runs/<timestamp>-<slug>/` packets with `run.md`, `prompt.md`, `subagents.md`, `status.json`, and `logs/`.
  - Goal: `harness/goals/2026-06-21-harness-run-subagent-workflow.md`
- [x] Add a goal file generator command
  - Completed: `agent-harness goal create --task <title-or-id>` can generate goal handoffs; `--dry-run` previews without writing.
- [x] Scaffold local marketplace-backed Codex plugin
- [x] Initialize Agent Harness
- [x] Add an install guide for other machines
