# Controller Communication

The controller communicates durable target, accepted scope, configured roots,
Run/DAG node, ownership, verification, stop conditions, accepted-state owner,
Delivery State, and state-sync obligations. It does not choose a default worker
surface or pin model/effort.

The Codex runtime owns scheduling, delegation, concurrency, cancellation, and
model selection. Harness records ready nodes, dependencies, ownership,
verification, and candidate evidence. Executors return candidate evidence;
only the accepted-state owner records accepted Goal, Task, Run, gate, and
bounded status state.

Use the nine canonical invariants defined in `docs/HARNESSES.md`. Report only
material blockers, risks, decisions, failed verification, or delivery changes.
Closeout must state concrete `Need user` and `Remaining` values without a fixed
summary template.
