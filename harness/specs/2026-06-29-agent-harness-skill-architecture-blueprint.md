# Agent Harness Skill Architecture Blueprint

Status: implemented in `0.2.0`; legacy wrapper cleanup implemented in `0.3.0`
Created: 2026-06-29
Updated: 2026-06-30

## Purpose

Redesign Agent Harness skills around frequent user workflows instead of
artifact types.

The implemented architecture makes the active user-facing surface short and
workflow-oriented:

```text
harness:orient
harness:intake
harness:execute
harness:init
```

The CLI package, repository directory, and binary stay named `agent-harness` for
now. The installed Codex plugin name is `harness`.

## Inputs

- `harness/mental-models/01-user-scenario.md`
- `harness/specs/2026-06-29-b3ehive-design-reference-review.md`
- current skills under `plugins/agent-harness/skills/`
- current CLI commands in `plugins/agent-harness/scripts/agent-harness.mjs`
- user-confirmed decisions in the control thread on 2026-06-29

## Decision Rule

Create a skill when both are true:

- the user intent is frequent enough that Codex should recognize it from
  natural language;
- the workflow needs recurring model judgment, boundaries, and behavioral
  discipline that cannot be expressed as a deterministic CLI command alone.

Do not create a skill merely because there is a file type, directory, CLI
command, or low-frequency workflow.

## Current Problem

The previous skill set was artifact-oriented:

- `harness-init`
- `harness-adapter`
- `harness-tasks`
- `harness-goal`
- `harness-run`

This caused overlap:

- every skill resolved config and adapter paths;
- multiple skills explained orientation behavior;
- task, goal, and run workflows repeated the same boundary rules;
- new user scenarios such as idea intake and inbox-thread capture did not fit a
  single artifact skill;
- the agent could pick an artifact skill too early and start producing a goal
  or run when the user only wanted orientation.

The mental model is workflow-oriented:

```text
Orient -> Select -> Shape / Intake -> Goal -> Execute -> Verify -> Sync -> Review
```

The skill architecture now matches this model.

## Implemented Skill Set

### `harness:orient`

Use when the user asks to understand project state, current todo, blockers,
next action, harness readiness, or workflow route.

Responsibilities:

- read repo instructions and harness config;
- resolve fixed vs adapter contract;
- read the configured adapter, task index, status, and relevant mental models;
- summarize current focus and task state;
- recommend next action without executing it;
- classify the next mode as `orient`, `intake`, `shape`, `goal`, `execute`,
  `competition`, or `ask`;
- run or mirror read-only commands such as `doctor`, `config inspect`,
  `orient next`, and `intake idea`;
- handle Idea Inbox Thread promotion by previewing intake candidates;
- explain the route choice lightly.

Strict boundaries:

- does not implement;
- does not create branches, worktrees, PRs, deploys, daemons, or background
  sessions;
- does not mutate task state unless the user explicitly asks to record an
  intake item;
- does not turn a recommendation into a goal or run without explicit user
  intent.

### `harness:intake`

Use when the user has a new idea, requirement, bug, or capture-thread note and
wants it triaged or added to the task system without implementing it now.

Responsibilities:

- preview a task candidate with `agent-harness intake idea`;
- classify duplicate / related / new ideas;
- propose title, priority, section, acceptance hint, and spec need;
- record only after explicit approval;
- keep raw ideas visible without interrupting the current execution lane.

Strict boundaries:

- intake is capture, triage, and optional record only;
- does not implement;
- does not create specs, goals, runs, branches, worktrees, PRs, or deployments;
- does not mutate task state without explicit record intent.

### `harness:execute`

Use when the user asks to execute a confirmed task, goal, spec, run packet, or
approved implementation slice.

Responsibilities:

- read repo instructions, harness config, adapter, task index, status, and
  relevant spec / goal / run packet;
- confirm scope, non-goals, work mode, verification, completion conditions, and
  pause conditions;
- create or validate a goal when needed;
- prepare or inspect a run packet when useful;
- implement only the authorized scope;
- run verification;
- sync task state, status, run evidence, blockers, and deferred work;
- preserve master-lane acceptance: subagents, inbox threads, automation, and
  competition output are candidate evidence, not final accepted state.

Strict boundaries:

- does not execute ambiguous product direction without confirmation;
- does not modify `AGENTS.md` or activation behavior without explicit approval;
- does not push, PR, deploy, release, use credentials, use paid APIs, touch
  production, perform destructive operations, or start daemons without explicit
  approval;
- does not mark completion without verification and state sync.

### `harness:init`

Use when setting up Agent Harness in a new project, importing an existing
project, auditing setup, or previewing activation instructions.

Responsibilities:

- run `doctor`;
- initialize an adapter-contract project when requested;
- import an existing task index without creating a second task index;
- print the project-scope activation snippet;
- report created paths, missing optional paths, activation state, and the first
  orientation command.

Strict boundaries:

- does not overwrite existing files without explicit approval or safe dry-run
  evidence;
- does not silently edit `AGENTS.md`;
- does not add plugin-level hooks until conditional bootstrap is validated;
- does not create background sessions, PRs, deployments, or releases.

## Existing Skill Migration

