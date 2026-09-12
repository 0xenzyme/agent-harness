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

An optional advanced reviewer may be used explicitly. It is read-only and
inherits the parent model and reasoning effort. Harness does not default to a
worker launch or to model/effort pinning.
