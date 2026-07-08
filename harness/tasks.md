# Project Tasks

## Now

## Next

## Later

## Done

- [x] Implement behavior eval and degraded execution provenance for Harness.
  - Completed: Added deterministic trace-shaped behavior eval fixtures under
    `evals/skills/agent-harness/behavior_trace_cases.yaml`.
  - Completed: Extended `evals/run-agent-harness-eval.mjs` so `npm run
    test:eval` validates ordered reads, forbidden writes/mutations, worker
    candidate evidence, degraded execution provenance, and gate-only acceptance
    evidence. The eval now reports `Behavior trace cases: 4`.
  - Completed: Added `harness-rule:degraded-execution-provenance` across the
    capability matrix, project contract docs, worker-runner / controller /
    gate-result references, `harness:execute`, worker prompt template, generated
    run/DAG/worker prompts, protocol checks, and smoke checks.
  - Source: Current controller thread reviewed Impeccable's `critique`
    workflow and accepted the useful pattern: trace-shaped behavior eval plus
    visible degraded execution provenance.
  - Spec:
    `harness/specs/2026-07-08-behavior-eval-and-degraded-execution-provenance.md`
  - Goal:
    `harness/goals/2026-07-08-implement-behavior-eval-and-degraded-execution-provenance-for-harness.md`
  - Run:
    `.harness/runs/20260708-114327-implement-behavior-eval-and-degraded-execution-provenance-for-harness/`
  - Verification: `node --check evals/run-agent-harness-eval.mjs`, `node
    --check scripts/test-suites.mjs`, `node --check tests/smoke.mjs`, `node
    --check plugins/agent-harness/scripts/agent-harness.mjs`, `npm run
    test:eval`, `npm run test:protocol`, `npm run test:smoke`, `npm run
    validate:plugin`, and `git diff --check`.
  - Delivery: `validated-local`; no commit, push, review, integration, publish,
    release, deploy, production access, daemon, watcher, paid API, credential,
    or destructive operation was performed.

- [x] Complete the control-theory feedback loop model for Harness.
  - Completed: Added `docs/cybernetic-stability.md` as the dedicated
    control-theory-inspired stability model for Agent Harness.
  - Completed: Framed Harness as a semantic control loop:
    `intent -> setpoint -> sensor -> measurement -> gap -> controller -> action -> feedback`.
  - Completed: Documented intent recognition as target / setpoint selection,
    sensor freshness, measurement snapshots, remaining gap, feedback quality,
    route stability, and saturation / pause triggers.
  - Completed: Updated README / README.zh-CN, CHANGELOG, release notes,
    version metadata, capability matrix, project contract, social preview
    source, and deterministic checks for the `0.5.0` cybernetic stability line.
  - Completed: Promoted the stability model into stable protocol anchors:
    `harness-rule:intent-setpoint-selection`,
    `harness-rule:sensor-freshness`,
    `harness-rule:measurement-snapshot`,
    `harness-rule:remaining-gap`, `harness-rule:feedback-quality`, and
    `harness-rule:stability-saturation`.
  - Completed: Updated task routing, `harness:orient`, `harness:intake`,
    `harness:execute`, goal/spec/worker templates, and CLI-generated
    goal/run/prompt/subagent guidance so future Harness execution carries
    target, observed state, gap, feedback quality, and saturation checks.
  - Source: Split from the 2026-07-04 intake idea: "要不要学习控制论，利用控制论的思想来改造".
  - Spec:
    `harness/specs/2026-07-06-cybernetic-stability-model-for-agent-harness.md`
  - Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `node --check scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `git diff --check`, `npm run test:protocol`,
    `npm run test:presentation`, `npm run test:smoke`, `npm run test:all`,
    and `npm run validate:plugin`.
  - Delivery: `validated-local`; no commit, push, review, integration, publish,
    release, deploy, production access, daemon, watcher, paid API, credential,
    or destructive operation was performed.

- [x] Shape EnvContext focus and intent-routing model for Harness.
  - Completed: Added `harness-rule:context-focus-routing` so Harness
    normalizes user intent to `Milestone`, `Goal`, `Task`, `Run`, `Priority`,
    or `Spec` before selecting the smallest useful context focus.
  - Completed: Defined context layers for Harness routing: `entry/channel`,
    `modality`, `dialog`, `project/world`, `capability`, and `self/control`.
  - Completed: Defined focus presets for `orient`, `intake`, `shape`, `goal`,
    and `execute`, including token/noise and lost-in-the-middle controls.
  - Completed: Kept `EnvContext` as internal design language only; no public
    `--focus` CLI parameter, schema/config field, storage migration, activation
    behavior, or external dependency was added.
  - Source: Split from the 2026-07-04 intake idea and screenshot about adding
    intent recognition inspired by EnvContext layers and `focus` filtering.
  - Spec:
    `harness/specs/2026-07-04-envcontext-focus-and-intent-routing-model.md`
  - Goal:
    `harness/goals/2026-07-04-shape-envcontext-focus-and-intent-routing-model-for-harness.md`
  - Run:
    `.harness/runs/20260704-190518-shape-envcontext-focus-and-intent-routing-model-for-harness/`
  - Verification: `node --check
    plugins/agent-harness/scripts/agent-harness.mjs`, `node --check
    scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, `git diff --check`, `goal validate`, and
    `run status --json`.
  - Delivery: `validated-local`; no commit, push, review, integration, publish,
    release, deploy, production access, daemon, watcher, paid API, credential,
    or destructive operation was performed.

