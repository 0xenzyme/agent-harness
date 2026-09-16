# Project Goals

## Now

## Next

## Later

## Done

- [x] P0+P1 GitHub presentation first screen and social preview.
  - Type: docs
  - Status: completed
  - Source: User asked what to optimize from the presentation contract,
    then approved P0+P1.
  - Completed: Restored protocol/smoke badges; routed the README hero to
    HARNESSES, CHANGELOG, v0.12.0 notes, and the social preview SVG;
    reordered first-use to host prompts then CLI.
  - Completed: Host-neutral social-preview subtitle, State Sync in the
    preview flow, published 1280x640 `social-preview.png`, `package.json`
    description aligned to the presentation line, and presentation-suite
    locks for first-screen routes.
  - Delivery: `validated-local`; GitHub About updated to the host-neutral
    positioning line. No version bump, commit, push, tag, GitHub Release,
    or Settings/OG upload.

- [x] P1 Make `README.md` the canonical English homepage.
  - Type: docs
  - Status: completed
  - Source: User asked to switch the default README to English.
  - Completed: Moved Simplified Chinese to `README.zh-CN.md`, updated the
    GitHub presentation contract and presentation suite, and removed
    `README.en.md`.
  - Delivery: `validated-local`; no version bump, commit, push, tag, or
    release.

- [x] P1 Align user-facing docs with the 0.12.0 host-neutral contract.
  - Type: docs
  - Status: completed
  - Source: User asked for an overall look because recent versions may have
    left documentation behind, then approved the docs-alignment plan.
  - Completed: Moved `CHANGELOG.md` `0.12.0` above `0.11.0`; recorded the
    remaining alignment under Unreleased.
  - Completed: Replaced leftover “ordinary work = Codex” wording in README,
    usage, and CLI with current-host / `host-direct` language; documented
    maintainer `print-contract`.
  - Completed: Aligned eval live examples and trigger rationale, added the
    two missing durable invariants to Goal/Spec templates, and made
    `runtime-capabilities.md` host-neutral.
  - Verification: `git diff --check`, `npm run test:presentation`,
    `npm run test:protocol`, `npm run test:eval`, `npm run validate:plugin`,
    `npm run test:all`, and project `doctor` passed.
  - Delivery: `validated-local`; no version bump, commit, push, tag,
    publish, release, deploy, or nested-copy deletion was performed.

- [x] P0 Implement Run Checkpoint and Recovery Protocol.
  - Type: development
  - Status: completed
  - Spec: `harness/specs/2026-09-01-run-checkpoint-and-recovery-protocol.md`
  - Goal: `harness/goals/2026-09-01-implement-run-checkpoint-and-recovery-protocol.md`
  - Run: `.harness/runs/20260901-164310-implement-run-checkpoint-and-recovery-protocol`
  - Completed: Added explicit default-disabled/enforced checkpoint policy,
    independent checkpoint state, manifest binding, lock/atomic/CAS mutation,
    drift/replacement and reconciliation recovery, L0/L1 orientation, and safe
    lifecycle handling while retaining legacy and fast-path compatibility.
  - Completed: Aligned config/schema/templates, execute/orient skills,
    adapter/lifecycle references, bilingual docs, capability matrix, CHANGELOG,
    deterministic regressions, behavior evals, and durable project state.
  - Verification: Syntax, `npm run test:all`, `npm run test:eval`,
    `npm run validate:plugin`, config/Goal/Run validation, project doctor,
    lifecycle previews, and `git diff --check` passed.
  - Delivery: `validated-local`; no version bump, commit, push, publish,
    release, deploy, production access, credential, paid API, or destructive
    operation was performed. RC-D1 through RC-D6 remain deferred in the spec.

- [x] P1 Refresh stale documentation and project state after post-0.10 hardening.
  - Type: docs
  - Status: completed
  - Source: User requested a documentation freshness audit on 2026-08-28 and
    then asked to fix every identified item.
  - Completed: Reclassified the unpublished `0.10.0` surface as release
    preparation, kept post-preparation work under `Unreleased`, and removed
    post-preparation Run-manifest/locking claims from the historical release
    notes.
  - Completed: Added the missing `harness-rule:pre-delegation-work-mode`
    capability and user guidance, including the thread/worktree/`startingState`
    authorization boundary.
  - Completed: Documented `test:regressions` and the full `test:all` suite, and
    synchronized this bounded Task/status state with the July/August hardening
    commits.
  - Completed: Extended deterministic checks so all canonical invariants must
    remain in the capability matrix and README/CLI validation guidance cannot
    silently drop `test:all` or `test:regressions` again.
  - Verification: `git diff --check`, Markdown local-link validation,
    `npm run test:all`, `npm run test:eval`, `npm run validate:plugin`, project
    `doctor`, config validation, and artifact-compaction preview.
  - Delivery: `validated-local`; no commit, push, tag, GitHub Release, publish,
    deploy, production access, paid API, credential, or destructive operation
    was performed.

- [x] P0 Simplify completion and remove Git-derived Delivery State.
  - Type: development/docs
  - Status: completed
  - Spec: `harness/specs/2026-07-21-simplify-completion-and-remove-git-derived-delivery-state.md`
  - Goal: `harness/goals/2026-07-21-simplify-completion-and-remove-git-derived-delivery-state.md`
  - Run: `.harness/runs/20260721-110505-simplify-completion-and-remove-git-derived-delivery-state`
  - Completed: Task/Goal is authoritative with active, completed, or resumable
    blocked phase; Run stores execution evidence and status is a bounded
    projection.
  - Completed: Removed implicit checkout inspection, Git-derived Delivery
    State, Run start snapshots, delivery gates, and delivery output from the
    canonical lifecycle.
  - Compatibility: Existing legacy Goal/Run fields remain readable for one
    release, are ignored by current behavior, and are removed when an old Run
    is recorded again.
  - Verification: JavaScript syntax, protocol, smoke, `test:all`, deterministic
    eval, and plugin validation passed at `0.10.0`.

- [x] P0 Fix bounded artifact lifecycle and retention.
  - Type: development/docs
  - Status: done (`committed`)
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
  - Delivery: implementation and `0.9.0` release prep committed as `e38a746`;
    local `harness@agent-harness-local` cache refreshed at `0.9.0` with 45/45
    source/cache files and no differences. Push, review, integration, Git tag,
    GitHub Release, remote publish, production access, paid API, and Run
    deletion remain out of scope.

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
