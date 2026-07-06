# Spec: Level 0 Fast Path Direct Execution Policy

Created: 2026-07-04
Status: accepted

## Background

The 2026-07-04 lower-friction workflow intake asked whether very small work
should sometimes be completed directly instead of requiring full Harness
Goal/Run ceremony or a delegated sub worker. The risk is that a fast path can
blur Controller / worker boundaries, skip verification, or quietly change
project direction without accepted evidence.

Harness should support a narrowly bounded direct-execution policy for truly
small Goals while preserving the existing rule that a Controller, gate,
reviewer, judge, or acceptance lane stays `gate-only` unless direct
implementation is explicitly authorized.

## Goal

Define when a small Goal may be executed directly without full Harness
Goal/Run ceremony or sub worker delegation, including risk thresholds,
execution role boundaries, required verification, closeout shape, and pause
conditions.

## Scope

- Define the Level 0 Fast Path threshold for direct current-thread execution.
- Define when Level 0 may skip spec, durable goal, prepared run, and worker
  delegation ceremony.
- Preserve Controller / worker separation by making direct execution available
  only to `implementer` or explicitly accepted `mixed` current-thread work.
- Define when current-thread work must remain `gate-only`, route to `shape`,
  route to `ask`, or use a worker through Harness execution.
- Align routing docs, project contract docs, workflow skill guidance, public
  capability docs, templates, and deterministic checks where needed.
- Sync Harness task, status, goal, and run evidence after implementation.

## Non-Goals

- Do not implement EnvContext focus or broader intent-routing model changes.
- Do not research or implement control-theory feedback-loop changes.
- Do not migrate the `harness/tasks.md` / `taskIndex` storage contract.
- Do not weaken `harness-rule:gate-only-controller`,
  `harness-rule:worker-surface-default`, Delivery State, checklist, or gate
  evidence requirements for non-Level 0 work.
- Do not authorize commits, pushes, reviews, integrations, releases, deploys,
  publication, credentials, paid APIs, production access, destructive
  operations, daemons, watchers, network services, or background sessions.

## Key Decisions

- Level 0 is a direct-execution exception, not a replacement for Harness
  routing. It applies only when the change is local, obvious, reversible,
  low-risk, and quickly verifiable.
- Current-thread direct execution is allowed only when the current thread's
  execution role is `implementer` or explicitly accepted `mixed`. If the user
  frames the thread as Controller, control lane, gate, reviewer, judge, or
  acceptance lane, the thread remains `gate-only` and must not use Level 0 to
  edit implementation files.
- A Level 0 item may skip a durable spec, goal file, prepared run packet, and
  worker delegation only when no existing accepted Harness Goal/Run requires
  state sync and no adapter-required gate applies.
- A Level 0 item still needs a lightweight route decision, scoped edits,
  verification evidence, Delivery State, `Need user`, and `Remaining` in the
  closeout.
- Escalate from Level 0 when the work changes product or project semantics,
  source-of-truth policy, schemas, public protocol contracts, reusable
  abstractions, security/privacy behavior, external systems, or multi-file /
  cross-module behavior beyond an obvious local fix.
- If a request is `shape`, asks for policy definition, changes default routing
  behavior, or affects Controller / worker boundaries, it is not itself Level 0.
  This spec is therefore a standard adapter policy implementation.

## Task Routing

- Level: standard adapter implementation.
- Reason: this changes default routing behavior, workflow skill guidance,
  protocol docs, templates, and deterministic checks, and it must preserve
  Controller / worker boundaries.
- Required docs: `AGENTS.md`, `.harness/config.json`, `harness/README.md`,
  `harness/tasks.md`, `harness/status.md`, this spec, task routing reference,
  execution skill guidance, project contract docs, capability matrix, templates,
  CLI generator, `scripts/test-suites.mjs`, and `tests/smoke.mjs`.
- Required gates: goal validation, prepared run status, controller review,
  deterministic tests, plugin validation, git whitespace check, and Harness
  state sync.
- Execution role: current thread is `gate-only` Controller; implementation
  edits should come from a bounded worker and remain candidate evidence until
  accepted by this Controller.
- Work mode: `local` in the current checkout and branch.
- Execution DAG: one implementation worker node plus verification / acceptance
  node is sufficient unless implementation discovers broader scope.
- Parallel worker candidates: no; the write surface is small and coupled.
- Optional competition needed: no; the policy boundary is concrete enough after
  the split intake goal.
- Idea Inbox input: the raw lower-friction workflow idea has already been split
  into this accepted Goal and separate EnvContext / control-theory follow-ups.
- Escalation triggers: unclear product semantics, conflict with gate-only or
  worker-surface defaults, schema/storage migration, adapter-specific
  assumptions, external risk, or delivery above `validated-local`.

## Spec Acceptance Checklist

