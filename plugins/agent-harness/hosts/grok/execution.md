# Grok Host Execution

This pack maps Agent Harness capabilities to Grok. Core protocol lives in
`references/host-execution.md` and `references/host-capabilities.md`.

Prefer project skills already installed at `.agents/skills/`. Grok scans that
path. Do not copy those skills into `.grok/skills/` by default. Do not depend
on `.codex-plugin` or `agents/openai.yaml`.

## Capability Map

| Capability | Grok surface | Fallback |
| --- | --- | --- |
| `runtimeOutcome` | Not exposed. Session continuation and Plan mode `plan.md` are not outcome ids | Continue in the current session. Never invent a Goal id. Durable Runs record degraded provenance. |
| `transientPlan` | `todo_write` when the session exposes it | Keep steps in the current session. Do not mirror every todo into Git. |
| `delegation` | `spawn_subagent` when the session exposes it | Foreground execution in the current session. |
| `isolation` | `spawn_subagent` with `isolation` set to `worktree` | Sequential writers only. |
| `resultPacket` | DAG node record plus the Execution Result Packet | Incomplete packets stay candidate evidence. |

## Path Aliases

Use the canonical paths `host-direct`, `host-direct-postflight`, and
`durable-harness`. Conversation routes use `current-session`,
`delegated-worker`, and `isolated-worktree`.

## Grok-Specific Rules

- Authorization to spawn a subagent is not authorization to create a worktree.
- Do not pass a host-specific starting checkout unless the current user
  explicitly requests that Git state.
- Worker selection, concurrency, cancellation, and model/effort belong to the
  Grok runtime. Harness records ready nodes, ownership, verification, and
  candidate evidence.
- The `workflow` tool is not the Harness DAG runner. Use it only when the user
  explicitly asks to run a workflow.
- Do not register a default reviewer under `plugins/agent-harness/agents/`.
  An optional reviewer stays opt-in and inherits the parent model and effort.
- Scheduler, monitor, and background tasks are host facilities. They are not
  Harness capabilities.
- Marketplace install is optional through `.grok-plugin/marketplace.json`.
  `npm run validate:plugin` does not validate this pack.
- Worker output must be recorded with `run node record` before dependents run.
- Map the Grok worker return onto the result packet in
  `hosts/grok/result-packet.md`.
