# Model Routing Reference

Model routing is scheduling guidance, not a product or code boundary. It must
not be used to claim that a worker ran on a model that the Codex runtime did
not report.

## Stable Labels

- `default configured model`: use the runtime default.
- `fast / cheap model`: simple docs, typo, or mechanical edits.
- `strong coding model`: difficult implementation and debugging.
- `strong reasoning model`: planning, review, and gate decisions.
- `frontier model`: rare high-ambiguity or high-blast-radius work.

## Current Codex Recommendation

For Codex work, use the `gpt-5.6` alias as the default recommendation for
controllers and implementation workers. It routes to the flagship
`gpt-5.6-sol` model while keeping the Harness policy on the stable public
alias.

Use `gpt-5.6-terra` for bounded, read-heavy, or mechanical parallel workers
where lower latency and cost matter more than deep planning. Do not use it as a
silent downgrade for an ambiguous implementation, gate, security review, or
high-blast-radius decision.

| Work shape | Recommended model | Starting reasoning effort |
| --- | --- | --- |
| Controller, implementation, difficult debugging | `gpt-5.6` | `medium` |
| Planning, review, gate, security-sensitive reasoning | `gpt-5.6` | `high` |
| Read-heavy exploration, inventory, docs scan, mechanical support work | `gpt-5.6-terra` | `low` or `medium` |
| Rare quality-first, high-ambiguity work | `gpt-5.6` | `xhigh` or `max`, after a measured need |

The runtime may choose a model when no model is pinned. In that case, record
`default configured model` as the recommendation and report the actual runtime
model when available.

## Pinning A Codex Worker Model

Yes. Create a named custom Codex agent in `.codex/agents/` for project-scoped
policy or `~/.codex/agents/` for a personal policy, then set `model` and
`model_reasoning_effort`. A custom agent inherits the parent settings for
fields it does not define.

Agent Harness ships project-neutral starting templates. Copy the selected
template without renaming its underscore filename or `name` field:

| Role | Canonical template | Model / effort | Sandbox |
| --- | --- | --- | --- |
| Explorer | `templates/codex-agents/harness_explorer.toml` | `gpt-5.6-terra` / `low` | `read-only` |
| Implementer | `templates/codex-agents/harness_implementer.toml` | `gpt-5.6` / `medium` | `workspace-write` |
| Reviewer | `templates/codex-agents/harness_reviewer.toml` | `gpt-5.6` / `high` | `read-only` |

The templates define execution-worker policy only: each returns candidate
evidence, and the controller remains the only accepted-state owner. See the
English or zh-CN install guide for project- and user-scoped copy commands.

Ask Codex to launch the named worker explicitly. A Harness `Recommended model`
field is advisory evidence; it does not itself override Codex runtime routing.
Keep `Actual model` and `Actual reasoning effort` in the execution result
packet whenever the runtime exposes them.

## Goal Launch Fields

```text
Recommended model:
Recommended reasoning effort:
Why this level:
Fallback allowed:
```

Default:

```text
Recommended model: gpt-5.6
Recommended reasoning effort: medium
Why this level: task class and scope are bounded.
Fallback allowed: yes
```

Execution results should report actual model and effort when the runtime
exposes them. If not exposed, say so rather than guessing.