- [x] Shape Level 0 Fast Path direct-execution policy.
  - Completed: Added `harness-rule:level-0-fast-path` so Level 0 direct
    execution is a narrow exception for small local, reversible, low-risk fixes
    by an `implementer` or explicitly accepted `mixed` thread.
  - Completed: Defined that Level 0 cannot bypass accepted Harness specs,
    Goals, Runs, DAG nodes, checklists, adapter-required gates, state-sync
    obligations, Controller/gate/review/acceptance roles, product/project
    semantic changes, public protocol/source-of-truth changes, schemas,
    external systems, credentials, paid/production access, destructive
    operations, or larger Goal/Milestone work.
  - Completed: Preserved verification and closeout requirements for direct
    execution: short route reason, scoped diff summary, concrete verification,
    Delivery State, `Need user`, and `Remaining`.
  - Source: Split from the 2026-07-04 intake idea about allowing simple work to
    execute directly without full Harness ceremony or sub worker delegation.
  - Spec:
    `harness/specs/2026-07-04-level-0-fast-path-direct-execution-policy.md`
  - Goal:
    `harness/goals/2026-07-04-shape-level-0-fast-path-direct-execution-policy.md`
  - Run:
    `.harness/runs/20260704-181600-shape-level-0-fast-path-direct-execution-policy/`
  - Verification: `node --check
    plugins/agent-harness/scripts/agent-harness.mjs`, `node --check
    scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, `git diff --check`, `goal validate`, and
    `run status --json`.
  - Delivery: `validated-local`; no commit, push, review, integration, publish,
    release, deploy, production access, daemon, watcher, paid API, credential,
    or destructive operation was performed.

- [x] Shape lightweight human-verification checklist and Need-user digest.
  - Completed: Added `harness-rule:need-user-digest` so user-facing closeouts
    explicitly report `Need user` and `Remaining`.
  - Completed: Updated `harness:execute` closeout guidance, the user-facing
    closeout reference, project contract docs, Controller packets, goal and
    worker prompt templates, generated run packets, and deterministic checks so
    routine closeouts use `Need user: None` / `Remaining: None` when no true
    pause trigger or follow-up remains.
  - Completed: Preserved the boundary that concrete human decisions,
    user-required manual verification, authorization, credentials/paid APIs,
    production access, destructive-operation approval, product direction, or
    external evidence belong in `Need user`; agent-performed manual inspection
    belongs in `Verification`.
  - Source: Split from the 2026-07-04 intake idea about simplifying
    human-verification checklists and reducing repeated confirmation asks.
  - Spec:
    `harness/specs/2026-07-04-lightweight-human-verification-checklist-need-user-digest.md`
  - Goal:
    `harness/goals/2026-07-04-shape-lightweight-human-verification-checklist-and-need-user-digest.md`
  - Run:
    `.harness/runs/20260704-170345-shape-lightweight-human-verification-checklist-and-need-user-digest/`
  - Verification: `node --check
    plugins/agent-harness/scripts/agent-harness.mjs`, `node --check
    scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, `git diff --check`, `goal validate`, and
    `run status --json`.
  - Delivery: `validated-local`; no commit, push, review, integration, publish,
    release, deploy, production access, daemon, watcher, paid API, credential,
    or destructive operation was performed.

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

