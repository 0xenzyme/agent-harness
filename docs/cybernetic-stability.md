# Durable Control Feedback

Agent Harness keeps durable project state aligned with accepted intent through
fresh verification, candidate-versus-accepted evidence, authoritative
completion state, and state sync. This model is expressed through the
canonical domain
invariants in [HARNESSES.md](HARNESSES.md), rather than a separate family of
micro-rules.

For each durable Run, compare the accepted Goal with current observations,
record ready DAG nodes and ownership, verify candidate results, apply required
gates, and synchronize bounded current status plus durable Goal/Run evidence.
Pause when evidence cannot validate the accepted objective or new authority is
required.

Ordinary Codex-direct work does not enter this durable loop. Postflight-only
work performs one fresh verification and bounded update to state that already
existed; it does not inherit durable gates or create lifecycle artifacts.

The Codex runtime owns scheduling, delegation, concurrency, cancellation, and
model selection. Harness records the durable facts needed for recovery and
audit; it is not a runtime scheduler.
