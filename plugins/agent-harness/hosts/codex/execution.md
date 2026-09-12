# Codex Host Execution

This pack maps Agent Harness capabilities to the Codex runtime. Core protocol
lives in `references/host-execution.md` and `references/host-capabilities.md`.

## Capability Map

| Capability | Codex surface | Fallback |
| --- | --- | --- |
| `runtimeOutcome` | Native `create_goal` when the host exposes it | Continue in the current thread. Never invent a Goal id. |
| `transientPlan` | Native Plan / `update_plan` when exposed | Keep steps in the current thread. Do not mirror every Plan update into Git. |
| `delegation` | Thread / subagent runtime | Foreground execution in the current thread. |
| `isolation` | Locked worktree plus recorded non-overlap | Sequential writers only. |
| `resultPacket` | DAG node record and Execution Result Packet | Incomplete packets stay candidate evidence. |

## Path Aliases

Codex-era path names remain readable aliases:

- `codex-direct` = `host-direct`
- `codex-direct-postflight` = `host-direct-postflight`

Conversation-route aliases:

- `current-thread` = `current-session`
- `slot-thread` = `delegated-worker`
- `remote-control-worktree` = `isolated-worktree`

## Codex-Specific Rules

- Authorization to create a thread is not authorization to create a worktree.
- Do not pass `startingState` unless the current user explicitly requests that
  specific existing Git state.
- Worker selection, concurrency, cancellation, and model/effort belong to the
  Codex runtime. Harness records ready nodes, ownership, verification, and
  candidate evidence.
- The optional `templates/codex-agents/harness_reviewer.toml` is a read-only
  advanced reviewer and inherits the parent model and effort.
- Install via Codex marketplace remains valid for this host. Project skill
  discovery still prefers `.agents/skills/`.
