# Work Routing

Delivery is the primary outcome. Choose the lightest surface that delivers and
verifies the user's actual objective; never add process artifacts merely because
Harness is installed.

- Ordinary clear question, analysis, review, change, or build with no existing
  state-sync obligation: `host-direct`; use the current host directly. The result
  and its real verification are sufficient; no Harness evidence trail is needed.
- Simple completed work linked to existing Task/Goal/status state:
  `host-direct-postflight`; verify and update existing state only.
- Harness status, blocker, stale artifact, or next-entry inspection: `harness:orient`.
- Rough unaccepted idea or explicit capture: `harness:intake`.
- Harness adoption, audit, import, migration, or repair: `harness:init`.
- Accepted work needing recovery, audit, persistent state sync, milestone
  acceptance, Run orchestration, multiple workers, or high-risk control: `harness:execute`.

Shaping scope and asking a blocking question are ordinary actions. Repository
Goal creation is an execute action for the durable tier. Proposal competition
is an explicit advanced read-only technique for genuinely ambiguous or
high-risk decisions.

Read `host-execution.md` for runtime-outcome and transient-plan binding,
controller semantics, postflight limits, and fallback. A prepared enforced Run
cannot be downgraded. Legacy names `codex-direct` and
`codex-direct-postflight` remain readable aliases.

For durable work, normalize the target to Roadmap, Milestone, Goal, Task, Run,
Priority, or Spec. Record `gate-only` or `implementer`, configured roots, the
accepted-state owner, verification, pause conditions, and State Sync Notes.
Worker selection, model/effort, delegation, concurrency, and cancellation stay
with the host when `delegation` is available; Harness records orchestration
dependencies, ready state, ownership, verification, and candidate evidence.
