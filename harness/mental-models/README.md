# Agent Harness Mental Models

Agent Harness is a file-based control plane for Codex work. It does not own a
product domain, start workers, or execute release actions by itself. Its job is
to make Goal state, execution context, handoffs, gates, and evidence explicit
enough that another Codex session or human can safely continue the loop.

The reusable adapter formula is:

```text
adapter contract = goal with tasks + spec + run + gate + evidence
```

User-facing terminology follows:

```text
Roadmap -> Milestone -> Goal -> Task -> Run
```

The core rule is:

```text
Plugin defines protocol. Adapter defines overrides. Artifacts record facts.
```

## Model Index

| Model | Question It Answers | Path |
| --- | --- | --- |
| User / Scenario Model | How should a first-time user adopt, activate, and use the harness in a new or existing project? | `01-user-scenario.md` |
| Work Unit Model | What is one harness-managed unit of work? | `02-work-unit.md` |
| Control Loop / Handoff Model | How does Codex enter, execute, verify, update state, stop, and hand off? | `03-control-loop-handoff.md` |
| Ownership / Boundary Model | What belongs to plugin core, project adapters, artifacts, and pause rules? | `04-ownership-boundary.md` |

## Layers

Agent Harness has three layers:

1. Harness plugin: canonical adapter protocol, references, skills,
   templates, and deterministic CLI helpers.
2. Project adapter: project-specific artifact paths, source-of-truth rules,
   hard boundaries, validation commands, and enabled gates.
3. Documentation artifacts: Goal indexes, specs, goals, milestones, gate
   records, run logs, status files, mental models, and deferred registers.

Fixed-contract projects keep the original fixed file contract.
Adapter-contract projects resolve artifact paths through
`.harness/config.json` and the project adapter.

## Reading Order

Read `01-user-scenario.md` first when deciding how a new user should initialize
the harness in a new project, migrate an existing project into the harness
system, activate harness instructions, or trigger normal post-activation
workflows.

Read `02-work-unit.md` when deciding which artifacts a Goal needs and how its
Tasks should be represented.

Read `03-control-loop-handoff.md` when creating goals, preparing runs,
recording verification, or passing work to another session.

Read `04-ownership-boundary.md` when changing plugin core, adapter rules,
artifact paths, or anything with safety, cost, production, credentials,
destructive actions, push, PR, deploy, release, daemon, or automation impact.