- [x] Execute GitHub presentation pass for profile-pinned repository.
  - Completed: Added README / README.zh-CN first-screen badges, positioning,
    flow line, links, and social preview reference.
  - Completed: Added `docs/assets/github/social-preview.svg`,
    `docs/github-presentation.md`, `CHANGELOG.md`, `docs/releases/v0.4.0.md`,
    and `LICENSE`.
  - Completed: Added `npm run test:presentation` and extended `npm run
    test:all` / smoke coverage to protect presentation assets and links.
  - Completed: Applied GitHub repository description and topics for
    `0xenzyme/agent-harness`.
  - Completed: Pushed commit `1a622a5`, pushed tag `v0.4.0`, and created
    GitHub Release `v0.4.0`.
  - Source: User pinned `0xenzyme/agent-harness` to their GitHub profile and
    asked to use Harness to design and execute the presentation work.
  - Spec: `harness/specs/2026-07-02-github-presentation-pass.md`
  - Goal: `harness/goals/2026-07-02-github-presentation-pass.md`
  - Run: `.harness/runs/20260702-025928-github-presentation-pass/`
  - Release: `https://github.com/0xenzyme/agent-harness/releases/tag/v0.4.0`
  - Verification: `npm run test:presentation`, `npm run test:protocol`,
    `npm run test:smoke`, `npm run test:all`, `npm run validate:plugin`,
    `git diff --check`, `goal validate`, `run status`, `gh repo view`,
    `git ls-remote --tags origin v0.4.0`, and `gh release view v0.4.0`.
  - Boundary: No runtime protocol redesign, plugin activation change, website,
    daemon/watcher, paid service, destructive operation, or production
    credential was used.

- [x] Bump Agent Harness version metadata to 0.4.0.
  - Completed: Updated `package.json` and
    `plugins/agent-harness/.codex-plugin/plugin.json` from `0.3.0` to
    `0.4.0`.
  - Completed: Updated README, README.zh-CN, and `docs/versioning.md` so the
    documented current version matches the capability matrix, stable
    `harness-rule:*` anchors, and suite-routing work.
  - Source: User requested a version bump and documentation update after the
    Impeccable-inspired productization improvements were accepted.
  - Verification: `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, `git diff --check`, and version alignment check.
  - Boundary: Local metadata and docs only; no publish, release, commit, push,
    review, or integration delivery was performed.

- [x] Apply Impeccable-inspired harness productization improvements.
  - Completed: Added `docs/HARNESSES.md` as the project-neutral Agent Harness
    capability matrix for runtime/control surfaces, defaults, boundaries,
    applicability, and suite-routing expectations.
  - Completed: Added stable `harness-rule:*` anchors for gate-only controller
    behavior, local delivery ceilings, default worker surface, project-neutral
    core content, and state-sync evidence across canonical docs, references,
    templates, and `harness:execute` guidance.
  - Completed: Added deterministic protocol validation through
    `scripts/test-suites.mjs`, `npm run test:protocol`, `npm run test:all`, and
    smoke checks that protect the rule anchors and matrix links.
  - Completed: Linked the matrix and suite-routing guidance from README,
    README.zh-CN, install docs, CLI docs, and the project contract.
  - Source: User request on 2026-07-01 after studying the updated
    `impeccable` skill as a design and engineering reference.
  - Goal: `harness/goals/2026-07-01-apply-impeccable-inspired-harness-productization-improvements.md`
  - Run: `.harness/runs/20260701-235053-apply-impeccable-inspired-harness-productization-improvements/`
  - Verification: `node --check scripts/test-suites.mjs`,
    `node --check tests/smoke.mjs`,
    `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `npm run test:protocol`, `npm run test:smoke`, `npm run test:all`,
    `npm run validate:plugin`, `git diff --check`, `goal validate`, and
    `run status --json`.
  - Boundary: No provider-output build migration, plugin hook/bootstrap change,
    daemon/watcher, deploy, publish, release, commit, push, review, or
    integration delivery was performed.

