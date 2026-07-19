# Gate Results

A gate result cites the accepted objective, candidate inputs, fresh verification,
required checklist items, Run/DAG ownership evidence, run-scoped Delivery
State, and State Sync Notes. The accepted-state owner records `accepted`,
`request-fix`, or `blocked` with concrete evidence.

Apply the nine canonical invariants in `docs/HARNESSES.md`. Local tests do not
prove commit, push, review, integration, release, deploy, or whole-Milestone
completion. Runtime scheduling, delegation, concurrency, cancellation, and
model selection are observations when exposed, not gate policy.

Configured completion gates are durable Goal/Run gates. They do not apply to
ordinary direct execution or lightweight postflight-only synchronization.
Postflight cannot bypass a prepared enforced Run or close a durable Goal
without its recorded gates.
