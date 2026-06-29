# B3ehive Design Reference Review

Status: implemented
Created: 2026-06-29
Updated: 2026-06-29

## Source

Reviewed local reference project: `~/project/skills/b3ehive`.

This is an input to Agent Harness skill redesign. It is not a dependency and
should not be copied wholesale.

## Summary

B3ehive is organized around work-shape algorithms, not artifact types. Its
public skills are distinct because each one controls a different recurring
agent organization:

- competition
- blueprint execution
- learning / transformation
- architecture optimization
- feedback / loop control

That confirms the right decision rule for Agent Harness skill redesign:

```text
Make a skill when a high-frequency user intent needs model behavior,
state interpretation, boundaries, and recurring procedural judgment.
Do not make a skill merely because there is a file type or CLI command.
```

## Concepts To Reuse

### Work Shape Over Artifact Type

B3ehive does not split skills by output file. It splits by recurring work
organization. Agent Harness should apply the same principle.

Implication:

- `harness-orient` is a strong candidate because orientation is frequent and
  requires consistent read-only behavior.
- `harness-execute` is a strong candidate because execution is frequent,
  risky, and needs boundaries, validation, and state sync.
- one-off adoption and evaluation flows do not need standalone skills unless
  they become high-frequency model workflows.

### One Authoritative Source

B3ehive's blueprint model is useful because it rejects scattered authority.
Agent Harness should preserve the configured source of truth:

- task index
- status file
- spec when one exists
- goal when execution is scoped
- run record when evidence is produced

The harness equivalent is not one universal blueprint file. It is a resolved
adapter contract that tells Codex which artifact is authoritative for the
current question.

### Master Lane And Evidence Lane

B3ehive separates worker self-tested output from master acceptance. Agent
Harness should reuse the principle without necessarily adopting the same
checkbox vocabulary everywhere.

Implication:

- the active control thread is the master lane
- subagents, idea inbox threads, and automation produce candidate evidence
- only the control lane updates accepted task/status/run state after validation
- raw ideas and worker notes are not accepted work until triaged or verified

### Gates Before Acceptance

B3ehive treats validation and documentation reconciliation as acceptance gates.
Agent Harness should make the same rule explicit in `harness-execute`:

- execute authorized scope
- verify with the configured checks
- reconcile task/status/run evidence
- only then report completion

### Route Decision Lite

B3ehive records rich route decisions for nested skill orchestration. Agent
Harness should use a lighter version:

- why this task is orient / intake / shape / execute
- whether spec or goal is needed
- whether work mode is local / worktree / ask
- what confirmation is required before high-impact transitions

This belongs in skill behavior and CLI output, not in a heavy new route ledger
yet.

### Optional Proposal Competition

B3ehive's competition pattern is useful for high-ambiguity shaping work. Agent
Harness should treat it as an optional capability, not a default core workflow.

Good fit:

- competing skill architecture proposals
- comparing migration routes
- exploring high-risk spec alternatives
- broad audit / coverage tasks
- repair strategy after repeated execution failure

The competition mode should output candidate routes, tradeoff tables, coverage
union, risks, and a recommended decision. It should not directly implement the
chosen route. Implementation belongs to `harness-execute` after the control
thread accepts a route.

### Inspectable Evidence Trail

B3ehive consistently leaves artifacts that another person can inspect: specs,
todos, logs, validation notes, and accepted state. Agent Harness should keep
this as a core design value.

For foreground harness work, the equivalent is:

- status explains current focus and blockers
- tasks explain source and acceptance
- specs capture design decisions
- goals capture executable handoffs
- runs capture verification evidence
- deferred ideas stay visible instead of vanishing into chat context

### Compatibility And Packaging Discipline

B3ehive keeps distribution mechanics explicit: root skill source, plugin copy,
marketplace metadata, install docs, validation scripts, and fresh-thread
testing after install.

Agent Harness can learn the discipline without copying the exact generated-copy
workflow. Useful pieces:

- keep plugin validation mandatory after plugin changes
- document install/update behavior clearly
- test skill discoverability from a fresh Codex thread when packaging changes
- avoid having docs describe skills or commands that the plugin cannot expose

### Project-Neutral Public Artifacts

B3ehive references emphasize avoiding private repo names, local absolute paths,
customer names, and local evidence paths in committed generic docs.

