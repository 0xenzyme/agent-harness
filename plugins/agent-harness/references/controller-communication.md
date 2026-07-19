# Controller Communication

Controller means outcome owner and accepted-state owner; it does not imply
`gate-only` or prohibit foreground implementation. Only explicit review-only
or gate-only direction makes the controller non-editing.

The controller communicates durable target, accepted scope, configured roots,
Run/DAG node, ownership, verification, stop conditions, accepted-state owner,
Delivery State, and state-sync obligations. It does not choose a default worker
surface or pin model/effort.

The Codex runtime owns scheduling, delegation, concurrency, cancellation, and
model selection. For accepted long-running controller work, establish or reuse
a runtime Goal and maintain multi-step work in Codex Plan. Harness records ready nodes, dependencies, ownership,
verification, and candidate evidence. Executors return candidate evidence;
only the accepted-state owner records accepted Goal, Task, Run, gate, and
bounded status state.

Use the nine canonical invariants defined in `docs/HARNESSES.md`. Report only
material blockers, risks, decisions, failed verification, or delivery changes.
Closeout must state concrete `Need user` and `Remaining` values without a fixed
summary template.
