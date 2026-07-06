# Spec: EnvContext Focus And Intent Routing Model

Created: 2026-07-04
Status: accepted

## Background

The 2026-07-04 intake split out a follow-up idea to add intent recognition
inspired by EnvContext layers and `focus` filtering. The user accepted the
recommended shape on 2026-07-04:

- keep `EnvContext` as an internal design reference, not a public user-facing
  concept;
- keep `focus` as internal workflow presets for the first version, not a new
  user or CLI parameter;
- define the context layers Harness should use for `orient`, `intake`,
  `shape`, `goal`, and `execute`;
- connect those focus presets to existing intent normalization for
  `Milestone`, `Goal`, `Task`, `Run`, `Priority`, and `Spec`;
- control token, noise, and lost-in-the-middle risk by reading only the
  context each workflow needs.

This spec follows the completed terminology work:

```text
Roadmap -> Milestone -> Goal -> Task -> Run
```

## Goal

Define and implement the first version of Harness intent recognition and
context focus guidance so agents can route user language correctly and read the
smallest useful set of artifacts for each workflow.

## Scope

- Add a stable protocol anchor for context focus and intent routing.
- Document the internal context layers Harness uses before routing or
  execution.
- Define default focus presets for `orient`, `intake`, `shape`, `goal`, and
  `execute`.
- Clarify that intent normalization runs before focus selection.
- Define token/noise controls and lost-in-the-middle safeguards.
- Align canonical protocol docs, workflow skill guidance, templates,
  generated run or prompt text, and deterministic checks where they need to
  mention the new guidance.
- Sync Harness task, status, goal, and run evidence after verification.

## Non-Goals

- Do not expose `EnvContext` as a formal public product term.
- Do not add a `--focus` CLI option, schema field, persistent config, or user
  parameter in the first version.
- Do not implement a screenshot parser or external EnvContext dependency.
- Do not change the `Roadmap -> Milestone -> Goal -> Task -> Run`
  terminology hierarchy.
- Do not implement the separate control-theory research Goal.
- Do not change plugin activation behavior, add daemons, add watchers, use
  credentials, use paid APIs, touch production data, perform destructive
  operations, commit, push, open review, integrate, deploy, publish, release,
  or migrate storage schemas.

## Key Decisions

- `EnvContext` is internal design language only. Public docs should use
  `context focus` or `focus preset` when a user-facing name is needed.
- `focus` remains an internal preset model in this version. Generated guidance
  may mention the active focus preset, but no new CLI/config API is added.
- Harness context layers are:
  - `entry/channel`: workflow entry, user request source, thread role, and
    conversation route.
  - `modality`: text, screenshot, file, URL, terminal output, or other input
    shape.
  - `dialog`: current conversation-confirmed decisions, stale artifacts,
    superseded plans, `Need user`, and unresolved questions.
  - `project/world`: adapter, config, task/status/spec/goal/run state, git
    state, delivery posture, and external risk.
  - `capability`: available workflow skills, tools, worker surfaces, and
    validation commands.
  - `self/control`: current lane, execution role, accepted-state owner,
    delivery authorization, completion conditions, and pause conditions.
- Default focus presets:
  - `orient`: current state, route recommendation, blockers, stale artifacts,
    and next safe action. Avoid implementation details unless they explain the
    route.
  - `intake`: raw idea, duplicates or related work, proposed priority, likely
    route, and whether a spec or accepted scope is needed. Avoid execution
    artifacts unless they prove duplication or dependency.
  - `shape`: decisions, alternatives, source of truth, non-goals, acceptance,
    risks, verification, and pause triggers. Avoid detailed implementation
    files until the shape is accepted.
  - `goal`: accepted spec or explicit accepted scope, source task acceptance,
    role, context lock, delivery policy, verification, completion conditions,
    and state-sync obligations.
  - `execute`: goal/spec/run packet, execution DAG, allowed and forbidden
    scope, implementation-relevant files, verification commands, delivery
    target, and state-sync requirements.
- Intent normalization runs before focus selection. User language maps to
  `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec` first; the mapped
  intent then chooses which context layers to read.
- Token/noise controls prefer current conversation-confirmed state, accepted
  specs/goals/runs, adapter/config/status, and only then broad docs or
  historical logs. Historical run logs should be summarized by path and
  evidence unless their details are directly relevant.

## Task Routing