- Item: `Fast Path threshold`
  - Acceptance: Protocol docs define concrete Level 0 criteria for direct
    execution, including local scope, low risk, reversibility, verification,
    and no product/source-of-truth/default-routing impact.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`, `plugins/agent-harness/references/task-routing.md`, and `plugins/agent-harness/skills/execute/SKILL.md` define `harness-rule:level-0-fast-path` as a narrow exception for small, local, reversible, low-risk fixes and exclude product/project semantics, source-of-truth policy, public protocol contracts, schemas, storage, adapter contracts, default routing behavior, external systems, and other high-risk work.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Execution role boundary`
  - Acceptance: Docs state that `gate-only` Controller threads cannot use Level
    0 to edit implementation files; direct execution requires `implementer` or
    explicitly accepted `mixed`.
  - Evidence: `plugins/agent-harness/references/task-routing.md`, `docs/project-contract.md`, `plugins/agent-harness/skills/execute/SKILL.md`, `plugins/agent-harness/skills/execute/references/execution-roles.md`, `plugins/agent-harness/templates/goal.md`, and generated text in `plugins/agent-harness/scripts/agent-harness.mjs` state that direct execution requires `implementer` or explicitly accepted `mixed`, and that `gate-only` cannot use Level 0 to edit implementation files.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Ceremony skip boundary`
  - Acceptance: Docs define when Level 0 can skip spec/goal/run/worker
    ceremony and when existing Harness artifacts, adapter gates, or user
    requests require normal Harness execution.
  - Evidence: `plugins/agent-harness/references/task-routing.md`, `docs/project-contract.md`, `docs/HARNESSES.md`, `plugins/agent-harness/templates/goal.md`, `plugins/agent-harness/templates/worker-prompt.md`, and generated run/prompt guidance in `plugins/agent-harness/scripts/agent-harness.mjs` define that Level 0 may skip ceremony only when no accepted Harness artifact, adapter gate, Controller/gate role, or larger Goal/Milestone obligation applies.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Verification and closeout`
  - Acceptance: Docs require lightweight route explanation, concrete
    verification, Delivery State, `Need user`, and `Remaining` even when Level
    0 skips durable ceremony.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`, `plugins/agent-harness/references/task-routing.md`, `plugins/agent-harness/skills/execute/SKILL.md`, and generated run/prompt guidance in `plugins/agent-harness/scripts/agent-harness.mjs` require route reason, scoped diff summary, concrete verification, Delivery State, `Need user`, and `Remaining` for Level 0 closeout.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Deterministic coverage`
  - Acceptance: Protocol and smoke checks protect the new Fast Path rule and
    generated guidance where implementation touches CLI/template output.
  - Evidence: `scripts/test-suites.mjs` protects `harness-rule:level-0-fast-path` and Level 0 invariants; `tests/smoke.mjs` asserts the capability matrix, task routing reference, execute skill, CLI generator, generated run packet, and generated execution prompt. Verification passed with node syntax checks, `npm run test:protocol`, `npm run test:smoke`, `npm run validate:plugin`, `git diff --check`, `goal validate`, and run status.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `controller-acceptance`
  - Required: `yes`
  - Evidence: `Gate-only Controller reviewed explorer, cli-contract-worker, and docs-skill-worker candidate packets, inspected scoped diffs, recorded all DAG nodes in .harness/runs/20260704-181600-shape-level-0-fast-path-direct-execution-policy/, and passed node --check plugins/agent-harness/scripts/agent-harness.mjs, node --check scripts/test-suites.mjs, node --check tests/smoke.mjs, npm run test:protocol, npm run test:smoke, npm run validate:plugin, git diff --check, and goal validate.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Evidence Plan

- Candidate evidence sources: worker result packet, implementation diff,
  generated run packet text when applicable, and deterministic command output.
- Accepted evidence: Controller review against every checklist item, passing
  verification, completed run node records, and completed run record.
- State records to update: `harness/tasks.md`, `harness/status.md`, the goal
  file, and `.harness/runs/`.

## Acceptance Criteria

- Level 0 Fast Path criteria are concrete enough for an agent to decide whether
  direct current-thread execution is allowed.
- The policy explicitly separates direct implementer execution from
  `gate-only` Controller behavior.
- The policy lists risk thresholds that escalate to `shape`, `ask`, full
  Harness Goal/Run execution, or worker delegation.
- Verification and closeout requirements remain mandatory even when durable
  ceremony is skipped.
- EnvContext and control-theory ideas remain deferred to their separate Goals.
- Harness state records contain concrete verification and delivery evidence.

## Verification

```bash
node --check plugins/agent-harness/scripts/agent-harness.mjs
node --check scripts/test-suites.mjs
node --check tests/smoke.mjs
npm run test:protocol
npm run test:smoke
npm run validate:plugin
git diff --check
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /Users/liuyj/project/skills/agent-harness --goal harness/goals/2026-07-04-shape-level-0-fast-path-direct-execution-policy.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /Users/liuyj/project/skills/agent-harness --run <run-dir> --json
```

## Pause Conditions

- This spec conflicts with repository instructions, adapter rules, code
  constraints, production constraints, or newer user instructions.
- The policy would weaken gate-only Controller boundaries, worker delegation
  defaults, Delivery State, checklist evidence, or adapter-required gates.
- Requirements become unclear in a way that affects compatibility, default
  routing behavior, product direction, public protocol semantics, or state
  storage migration.
- The work expands into EnvContext focus, broader intent routing,
  control-theory research, schema/storage migration, downstream-specific
  assumptions, or delivery above `validated-local`.
- Credentials, paid APIs, production access, destructive operations, commit,
  push, review, integration, deploy, publish, release, daemons, watchers,
  network services, background sessions, or automations become necessary.
