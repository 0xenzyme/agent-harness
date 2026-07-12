# Adapter Harness Reference

Agent Harness separates reusable protocol from project-specific policy through
the adapter contract.

```text
adapter contract = Goal with Tasks + status + spec + DAG + run + gate
```

## Layers

1. Harness plugin: reusable rules, packet formats, gates, and base templates.
2. Project adapter: project artifact paths, hard boundaries, enabled gates,
   validation commands, and release policy.
3. Documentation artifacts: Goal indexes, specs, goals, milestones, run logs,
   gate records, and deferred registers.

## Design Principles

- Optional proposal competition: use competition only for Shape decisions when
  ambiguity or risk justifies comparing routes. Competition output is candidate
  evidence, not accepted implementation.
- Inspectable evidence trail: accepted state should name concrete artifacts,
  commands, reviews, gate records, or run logs that another thread can inspect.
- Packaging discipline: plugin docs, install docs, skills, templates,
  marketplace metadata, validation commands, and version metadata should not
  describe behavior the package does not expose.
- Project-neutral docs (`harness-rule:project-neutral-core`): plugin core
  examples and templates should not contain private repo names, local absolute
  paths, customer names, provider-specific rules, ports, credentials, or
  downstream production procedures.
- Lightweight route explanation: when Codex changes workflow mode or work
  mode, it should briefly say why and name the confirmation boundary.
- Role separation: control / gate threads should declare whether they are
  `gate-only`, `implementer`, or `mixed` before editing. A main-control,
  review, judge, gate, or acceptance request defaults to `gate-only` unless the
  user explicitly authorizes same-thread implementation.
- Agent-neutral delegation: worker surfaces are optional capability providers.
  They must return inspectable result packets before controller acceptance; if
  no suitable worker exists, fall back to foreground execution or `ask`. Run
  packets default worker nodes to `codex-cli-subagent` when that surface is
  available; Codex App threads are explicit long-lived handoff lanes, not the
  default worker surface. Worker launches and result acceptance follow
  `references/worker-runner-contract.md`.

## Default Lifecycle

- `todo`: recorded but not started.
- `spec-draft`: requirements are being clarified.
- `spec-ready`: spec is accepted enough to generate a goal.
- `goal-ready`: executable goal prompt exists.
- `doing`: implementation or review work is underway.
- `review`: waiting for human or integration review.
- `blocked`: cannot proceed until a decision or external condition changes.
- `done`: accepted and verified.
- `cancelled`: explicitly not being pursued.

## Goal Kinds

- `development`: concrete work intended to complete after implementation,
  review, and verification.
- `observe`: ongoing observation that records signals, triages them, and may
  produce follow-up Goal entries.

Adapters should declare project-specific observe sources, but the `observe`
kind and its state model belong to the harness protocol.

## Adapter Precedence

Use the highest-priority applicable instruction:

1. Current user instruction.
2. Repository `AGENTS.md` and nested instructions.
3. Project adapter.
4. `.harness/config.json`.
5. Plugin canonical defaults.

Pause when these conflict in a way that affects cost, risk, product direction,
production safety, or compatibility.

## Language Policy

The project adapter owns language preference through the top-level
`.harness/config.json` field:

```json
{
  "language": {
    "default": "auto"
  }
}
```

Use `auto`, `en`, or `zh-CN`. Selection precedence is `--lang`,
`AGENT_HARNESS_LANG`, `language.default`, `LC_ALL`, `LC_MESSAGES`, then `LANG`,
with English as the final fallback. Do not duplicate language configuration
inside the `adapter` object.

This policy currently controls supported human-facing CLI messages only. Base
templates and deterministic Goal/Run artifact bodies remain English. Agent-led
responses follow the user's language while preserving code, commands, paths,
APIs, package and skill names, model names, abbreviations, and Git commit
messages in their original form. Adapter docs should state the desired project
language and this implementation boundary without claiming artifact
localization that the renderer does not provide.

## Commentary Policy

The project adapter may set the top-level `.harness/config.json` field:

```json
{
  "communication": {
    "commentary": "minimal"
  }
}
```

Use `minimal`, `balanced`, or `audit`. Omitted configuration resolves to
`minimal`. Apply `harness-rule:signal-only-commentary`: this policy shapes
Harness skills and generated Run/worker artifacts, but it does not filter Codex
messages or override host-required tool, approval, safety, or heartbeat output.

## Fixed Compatibility

`contract: "fixed"` and projects without config use the fixed contract:

- `harness/tasks.md`
- `.harness/config.json`
- `harness/status.md`
- `harness/goals/`
- `.harness/runs/`

Fixed paths are compatibility defaults, not the universal adapter contract.

## Config Schema

The machine config contract is published as
`plugins/agent-harness/schemas/config.schema.json`. Use:

```bash
agent-harness config validate --cwd <project>
```

Validation should run after init/import and before treating a custom adapter
config as accepted evidence. It checks known keys, contract values, required
fixed/adapter paths, work mode values, and repo-relative path safety.

## Idea Inbox And Competition

Idea Inbox Threads are capture lanes. They can preserve raw ideas and rough
requirements while another thread continues the active goal, but promotion
requires intake / triage before task, spec, goal, or execution state changes.

Proposal competition is a Shape protocol. It can compare routes and risks for
ambiguous work, but it is not an execution launcher and is not accepted state
until the control lane validates the recommendation.

## Execution Roles

Use an explicit execution role when a thread moves from orientation to
execution:

- `gate-only`: inspect candidate output and evidence; accept, block, or
  request correction without directly editing implementation files.
- `implementer`: edit files inside the accepted scope and provide evidence for
  acceptance.
- `mixed`: combine editing and acceptance only after naming why that tradeoff
  is acceptable for the task.

`goal validate` enforces a declared execution role. `run record --phase
completed` requires verification evidence, and `gate-only` completion also
requires explicit gate evidence.

## Evaluation Fixtures

Use `evals/` fixture blueprints and `docs/examples/downstream-project-shapes.md`
to test whether Agent Harness works across new, legacy, non-harness, and messy
realistic project shapes. These examples are contract fixtures, not downstream
project policy.
