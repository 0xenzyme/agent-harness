# Host Capabilities

Plugin core talks about host capabilities, not vendor tool names. A host pack
maps these names to the tools that host actually exposes.

| Capability | Meaning | When missing |
| --- | --- | --- |
| `runtimeOutcome` | Cross-turn outcome, success criteria, and continuation | Continue in the current session. Do not invent a runtime id. |
| `transientPlan` | Short-lived multi-step progress | Keep steps in the current session. Do not mirror them into Git. |
| `delegation` | Hand a ready DAG node to another worker or session | Stay in the foreground controller. |
| `isolation` | Parallel writers get a locked worktree or proven non-overlap | Do not run parallel writers. |
| `resultPacket` | Inspectable worker return: files, verification, risks, State Sync Notes, remaining work | Treat narrative claims as incomplete candidate evidence. |

## Result Packet

Workers return candidate evidence only. The accepted-state owner validates the
packet before writing Goal, Task, Run, gate, or status state.

```text
Execution Result Packet

Goal:
Session:
Node:
Status:
State change:
Changed files:
Summary:
Validation:
Known risks:
State Sync Notes:
Need user:
Remaining:
Needs review:
Controller notified:
Worktree:
Actual model:
Actual reasoning effort:
Degraded provenance:
Gate self-check:
Deferred items:
```

`Session` is the host-neutral field. A host pack may record a vendor thread or
agent id in that field; it must not invent an id the host did not expose.

## Fallback

If the host does not expose a capability, keep work in the current session and
record degraded provenance only when an active durable Run requires it. Do not
emulate missing runtime capabilities with extra repository artifacts.
