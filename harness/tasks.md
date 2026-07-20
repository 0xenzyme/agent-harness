# Project Goals

## Now

## Next

## Later

## Done

- [x] P0 Fix bounded artifact lifecycle and retention.
  - Type: development/docs
  - Status: done (`validated-local`)
  - Spec: `harness/specs/2026-07-20-bounded-artifact-lifecycle-and-retention.md`
  - Goal: `harness/goals/2026-07-20-fix-bounded-artifact-lifecycle-and-retention.md`
  - Source: Current user direction to keep this thread as controller and fix
    the reviewed long-running Harness artifact accumulation problems.
  - Run: `.harness/runs/20260720-105524-fix-bounded-artifact-lifecycle-and-retention`
  - Acceptance: Implement the project-neutral lifecycle contract and
    deterministic CLI, validate plugin compatibility, and dogfood bounded
    task/status/Run policy without deleting Runs.
  - Verification: Syntax checks, `test:all`, deterministic eval, plugin
    validation, four skill validators, config/Goal validation, lifecycle
    previews, and `git diff --check` passed.
  - Delivery: `validated-local`; local commit and plugin-cache refresh are
    authorized and pending. Push, review, integration, Git tag, GitHub Release,
    remote publish, production access, paid API, and Run deletion remain out of
    scope.

- [x] P0 Integrate Agent Harness with Codex-native Goal and Plan execution.
  - Completed: Added three explicit execution paths: Codex-only direct work,
    Codex execution with bounded postflight state sync, and durable Harness
    Goal/Run control.
  - Completed: Long-running controller work now establishes or reuses a Codex
    runtime Goal and uses Codex Plan; controller means outcome owner, while
    only explicit review-only or `gate-only` direction forbids implementation.
  - Completed: Scoped adapter completion gates to durable Goal/Run completion,
    preserved enforced Run obligations, and reduced future medium/large Runs
    to a minimal `execution -> verification` DAG owned by the Codex runtime.
  - Completed: Synchronized skills, references, CLI, templates, schema text,
    deterministic evals, tests, public docs, release notes, and version
    metadata at `0.8.0`.
  - Spec: `harness/specs/2026-07-19-integrate-agent-harness-with-codex-native-execution.md`
  - Goal: `harness/goals/2026-07-19-integrate-agent-harness-with-codex-native-goal-and-plan-execution.md`
  - Run: `.harness/runs/20260719-085333-integrate-agent-harness-with-codex-native-goal-and-plan-execution/`
  - Verification: `npm run test:all`, `npm run test:eval`, plugin validation,
    four skill validators, Chinese-locale smoke/eval, four syntax checks, and
    `git diff --check` passed.
  - Delivery: implementation commit `67b94cc` pushed to `origin/main`; local
    `harness@agent-harness-local` cache refreshed at `0.8.0` with 44/44 files
    and zero SHA-256 differences. No review, integration, release, publish, or
    production deployment performed.

- [x] Refocus Agent Harness on durable project control and current Codex runtime boundaries.
  - Completed: Closed configured-path, Run-directory, Goal/Spec, DAG artifact,
    and symlink containment gaps before writes.
  - Completed: Added Run-start Git snapshots and Run-scoped delivery
    classification; historical upstream state and cross-branch changes cannot
    promote the current Run.
  - Completed: Simplified public skills, roles, routes, 9 domain invariants,
    worker/model policy, config/schema, marketplace identity, docs, tests, and
    routing-classification eval while preserving adapter and durable evidence.
  - Spec: `harness/specs/2026-07-18-refocus-agent-harness-on-durable-project-control.md`
  - Goal: `harness/goals/2026-07-18-refocus-agent-harness-on-durable-project-control-and-current-codex-runtime-boundaries.md`
  - Run: `.harness/runs/20260718-083037-refocus-agent-harness-on-durable-project-control-and-current-codex-runtime-boundaries/`
  - Verification: syntax checks, `npm run test:all`, `npm run test:eval`,
    `npm run validate:plugin`, four skill validators, zh-CN regressions, and
    `git diff --check` passed under controller review.
  - Follow-up correction: constrained `run record` Goal/Spec lookups to their
    configured roots and added zero-write tamper regressions; targeted smoke,
    `test:all`, plugin validation, syntax, and diff checks passed.
  - Delivery: `validated-local`; no commit, push, review, integration,
    release, deploy, or plugin-cache refresh performed.

