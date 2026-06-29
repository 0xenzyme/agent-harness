# Agent Harness Activation And Next-Action Design

Status: accepted
Created: 2026-06-29
Updated: 2026-06-29

## Background

Agent Harness now has an adapter contract and project mental models, but adapter
files do not automatically affect Codex behavior. A project can have
`.harness/config.json`, `harness/README.md`, tasks, status, goals, runs, and
mental models, yet Codex will only use them when instructed through project
scope, an explicit user request, a harness skill, a CLI command, or a plugin
bootstrap.

A hook-capable reference plugin solves this differently: it installs a
session-start hook that injects a global bootstrap into each session. That is
appropriate for a global development methodology. Agent Harness should be more
conservative because it is a project control plane. It should activate strongly
for opted-in projects without forcing harness behavior on unrelated projects.

The user also identified a common post-activation scenario: they may not want
implementation yet. They may want to see the current todolist, current status,
blocked / ready tasks, and a recommended next action. This must be a first-class
read-only orientation flow.

The user also identified a future scenario for bringing new ideas or
requirements into the harness without the agent jumping straight to
implementation. That scenario is documented in the mental model, but its
implementation is deferred to a separate task.

## Goal

Define and implement the first activation and next-action workflow for Agent
Harness:

- make project-scope activation explicit and easy to add;
- explore a conditional plugin bootstrap for opted-in projects;
- add a read-only orientation / next-action flow;
- add confirmation-check guidance before high-impact transitions;
- keep all behavior deterministic, auditable, and non-destructive by default.

## Scope

### Project-Scope Activation

Provide a deterministic way to produce an `AGENTS.md` activation snippet for a
harness project.

The activation snippet should instruct Codex to:

- read `.harness/config.json` before substantial work when it exists;
- read the configured project adapter for `contract: "adapter"`;
- read the configured task index, status file, and relevant specs / goals;
- use harness CLI commands when they fit the task;
- preserve existing project instructions and pause on conflicts or high-risk
  actions.

The initial command should be non-mutating by default. It may print a snippet,
show where it should be inserted, or provide a `--dry-run` preview. Any command
that writes `AGENTS.md` must require explicit user intent and must not weaken or
delete existing instructions.

### Conditional Plugin Bootstrap

Design a lightweight session-start bootstrap for the plugin that only activates
for opted-in harness projects.

The intended bootstrap rule is:

```text
If `.harness/config.json` exists in the current project, inspect the harness
contract before substantial project work.
```

This feature must remain conditional. It must not inject heavy workflow
instructions into every session merely because the plugin is installed.

Implementation may be split if hook behavior needs separate testing across
Codex App and Codex CLI surfaces.

### Orientation / Next-Action

Add a read-only flow for users who ask what the project state is or what to do
next.

The flow should read resolved harness paths and summarize:

- current focus from the configured status file;
- task index highlights;
- ready, blocked, in-progress, and recently completed work when detectable;
- recommended next action;
- reason for the recommendation;
- what user prompt or CLI command would start execution if the user agrees.

This flow must not start implementation, edit code, create goals, launch runs,
create branches, push, open PRs, deploy, or start background work unless the
user explicitly asks.

### Confirmation Check

Add harness guidance for confirmation checks before moving between development
modes.

The check should distinguish:

- actions Codex can do without confirmation, such as reading files, inspecting
  harness state, drafting spec text, and running local validation;
- actions requiring user confirmation, such as product direction, entering
  implementation from ambiguous shape work, modifying `AGENTS.md`, adopting
  plugin bootstrap behavior, creating worktrees, push / PR / deploy / release,
  credentials, paid APIs, production access, destructive operations, and
  merging multiple work streams.

This should be reflected in skills, references, generated text, or CLI output
where relevant.

## Non-Goals

- Do not silently modify `AGENTS.md`.
- Do not weaken existing project instructions.
- Do not make Agent Harness a global mandatory methodology for every installed
  Codex session.
- Do not start daemons, watchers, background agents, Codex sessions, push, PR,
  deploy, publish, or release behavior.
