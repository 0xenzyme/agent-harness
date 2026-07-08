# Project Status

## Focus

- Current focus: Controller-gated cancellation boundary for worker fallback is
  implemented and verified in the local checkout. Added
  `harness-rule:controller-cancellation-boundary` so cancellation,
  supersession, drain, and pause-after-current are cooperative control-plane
  signals rather than runtime kill guarantees. Harness now documents that
  controllers may stop new dependent launches, quarantine late worker output,
  reject stale candidate evidence, or switch to manual-foreground fallback with
  degraded provenance, but must not present cancellation as proof that a Codex
  subagent stopped. Updated the capability matrix, project contract, worker
  runner / controller communication / gate result / task routing references,
  `harness:execute`, worker prompt template, generated run/DAG/worker prompts,
  CLI docs, CLI completion gate, protocol checks, smoke tests, and behavior
  eval. `run record --phase completed` now rejects enforced-DAG completion
  while active `running` worker nodes remain unresolved. Goal:
  `harness/goals/2026-07-09-add-controller-gated-cancellation-boundary-for-worker-fallback.md`;
  run:
  `.harness/runs/20260709-042813-add-controller-gated-cancellation-boundary-for-worker-fallback/`.
  Verification passed: `node --check
  plugins/agent-harness/scripts/agent-harness.mjs`, `node --check
  scripts/test-suites.mjs`, `node --check tests/smoke.mjs`, `node --check
  evals/run-agent-harness-eval.mjs`, `npm run test:protocol`, `npm run
  test:eval`, `npm run test:smoke`, `npm run validate:plugin`, and `git diff
  --check`. Delivery state is `validated-local`; no commit, push, review,
  integration, publish, release, deploy, production access, daemon, watcher,
  paid API, credential, or destructive operation was performed.

- Current focus: Behavior eval and degraded execution provenance for Harness
  is implemented and verified in the local checkout. Added deterministic
  trace-shaped behavior fixtures at
  `evals/skills/agent-harness/behavior_trace_cases.yaml` and extended
  `evals/run-agent-harness-eval.mjs` so `npm run test:eval` validates ordered
  reads, forbidden writes/mutations, worker candidate evidence, degraded
  provenance, and gate-only acceptance evidence. Added
  `harness-rule:degraded-execution-provenance` across the capability matrix,
  project contract docs, worker-runner / controller / gate-result references,
  `harness:execute`, worker prompt template, generated run/DAG/worker prompts,
  protocol checks, and smoke checks. Spec:
  `harness/specs/2026-07-08-behavior-eval-and-degraded-execution-provenance.md`;
  goal:
  `harness/goals/2026-07-08-implement-behavior-eval-and-degraded-execution-provenance-for-harness.md`;
  run:
  `.harness/runs/20260708-114327-implement-behavior-eval-and-degraded-execution-provenance-for-harness/`.
  Delivery state is `validated-local`; no commit, push, review, integration,
  publish, release, deploy, production access, daemon, watcher, paid API,
  credential, or destructive operation was performed.

- Current focus: Control-theory-inspired Harness stability implementation is
  complete and verified in the local checkout. Added
  `docs/cybernetic-stability.md` as the dedicated model; updated README /
  README.zh-CN, CHANGELOG, `docs/releases/v0.5.0.md`, package and plugin
  version metadata, the capability matrix, project contract, social preview
  source, task routing, `harness:orient`, `harness:intake`, `harness:execute`,
  goal/spec/worker templates, CLI-generated goal/run/prompt/subagent guidance,
  and deterministic checks for the `0.5.0` cybernetic stability line. The model
  now has stable protocol anchors for `harness-rule:intent-setpoint-selection`,
  `harness-rule:sensor-freshness`, `harness-rule:measurement-snapshot`,
  `harness-rule:remaining-gap`, `harness-rule:feedback-quality`, and
  `harness-rule:stability-saturation`. Spec:
  `harness/specs/2026-07-06-cybernetic-stability-model-for-agent-harness.md`.
  Verification passed: `node --check
  plugins/agent-harness/scripts/agent-harness.mjs`, `node --check
  scripts/test-suites.mjs`, `node --check tests/smoke.mjs`, `git diff --check`,
  `npm run test:protocol`, `npm run test:presentation`, `npm run test:smoke`,
  `npm run test:all`, and `npm run validate:plugin`. Delivery state is
  `validated-local`; no commit, push, review, integration, publish, release,
  deploy, production access, daemon, watcher, paid API, credential, or
  destructive operation was performed.