- [x] Add milestone completion coverage gate for parent roadmap milestones.
  - Completed: Added `Milestone Completion Map` parsing and validation so
    parent roadmap milestones such as `M5` cannot be marked complete after only a
    source-spec leaf like `M5-S0`.
  - Completed: `goal create --spec` now drafts a `Milestone Completion Map`
    when a parent Milestone Goal references a spec with `Implementation
    Phasing` items such as `M5-S0` and `M5-D1`.
  - Completed: `goal validate`, `run prepare`, `run status --json`, and
    `run record --phase completed` now carry and enforce Milestone completion
    evidence.
  - Completed: Updated the project contract, `harness:execute` guidance,
    completion/gate references, goal/spec templates, and smoke coverage.
  - Completed: Follow-up documentation clarified the value proposition at the
    start of `README.md` and `README.zh-CN.md`; `AGENTS.md` now keeps the same
    value proposition as a source-repository development principle.
  - Source: User reported that wiki `M5` was twice claimed complete while only
    `M5-S0` source-spec acceptance was done and `M5-D1..D4` remained pending.
  - Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `node --check tests/smoke.mjs`, `npm run test:smoke`,
    `npm run validate:plugin`, `git diff --check`, and the wiki regression
    `goal validate` now fails with `Milestone completion goals require a
    Milestone Completion Map`.
  - Boundary: Did not modify wiki state, deploy/publish the plugin, commit,
    push, open PRs, release, or add daemons/watchers.

- [x] Implement adapter migration ergonomics from geocn review.
  - Completed: Updated `orient next` to route by Goal state and spec readiness:
    P0/P1 `todo` / `spec-draft` Goals without spec route to shaping or
    accepted-scope confirmation, `spec-ready` Goals with linked specs route to
    `goal create --spec`, and `goal-ready` Goals prefer existing goal
    validation plus `run prepare`.
  - Completed: Added `config import` path overrides for status, specs, goals,
    milestones, runs, gate records, deferred register, and mental-model paths.
    `--dry-run --json` now includes the proposed config payload.
  - Completed: Added explicit spec-less adapter goal support through
    `goal create --allow-no-spec`. Generated goals persist `Spec Policy:
    allow-no-spec`, and validation still requires Scope, Non-Goals,
    Verification, Completion Conditions, Pause Conditions, Execution Role, and
    Delivery State.
  - Completed: Updated CLI docs, install docs, project contract docs, workflow
    skill guidance, task-routing reference, goal template, and smoke coverage.
  - Deferred: Table-based `maintain tasks --record` task-index writeback
    remains refused. The project contract now records the follow-up boundary:
    only implement table status updates when row matching is by unique task
    title, a recognized `Status` column, and a bounded status transition.
  - Source: geocn adapter migration review accepted by user on 2026-07-01.
  - Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `node --check tests/smoke.mjs`, `npm run test:smoke`, `git diff --check`,
    `npm run validate:plugin`, and `config validate --json`.
  - Boundary: Did not modify geocn, publish the plugin, add hooks/daemons/
    watchers, create branches/worktrees, commit, push, open PRs, deploy,
    release, or refactor the whole CLI.

- [x] Decouple integration-line wording from `main`.
  - Completed: Replaced branch-bound integration wording with `target
    integration line` / `complete on the integration line`. Updated the
    project contract, task-routing reference, execute skill guidance,
    execution-role reference, goal template, generated goal content, and
    Chinese install guide to clarify that Harness core does not assume the
    integration line is named `main`.
  - Source: User noted that current work assumed `main` as the primary
    development branch and asked to fix the adaptability issue.
  - Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `git diff --check`, `npm run test:smoke`, and
    `npm run validate:plugin`.
  - Boundary: No new required schema field was added; branch choices remain
    adapter / goal / user-instruction owned.

- [x] Add lightweight Chinese install and usage guide.
  - Completed: Added `docs/install.zh-CN.md` as a Chinese user-facing guide
    for installation, downstream adoption, workflow skill routing, main
    control / worker boundaries, goal/run/evidence concepts, Delivery State
    boundaries, and validation commands. Linked it from `README.zh-CN.md` and
    `docs/cli.zh-CN.md`.
  - Source: User agreed to add a lightweight Chinese explanation instead of a
    full bilingual mirror of `docs/project-contract.md`.
  - Verification: `git diff --check`, `npm run test:smoke`, and
    `npm run validate:plugin`.
  - Deferred: `docs/project-contract.md` remains the English protocol source
    of truth; no full Chinese contract mirror was added.

