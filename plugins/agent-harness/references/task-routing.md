# Work Routing

Choose the lightest surface that preserves the user's actual objective.

- Ordinary clear question, analysis, review, change, or build with no existing
  state-sync obligation: `codex-direct`; use Codex directly.
- Simple completed work linked to existing Task/Goal/status state:
  `codex-direct-postflight`; verify and update existing state only.
- Harness status, blocker, stale artifact, or next-entry inspection: `harness:orient`.
- Rough unaccepted idea or explicit capture: `harness:intake`.
- Harness adoption, audit, import, migration, or repair: `harness:init`.
- Accepted work needing recovery, audit, persistent state sync, milestone
  acceptance, Run/DAG, multiple workers, or high-risk control: `harness:execute`.

Shaping scope and asking a blocking question are ordinary actions. Repository
Goal creation is an execute action for the durable tier. Proposal competition
is an explicit advanced read-only technique for genuinely ambiguous or
high-risk decisions.

Read `codex-native-execution.md` for runtime Goal/Plan binding, controller
semantics, postflight limits, and fallback. A prepared enforced Run cannot be
downgraded.

For durable work, normalize the target to Roadmap, Milestone, Goal, Task, Run,
Priority, or Spec. Record `gate-only` or `implementer`, configured roots, the
accepted-state owner, verification, pause conditions, and State Sync Notes.
Worker selection, model/effort, delegation, concurrency, and cancellation stay
with the Codex runtime; Harness records DAG dependencies, ready state,
ownership, verification, and candidate evidence.
