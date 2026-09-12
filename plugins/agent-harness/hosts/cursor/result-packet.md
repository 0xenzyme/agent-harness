# Cursor Result Packet

Workers return candidate evidence only. The accepted-state owner records
accepted Goal, Task, Run, gate, and status state after validating this packet.

## Mapping

| Result packet field | Cursor worker return | `run node record` |
| --- | --- | --- |
| `Goal` | Repository Goal path supplied by the controller | Implied by `--run` Goal binding |
| `Session` | Cursor chat, Task, or Cloud Agent id if the host exposes one | `--thread` |
| `Node` | DAG node id from `dag.json` | `--node` |
| `Status` | running / completed / blocked | `--phase` |
| `Changed files` | Files the worker edited | `--summary` or verification text |
| `Validation` | Commands and pass/fail | `--verification` |
| `Known risks` | Residual risk the worker cannot close | `--summary` |
| `State Sync Notes` | Goal/Task/status/Run records that should change | `--summary` |
| `Need user` | Blocking user decision | `--summary` |
| `Remaining` | Unfinished accepted scope | `--summary` |
| `Worktree` | Isolated cwd or worktree path | `--cwd` plus `--isolation-evidence` |
| `Actual model` | Model the host reported, or "not exposed" | evidence text |
| `Degraded provenance` | Missing `runtimeOutcome`, `transientPlan`, or `delegation` | evidence text |

## Recording Command

```bash
node <plugin-root>/scripts/agent-harness.mjs run node record \
  --run <run-dir> \
  --node <node-id> \
  --phase completed \
  --summary "<changed files, risks, State Sync Notes, Need user, Remaining>" \
  --verification "<commands and results>" \
  --thread "<cursor session id if exposed>" \
  --surface cursor \
  --isolation-evidence "<locked worktree or proven non-overlap>"
```

If Cursor does not expose a session id, leave `--thread` empty. Never invent
one. The packet remains candidate evidence until the controller accepts it.