- [x] Complete Agent Harness docs engineering audit.
  - Completed: Audited and synchronized the Agent Harness documentation
    surface after recent delivery-state, gate-only, subagent, DAG, and
    acceptance-gate changes. Updated public README files, CLI docs, install
    docs, project contract docs, execute skill docs, plugin references, and the
    goal template to align on workflow-controller entry paths,
    `codex-cli-subagent` defaults, provider-neutral `review-open` /
    `integrated` terminology, candidate evidence vs accepted completion, and
    validation guidance.
  - Source: Intake idea: 最近做了很多改动，想用 harness 做一次文档工程：审计并同步 Agent Harness 最近交付后的 README、CLI docs、project contract docs、workflow skill docs、templates 和验证说明，确保公开文档与当前 adapter / delivery-state / subagent / gate protocol 一致。当前线程作为 main control / gate-only，实施输出由 worker 完成，主控负责 goal、run、verification 和 acceptance state sync。
  - Spec: `harness/specs/2026-07-01-docs-engineering-audit.md`
  - Goal: `harness/goals/2026-07-01-agent-harness-docs-engineering-audit.md`
  - Run: `.harness/runs/20260701-120641-agent-harness-docs-engineering-audit/`
  - Verification: `git diff --check`, `npm run test:smoke`,
    `npm run validate:plugin`, `goal validate`, and `run status --json`;
    `npm run test:eval` was skipped because eval docs and fixtures were not
    changed.
  - Delivery: validated local only; no commit, push, review, integration,
    publish, or release was authorized or performed.

- [x] Fix delivery intent defaults for worktree-to-mainline flow.
  - Completed: Generated goals and the reusable goal template now default
    development delivery to `Delivery intent: integrate-after-gates` and
    `Target delivery state: integrated`, with commit, push, and integration
    authorized after gates pass while release / ship remains unauthorized.
    Provider-specific `PR-open` / `merged` wording was replaced with
    provider-neutral `review-open` / `integrated`; old `PR-open`, `--pr-url`,
    `Merge authorized`, and `--merge-sha` inputs remain compatibility aliases.
    Non-Goals and Pause Conditions no longer treat push / review / integration
    as inherently user-blocking; they pause only when a step exceeds the active
    Delivery State policy. Updated run packets, prompts, run logs/status
    output, `harness:execute`, project contract docs, CLI docs, README files,
    templates, and smoke coverage.
  - Source: User identified that the "original goal said no merge/ship" defense
    was itself generated by Harness, so the root bug was the goal generator's
    local-only delivery ceiling.
  - Fixes: value-prop mismatch where gate-passing worktree output stopped at
    `validated-local`; GitHub-specific PR delivery assumptions; and generated
    Non-Goals / Pause Conditions that forced extra user confirmation for normal
    development delivery.
  - Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `node --check tests/smoke.mjs`, `npm run test:smoke`,
    `git diff --check`, and `npm run validate:plugin`.

- [x] Make subagent the default worker surface for gate-only control lanes.
  - Completed: `run prepare` now emits `defaultWorkerSurface:
    codex-cli-subagent`, prefers only `codex-cli-subagent` by default, and
    treats new Codex threads as explicit visible long-lived handoff lanes
    instead of default workers. Gate-only small runs create worker nodes rather
    than current-thread implementation nodes. Updated run/DAG prompts,
    `harness:execute`, controller communication, task routing, project
    contract docs, CLI docs, README files, goal template, and smoke tests.
  - Source: User accepted the policy that control lanes should automatically
    dispatch subagents instead of asking whether to launch a worker or switch
    the control thread to `mixed`.
  - Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `npm run test:smoke`, `git diff --check`, and
    `npm run validate:plugin`.