- Current focus: EnvContext focus and intent-routing model is implemented and
  verified in the local checkout. `harness-rule:context-focus-routing` now
  defines the routing order: normalize user intent to `Milestone`, `Goal`,
  `Task`, `Run`, `Priority`, or `Spec` before selecting the smallest useful
  context focus. Harness context layers are `entry/channel`, `modality`,
  `dialog`, `project/world`, `capability`, and `self/control`; default focus
  presets now cover `orient`, `intake`, `shape`, `goal`, and `execute`, with
  token/noise and lost-in-the-middle controls. `EnvContext` remains internal
  design language only; no public `--focus` CLI parameter, schema/config
  field, storage migration, activation behavior, or external dependency was
  added. Spec:
  `harness/specs/2026-07-04-envcontext-focus-and-intent-routing-model.md`;
  goal:
  `harness/goals/2026-07-04-shape-envcontext-focus-and-intent-routing-model-for-harness.md`;
  run:
  `.harness/runs/20260704-190518-shape-envcontext-focus-and-intent-routing-model-for-harness/`.
  Delivery state is `validated-local`; no commit, push, review, integration,
  publish, release, deploy, production access, daemon, watcher, paid API,
  credential, or destructive operation was performed.

- Current focus: Level 0 Fast Path direct-execution policy is implemented and
  verified in the local checkout. `harness-rule:level-0-fast-path` now defines
  direct execution as a narrow exception for small local, reversible, low-risk
  fixes by an `implementer` or explicitly accepted `mixed` thread. It cannot
  bypass accepted Harness artifacts, adapter gates, Controller/gate/review/
  acceptance roles, product/project semantics, public protocol or
  source-of-truth changes, schemas, external systems, credentials, paid or
  production access, destructive operations, or larger Goal/Milestone work.
  Level 0 closeouts still require a route reason, scoped diff summary,
  concrete verification, Delivery State, `Need user`, and `Remaining`. Spec:
  `harness/specs/2026-07-04-level-0-fast-path-direct-execution-policy.md`;
  goal:
  `harness/goals/2026-07-04-shape-level-0-fast-path-direct-execution-policy.md`;
  run:
  `.harness/runs/20260704-181600-shape-level-0-fast-path-direct-execution-policy/`.
  Delivery state is `validated-local`; no commit, push, review, integration,
  publish, release, deploy, production access, daemon, watcher, paid API,
  credential, or destructive operation was performed.

- Current focus: The earlier bundled lower-friction workflow intake has been
  split into separate Goals in the Goal index. The lightweight
  human-verification checklist / Need-user digest Goal is implemented and
  verified in the local checkout. `harness-rule:need-user-digest` now requires
  routine closeouts to state `Need user: None` / `Remaining: None` when no true
  pause trigger or follow-up exists, while concrete human decisions,
  user-required manual verification, authorization, credentials/paid APIs,
  production access, destructive-operation approval, product direction, or
  external evidence remain explicit `Need user` items. Spec:
  `harness/specs/2026-07-04-lightweight-human-verification-checklist-need-user-digest.md`;
  goal:
  `harness/goals/2026-07-04-shape-lightweight-human-verification-checklist-and-need-user-digest.md`;
  run:
  `.harness/runs/20260704-170345-shape-lightweight-human-verification-checklist-and-need-user-digest/`.
  The former remaining control-theory feedback-loop split Goal is now
  completed by the `0.5.0` cybernetic stability implementation. Delivery state is
  `validated-local`; no commit, push, review, integration, publish, release,
  deploy, production access, daemon, watcher, paid API, credential, or
  destructive operation was performed.

- Current focus: Current project adapter and storage artifacts are aligned with
  the Goal-first terminology in the local checkout. `harness/README.md` now
  declares `Roadmap -> Milestone -> Goal -> Task -> Run`, intent normalization,
  and the compatibility boundary for the existing `harness/tasks.md` /
  `taskIndex` storage path. `harness/mental-models/` now describes Goal state,
  Goal index storage, Goal-internal Tasks, Runs as execution attempts, and
  Milestones as roadmap outcomes. `harness/tasks.md` and `harness/status.md`
  now use `Milestone Completion Map` as the formal project-state term, with
  `Stage Completion Map` only where documenting legacy compatibility. Delivery
  state is `validated-local`; no commit, push, review, integration, publish,
  release, deploy, production access, daemon, watcher, paid API, credential, or
  destructive operation was performed.

- Current focus: Agent Harness README diagram refresh is implemented and
  verified in the local checkout. `docs/assets/readme/adapter-model.png` and
  `docs/assets/readme/adapter-execution-model.png` were regenerated from new
  SVG sources to present `Roadmap -> Milestone -> Goal -> Task -> Run`,
  with `Goal` as the main work unit, `Task` as internal breakdown, and `Run`
  as evidence attempt. `docs/assets/readme/adapter-artifact-map.png` was
  inspected and left unchanged because it already uses `Milestones` and no
  `Stage` term. Spec:
  `harness/specs/2026-07-04-agent-harness-readme-diagram-refresh.md`; goal:
  `harness/goals/2026-07-04-refresh-agent-harness-readme-diagrams-for-terminology-hierarchy.md`;
  run:
  `.harness/runs/20260704-160154-refresh-agent-harness-readme-diagrams-for-terminology-hierarchy/`.
  Delivery state is `validated-local`; no commit, push, review, integration,
  publish, release, deploy, production access, daemon, watcher, paid API,
  credential, or destructive operation was performed.