- Level: standard adapter implementation.
- Reason: this changes default routing guidance, protocol docs, workflow
  skill guidance, templates, generated packet text, and deterministic checks.
- Required docs: `AGENTS.md`, `.harness/config.json`, `harness/README.md`,
  `harness/tasks.md`, `harness/status.md`, this spec, task routing reference,
  capability matrix, project contract docs, relevant workflow skills,
  templates, CLI generator, `scripts/test-suites.mjs`, and `tests/smoke.mjs`.
- Required gates: goal validation, run preparation/status evidence,
  gate-only Controller review, deterministic protocol/smoke tests, plugin
  validation, git whitespace check, and Harness state sync.
- Execution role: `gate-only`; the current thread is the Controller and
  acceptance lane. Implementation edits should come from bounded worker
  candidate output and remain candidate evidence until accepted.
- Work mode: `local` in the current checkout and branch.
- Execution DAG: one implementation worker node plus verification and
  acceptance node is sufficient unless implementation discovers broader scope.
- Parallel worker candidates: no; docs, templates, CLI text, and tests are
  coupled enough that a single bounded worker is simpler.
- Optional competition needed: no; the user accepted the recommended shape.
- Idea Inbox input: split from the 2026-07-04 intake idea and screenshot about
  EnvContext layers and `focus` filtering.
- Escalation triggers: public API exposure, CLI/schema/config migration,
  activation behavior change, external EnvContext dependency, conflict with
  terminology boundaries, scope expansion into control-theory research, or
  delivery above `validated-local`.

## Evidence Plan

- Candidate evidence sources: worker result packet, implementation diff,
  generated run/prompt text, deterministic command output, and run packet
  status.
- Accepted evidence: Controller review against every checklist item, passing
  verification, completed DAG node records, completed run record, and task /
  status state sync.
- State records to update: `harness/tasks.md`, `harness/status.md`, the goal
  file, and `.harness/runs/`.

## Spec Acceptance Checklist

- Item: `Public concept boundary`
  - Acceptance: Protocol docs explain that `EnvContext` is an internal design
    reference and public guidance uses context focus / focus presets instead.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`,
    `plugins/agent-harness/references/task-routing.md`,
    `plugins/agent-harness/templates/goal.md`, and
    `plugins/agent-harness/templates/spec.md` keep public wording on
    context focus / focus presets and state that `EnvContext` remains internal
    design language only.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Focus presets`
  - Acceptance: Docs or generated guidance define default focus presets for
    `orient`, `intake`, `shape`, `goal`, and `execute`.
  - Evidence: `docs/project-contract.md`,
    `plugins/agent-harness/references/task-routing.md`,
    `plugins/agent-harness/skills/orient/SKILL.md`,
    `plugins/agent-harness/skills/intake/SKILL.md`,
    `plugins/agent-harness/skills/execute/SKILL.md`,
    `plugins/agent-harness/templates/goal.md`, and generated guidance in
    `plugins/agent-harness/scripts/agent-harness.mjs` define workflow focus
    presets for `orient`, `intake`, `shape`, `goal`, and `execute`.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Intent before focus`
  - Acceptance: Routing guidance states that intent normalization to
    `Milestone`, `Goal`, `Task`, `Run`, `Priority`, or `Spec` runs before
    selecting context focus.
  - Evidence: `docs/HARNESSES.md`, `docs/project-contract.md`,
    `plugins/agent-harness/references/task-routing.md`,
    `plugins/agent-harness/templates/goal.md`,
    `plugins/agent-harness/templates/worker-prompt.md`, and generated
    goal/run/prompt text in `plugins/agent-harness/scripts/agent-harness.mjs`
    all carry `harness-rule:context-focus-routing`.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Token and noise controls`
  - Acceptance: Guidance defines how agents limit broad docs, historical run
    logs, and irrelevant artifacts for each workflow.
  - Evidence: `docs/project-contract.md`,
    `plugins/agent-harness/references/task-routing.md`,
    `plugins/agent-harness/skills/orient/SKILL.md`,
    `plugins/agent-harness/skills/intake/SKILL.md`,
    `plugins/agent-harness/skills/execute/SKILL.md`, and generated run/prompt
    guidance define current-state-first reading, historical-log summaries, and
    route-local source-of-truth placement.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `No first-version API expansion`
  - Acceptance: The implementation does not add a public `EnvContext` API,
    `--focus` CLI parameter, schema field, persistent config, or storage
    migration.
  - Evidence: Verification worker and Controller checks confirmed CLI help,
    `plugins/agent-harness/scripts/agent-harness.mjs`,
    `docs/cli.md`, `docs/cli.zh-CN.md`, `.harness/config.json`, and
    `plugins/agent-harness/schemas/config.schema.json` do not expose a
    first-version public `--focus` or focus config/schema surface.
  - Status: `satisfied`
  - Unblocker: `N/A`