- [x] Make Agent Harness skills GPT-5.6-ready.
  - Follow-up correction: Preserved DAG worker `thread`, `surface`, and
    `isolationEvidence` across `running` to `completed`; aligned the Goal
    template with local-only delivery defaults; distinguished all-completed
    orientation from task parse failure; and added regression coverage.
  - Completed: Mapped internal routes to published skills or exact user actions;
    no unshipped `shape`, `goal`, `competition`, or `ask` skill is implied.
  - Completed: Shortened all skill descriptions to 207-254 characters, added
    `agents/openai.yaml`, and reduced `harness:execute` from 319 to 131 lines
    with path-specific progressive disclosure.
  - Completed: Generated Goals default to `validated-local` with every delivery
    authorization `no`; parallel workers default to sequential launch and need
    recorded isolation evidence for concurrency.
  - Completed: Deterministic eval explicitly disclaims model activation; the
    opt-in live runner refuses GPT-5.6 claims without runtime-reported model
    evidence.
  - Spec:
    `harness/specs/2026-07-11-gpt-5-6-skill-compatibility-repair.md`
  - Goal:
    `harness/goals/2026-07-11-make-agent-harness-skills-gpt-56-ready.md`
  - Run:
    `.harness/runs/20260711-235825-make-agent-harness-skills-gpt-56-ready/`
  - Verification: `node --check`, `npm run test:protocol`, `npm run test:all`,
    `npm run test:eval`, `npm run validate:plugin`, `git diff --check`, four
    skill `quick_validate.py` checks, and Goal dry-run passed.
  - Delivery: `committed` under the user's 2026-07-12 follow-up authorization;
    live GPT-5.6 activation, push, review, integration, publish, release,
    deploy, paid API, production, daemon, and destructive operations were not
    performed.

- [x] Upgrade Agent Harness to 0.6.0 and update release docs.
  - Completed: Bumped `package.json` and
    `plugins/agent-harness/.codex-plugin/plugin.json` to `0.6.0`.
  - Completed: Updated README / README.zh-CN current-version entry points,
    `CHANGELOG.md`, `docs/releases/v0.6.0.md`,
    `docs/github-presentation.md`, social preview text, versioning examples,
    and deterministic presentation/smoke checks.
  - Completed: Added presentation-suite assertions that package and plugin
    manifest versions both equal `0.6.0` and stay aligned.
  - Completed: Deployed the local Codex plugin cache at
    `/Users/liuyj/.codex/plugins/cache/personal/harness/0.6.0` with
    `npm run deploy:local-plugin`.
  - Source: Current conversation on 2026-07-09; user approved upgrading the
    version line to `0.6`.
  - Goal:
    `harness/goals/2026-07-09-upgrade-agent-harness-to-060-and-update-release-docs.md`
  - Run:
    `.harness/runs/20260709-192744-upgrade-agent-harness-to-060-and-update-release-docs/`
  - Verification: `node --check scripts/test-suites.mjs`, `node --check
    tests/smoke.mjs`, `node --check
    plugins/agent-harness/scripts/agent-harness.mjs`, `npm run
    test:presentation`, `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, `npm run deploy:local-plugin`, and `git diff
    --check`.
  - Delivery: local deployment completed; commit and push are authorized by the
    2026-07-09 follow-up request. No review, integration, publish, GitHub
    Release, production access, daemon, watcher, paid API, credential, or
    destructive operation was performed.

- [x] Make status file a bounded snapshot.
  - Completed: Added `harness-rule:bounded-status-snapshot` so configured
    status files are bounded current-state snapshots, not append-only history
    logs.
  - Completed: Updated status template, adapter template, capability matrix,
    project contract, `harness:execute`, generated goal/run/worker prompts,
    CLI docs, README / README.zh-CN, project adapter docs, mental model, and
    deterministic tests.
  - Completed: Compacted this repository's `harness/status.md` to current
    state and durable evidence links.
  - Source: Current conversation on 2026-07-09; user observed that
    `harness/status.md` can grow without bound.
  - Goal:
    `harness/goals/2026-07-09-make-status-file-a-bounded-snapshot.md`
  - Run:
    `.harness/runs/20260709-192149-make-status-file-a-bounded-snapshot/`
  - Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `node --check scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, and `git diff --check`.
  - Delivery: `validated-local`; no commit, push, review, integration,
    publish, release, deploy, production access, daemon, watcher, paid API,
    credential, or destructive operation was performed.

