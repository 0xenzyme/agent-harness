# Runtime Capability Compatibility

Harness has one conservative protocol for every model and an optional set of
Codex-native enhancements. Model names are not capability checks; use a
capability only when the current host exposes it.

## Baseline

Every execution must be understandable without native Goal, Plan, subagents,
async steering, or mid-turn configuration. The baseline is:

- accepted objective, scope, and completion conditions;
- current thread and checkout when no isolated runtime is available;
- a short checklist for multi-step work;
- deterministic verification and CLI-enforced state validation;
- a concrete result, remaining work, and state-sync note when state already
  existed before execution.

## Optional capabilities

- Native Goal owns a long-running outcome when the host exposes `create_goal`.
- Native Plan owns transient steps when a plan tool is exposed.
- Thread or subagent tools own delegation, scheduling, and concurrency when
  available and useful.
- Async steering or runtime configuration updates are optional optimizations.

If a capability is unavailable, continue with the baseline in the current
thread. Do not create repository artifacts that imitate an unavailable runtime
feature, and do not invent runtime identifiers. A prepared enforced Run still
keeps its repository-level evidence and recovery requirements.

This profile is deliberately model-neutral: newer models may use more optional
capabilities, while older models remain supported by the same accepted-state
and verification contract.