- Item: `Deterministic coverage`
  - Acceptance: Protocol and smoke checks protect the new context focus and
    intent-routing guidance where implementation touches public docs, skill
    references, templates, or generated packets.
  - Evidence: `scripts/test-suites.mjs` protects the
    `harness-rule:context-focus-routing` anchor and no public `--focus`
    surface; `tests/smoke.mjs` asserts docs, task routing, templates, CLI
    source, generated goals, run packets, execution prompts, and worker
    prompts. Verification passed with node syntax checks, `npm run
    test:protocol`, `npm run test:smoke`, `npm run validate:plugin`, `git
    diff --check`, goal validation, and run status.
  - Status: `satisfied`
  - Unblocker: `N/A`

## Required Gate Evidence

- Gate: `controller-acceptance`
  - Required: `yes`
  - Evidence: `Gate-only Controller reviewed explorer,
    cli-contract-worker, docs-skill-worker, and verification candidate
    packets, inspected scoped diffs, recorded all DAG nodes in
    .harness/runs/20260704-190518-shape-envcontext-focus-and-intent-routing-model-for-harness/,
    and passed node --check for agent-harness.mjs/test-suites.mjs/smoke.mjs,
    npm run test:protocol, npm run test:smoke, npm run validate:plugin, git
    diff --check, goal validate, and run status --json.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Source Task Acceptance Map

- Task: `Shape EnvContext focus and intent-routing model for Harness.`
  - Acceptance: `Define which context layers Harness should expose for orient, intake, shape, goal, and execute; include focus presets, token/noise controls, and how intent normalization routes user language to Milestone, Goal, Task, Run, Priority, or Spec.`
  - Evidence: `Implemented and verified as internal context focus routing:
    docs/project-contract.md and plugins/agent-harness/references/task-routing.md
    define context layers, focus presets, token/noise controls, and
    intent-before-focus; plugins/agent-harness/scripts/agent-harness.mjs,
    scripts/test-suites.mjs, and tests/smoke.mjs add generated guidance and
    deterministic coverage.`
  - Status: `satisfied`
  - Unblocker: `N/A`

## Adapter References

- Project adapter: `harness/README.md`
- Source of truth: user acceptance on 2026-07-04, this spec, and
  `harness/tasks.md`
- Hard boundaries: repository instructions in `AGENTS.md`, adapter rules in
  `harness/README.md`, current checkout / branch, and delivery ceiling
  `validated-local`

## Acceptance Criteria

- Intent recognition and context focus are documented as one routing model:
  first normalize user intent, then choose the smallest useful context.
- The first-version public surface stays simple: no formal public
  `EnvContext`, no `--focus`, no schema/config/storage migration.
- Default focus presets cover `orient`, `intake`, `shape`, `goal`, and
  `execute`.
- Token/noise/lost-in-the-middle controls are explicit enough for workflow
  skills and generated packets to use.
- Existing terminology, Level 0 Fast Path, Need-user digest, gate-only, and
  local delivery boundaries remain intact.
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
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /Users/liuyj/project/skills/agent-harness --goal harness/goals/2026-07-04-shape-envcontext-focus-and-intent-routing-model-for-harness.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /Users/liuyj/project/skills/agent-harness --run <run-dir> --json
```

Config schema validation needed: no, because this version does not add config
or schema fields.

## Pause Conditions

- This spec conflicts with repository instructions, adapter rules, code
  constraints, production constraints, or newer user instructions.
- Requirements become unclear in a way that affects compatibility, default
  routing behavior, public protocol semantics, product direction, or state
  storage migration.
- The work would expose a new public `EnvContext` concept, add `--focus`, add
  schema/config fields, or change activation behavior without separate
  acceptance.
- The work expands into the separate control-theory research Goal.
- Credentials, paid APIs, production access, destructive operations, commit,
  push, review, integration, deploy, publish, release, daemons, watchers,
  network services, background sessions, or automations become necessary.
