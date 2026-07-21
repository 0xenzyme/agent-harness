# Gate Results

A gate result cites the accepted objective, candidate inputs, fresh verification,
required checklist items, Run/DAG ownership evidence, authoritative Task/Goal
phase, and State Sync Notes. The accepted-state owner records `accepted`,
`request-fix`, or `blocked` with concrete evidence.

Apply the canonical invariants in `docs/HARNESSES.md`. Local tests do not prove
whole-Milestone completion without accepted scope and state evidence. Runtime
scheduling, delegation, concurrency, cancellation, and
model selection are observations when exposed, not gate policy.

Configured completion gates are durable Goal/Run gates. They do not apply to
ordinary direct execution or lightweight postflight-only synchronization.
Postflight cannot bypass a prepared enforced Run or close a durable Goal
without its recorded gates.
