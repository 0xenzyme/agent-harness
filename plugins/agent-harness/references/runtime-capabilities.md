# Runtime Capability Compatibility

Harness has one conservative protocol for every model and an optional set of
host capabilities. Model names are not capability checks; use a capability
only when the current host exposes it. Codex tool names such as `create_goal`
and `update_plan` live in `hosts/codex/execution.md`.

## Baseline

Every execution must be understandable without runtime outcome, transient plan,
delegation, isolation, or result-packet tools. The baseline is:

- accepted objective, scope, and completion conditions;
- current session and checkout when no isolated runtime is available;
- a short checklist for multi-step work;
- deterministic verification and CLI-enforced state validation;
- a concrete result, remaining work, and state-sync note when state already
  existed before execution.

## Optional capabilities

- `runtimeOutcome` owns a long-running result when the host exposes it.
- `transientPlan` owns current steps when the host exposes it.
- `delegation` owns worker or session handoff when the host exposes it.
- `isolation` is required before parallel writers when the host exposes it.
- `resultPacket` keeps worker returns inspectable candidate evidence.

If a capability is unavailable, continue with the baseline in the current
session. Do not create repository artifacts that imitate an unavailable runtime
feature, and do not invent runtime identifiers. A prepared enforced Run still
keeps its repository-level evidence and recovery requirements.

This profile is deliberately model-neutral: newer models may use more optional
capabilities, while older models remain supported by the same accepted-state
and verification contract.
