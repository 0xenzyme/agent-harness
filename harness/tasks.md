# Project Tasks

## Now

## Next

## Later

- [ ] P3 Revisit conditional Agent Harness bootstrap after hook validation support.
  - Source: Conditional bootstrap validation found that the current plugin
    validation gate rejects `hooks` in `.codex-plugin/plugin.json`; Agent
    Harness must remain hook-free until the plugin contract and runtime tests
    can prove non-harness projects receive no injected context.
  - Acceptance: If hook manifests become supported, add a conditional
    `SessionStart` bootstrap only with Codex App and Codex CLI runtime tests
    covering both harness and non-harness projects.

## Done

- [x] Remove legacy Agent Harness wrapper skills.
  - Completed: Deleted the artifact-oriented `harness-*` wrapper skill files
    so the installed plugin exposes only `harness:orient`, `harness:intake`,
    `harness:init`, and `harness:execute`.
  - Version: `0.3.0`
  - Verification: `git diff --check`, `npm run validate:plugin`,
    `npm run test:smoke`, `doctor`, and skill-file listing.
- [x] Complete Agent Harness maintenance batch.
  - Completed: Added `config validate` and
    `plugins/agent-harness/schemas/config.schema.json`; created `evals/`
    fixture blueprints for new-project, legacy-project, non-harness-project,
    and messy-realistic scenarios; added representative downstream project
    shape examples; documented Idea Inbox promotion and optional competition
    routing as Shape/control-lane contracts.
  - Source tasks: `P2 Design Agent Harness evaluation fixture suite`, `P2
    Define Idea Inbox Thread workflow support`, `P3 Explore optional
    competition skill for high-ambiguity harness shaping`, `P3 Add JSON schema
    validation for .harness/config.json`, and `P3 Add examples for
    representative downstream project shapes`.
  - Spec: `harness/specs/2026-06-30-agent-harness-maintenance-batch.md`
  - Goal: `harness/goals/2026-06-30-agent-harness-maintenance-batch.md`
  - Verification: `node --check`, `git diff --check`,
    `npm run validate:plugin`, `npm run test:smoke`, `config validate`,
    `doctor`, `goal validate`, and public-doc neutrality grep.
  - Deferred: Conditional bootstrap / hooks remains a separate Later task.
- [x] Add b3ehive-inspired design principles to Agent Harness contracts.
  - Completed: Added optional proposal competition, inspectable evidence
    trail, packaging discipline, project-neutral docs, and lightweight route
    explanation as explicit Agent Harness contract principles across core
    docs, plugin references, templates, workflow skills, public docs, and
    smoke guards.
  - Spec: `harness/specs/2026-06-30-b3ehive-inspired-design-principles-contracts.md`
  - Goal: `harness/goals/2026-06-30-add-b3ehive-inspired-design-principles-to-agent-harness-contracts.md`
  - Verification: `node --check`, `git diff --check`,
    `npm run validate:plugin`, `npm run test:smoke`, `doctor`, `goal
    validate`, and public-doc neutrality grep.
- [x] Add automated task maintenance from recent git diff and run logs.
  - Completed: Added `agent-harness maintain tasks` for deterministic task /
    status maintenance from configured harness paths, current git state, and
    recent run records. Preview is read-only by default; `--record` writes a
    conservative status snapshot and only moves exact completed-run markdown
    tasks to Done when safe.
  - Spec: `harness/specs/2026-06-29-automated-task-maintenance-design.md`
  - Goal: `harness/goals/2026-06-29-add-automated-task-maintenance-from-recent-git-diff-and-run-logs.md`
  - Verification: `node --check`, `git diff --check`,
    `npm run validate:plugin`, `npm run test:smoke`, `goal validate`, and
    `maintain tasks --json` / `maintain tasks --record --json`.
- [x] Implement Agent Harness workflow-controller skills.
  - Completed: Added short workflow skills `harness:orient`,
    `harness:intake`, `harness:execute`, and `harness:init`; renamed the
    installed plugin metadata to `harness`; converted legacy `harness-*`
    artifact skills to compatibility wrappers; updated README, Chinese README,
    install docs, marketplace metadata, smoke guards, and the skill
    architecture blueprint.
  - Note: The compatibility wrappers were later removed in `0.3.0` so the
    plugin exposes only the four workflow skills.
  - Spec: `harness/specs/2026-06-29-agent-harness-skill-architecture-blueprint.md`
  - Version: `0.2.0`
  - Verification: `quick_validate.py` for all plugin skills,
    `npm run validate:plugin`, `node --check`, `git diff --check`,
    external-methodology keyword guard, `npm run test:smoke`, and
    `doctor --lang zh-CN`.
