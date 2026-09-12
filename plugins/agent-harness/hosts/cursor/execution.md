# Cursor Host Execution

This pack maps Agent Harness capabilities to Cursor. Core protocol lives in
`references/host-execution.md` and `references/host-capabilities.md`.

Prefer project skills already installed at `.agents/skills/`. If a workspace
needs Cursor's native directory, copy or symlink those skill folders to
`.cursor/skills/`. Do not depend on `.codex-plugin` or `agents/openai.yaml`.

## Capability Map

| Capability | Cursor surface | Fallback |
| --- | --- | --- |
| `runtimeOutcome` | Cursor Goal tools when the session exposes them | Continue in the current chat. Never invent a Goal id. |
| `transientPlan` | Session todos / plan UI when exposed | Keep steps in the current chat. Do not mirror every todo into Git. |
| `delegation` | Task / Cloud Agent / subagent when the session exposes them | Foreground execution in the current chat. |
| `isolation` | Locked worktree or a separate agent cwd | Sequential writers only. |
| `resultPacket` | DAG node record plus the Execution Result Packet | Incomplete packets stay candidate evidence. |

## Path Aliases

Use the canonical paths `host-direct`, `host-direct-postflight`, and
`durable-harness`. Conversation routes use `current-session`,
`delegated-worker`, and `isolated-worktree`.

## Cursor-Specific Rules

- Authorization to create a Task or Cloud Agent is not authorization to create
  a worktree.
- Do not pass a host-specific starting checkout unless the current user
  explicitly requests that Git state.
- Worker output must be recorded with `run node record` before dependents run.
- Map the Cursor worker return onto the result packet in
  `hosts/cursor/result-packet.md`.
