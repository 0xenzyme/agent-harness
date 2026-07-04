# Spec: Agent Harness Terminology Simplification

Created: 2026-07-04
Status: accepted

## Background

Agent Harness currently mixes roadmap phase language, priority labels, task
index titles, goals, runs, and legacy `Stage Completion Map` wording. That
creates ambiguity for both English and Chinese users:

- `P0` / `P1` / `P2` / `P3` can look like task or phase identifiers when they
  should only be priority labels.
- `M1` / `M2` / `M5` can be confused with priority or task names when they
  should identify roadmap milestones.
- User phrases such as "complete this task" or "用 harness 做这个任务" often mean
  "create and execute a Goal", while questions about checklist details mean
  "show the Tasks inside the Goal".
- Existing parent-stage safeguards solve a real acceptance bug, but the formal
  user-facing term should now be `Milestone`, not `Stage`.

The user has confirmed the terminology decisions below and asked this
repository to land them as a stable protocol, documentation, template, CLI, and
verification update.

## Goal

Simplify Agent Harness user-facing terminology around this main line:

`Roadmap -> Milestone -> Goal -> Task -> Run`

Use `Milestone` for roadmap phase completion in new docs, templates, and CLI
output. Keep `Stage` only as a legacy migration note that says `Stage` was
renamed to `Milestone`.

## Key Decisions

- `Roadmap`: longer-range product or engineering direction.
- `Milestone`: a phase-level roadmap outcome. It is usually too large for
  Harness to promise in one execution. Requests such as `complete M5` or
  `推进完成M5` mean `complete Milestone M5`, which requires evidence across
  multiple Goals.
- `Goal`: the main Harness work unit. Users confirm a Goal's direction, scope,
  and acceptance points. Most Goals should finish in one Run, but a Goal may
  take multiple Runs.
- `Task`: a concrete breakdown item inside a Goal, such as checklist,
  execution steps, or sub-work. Users should be able to inspect Tasks because
  they explain what a Goal contains.
- `Run`: one execution attempt and evidence record. A Run is not equal to a
  thread or session and must not bind to a thread/session identity. A Run may
  span workers, subagents, and worktrees.
- `Priority`: `P0` / `P1` / `P2` / `P3` mean priority only. They are not task
  names, stages, or milestone identifiers.
- `Spec`: a user-visible specification, constraint, and acceptance document.

## Intent Normalization

Normalize natural-language user intent before choosing a Harness route:

- "完成这个任务", "开发这个任务", "用 harness 做这个任务" -> `Goal`
- "这个任务包含哪些步骤", "子任务", "checklist" -> `Tasks`
- "complete M2", "完成 M2", "推进 M5" -> `Milestone`
- "再跑一次", "这次执行", "上次失败那次" -> `Run`
- `P0` / `P1` / `P2` / `P3` -> `Priority`
- `Spec`, document, 文档, 规格, 验收标准 -> `Spec`

Core rule: when a user says "帮我做这个任务", map it to a `Goal` by default.
When the user asks what that Goal contains, show `Tasks`. Agent execution
creates a `Run` for one `Goal`. `Milestone` completion can only be derived from
aggregated completion evidence across multiple Goals.

## Scope

- Update public README surfaces and project contract docs where they explain
  roadmap, milestone, goal, task, run, priority, and evidence concepts.
- Update plugin references, workflow skill guidance, and templates so new
  artifacts use `Milestone Completion Map` and the confirmed terminology.
- Update CLI generation, validation, status, and run packet output so new
  user-facing strings use `Milestone Completion Map`.
- Keep legacy `Stage Completion Map` artifacts readable as compatibility input,
  but do not make `Stage` the primary long-term term.
- Update deterministic protocol and smoke coverage for the new terminology,
  including priority/milestone separation and the legacy rename boundary.
- Update Harness task, status, goal, and run evidence after verification.

## Non-Goals

- Do not redesign the whole task index schema.
- Do not remove existing historical run, goal, task, or status evidence solely
  because it contains legacy wording.
- Do not change `P0` / `P1` / `P2` / `P3` sorting semantics beyond clarifying
  that they are priorities.
- Do not bind Runs to Codex threads or sessions.
- Do not change plugin activation behavior, add network services, start
  daemons/watchers, deploy, publish, release, commit, push, or open a review.

## Task Routing

- Level: standard adapter implementation.
- Reason: accepted terminology decisions need durable protocol, docs,
  templates, CLI output, and regression coverage.
- Required docs: `AGENTS.md`, `.harness/config.json`, `harness/tasks.md`,
  `harness/status.md`, this spec, `README.md`, `README.zh-CN.md`,
  `docs/project-contract.md`, relevant plugin references, workflow skills,
  templates, `scripts/test-suites.mjs`, and `tests/smoke.mjs`.
