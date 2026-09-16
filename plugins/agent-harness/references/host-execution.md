# Host Execution Bridge

Harness complements the current coding-agent host; it does not replace it.

Read [Host Capabilities](host-capabilities.md) for the capability names. Read
the current host pack under `hosts/<name>/execution.md` only for native tool
names. Legacy path names `codex-direct` and `codex-direct-postflight` remain
readable aliases for one migration window.

## Three Execution Paths

1. `host-direct`: ordinary clear, local, reversible work uses the current host
   directly. Do not invoke Harness execution and do not create lifecycle
   artifacts.
2. `host-direct-postflight`: when simple work was already linked to an
   existing Harness Task, Goal, status item, or Run, the host executes
   normally and Harness performs one bounded verification and state-sync
   closeout.
3. `durable-harness`: recovery, audit, milestone acceptance, DAG dependencies,
   multiple workers, persistent state sync, or high-risk control uses a
   repository Goal/Run and its evidence contract.

An existing prepared enforced Run remains durable. It cannot be reclassified
as postflight-only to bypass its DAG, checklist, gates, or evidence.

## Native Runtime Binding

- Runtime outcome owns the current long-running outcome, success criteria, and
  continuation. For accepted controller work such as "作为主控开发", "推进直到完成",
  "不要停", or cross-turn continuation, establish or reuse a compatible
  runtime outcome before execution when the host exposes `runtimeOutcome`.
- Transient plan owns current steps and short-lived progress. Multi-step work
  should use the host `transientPlan` capability when exposed.
- Delegation, scheduling, concurrency, cancellation, and model/effort
  selection belong to the host when `delegation` is available.
- Repository Goal/Run owns cross-task recovery, durable dependencies and
  ownership, acceptance evidence, and bounded state sync.

Do not duplicate a compatible active runtime outcome. Do not mirror every
transient-plan transition into Git. If a native capability is unavailable,
continue in the current session; record degraded provenance only when an
active durable Run requires it. Never invent runtime ids or state the host
does not expose.

## Controller Meaning

Controller means outcome owner and accepted-state owner. It does not imply
`gate-only` and does not prohibit foreground implementation. Use `gate-only`
only when the user or accepted Goal explicitly says the controller only reviews
or accepts evidence.

## Postflight Sync

Postflight sync updates existing state only. Record fresh verification, the
observed result, and remaining gap. Do not
create a Goal, Run, DAG, gate, or status record solely for bookkeeping.
Adapter completion gates apply to durable Goal/Run completion, not to ordinary
direct work or lightweight postflight-only synchronization.

## Conversation Routes

Canonical values:

- `current-session`: the current conversation owns execution in the locked cwd.
- `delegated-worker`: hand off to a dedicated worker session before editing.
- `isolated-worktree`: the current conversation may control a different locked
  worktree only when explicitly approved.

Legacy aliases remain readable: `current-thread`, `slot-thread`, and
`remote-control-worktree`.
