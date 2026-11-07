# Agent Harness Capability Matrix

Harness supplies accepted Goal/Milestone control, project-specific adapters,
concise verification and bounded state sync. The host supplies execution,
sessions, resume, workers, terminals and full logs.

| Execution path | Host behavior | Harness behavior |
| --- | --- | --- |
| `host-direct` | Deliver and verify ordinary work | None |
| `host-direct-postflight` | Deliver normally | Update existing delivery state only |
| `durable-harness` | Execute accepted work in a session | Control Goal/Milestone acceptance and state |

`execute next` selects the next accepted outcome. Completion writes concise
verification summaries, not source snapshots. Later source edits never reopen
completed targets. Milestone completion requires all Goals and whole-target
checks.

| Domain invariant | Contract |
| --- | --- |
| `harness-rule:path-containment` | Writes and references remain inside configured roots. |
| `harness-rule:pre-delegation-work-mode` | Resolve local/worktree/ask before delegation. |
| `harness-rule:candidate-accepted-evidence` | The outcome owner verifies candidate output. |
| `harness-rule:authoritative-completion-state` | Goal/Milestone owns completion. |
| `harness-rule:state-sync-evidence` | Synchronize concise verification and existing delivery records. |
| `harness-rule:bounded-status-snapshot` | Status is current and bounded, not process history. |
| `harness-rule:project-neutral-core` | Adapters own downstream facts. |
| `harness-rule:durable-tier-boundary` | Ordinary work uses the host directly. |
| `harness-rule:host-owned-execution` | Host owns sessions, resume, workers and execution detail. |

Legacy Run files may remain as historical material. They are not a control
plane and never gate current delivery.