- Required gates: goal validation, run preparation/status evidence,
  deterministic tests, plugin validation, git whitespace check, and Harness
  state sync.
- Execution role: `mixed`; the current thread is Controller plus implementer
  for this local-only terminology pass because the user explicitly allowed
  direct editing when reason, scope, verification, completion, and pause
  conditions are recorded.
- Work mode: `local` in the current checkout and branch.
- Optional competition needed: no; terminology decisions are already confirmed.

## Spec Acceptance Checklist

- Item: `Terminology hierarchy`
  - Acceptance: New user-facing docs and templates present
    `Roadmap -> Milestone -> Goal -> Task -> Run`, with `Goal` as the main
    Harness work unit and `Task` as Goal-internal breakdown.
  - Evidence: `README.md`, `README.zh-CN.md`, `docs/project-contract.md`,
    `docs/cli.md`, `docs/cli.zh-CN.md`, `docs/install.zh-CN.md`,
    `plugins/agent-harness/references/task-routing.md`, and
    `plugins/agent-harness/templates/goal.md`.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Milestone replaces Stage`
  - Acceptance: New docs, templates, CLI output, and tests use `Milestone`
    instead of `Stage` for formal roadmap phase completion; legacy `Stage`
    remains only as a migration/compatibility note.
  - Evidence: `plugins/agent-harness/scripts/agent-harness.mjs` generates and
    reports `Milestone Completion Map`, keeps `Stage Completion Map` as a
    legacy alias, and `tests/smoke.mjs` verifies both paths.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Priority separation`
  - Acceptance: Documentation and tests state that `P0` / `P1` / `P2` / `P3`
    are priorities only, not task, stage, or milestone names.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`,
    `docs/cli.md`, `docs/cli.zh-CN.md`,
    `plugins/agent-harness/references/task-routing.md`,
    `plugins/agent-harness/templates/task-index.md`, `scripts/test-suites.mjs`,
    and `tests/smoke.mjs`.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Intent normalization`
  - Acceptance: Routing references document how common English and Chinese
    phrases map to `Goal`, `Tasks`, `Milestone`, `Run`, `Priority`, and `Spec`.
  - Evidence: `docs/project-contract.md` and
    `plugins/agent-harness/references/task-routing.md` document the mapping,
    and `tests/smoke.mjs` asserts the Chinese task phrasing rule.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Run/thread boundary`
  - Acceptance: User-facing docs preserve that a `Run` is an execution attempt
    and evidence record, not a thread or session identity.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`, `docs/cli.md`,
    `docs/cli.zh-CN.md`, `docs/install.md`, `docs/install.zh-CN.md`, and
    `plugins/agent-harness/references/task-routing.md`.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `controller-acceptance`
  - Required: `yes`
  - Evidence: `Current mixed Controller reviewed the scoped diff and verified
    with node --check for agent-harness.mjs/test-suites.mjs/smoke.mjs,
    npm run test:protocol, npm run test:smoke, npm run validate:plugin, and
    git diff --check.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Evidence Plan

- Candidate evidence sources: implementation diff, generated goal, prepared
  run packet, deterministic verification command output.
- Accepted evidence: Controller review against every checklist item, passing
  verification, and completed run record.
- State records to update: `harness/tasks.md`, `harness/status.md`, the goal
  file, and `.harness/runs/`.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
npm run test:protocol
npm run test:smoke
npm run validate:plugin
git diff --check
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /Users/liuyj/project/skills/agent-harness --goal harness/goals/2026-07-04-shape-agent-harness-terminology-simplification-and-prioritystage-separation.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /Users/liuyj/project/skills/agent-harness --run <run-dir> --json
```

## Completion Conditions

- The confirmed terminology decisions are reflected in scoped docs,
  references, templates, CLI output, and deterministic checks.
- Legacy `Stage Completion Map` artifacts remain readable, but new generated
  artifacts and CLI output use `Milestone Completion Map`.
- Every `Spec Acceptance Checklist` item is `satisfied` with concrete evidence.
- `controller-acceptance` gate evidence is `satisfied`.
- Required verification commands pass, or the run records the exact blocker.
- Harness task/status/goal/run evidence is synchronized.
- Delivery State is `validated-local`; no commit, push, review, integration,
  release, publish, deploy, or production action is performed.

## Pause Conditions

- This spec conflicts with repository instructions, adapter rules, code
  constraints, or newer user instructions.
- Terminology scope expands into a product-direction decision not covered by
  the confirmed decisions above.
- Backward compatibility for existing `Stage Completion Map` artifacts would be
  broken.
- Credentials, paid APIs, production access, destructive operations, commit,
  push, review, integration, deploy, publish, release, daemons, watchers,
  network services, or background automations become necessary.