- Do not require a new roadmap artifact before this implementation.
- Do not migrate downstream projects automatically.
- Do not redesign the entire skill architecture in this spec.
- Do not implement idea / requirement intake in this spec; keep it as a
  separate task.

## Key Decisions

- Agent Harness activation has three possible mechanisms:
  1. project-scope activation through `AGENTS.md`;
  2. plugin-scope bootstrap through a session-start hook;
  3. conditional plugin bootstrap that activates only when harness config exists.
- Project-scope activation is the safest first-class user-facing mechanism.
- Conditional bootstrap is desirable, but implementation is deferred to a
  separate follow-up because session-start hook behavior needs validation
  across Codex App and Codex CLI before it can become default.
- Orientation / next-action is a read-only usage mode, not an execution mode.
- Idea / requirement intake is a shaping mode in the mental model, but
  implementation is deferred to a separate todolist item.
- Roadmap is not needed yet. Use this spec plus a goal. Add milestones only if
  implementation splits into multiple dependent phases.
- The current skill architecture likely needs a separate blueprint. Existing
  skills are artifact-oriented; the emerging harness usage model is workflow-
  oriented around adoption, orientation, and execution. Record that as follow-up
  unless this implementation directly requires a narrow skill update.

## Task Routing

- Level: medium / high
- Reason: touches CLI behavior, plugin manifest / hook behavior, skills,
  templates, tests, and user-facing workflow semantics.
- Required docs:
  - `AGENTS.md`
  - `.harness/config.json`
  - `harness/README.md`
  - `harness/mental-models/01-user-scenario.md`
  - `docs/project-contract.md`
  - `plugins/agent-harness/skills/harness-init/SKILL.md`
  - `plugins/agent-harness/skills/harness-goal/SKILL.md`
  - `plugins/agent-harness/scripts/agent-harness.mjs`
  - `tests/smoke.mjs`
- Required gates:
  - plugin validation
  - smoke tests
  - current-project doctor
- Escalation triggers:
  - deciding to auto-write `AGENTS.md`
  - deciding to enable unconditional session-start injection
  - changing public command names after implementation begins
  - adding background or automatic execution behavior

## Adapter References

- Project adapter: `harness/README.md`
- Source of truth:
  - `harness/tasks.md`
  - `harness/status.md`
  - `harness/mental-models/01-user-scenario.md`
- Hard boundaries:
  - no silent `AGENTS.md` mutation
  - no network services or persistent daemons
  - no automatic Codex session launch
  - no push, PR, deploy, publish, or release behavior
  - no downstream project assumptions in plugin core

## Acceptance Criteria

- CLI or documented workflow can produce an Agent Harness activation snippet for
  `AGENTS.md` without modifying files by default.
- Activation guidance preserves existing project instructions and explains
  precedence / pause behavior.
- Conditional bootstrap design is implemented or explicitly deferred with a
  concrete follow-up task if platform behavior needs separate validation.
- Orientation / next-action flow can summarize the configured task index and
  status file without editing project files.
- Confirmation-check guidance is present where users and Codex transition from
  orientation / shaping into goal or execution work.
- Smoke tests cover any new CLI command or generated artifact.
- Documentation and templates stay aligned with the mental model.

## Verification

```bash
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd . --lang zh-CN
```

Additional temporary-project checks should cover:

- adapter project with default `harness/tasks.md`;
- adapter project with existing `todolist.md`;
- project without harness config;
- activation snippet output does not write `AGENTS.md` by default;
- orientation / next-action output is read-only;
- conditional bootstrap, if implemented, does not activate for projects without
  `.harness/config.json`.

## Pause Conditions

- The spec conflicts with code, production constraints, repo instructions, or
  newer user instructions.
- Requirements are unclear in a way that affects cost, risk, compatibility, or
  product direction.
- Credentials, paid APIs, production access, destructive operations, push, PR,
  deploy, publish, or release are required.
- Implementing a hook would inject harness instructions into non-harness
  projects.
- Writing `AGENTS.md` would require merging or rewriting project instructions
  without explicit user approval.