- [x] Make state sync a task completion obligation.
  - Completed: Clarified `harness-rule:state-sync-evidence` so task
    completion includes state-sync evidence or `State Sync Notes` from the
    executing lane.
  - Completed: Preserved the accepted-state owner boundary: execution workers
    return candidate state-sync notes, while the authorized accepted-state
    owner verifies and writes accepted task/status/goal/run/gate state.
  - Completed: Updated README / README.zh-CN, capability matrix, project
    contract, `harness:execute`, completion / gate / controller / worker
    references, goal and worker templates, generated prompt text, and smoke
    assertions.
  - Source: Current conversation on 2026-07-09; user asked to optimize the
    abstraction so task status updates are treated as part of task completion.
  - Goal:
    `harness/goals/2026-07-09-make-state-sync-a-task-completion-obligation.md`
  - Run:
    `.harness/runs/20260709-184137-make-state-sync-a-task-completion-obligation/`
  - Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `node --check scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, and `git diff --check`.
  - Delivery: `validated-local`; no commit, push, review, integration,
    publish, release, deploy, production access, daemon, watcher, paid API,
    credential, or destructive operation was performed.

- [x] Align current project adapter and storage artifacts with Goal-first terminology.
  - Completed: Updated `harness/README.md` to define the project adapter
    terminology contract as `Roadmap -> Milestone -> Goal -> Task -> Run`,
    including intent normalization and the compatibility boundary for the
    existing `harness/tasks.md` / `taskIndex` storage path.
  - Completed: Updated `harness/mental-models/` so project storage and usage
    models describe Goal state, Goal index storage, Goal-internal Tasks, Runs
    as execution attempts, and Milestones as roadmap outcomes.
  - Completed: Updated current project status and completed Goal records to use
    `Milestone Completion Map` as the formal term, leaving `Stage Completion
    Map` only where documenting legacy compatibility.
  - Source: User asked on 2026-07-04 to update the current project's adapter
    and storage files to the new terminology.
  - Verification: `git diff --check` and terminology scans over
    `harness/README.md`, `harness/tasks.md`, `harness/status.md`, and
    `harness/mental-models/`.
  - Delivery: `validated-local`; no commit, push, review, integration, publish,
    release, deploy, production access, daemon, watcher, paid API, credential,
    or destructive operation was performed.

- [x] Refresh Agent Harness README diagrams for terminology hierarchy.
  - Completed: Added maintained SVG sources for
    `docs/assets/readme/adapter-model.png` and
    `docs/assets/readme/adapter-execution-model.png`, then regenerated both
    PNGs with `sips` at 1672x941.
  - Completed: Updated diagram content to present
    `Roadmap -> Milestone -> Goal -> Task -> Run`, with `Goal` as the main
    work unit, `Task` as internal breakdown, and `Run` as evidence attempt.
  - Completed: Inspected `docs/assets/readme/adapter-artifact-map.png` and left
    it unchanged because it already uses `Milestones` and no `Stage` term.
  - Completed: Extended presentation/smoke checks to protect README diagram
    links, SVG terminology, and the removal of the old task-first phrase.
  - Source: User agreed on 2026-07-04 that this Controller thread should finish
    the docs improvement task after inspecting whether diagrams need to be
    redone.
  - Spec: `harness/specs/2026-07-04-agent-harness-readme-diagram-refresh.md`
  - Goal: `harness/goals/2026-07-04-refresh-agent-harness-readme-diagrams-for-terminology-hierarchy.md`
  - Run: `.harness/runs/20260704-160154-refresh-agent-harness-readme-diagrams-for-terminology-hierarchy/`
  - Verification: `sips -g pixelWidth -g pixelHeight`, `node --check
    scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:presentation`, `npm run test:protocol`,
    `npm run test:smoke`, `npm run validate:plugin`, and
    `git diff --check`.
  - Delivery: `validated-local`; no commit, push, review, integration, publish,
    release, deploy, production access, daemon, watcher, paid API, credential,
    or destructive operation was performed.

- [x] Shape Agent Harness terminology simplification and priority/milestone separation.
  - Completed: Created accepted terminology spec with user-confirmed decisions:
    `Roadmap -> Milestone -> Goal -> Task -> Run`; `Goal` as the main work
    unit; `Task` as Goal-internal breakdown; `Run` as execution attempt and
    evidence record; `P0` / `P1` / `P2` / `P3` as priority only.
  - Completed: Updated README, README.zh-CN, CLI/install docs, project
    contract, execute/intake skill guidance, references, templates, social
    preview text, and GitHub presentation flow to use `Milestone` in new
    user-facing terminology.
  - Completed: Updated CLI generation/status/record output to use
    `Milestone Completion Map` while preserving legacy `Stage Completion Map`
    compatibility input and JSON aliases.
  - Completed: Added `harness-rule:terminology-boundary` protocol coverage and
    smoke tests for priority separation, intent normalization, Run/thread
    boundary, milestone completion output, and legacy Stage compatibility.
  - Source: Intake idea was superseded by user-confirmed terminology decisions
    on 2026-07-04.
  - Spec: `harness/specs/2026-07-04-agent-harness-terminology-simplification.md`
  - Goal: `harness/goals/2026-07-04-shape-agent-harness-terminology-simplification-and-prioritystage-separation.md`
  - Run: `.harness/runs/20260704-154151-shape-agent-harness-terminology-simplification-and-prioritystage-separation/`
  - Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `node --check scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:protocol`, `npm run test:smoke`, `npm run validate:plugin`,
    and `git diff --check`.
  - Delivery: `validated-local`; no commit, push, review, integration, publish,
    release, deploy, production access, daemon, watcher, paid API, credential,
    or destructive operation was performed.