- [x] Apply blueprint-driven versioning to the workflow-controller blueprint.
  - Completed: Treated the implemented workflow-controller skill blueprint as
    one pre-1.0 version unit and aligned `package.json` plus
    `plugins/agent-harness/.codex-plugin/plugin.json` at `0.2.0`.
  - Policy: `docs/versioning.md`
  - Verification: `npm run validate:plugin` and `npm run test:smoke`.
- [x] Redesign Agent Harness skills around workflow controllers.
  - Completed: Replaced the artifact-first skill architecture with a workflow
    model based on usage frequency and skill necessity. The implemented
    blueprint defines `orient`, `intake`, `execute`, and `init` as primary
    entries; leaves eval, maintain, and compete outside core V1; and records
    migration guidance for legacy skills.
  - Spec: `harness/specs/2026-06-29-agent-harness-skill-architecture-blueprint.md`
  - Verification: `quick_validate.py` for all plugin skills,
    `npm run validate:plugin`, and `npm run test:smoke`.
- [x] Review b3ehive as Agent Harness design reference.
  - Completed: Inspected `~/project/skills/b3ehive` docs, skill index, core
    concepts, blueprint model, execution pattern, gate rules, plugin packaging,
    and loop-control references. Captured which concepts should influence
    Agent Harness, which should not be copied, and what this implies for
    `harness-orient`, `harness-execute`, optional `harness-intake`, and
    non-skill adoption/eval/maintenance flows.
  - Review: `harness/specs/2026-06-29-b3ehive-design-reference-review.md`
  - Verification: `git diff --check`, `npm run validate:plugin`, and
    `npm run test:smoke`.
- [x] Organize eval and idea-inbox concepts.
  - Completed: Added the Idea Inbox Thread / Capture Thread model and the
    Evaluation Project Scenario to the user/scenario mental model and template.
    Recorded follow-up tasks for an evaluation fixture suite and inbox-thread
    workflow support.
  - Verification: `git diff --check`, `npm run validate:plugin`, and
    `npm run test:smoke`.
- [x] Remove project-local external methodology plugin naming residue.
  - Completed: Removed direct reference names, absolute local paths, and the
    old nested specs directory naming so Agent Harness does not appear to
    depend on an external methodology plugin. Historical specs now live
    directly under `harness/specs/`, and conditional bootstrap docs describe
    hook evidence as external reference evidence rather than a dependency.
  - Verification: external-methodology keyword search returned no matches,
    filename search returned no matches, `node --check`, `git diff --check`,
    `npm run validate:plugin`, `npm run test:smoke`, `goal validate`, and
    `doctor`.
- [x] Validate conditional Agent Harness bootstrap.
  - Completed: Validated an external hook-capable reference manifest and tested
    a temporary Agent Harness manifest with `hooks`. The current plugin
    validation gate rejects `hooks` in `.codex-plugin/plugin.json`, so do not
    add `SessionStart` bootstrap now; keep the Agent Harness plugin manifest
    hook-free so non-harness projects receive no injected harness context.
  - Spec: `harness/specs/2026-06-29-conditional-bootstrap-validation-design.md`
  - Goal: `harness/goals/2026-06-29-conditional-bootstrap-validation.md`
  - Verification: temporary hook-manifest validation failed as expected,
    external hook-manifest validation failed as expected, `node --check`, `git
    diff --check`, `npm run validate:plugin`, `npm run test:smoke`, `goal
    validate`, and `doctor`.
- [x] Add idea / requirement intake flow.
  - Completed: Added `agent-harness intake idea` for read-only idea /
    requirement preview and explicit `--record` append to supported markdown
    task indexes. The command classifies ideas, detects related tasks/artifacts,
    suggests title/priority/section/acceptance/spec need, refuses table-based
    writes safely, and never starts implementation.
  - Spec: `harness/specs/2026-06-29-idea-requirement-intake-flow-design.md`
  - Goal: `harness/goals/2026-06-29-idea-requirement-intake-flow.md`
  - Run: `.harness/runs/20260629-190656-idea-requirement-intake-flow/`
  - Verification: `node --check`, `git diff --check`,
    `npm run validate:plugin`, `npm run test:smoke`, `goal validate`,
    `run prepare`, `run record`, and intake preview.
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
  - Spec: `harness/specs/2026-06-21-smarter-worktree-recommendation-command-design.md`
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