The `0.2.0` release kept artifact-oriented skill names as compatibility
wrappers. The `0.3.0` cleanup removes those wrappers from the shipped plugin
to keep the skill picker focused on the four workflow skills.

Removed wrapper skills:

- `harness-init`
- `harness-adapter`
- `harness-tasks`
- `harness-goal`
- `harness-run`

Route old usage to:

- setup, migration, import, doctor, and activation preview: `harness:init`
- project state, task summaries, blockers, and next-step recommendations:
  `harness:orient`
- ideas, requirements, bugs, and capture-thread notes: `harness:intake`
- confirmed task, spec, goal, run, verification, and state sync:
  `harness:execute`

## Non-Core Workflows

### Evaluation

Do not make `harness:eval` now.

Evaluation fixture-suite work should start as a blueprint and `evals/` design,
not a skill. Reconsider only if users repeatedly ask Codex to run or interpret
eval fixtures as a recurring model workflow.

### Maintenance

Do not make `harness:maintain` now.

If maintenance is deterministic sync from git diff, run logs, task state, and
status records, implement it as CLI/tooling and call it from `harness:execute`
during the Sync step.

### Competition

Do not make `harness:compete` in the core workflow skill surface.

Treat proposal competition as an optional Shape protocol for high-ambiguity
work:

- competing architecture proposals;
- comparing migration routes;
- broad audit / coverage tasks;
- repair strategy after repeated execution failure;
- design choices with multiple defensible routes.

Competition output should be candidate routes, tradeoffs, coverage union,
risks, and recommendation. It must not directly execute the chosen route.

Reconsider an optional `harness:compete` skill after the protocol is used often
enough to justify a separate natural-language entry point.

## Shared Contracts

### Optional Proposal Competition

Proposal competition is optional Shape behavior for ambiguous or high-risk
route selection. It may produce candidate routes, tradeoffs, coverage union,
risks, and a recommendation. It must not directly execute the selected route
or update accepted task/status/run state.

### Blueprint-Driven Versioning

This blueprint first shipped as `0.2.0`. The legacy wrapper removal ships as
`0.3.0`.

The following version fields are aligned:

- `package.json`
- `plugins/agent-harness/.codex-plugin/plugin.json`

### Packaging Discipline

Docs, install instructions, marketplace metadata, skill files, templates,
validation commands, and version metadata should describe the same shipped
behavior. When public skill or command surfaces change, update these surfaces
together and verify with plugin validation and smoke coverage.

### Inspectable Evidence Trail

Workflow skills must leave state inspectable:

- orientation outputs a route recommendation and confirmation boundary;
- intake previews before recording;
- execution updates task/status/run evidence after meaningful work;
- completed work cites verification;
- deferred work is visible in the configured task index or deferred register.

### Project-Neutral Docs

Plugin core skills, templates, and examples must stay project-neutral:

- no private repo names;
- no local absolute paths except user-supplied adapter facts;
- no customer names;
- no private evidence paths in generic docs.

### Lightweight Route Explanation

The agent should explain why it chose a workflow mode:

- orientation instead of execution;
- intake instead of task mutation;
- shape / competition instead of implementation;
- goal needed before execution;
- local / worktree / ask work mode;
- pause for human confirmation.

This should be concise, not a heavy route ledger.

### Master Lane And Candidate Evidence

The active control thread owns acceptance.

- Idea Inbox Threads capture raw ideas.
- Subagents may produce candidates or verification evidence.
- Automation may produce run evidence.
- Competition may produce candidate routes.
- Only the control lane should accept final state after validation and update
  authoritative task/status/run records.

## Confirmed Decisions

1. Keep `init` available as a low-frequency adoption entry.
2. Treat intake as capture + triage + optional record for new ideas or
   requirements. Intake does not execute.
3. Treat optional competition as a protocol first, not a parameter and not a
   default execution path.
4. Compatibility pressure is low because there are no external installed users.
   Shorter plugin and skill names are preferred.

## Implementation Summary

- Added `plugins/agent-harness/skills/orient/SKILL.md`.
- Added `plugins/agent-harness/skills/intake/SKILL.md`.
- Added `plugins/agent-harness/skills/execute/SKILL.md`.
- Added `plugins/agent-harness/skills/init/SKILL.md`.
- Removed legacy `harness-*` wrapper skills from the shipped plugin in
  `0.3.0`; the four workflow skills are the only public skill entries.
- Renamed the installed plugin metadata from `agent-harness` to `harness`.
- Kept the repository directory and CLI binary as `agent-harness`.
- Updated README, Chinese README, install docs, marketplace metadata, and smoke
  validation guards.

## Acceptance Criteria

- New skills are discoverable and project-neutral.
- `harness:orient` covers state, next-action, intake preview, and route
  recommendation without execution.
- `harness:intake` covers new idea / requirement / bug capture without
  execution.
- `harness:execute` covers confirmed task / goal / run execution, verification,
  and state sync.
- `harness:init` covers setup, migration, doctor/import, and activation preview.
- Legacy wrapper skill names are not shipped; old usage routes to the four
  workflow skills.
- README and install docs do not advertise absent skills.
- `package.json` and plugin manifest versions are aligned at `0.3.0`.
- `npm run validate:plugin` passes.
- `npm run test:smoke` passes.
