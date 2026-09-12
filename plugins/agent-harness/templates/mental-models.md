# Project Mental Models

This directory records reusable project mental models and invariants. A mental
model should explain how to reason about the project across tasks, not just
what changed in one run.

The adapter formula is:

```text
adapter contract = task with status + spec + DAG + goal + gate
```

## Index

| Model | Purpose | Path |
| --- | --- | --- |
| User / Scenario Model | How should a first-time user adopt, activate, and use the harness in a new or existing project? | `01-user-scenario.md` |
| Work Unit Model | What is one harness-managed unit of work? | `02-work-unit.md` |
| Control Loop / Handoff Model | How does the current host enter, execute, verify, update state, stop, and hand off? | `03-control-loop-handoff.md` |
| Ownership / Boundary Model | What belongs to plugin core, project adapters, artifacts, and pause rules? | `04-ownership-boundary.md` |

## Core Rules

- Plugin defines protocol. Adapter defines overrides. Artifacts record facts.
- Keep project-specific mental models here, not in plugin core.
- Add a separate file when one model becomes too broad.
- Link task, spec, goal, milestone, or gate artifacts to the relevant model
  when it affects execution.
- Record durable invariants here; record temporary execution evidence in run
  logs or status files.
- Explain route and work-mode choices briefly when they affect execution.
- Treat subagent, automation, inbox, and competition output as candidate
  evidence until the control lane validates it.
- Treat an enforced Run checkpoint as revision-safe recovery state, never as
  Task/Goal completion or external authoritative evidence.
- Keep plugin-facing examples project-neutral; put local facts in adapter
  artifacts.

## Model Definitions

### User / Scenario Model

How a first-time user should initialize the harness in a new project, migrate
an existing project into the harness system, and activate harness instructions
or normal post-activation workflows.

### Work Unit Model

The unit of work behind the adapter formula:

```text
task with status + spec + DAG + goal + gate
```

### Control Loop / Handoff Model

How the current host enters, executes, verifies, updates state, stops, and leaves enough
context for another human or host session to continue.

### Ownership / Boundary Model

What belongs to plugin core, project adapters, and artifacts, plus the
conditions where the host should pause before acting.
