# Codex-Native Execution Bridge

Harness complements the Codex runtime; it does not replace it.

## Three Execution Paths

1. `codex-direct`: ordinary clear, local, reversible work uses Codex directly.
   Do not invoke Harness execution and do not create lifecycle artifacts.
2. `codex-direct-postflight`: when simple work was already linked to an
   existing Harness Task, Goal, status item, or Run, Codex executes normally
   and Harness performs one bounded verification and state-sync closeout.
3. `durable-harness`: recovery, audit, milestone acceptance, DAG dependencies,
   multiple workers, persistent state sync, or high-risk control uses a
   repository Goal/Run and its evidence contract.

An existing prepared enforced Run remains durable. It cannot be reclassified
as postflight-only to bypass its DAG, checklist, gates, or evidence.

## Native Runtime Binding

- Runtime Goal owns the current long-running outcome, success criteria, and
  continuation. For accepted controller work such as "作为主控开发", "推进直到完成",
  "不要停", or cross-turn continuation, establish or reuse a compatible
  runtime Goal before execution. In Codex hosts that expose it, use the native
  `create_goal` capability.
- Codex Plan owns current steps and transient progress. Multi-step work should
  use the native Plan capability, such as `update_plan` when exposed.
- Thread/subagent runtime owns execution, delegation, scheduling, concurrency,
  cancellation, and model/effort selection.
- Repository Goal/Run owns cross-task recovery, durable dependencies and
  ownership, acceptance evidence, Delivery State, and bounded state sync.

Do not duplicate a compatible active runtime Goal. Do not mirror every Plan
transition into Git. If a native capability is unavailable, continue in the
current thread; record degraded provenance only when an active durable Run
requires it. Never invent runtime ids or state the host does not expose.

## Controller Meaning

Controller means outcome owner and accepted-state owner. It does not imply
`gate-only` and does not prohibit foreground implementation. Use `gate-only`
only when the user or accepted Goal explicitly says the controller only reviews
or accepts evidence.

## Postflight Sync

Postflight sync updates existing tracked state only. Record fresh verification,
the observed result, actual Delivery State, and remaining tracked gap. Do not
create a Goal, Run, DAG, gate, or status record solely for bookkeeping.
Adapter completion gates apply to durable Goal/Run completion, not to ordinary
direct work or lightweight postflight-only synchronization.