- Current focus: Agent Harness terminology simplification is implemented and
  verified in the local checkout. User-facing terminology now follows
  `Roadmap -> Milestone -> Goal -> Task -> Run`; `P0` / `P1` / `P2` / `P3`
  are documented as priority only; `Milestone Completion Map` is the new
  generated/CLI term; legacy `Stage Completion Map` remains readable as a
  compatibility alias only. Spec:
  `harness/specs/2026-07-04-agent-harness-terminology-simplification.md`;
  goal:
  `harness/goals/2026-07-04-shape-agent-harness-terminology-simplification-and-prioritystage-separation.md`;
  run:
  `.harness/runs/20260704-154151-shape-agent-harness-terminology-simplification-and-prioritystage-separation/`.
  Delivery state is `validated-local`; no commit, push, review, integration,
  publish, release, deploy, production access, daemon, watcher, paid API,
  credential, or destructive operation was performed.

- Current focus: GitHub presentation pass for the profile-pinned
  `0xenzyme/agent-harness` repository is complete. README / README.zh-CN now
  have badges, positioning, release links, and a social preview reference;
  GitHub repository description and topics are applied; `v0.4.0` tag is pushed;
  GitHub Release `v0.4.0` is published at
  `https://github.com/0xenzyme/agent-harness/releases/tag/v0.4.0`. Delivery
  reached released state for this presentation pass.

- Current focus: Agent Harness version metadata is aligned at `0.4.0` in the
  local checkout after the Impeccable-inspired productization improvements.
  README, README.zh-CN, and `docs/versioning.md` now document the `0.4.0`
  version line for the capability matrix, stable `harness-rule:*` anchors, and
  suite-routing surface. Delivery remains local metadata/docs sync only; no
  publish, release, commit, push, review, or integration action was performed.

- Current focus: Impeccable-inspired Agent Harness productization improvements
  are implemented and accepted in the local checkout. The work added the
  project-neutral capability matrix `docs/HARNESSES.md`, stable
  `harness-rule:*` anchors, deterministic protocol validation, and lightweight
  suite routing through `npm run test:protocol` / `npm run test:all`. The
  current thread acted as `gate-only` controller; implementation and
  verification ran through the prepared DAG at
  `.harness/runs/20260701-235053-apply-impeccable-inspired-harness-productization-improvements/`.
  Delivery state remains local validation only; commit, push, review,
  integration, publish, and release are not authorized.

- Current focus: Milestone completion coverage gate for parent roadmap
  milestones is implemented in the local checkout. The fix now presents
  `Milestone Completion Map` in new artifacts and CLI output, with legacy
  `Stage Completion Map` accepted only as compatibility input. A request such
  as `推进完成M5` is treated as whole-milestone completion, and a parent
  milestone cannot be closed after only `M5-S0` source-spec acceptance while
  `M5-D*` implementation items remain pending. Delivery state remains local;
  commit, push, review, integration, publish, and release are not authorized.

- Current focus: Agent Harness adapter migration ergonomics in the current
  checkout. The current thread was explicitly authorized as `mixed` for this
  local implementation/control pass after geocn adapter migration review.
  Implemented `orient next` task-state routing, `config import` path
  overrides, and controlled `goal create --allow-no-spec` support. Table-based
  task-index writeback remains deferred with a documented implementation
  boundary. The prior docs engineering audit also remains in the same local
  dirty checkout: spec
  `harness/specs/2026-07-01-docs-engineering-audit.md`, goal
  `harness/goals/2026-07-01-agent-harness-docs-engineering-audit.md`, and run
  `.harness/runs/20260701-120641-agent-harness-docs-engineering-audit/` have
  completed their DAG nodes, passed verification, and recorded completed run
  evidence. A follow-up added lightweight Chinese install and usage docs
  without creating a full Chinese contract mirror. Another follow-up decoupled
  integration-line wording from branch name `main`. Final delivery state
  remains local documentation changes; commit, push, review, integration,
  publish, and release are not authorized.

## Git

- Preferred work mode: local for foreground contract / CLI / documentation
  work unless the user asks for an isolated worktree.
- Current branch: main
- Worktree notes: Work is in the current checkout per user instruction; no
  additional worktree, branch, review request, deploy, daemon, watcher, or
  release action was created. `main` is the current execution branch for this
  repository, not a core Harness assumption about every project's integration
  line. Worker implementation was routed through the run DAG and accepted by
  the control lane after verification.

## Verification