Agent Harness should keep the same rule. Adapter docs may mention project-local
facts, but plugin core docs, templates, and generic examples should stay
project-neutral.

### Lightweight Route Explanation

B3ehive's `RouteDecision` is heavier than Agent Harness needs today, but the
idea is useful: when the agent chooses a mode, it should say why.

Harness should explain mode choice at transition points:

- why this is orientation instead of execution
- why this idea needs intake or spec
- why local/worktree/ask is recommended
- why a competition mode is worth the extra cost
- why the agent is pausing for confirmation

## Concepts Not To Copy

### Cron-First Automation

B3ehive is optimized for scheduled or repeated automation. Agent Harness is
currently a foreground Codex control harness. Do not import cron, daemon,
tmux-worker, resource-lease, or cleanup machinery into the core skill redesign.

### Five-Skill Shape

B3ehive's five skills match its own algorithmic surfaces. Agent Harness should
not mirror that count. The likely first split is smaller.

### Heavy Blueprint State

B3ehive stores execution state inside blueprint checklists. Agent Harness should
not force every project into that model. Adapter projects may already have
task indexes, specs, and status documents. The harness should resolve existing
sources rather than replace them.

### ROI / Lease / Reward Machinery

Those concepts are valuable for autonomous loops, but they are too heavy for
current high-frequency foreground harness use. Revisit them only for future
automation or evaluation systems.

### Generated Plugin Copy Workflow

B3ehive keeps root skills as source of truth and syncs a plugin package copy.
Agent Harness currently keeps plugin source directly under
`plugins/agent-harness/`. Do not add a generated-copy release workflow unless
distribution needs change.

## Skill Boundary Implications

### `harness-orient`

Should exist if the redesign proceeds.

Purpose:

- read project instructions, harness config, adapter, task index, status, and
  relevant mental models
- summarize current project state
- classify ready / blocked / in-progress / done work
- recommend next action without starting work
- identify whether the next mode is intake, shape, goal, execute, or ask
- surface confirmation boundaries

This is high-frequency and model-behavior heavy. It should be a skill because
the user often asks in natural language, and the agent must avoid jumping into
implementation.

### `harness-execute`

Should exist if the redesign proceeds.

Purpose:

- read confirmed spec / goal / run packet when present
- establish scope, work mode, and pause conditions
- implement authorized changes
- run verification
- update task state, status, run evidence, blockers, and deferred work
- preserve master-lane acceptance: subagents and side threads produce evidence,
  not final acceptance

This is high-frequency, high-risk, and requires stable boundaries. It should be
a skill.

### `harness-intake`

Possible, but not yet proven.

Idea intake may become frequent because of Idea Inbox Thread usage. For now it
can remain part of `harness-orient` or a CLI-driven workflow. Split it into a
standalone skill only if idea capture and triage become a common primary user
intent.

### `harness-adopt`

Not a strong skill candidate initially.

Adoption is important but low-frequency. It can stay as CLI commands, docs, and
maybe a section in `harness-orient` until evidence shows users repeatedly need
model-guided adoption.

### `harness-eval`

Not a skill candidate initially.

Evaluation fixture design is important but low-frequency. It should start as a
blueprint or docs workflow, not a skill.

### `harness-maintain`

Do not create initially.

If "maintenance" means deterministic sync from git diff, run logs, and task
state, prefer CLI/tooling and make `harness-execute` call it during sync. A
standalone skill is justified only if maintenance requires frequent model
judgment, such as classifying unresolved diffs into tasks, blockers, or
deferred work.

## Recommended Next Blueprint Direction

The skill redesign blueprint should evaluate this minimal target:

1. `harness-orient`
2. `harness-execute`
3. optional future `harness-intake`

Keep current artifact-oriented skills as compatibility wrappers until the new
workflow skills prove stable.

The blueprint should explicitly reject a skill merely for low-frequency flows
such as adoption or evaluation.

## Confirmed Principles

The user confirmed that these five b3ehive-inspired principles are all worth
adopting in Agent Harness:

- optional proposal competition
- inspectable evidence trail
- packaging discipline
- project-neutral docs
- lightweight route explanation

They should be carried forward into contracts, docs, templates, and the skill
redesign blueprint as explicit requirements.