- [x] Add conversation routing and delivery-state gates.
  - Completed: Added `Conversation Route` and `Execution Context Lock`
    sections to generated/manual goals; `goal validate` now rejects `worktree`
    goals without route/lock proof or invalid remote-control settings. Run
    packets and prompts record conversation lane, controller thread, execution
    cwd/branch/slot, remote-control worktree, and delivery state.
    `Delivery State` now has a target plus commit/push/PR/merge/release
    authorization; `goal validate` rejects targets without matching
    authorization, and `run record --phase completed` rejects actual delivery
    state below target. `run record` accepts `--pr-url`, `--merge-sha`, and
    `--release-ref` for external delivery evidence. Updated execute skill
    guidance, controller packets, task routing, project contract, CLI docs,
    templates, and smoke tests.
  - Source: Delegated intake from thread
    `019f19a0-5ee9-7650-878e-06975d1c18f2` during M2 GEO App repair.
  - Fixes: conversation routing / thread ownership risk where control-lane
    cwd could receive patches despite a dev worktree route; delivery-state
    ambiguity where dirty verified local work could read as done/merged; and
    the value-prop gap where gate-passing worktree output could stop at local
    validation instead of continuing into the authorized delivery pipeline.
  - Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `npm run test:smoke`, `git diff --check`, and
    `npm run validate:plugin`.

- [x] Add deterministic Agent Harness skill eval harness.
  - Completed: Added versioned activation trigger cases, task cases,
    transcript rubric, dependency-free deterministic eval runner,
    `npm run test:eval`, eval README instructions, and eval results history.
    The runner validates trigger-case coverage, materializes temporary fixture
    projects, runs CLI hard checks, and confirms read-only / dry-run cases do
    not write forbidden paths.
  - Spec: None - direct user request in the current thread on 2026-06-30.
  - Verification: `node --check evals/run-agent-harness-eval.mjs`,
    `npm run test:eval`, `npm run test:smoke`, `npm run validate:plugin`,
    `git diff --check`, and `doctor`.

- [x] Add controller-gated execution DAG for multi-agent runs.
  - Completed: `run prepare` now writes `dag.json`, `dag.md`, and
    per-node `agents/<node>/prompt.md` / `status.json` artifacts; medium and
    large runs use an enforced DAG, with large runs adding parallel worker
    layers. Added `run node record`
    to record worker node results with dependency checks, verification
    evidence, and ready-node updates. `run status --json` now exposes DAG
    readiness, and completed enforced-DAG runs are rejected until every node is
    complete. Documented fresh-thread / Codex CLI subagent preference and
    fork-as-exception policy across CLI docs, project contract docs, controller
    references, task routing, goal/spec templates, README summaries, and
    `harness:execute`.
  - Spec: None - direct user request in the current thread on 2026-06-30.
  - Verification: `node --check`, `npm run test:smoke`, `git diff --check`,
    and `npm run validate:plugin`.

- [x] Add master acceptance and adapter-declared gates to Agent Harness.
  - Completed: Added adapter-declared `gates.requiredForCompletion` and
    `gates.blocking` support; generated goals now include `Spec Acceptance
    Checklist` and `Required Gate Evidence`; run preparation records gate
    metadata; completed run records reject pending checklist or required gate
    evidence even when technical verification is present. Updated templates,
    execute workflow guidance, project contract docs, gate/controller
    references, config schema, and smoke tests.
  - Spec: `harness/specs/2026-06-30-master-acceptance-and-adapter-gates.md`
  - Goal: `harness/goals/2026-06-30-master-acceptance-and-adapter-gates.md`
  - Run: `.harness/runs/20260630-171105-master-acceptance-and-adapter-gates/`
  - Verification: `node --check`, `git diff --check`,
    `npm run test:smoke`, `npm run validate:plugin`, `goal validate`, and
    `run record`.

- [x] Move root README CLI command catalog into docs.
  - Completed: Moved detailed `agent-harness` CLI command examples out of
    `README.md` and `README.zh-CN.md` into `docs/cli.md` and
    `docs/cli.zh-CN.md`; root README files now keep only a short CLI reference
    while staying coding-agent-first. Added smoke guards so root README files
    do not regain the detailed CLI command catalog.
  - Spec: `harness/specs/2026-06-30-root-readme-cli-relocation.md`
  - Goal: `harness/goals/2026-06-30-root-readme-cli-relocation.md`
  - Run: `.harness/runs/20260630-163748-root-readme-cli-relocation/`
  - Verification: `node --check`, `git diff --check`,
    `npm run test:smoke`, `npm run validate:plugin`, `goal validate`, and
    `run record`.