- Last checked: 2026-07-08
- Last commands:
  - Completed accepted spec
    `harness/specs/2026-07-08-behavior-eval-and-degraded-execution-provenance.md`.
  - Completed and validated gate-only goal
    `harness/goals/2026-07-08-implement-behavior-eval-and-degraded-execution-provenance-for-harness.md`
    with current-thread controller ownership, current checkout lock, and target
    delivery state `validated-local`.
  - Prepared run packet
    `.harness/runs/20260708-114327-implement-behavior-eval-and-degraded-execution-provenance-for-harness/`;
    recorded completed DAG nodes: `explorer`, `worker`, and `verification`,
    then accepted the run through controller gate evidence.
  - Added trace-shaped behavior eval coverage for `harness:orient`
    read-only behavior, `harness:execute` gate-only worker candidate evidence,
    degraded execution provenance, and gate-only accepted-state requirements.
  - Added `harness-rule:degraded-execution-provenance` to protocol docs,
    workflow references, generated prompts, protocol checks, and smoke checks.
  - Verification passed: `node --check evals/run-agent-harness-eval.mjs`,
    `node --check scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `node --check plugins/agent-harness/scripts/agent-harness.mjs`, `npm run
    test:eval`, `npm run test:protocol`, `npm run test:smoke`, `npm run
    validate:plugin`, and `git diff --check`.
  - Created accepted spec
    `harness/specs/2026-07-04-envcontext-focus-and-intent-routing-model.md`.
  - Created and validated gate-only goal
    `harness/goals/2026-07-04-shape-envcontext-focus-and-intent-routing-model-for-harness.md`
    with current-thread route, current checkout lock, and target delivery state
    `validated-local`.
  - Prepared run packet
    `.harness/runs/20260704-190518-shape-envcontext-focus-and-intent-routing-model-for-harness/`;
    recorded completed DAG nodes: `explorer`, `cli-contract-worker`,
    `docs-skill-worker`, and `verification`.
  - Added `harness-rule:context-focus-routing` to the capability matrix,
    project contract docs, task-routing reference, `harness:orient`,
    `harness:intake`, `harness:execute`, goal/spec/worker templates, generated
    goal/run/prompt/worker text, protocol checks, and smoke checks.
  - Defined Harness context layers: `entry/channel`, `modality`, `dialog`,
    `project/world`, `capability`, and `self/control`; defined focus presets
    for `orient`, `intake`, `shape`, `goal`, and `execute`; kept `EnvContext`
    internal and did not add `--focus`, schema/config fields, storage
    migration, activation changes, or external dependencies.
  - Verification passed: `node --check
    plugins/agent-harness/scripts/agent-harness.mjs`, `node --check
    scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, `git diff --check`, `goal validate`, and
    `run status --json`.
  - Created accepted spec
    `harness/specs/2026-07-04-level-0-fast-path-direct-execution-policy.md`.
  - Created and validated gate-only goal
    `harness/goals/2026-07-04-shape-level-0-fast-path-direct-execution-policy.md`
    with current-thread route, current checkout lock, and target delivery state
    `validated-local`.
  - Prepared run packet
    `.harness/runs/20260704-181600-shape-level-0-fast-path-direct-execution-policy/`;
    recorded completed DAG nodes: `explorer`, `cli-contract-worker`,
    `docs-skill-worker`, and `verification`.
  - Added `harness-rule:level-0-fast-path` to the capability matrix, project
    contract docs, task-routing reference, `harness:execute` guidance,
    execution-role reference, goal and worker templates, generated goal/run/
    prompt text, protocol checks, and smoke checks.
  - Defined direct-execution thresholds: Level 0 is only for small local,
    reversible, low-risk fixes by an `implementer` or explicitly accepted
    `mixed` thread; `gate-only` Controllers cannot use Level 0 to edit
    implementation files, and accepted Harness artifacts or adapter gates must
    keep normal Harness flow.
  - Verification passed: `node --check
    plugins/agent-harness/scripts/agent-harness.mjs`, `node --check
    scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, `git diff --check`, `goal validate`, and
    `run status --json`.
  - Created accepted spec
    `harness/specs/2026-07-04-lightweight-human-verification-checklist-need-user-digest.md`.
  - Created and validated goal
    `harness/goals/2026-07-04-shape-lightweight-human-verification-checklist-and-need-user-digest.md`
    with execution role `mixed`, current-thread route, current checkout lock,
    and target delivery state `validated-local`.
  - Prepared run packet
    `.harness/runs/20260704-170345-shape-lightweight-human-verification-checklist-and-need-user-digest/`;
    recorded completed DAG nodes: `explorer`, `cli-contract-worker`,
    `docs-skill-worker`, and `verification`.
  - Added `harness-rule:need-user-digest` to the capability matrix, project
    contract docs, `harness:execute` closeout guidance, user-facing closeout
    reference, Controller communication packets, goal template, generated run
    packets, and worker prompt template.
  - Updated generated run and execution prompts so routine closeouts use
    `Need user: None` and `Remaining: None` instead of broad confirmation
    questions.
  - Added deterministic coverage in `scripts/test-suites.mjs` and
    `tests/smoke.mjs` for the closeout reference, Controller packets, worker
    prompts, generated `run.md`, generated `prompt.md`, and generated worker
    prompts.
  - Verification passed: `node --check
    plugins/agent-harness/scripts/agent-harness.mjs`, `node --check
    scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, `git diff --check`, `goal validate`, and
    `run status --json`.
  - Split the bundled lower-friction workflow intake in `harness/tasks.md` into
    four separate Next Goals: human-verification checklist / Need-user digest,
    Level 0 Fast Path direct-execution policy, EnvContext focus / intent
    routing, and control-theory feedback-loop research.
  - Preserved completed terminology, README diagram, and current project
    adapter/storage terminology records as Done instead of duplicating them in
    Next.
  - Updated current project adapter `harness/README.md` with the
    `Roadmap -> Milestone -> Goal -> Task -> Run` terminology contract, intent
    normalization, and compatibility note for `harness/tasks.md` / `taskIndex`
    storage.
  - Updated `harness/mental-models/` to use Goal state, Goal index storage,
    Goal-internal Tasks, Runs as execution attempts, and Milestones as roadmap
    outcomes.
  - Updated `harness/tasks.md` and `harness/status.md` project-state records to
    use `Milestone Completion Map` as the formal term, with `Stage Completion
    Map` only as legacy compatibility language.
  - Validation passed: `git diff --check` and terminology scans over
    `harness/README.md`, `harness/tasks.md`, `harness/status.md`, and
    `harness/mental-models/`.
  - Created accepted diagram refresh spec
    `harness/specs/2026-07-04-agent-harness-readme-diagram-refresh.md`.
  - Created, narrowed, and validated goal
    `harness/goals/2026-07-04-refresh-agent-harness-readme-diagrams-for-terminology-hierarchy.md`
    with execution role `mixed` and target delivery state `validated-local`.
  - Prepared run packet
    `.harness/runs/20260704-160154-refresh-agent-harness-readme-diagrams-for-terminology-hierarchy/`
    and recorded completed DAG nodes: `explorer`, `worker`, and
    `verification`.
  - Added maintained SVG sources
    `docs/assets/readme/adapter-model.svg` and
    `docs/assets/readme/adapter-execution-model.svg`, then regenerated
    `adapter-model.png` and `adapter-execution-model.png` with `sips` at
    1672x941.
  - Visually inspected regenerated PNGs for legibility, overlap, and current
    `Roadmap -> Milestone -> Goal -> Task -> Run` terminology; inspected
    `adapter-artifact-map.png` and left it unchanged because it already uses
    `Milestones` and no `Stage` term.
  - Extended `scripts/test-suites.mjs` and `tests/smoke.mjs` to protect README
    diagram links, SVG terminology, and removal of the old task-first artifact
    phrase.
  - Verification passed: `sips -g pixelWidth -g pixelHeight`, `node --check
    scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:presentation`, `npm run test:protocol`,
    `npm run test:smoke`, `npm run validate:plugin`, and
    `git diff --check`.
  - Created accepted terminology spec
    `harness/specs/2026-07-04-agent-harness-terminology-simplification.md`.
  - Created, narrowed, and validated goal
    `harness/goals/2026-07-04-shape-agent-harness-terminology-simplification-and-prioritystage-separation.md`
    with execution role `mixed` and target delivery state `validated-local`.
  - Prepared run packet
    `.harness/runs/20260704-154151-shape-agent-harness-terminology-simplification-and-prioritystage-separation/`
    and recorded completed DAG nodes: `explorer`, `cli-contract-worker`,
    `docs-skill-worker`, and `verification`.
  - Updated README, README.zh-CN, CLI/install docs, project contract docs,
    execute/intake skill guidance, completion/adversarial/gate references,
    task-routing, goal/spec/task-index templates, social preview text, and
    GitHub presentation flow for the terminology hierarchy and Milestone
    wording.
  - Updated `plugins/agent-harness/scripts/agent-harness.mjs` to generate and
    report `Milestone Completion Map`, preserve legacy `Stage Completion Map`
    reads, expose primary `milestoneCompletionMap*` status fields, and keep
    legacy `stageCompletionMap*` aliases.
  - Added `harness-rule:terminology-boundary` protocol coverage and smoke
    checks for hierarchy, priority-only labels, intent normalization, Run/thread
    separation, Milestone Completion Map generation, and legacy Stage alias
    compatibility.
  - Verification passed: `node --check
    plugins/agent-harness/scripts/agent-harness.mjs`, `node --check
    scripts/test-suites.mjs`, `node --check tests/smoke.mjs`,
    `npm run test:protocol`, `npm run test:smoke`,
    `npm run validate:plugin`, and `git diff --check`.
  - Goal validation passed for
    `harness/goals/2026-07-04-shape-agent-harness-terminology-simplification-and-prioritystage-separation.md`.
  - Recorded completed run log
    `.harness/runs/20260704-154151-shape-agent-harness-terminology-simplification-and-prioritystage-separation/logs/20260704-155322-completed.md`
    with delivery state `validated-local`.
  - Created accepted spec
    `harness/specs/2026-07-02-github-presentation-pass.md`.
  - Created and validated goal
    `harness/goals/2026-07-02-github-presentation-pass.md`.
  - Prepared run packet
    `.harness/runs/20260702-025928-github-presentation-pass/`.
  - Added presentation assets and docs: `docs/assets/github/social-preview.svg`,
    `docs/github-presentation.md`, `CHANGELOG.md`,
    `docs/releases/v0.4.0.md`, and `LICENSE`.
  - Updated README / README.zh-CN first screen with badges, positioning, release
    links, and social preview reference.
  - Added `npm run test:presentation` and updated `npm run test:all`, suite
    routing docs, and smoke checks for presentation assets.
  - Applied GitHub repository description and topics to
    `0xenzyme/agent-harness` with authenticated `gh`.
  - Verified locally with `npm run test:presentation`,
    `npm run test:protocol`, `npm run test:smoke`, `npm run test:all`,
    `npm run validate:plugin`, `git diff --check`, and `goal validate`.
  - Committed `1a622a5` (`Polish GitHub presentation for v0.4.0`) and pushed
    `main`.
  - Created and pushed Git tag `v0.4.0`.
  - Created GitHub Release `v0.4.0`:
    `https://github.com/0xenzyme/agent-harness/releases/tag/v0.4.0`.
  - Recorded completed run log
    `.harness/runs/20260702-025928-github-presentation-pass/logs/20260702-030659-completed.md`
    with delivery state `released/shipped`.
  - Verified remote delivery with `gh repo view`,
    `git ls-remote --tags origin v0.4.0`, and `gh release view v0.4.0`.
  - Updated Agent Harness version metadata from `0.3.0` to `0.4.0` in
    `package.json` and `plugins/agent-harness/.codex-plugin/plugin.json`.
  - Updated README, README.zh-CN, and `docs/versioning.md` so the documented
    current version matches the capability matrix, stable `harness-rule:*`
    anchors, and suite-routing work.
  - Version sync verification passed: direct version alignment check,
    `npm run test:protocol`, `npm run test:smoke`, `npm run validate:plugin`,
    and `git diff --check`.
  - Recorded the Impeccable-inspired productization task in
    `harness/tasks.md`.
  - Created and validated spec-less goal
    `harness/goals/2026-07-01-apply-impeccable-inspired-harness-productization-improvements.md`.
  - Prepared run packet
    `.harness/runs/20260701-235053-apply-impeccable-inspired-harness-productization-improvements/`
    with execution role `gate-only`, default worker surface
    `codex-cli-subagent`, and target delivery state `validated-local`.
  - Recorded completed DAG nodes: `explorer`, `worker`, and `verification`.
  - Added `docs/HARNESSES.md` as a project-neutral capability matrix for
    runtime/control surfaces, defaults, boundaries, applicability, and
    suite-routing expectations.
  - Added stable `harness-rule:*` anchors for gate-only controller behavior,
    local delivery ceilings, default worker surface, project-neutral core
    content, and state-sync evidence.
  - Added deterministic protocol validation with
    `scripts/test-suites.mjs`, `npm run test:protocol`, `npm run test:all`, and
    smoke checks for rule anchors and matrix links.
  - Linked the capability matrix and suite-routing guidance from README,
    README.zh-CN, install docs, CLI docs, and project-contract docs.
  - Verification passed: `node --check scripts/test-suites.mjs`,
    `node --check tests/smoke.mjs`,
    `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `npm run test:protocol`, `npm run test:smoke`, `npm run test:all`,
    `npm run validate:plugin`, `git diff --check`, `goal validate`, and
    `run status --json`.
  - Recorded completed run log
    `.harness/runs/20260701-235053-apply-impeccable-inspired-harness-productization-improvements/logs/20260702-001312-completed.md`
    with delivery state `validated-local`.
  - Implemented `Milestone Completion Map` parsing and validation in
    `plugins/agent-harness/scripts/agent-harness.mjs`.
  - Updated `goal create --spec` to generate pending Milestone map items from
    a referenced spec's `Implementation Phasing` headings such as `M5-S0` and
    `M5-D1`.
  - Updated `run prepare`, `run status --json`, and
    `run record --phase completed` so parent Milestone runs carry and enforce
    Milestone completion evidence.
  - Updated Milestone-completion protocol docs in `docs/project-contract.md`,
    `plugins/agent-harness/skills/execute/SKILL.md`, execute references,
    `plugins/agent-harness/references/gate-results.md`, and goal/spec
    templates.
  - Added smoke coverage for missing, pending, and satisfied
    `Milestone Completion Map` cases.
  - Verified the wiki regression: local
    `agent-harness goal validate --cwd /Users/liuyj/project/wiki --goal docs/harness/goals/2026-07-01-m5-diagnosis-actions-briefs-reports.md`
    now fails with `Milestone completion goals require a Milestone Completion
    Map`.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `node --check tests/smoke.mjs`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `git diff --check`
  - Switched/confirmed branch `main`; branch is up to date with `origin/main`.
  - Recorded the docs engineering task in `harness/tasks.md`.
  - Created accepted spec
    `harness/specs/2026-07-01-docs-engineering-audit.md`.
  - Created and validated goal
    `harness/goals/2026-07-01-agent-harness-docs-engineering-audit.md`.
  - Prepared run packet
    `.harness/runs/20260701-120641-agent-harness-docs-engineering-audit/`;
    ready node is `explorer`, default worker surface is
    `codex-cli-subagent`.
  - Recorded completed DAG nodes: `explorer`, `cli-contract-worker`,
    `docs-skill-worker`, and `verification`.
  - Updated README files, CLI docs, install docs, project contract docs,
    execute skill docs, plugin references, and the goal template for current
    workflow-controller, delivery-state, subagent, and acceptance-gate
    behavior.
  - Updated goal/spec checklist and required gate evidence to `satisfied`.
  - Verification passed: `git diff --check`, `npm run test:smoke`,
    `npm run validate:plugin`, `goal validate`, and `run status --json`.
  - `npm run test:eval` skipped because eval docs and fixtures were not
    changed.
  - Recorded completed run log
    `.harness/runs/20260701-120641-agent-harness-docs-engineering-audit/logs/20260701-122720-completed.md`
    with delivery state `validated-local`.
  - Added `docs/install.zh-CN.md` and linked it from `README.zh-CN.md` and
    `docs/cli.zh-CN.md`.
  - Verified the Chinese docs follow-up with `git diff --check`,
    `npm run test:smoke`, and `npm run validate:plugin`.
  - Replaced branch-bound integration wording with `target integration line` /
    `complete on the integration line`.
  - Clarified in `docs/project-contract.md`, the goal template, generated goal
    content, task-routing reference, execute skill docs, and Chinese install
    guide that Harness core does not assume the integration line is named
    `main`; branch choices belong to the adapter, confirmed goal, or explicit
    user instruction.
  - Verified the branch-adaptability follow-up with
    `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `git diff --check`, `npm run test:smoke`, and
    `npm run validate:plugin`.
  - Implemented geocn adapter migration ergonomics: `orient next` now avoids
    unusable goal creation recommendations for P0/P1 missing-spec tasks,
    `config import` accepts adapter path overrides and exposes
    `proposedConfig` in `--dry-run --json`, and adapter spec-less goal creation
    is available only through explicit `--allow-no-spec`.
  - Added validation for spec-less goals so they still require Scope,
    Non-Goals, Verification, Completion Conditions, Pause Conditions,
    Execution Role, and Delivery State. Run packets and prompts no longer ask
    workers to read a `TBD` spec for explicit spec-less goals.
  - Documented table-based `maintain tasks --record` task-index writeback as
    deferred until row matching is uniquely by task title, a recognized
    `Status` column, and a bounded status transition.
  - Verified the geocn migration ergonomics follow-up with
    `node --check plugins/agent-harness/scripts/agent-harness.mjs`,
    `node --check tests/smoke.mjs`, `npm run test:smoke`,
    `git diff --check`, `npm run validate:plugin`, and
    `config validate --json`.
  - Changed generated/manual goal Delivery State defaults from
    `validated-local` to `integrated` with `Delivery intent:
    integrate-after-gates`, commit/push/integration authorized, review
    optional, and release unauthorized.
  - Replaced provider-specific delivery vocabulary with `review-open` and
    `integrated`; kept `PR-open`, `--pr-url`, `Merge authorized`, and
    `--merge-sha` as compatibility aliases.
  - Removed default Non-Goals / Pause Conditions that treated push / review /
    integration as inherently user-blocking; delivery now pauses only when a
    step exceeds the active Delivery State policy.
  - Updated generated run packets, prompts, run record logs/status output,
    `harness:execute`, project contract docs, CLI docs, README files, goal
    template, and smoke tests for provider-neutral delivery.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `node --check tests/smoke.mjs`
  - `npm run test:smoke`
  - `git diff --check`
  - `npm run validate:plugin`
  - Added `Conversation Route`, `Execution Context Lock`, and `Delivery State`
    protocol fields to generated/manual goals, run packets, prompts, status,
    and run record logs.
  - Added `goal validate` checks for `worktree` goals that omit route/lock
    proof or mis-declare remote-control worktree execution.
  - Added delivery-state snapshots to `run prepare`, `run status`, and
    `run record`, including dirty working tree, commit, push, PR, merge, and
    release fields.
  - Added delivery target policy validation: targets above `validated-local`
    require matching authorization, and completed run records fail when actual
    delivery state is below target.
  - Added `--pr-url`, `--merge-sha`, and `--release-ref` evidence fields for
    PR / merge / release delivery states that Git status alone cannot infer.
  - Changed execution DAG worker-surface policy to default to
    `codex-cli-subagent`; new Codex threads are explicit visible handoff lanes,
    not default workers.
  - Added gate-only DAG/run guidance so clear implementation work dispatches to
    worker subagents rather than asking the user whether to switch the control
    thread to `mixed`.
  - Updated `harness:execute`, execution-role guidance, controller packets,
    task routing, project contract docs, CLI docs, templates, and smoke tests.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `npm run test:smoke`
  - `git diff --check`
  - `npm run validate:plugin`
  - Added `evals/skills/agent-harness/trigger_cases.yaml` with 36 activation
    cases: 20 positive, 10 negative, and 6 boundary.
  - Added `evals/skills/agent-harness/task_cases.yaml` with four deterministic
    task cases for new, legacy, non-harness, and messy-realistic project
    shapes.
  - Added `evals/skills/agent-harness/transcript_rubric.md`,
    `evals/run-agent-harness-eval.mjs`, `evals/results/index.md`, and
    `npm run test:eval`.
  - Updated `evals/README.md` with the repeatable skill eval workflow.
  - `node --check evals/run-agent-harness-eval.mjs`
  - `npm run test:eval`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `git diff --check`
  - `node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .`
  - Created `harness/specs/2026-06-30-complete-open-task-batch.md`.
  - Created `harness/goals/2026-06-30-complete-open-task-batch.md`.
  - Prepared run packet
    `.harness/runs/20260630-160325-complete-open-task-batch/`.
  - Added `Execution Role` validation to `goal validate`.
  - Propagated execution role into `run.md`, `prompt.md`, and `status.json`.
  - Updated `run record` so completed records require `--verification` and
    completed `gate-only` records require `--gate-evidence`.
  - Added smoke coverage for execution role validation, missing verification,
    `gate-only` gate evidence, bilingual fallback metadata, packaging
    boundary docs, and agent-neutral delegation docs.
  - Updated README files, install docs, project contract docs, plugin
    references, workflow skills, plugin metadata, and the goal template.
  - Rechecked conditional bootstrap with a temporary hook manifest; validation
    still rejects `plugin.json` field `hooks`.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-complete-open-task-batch.md`
  - `node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd . --run .harness/runs/20260630-160325-complete-open-task-batch --phase completed ...`
  - Created
    `harness/specs/2026-06-30-source-task-acceptance-coverage-gate.md`.
  - Created
    `harness/goals/2026-06-30-source-task-acceptance-coverage-gate.md`.
  - Added `Source Task Acceptance Map` parsing and validation.
  - `goal validate` now rejects batch goals without an acceptance map or with
    malformed map items.
  - `run prepare` records acceptance-map metadata in run `status.json`.
  - `run record --phase completed` now rejects batch runs unless every mapped
    item is `satisfied` with concrete evidence.
  - Added smoke coverage for missing, pending, and satisfied acceptance maps.
  - Added the blocked README CLI relocation follow-up back to `harness/tasks.md`.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-source-task-acceptance-coverage-gate.md`
  - `node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd . --run .harness/runs/20260630-162929-source-task-acceptance-coverage-gate --phase completed ...`
  - Created
    `harness/specs/2026-06-30-root-readme-cli-relocation.md`.
  - Created
    `harness/goals/2026-06-30-root-readme-cli-relocation.md`.
  - Prepared run packet
    `.harness/runs/20260630-163748-root-readme-cli-relocation/`.
  - Added `docs/cli.md` and `docs/cli.zh-CN.md`.
  - Removed detailed `agent-harness` CLI command catalog content from
    `README.md` and `README.zh-CN.md`.
  - Updated smoke coverage so root README files must link to `docs/cli*` and
    must not contain the detailed CLI command catalog.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-root-readme-cli-relocation.md`
  - `node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd . --run .harness/runs/20260630-163748-root-readme-cli-relocation --phase completed ...`
  - Created
    `harness/specs/2026-06-30-master-acceptance-and-adapter-gates.md`.
  - Created
    `harness/goals/2026-06-30-master-acceptance-and-adapter-gates.md`.
  - Prepared run packet
    `.harness/runs/20260630-171105-master-acceptance-and-adapter-gates/`.
  - Added config schema and adapter template support for
    `gates.requiredForCompletion` and `gates.blocking`.
  - Added `Spec Acceptance Checklist` and `Required Gate Evidence` parsing,
    goal validation metadata, run metadata, and completed-run blocking checks.
  - Updated `harness:execute`, project contract docs, gate/controller
    references, spec/goal templates, and smoke tests.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `git diff --check`
  - `npm run test:smoke`
  - `npm run validate:plugin`
  - `node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/2026-06-30-master-acceptance-and-adapter-gates.md`
  - `node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd . --run .harness/runs/20260630-171105-master-acceptance-and-adapter-gates --phase completed ...`
  - Added execution DAG generation to `run prepare`: `dag.json`, `dag.md`, and
    per-node `agents/<node>/prompt.md` / `status.json` artifacts.
  - Added `run node record` with dependency-order checks, required verification
    for completed nodes, worker thread/surface metadata, and run-level
    ready-node updates.
  - Updated `run status --json` to expose execution DAG readiness and updated
    completed-run gating so enforced DAG runs require all nodes to complete.
  - Documented fresh Codex thread / Codex CLI subagent preference, fork as an
    explicit exception, and controller-gated parallel ready-node execution.
  - Added smoke coverage for large-run DAG artifacts, dependency refusal,
    parallel worker release, verification release, and completed-run gating.
  - `node --check plugins/agent-harness/scripts/agent-harness.mjs`
  - `node --check tests/smoke.mjs`
  - `npm run test:smoke`
  - `git diff --check`
  - `npm run validate:plugin`
- Result: passed. Latest eval harness work was validated through eval,
  smoke/plugin, diff, syntax, and doctor checks without creating a new run
  packet. Prior run evidence remains completed at
  `.harness/runs/20260630-171105-master-acceptance-and-adapter-gates/`.

## Blockers

- None recorded.
