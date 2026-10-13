# Worker Runner Contract

Harness records durable worker boundaries; the host owns delegation,
concurrency, cancellation, and worker selection when `delegation` is available.

Runtime outcome owns the current long-running outcome and transient plan owns
short-lived steps when those capabilities are exposed. Harness does not turn
generic exploration, implementation, and verification phases into separate
workers by default; delegate only when the host finds it useful or durable
ownership/dependency evidence requires it.

For every DAG node record its Goal/Run, dependencies, ready state, ownership,
allowed and forbidden scope, execution cwd, verification, stop conditions, and
candidate result artifact. Do not launch a dependent node before its recorded
dependencies complete. Concurrent writers require separate locked worktrees or
proven non-overlapping ownership.

Workers never update accepted Goal, Task, status, Run, or gate state. They
return changed files, verification, risks, State Sync
Notes, and remaining work as candidate evidence in a result packet. The
accepted-state owner validates that evidence and records durable state.

For a planned Run, a node result is a candidate receipt. It must identify
actual validation logs and the content hashes of verification inputs. The
version 1 receipt goes to `<run>/agents/<node>/candidate.json`; see the
[Planned Execution Contract](planned-execution.md) for exact fields and the
`plan inputs` / `run node inputs` commands. The
controller checks those inputs against current files and records an explicit
`run node review` decision. Only `accepted` releases dependent nodes;
`request-fix` keeps the item available for bounded repair, and `blocked`
records a non-user failure. After three identical failures without progress,
block that item and continue other ready nodes. Inspect unknown host worker
liveness before any retry. Planned `running` and `blocked` node records and
reviews require the current checkpoint revision.
Node verification logs belong inside the same bound Run; check timestamps
must be at or after Run manifest creation. A Task's source write scope cannot
include authoritative Harness artifacts.
For a delegated node recorded as running, `executor.thread` in the candidate
receipt must equal the recorded worker identity. The controller runs necessary
checks and saves real logs; the CLI validates the recorded evidence.

An optional advanced reviewer may be used explicitly. It is read-only and
inherits the parent model and reasoning effort. Harness does not default to a
worker launch or to model/effort pinning.