- [x] Add source task acceptance coverage gate for batch completion.
  - Completed: Added `Source Task Acceptance Map` protocol for batch or merged
    source-task goals; `goal validate` now requires and validates the map when
    batch signals are present; `run prepare` records acceptance-map metadata;
    `run record --phase completed` rejects batch completion unless every map
    item is `satisfied` with concrete evidence. Updated templates, project
    contract docs, gate/controller references, and smoke tests.
  - Spec: `harness/specs/2026-06-30-source-task-acceptance-coverage-gate.md`
  - Goal: `harness/goals/2026-06-30-source-task-acceptance-coverage-gate.md`
  - Run: `.harness/runs/20260630-162929-source-task-acceptance-coverage-gate/`
  - Verification: `node --check`, `git diff --check`,
    `npm run test:smoke`, `npm run validate:plugin`, `goal validate`, and
    `run record`.

- [x] Complete open Agent Harness task batch.
  - Completed: Merged the unfinished `Next` and actionable `Later` tasks into
    one accepted batch spec and goal; added executable `Execution Role`
    validation, propagated execution role into run packets, required
    verification for completed run records, and required `--gate-evidence` for
    completed `gate-only` runs. Clarified packaging boundaries, added zh-CN/en
    bilingual fallback descriptions, documented agent-neutral delegation and
    multi coding-agent roadmap constraints, and rechecked conditional bootstrap
    hook support.
  - Source tasks: `Add execution-role and gate-evidence enforcement`, `Do a
    second-pass README and plugin packaging-boundary cleanup`, `Add zh-CN/en
    skill suggestion localization or bilingual fallback`, `Generalize execute
    delegation across coding agents`, `Define multi coding-agent support
    roadmap`, and `Revisit conditional Agent Harness bootstrap after hook
    validation support`.
  - Spec: `harness/specs/2026-06-30-complete-open-task-batch.md`
  - Goal: `harness/goals/2026-06-30-complete-open-task-batch.md`
  - Run: `.harness/runs/20260630-160325-complete-open-task-batch/`
  - Verification: `node --check`, `git diff --check`,
    `npm run test:smoke`, `npm run validate:plugin`, `goal validate`, and
    `run record`, plus temporary hook-manifest validation.
  - Deferred boundary: Conditional bootstrap remains hook-free because the
    current plugin validator still rejects `.codex-plugin/plugin.json`
    `hooks`; revisit only after plugin validation and runtime tests support
    conditional `SessionStart` behavior.
  - Acceptance audit: The source task acceptance map now records that the
    README CLI relocation acceptance remained blocked; the narrower follow-up
    task is back in `Later`.

- [x] Clarify control/gate vs implementer execution roles.
  - Completed: Added explicit `gate-only`, `implementer`, and `mixed`
    execution roles to `harness:execute`, project contract docs, route/gate
    references, README files, the goal template, and generated goal handoff
    text. Requests framed as main control, control lane, gate, judge, review,
    or acceptance now default to `gate-only` unless same-thread implementation
    is clearly authorized.
  - Goal: `harness/goals/2026-06-30-clarify-control-gate-vs-implementer-execution-roles.md`
  - Verification: `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `git diff --check`, `npm run test:smoke`, and `npm run validate:plugin`.
- [x] Review and improve Agent Harness README/docs for coding-agent-first use.
  - Completed: Reframed public README files around `harness:init`,
    `harness:orient`, `harness:intake`, and `harness:execute` as the primary
    user path; moved CLI and `npm` commands into agent/operator verification,
    deterministic diagnostics, and maintainer tooling context; aligned install
    and project-contract docs; added a smoke guard for the README entry path.
  - Goal: `harness/goals/2026-06-30-review-and-improve-agent-harness-readme-docs-coding-agent-first.md`
  - Verification: `git diff --check`, `npm run test:smoke`, and
    `npm run validate:plugin`.
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
    Goal indexes. The command classifies ideas, detects related Goals, Tasks,
    and artifacts, suggests title/priority/section/acceptance/spec need,
    refuses table-based
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
  - Completed: report-only init test used a local downstream project; first `doctor` showed all harness files missing, `init` created only the configured Goal index storage, machine config, status file, and harness directories.
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
