# User / Scenario Model

This model answers how someone who has never used Agent Harness should start
using it.

The model has two main entry points:

1. Use Agent Harness in a new project.
2. Bring an existing project into the Agent Harness system.

Both paths require the same adoption sequence:

```text
initialize or import adapter
-> activate harness through an explicit entry point
-> verify with doctor
-> use tasks, specs, goals, runs, and state sync in normal work
```

## New Project

- When to use this path:
- First initialization command:
- Artifacts that should be created:
- First task loop:
- Why the harness is valuable here:

## Existing Project

- When to use this path:
- Existing source of truth:
- Adapter import / migration command:
- Artifacts that must be preserved:
- Missing support artifacts to create:
- Why the harness is valuable here:

## Activation Step

- Project-scope activation through `AGENTS.md`:
- Plugin-scope bootstrap through a session-start hook:
- Conditional bootstrap when `.harness/config.json` exists:
- Current conditional-bootstrap status and validation evidence:
- Config and adapter files Codex should read:
- CLI commands Codex may use:
- Existing rules that must not be weakened:
- Explicit-use fallback when activation is not configured:
- Activation snippet command:
- Future conditional bootstrap task:

## Human / Agent Division

```text
Human owns intent, judgment, approval, and acceptance.
Agent owns orientation, execution, verification, and state sync within approved boundaries.
Harness owns durable coordination state.
```

### Human Owns

- Product direction:
- Priority:
- Risk tolerance:
- Spec / goal / next-action approval:
- High-risk operation authorization:
- Final acceptance:

### Agent Owns

- Reading harness context:
- Summarizing current state:
- Recommending next action:
- Identifying missing specs, goals, validation, blockers, or pause conditions:
- Executing authorized bounded work:
- Running verification:
- Updating task, status, run evidence, blockers, or deferred work:

### Harness Owns

- Task state:
- Adapter rules:
- Specs, goals, runs, gates, and milestones:
- Mental models and project invariants:
- Verification evidence and continuity:

## Post-Activation Usage

```text
User sets intent and approvals.
Harness stores project control state.
Codex executes the loop and updates evidence.
```

### User Responsibilities

- State task or ask for orientation:
- Decide priority and product direction:
- Confirm specs, goals, or next actions:
- Approve high-risk operations:
- Review final results:

### Codex Responsibilities

- Read project instructions:
- Inspect harness config:
- Read adapter, task index, status, and relevant specs/goals:
- Recommend or choose work mode:
- Execute authorized scope:
- Verify:
- Sync task, status, run evidence, blockers, or deferred work:

### User Triggers

- Natural language triggers:
- CLI triggers, including `activation snippet` and `orient next`:
- Automatic harness loop after project-scope activation:

## Development Progression

This model defines the development progression contract. CLI commands and
automation for these modes are separate implementation work.

- Orient:
- Select:
- Shape:
- Goal:
- Execute:
- Verify:
- Sync:
- Review:

## Confirmation Check

- Actions Codex can continue without confirmation:
- Actions requiring user judgment:
- Review-boundary confirmation:
- Goal / Execute entry confirmation:

## Orientation / Next-Action Scenario

- Read current status:
- Read task index:
- Summarize ready / blocked / in-progress / done work:
- Recommend next action:
- Explain why:
- Do not start implementation unless the user asks:

## Idea / Requirement Intake Scenario

- Read current task/status/adapter context:
- Preview with `intake idea --idea "<idea text>"`:
- Record with `intake idea --idea "<idea text>" --record` only after user
  confirmation:
- Compare new idea with existing tasks/specs/goals/deferred work:
- Classify as note, task candidate, spec needed, goal ready, defer, reject, or
  ask:
- Draft candidate task entry:
- Suggest priority, acceptance, risks, dependencies, and validation questions:
- Ask before modifying task state when product direction or scope is unclear:
- Do not start implementation unless the user asks:

## Idea Inbox Thread Scenario

- Master / Control Thread responsibilities:
- Idea Inbox / Capture Thread responsibilities:
- Intake step:
- Promotion into task index, spec, or goal:
- What the inbox thread must not execute by default:

## Evaluation Project Scenario

- Fixture suite purpose:
- New project fixture:
- Legacy project fixture:
- Non-harness project fixture:
- Messy realistic fixture:
- Scenario prompts:
- Expected outcomes:

## Who Uses It

- Repository maintainer:
- Current Codex session:
- Future Codex session:
- Subagent or worker:

## Non-Scenarios

- 

## Stability Promise

- orientation:
- intent:
- boundaries:
- evidence:
- continuity:
