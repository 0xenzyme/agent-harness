# Cursor Result Packet

Return candidate output in the current host: changed files, summary, actual
verification commands/results, known risks, remaining work and `Need user`.
Include the host session id only when Cursor exposes it.

The controller reviews the delivered result and updates existing acceptance
records. Do not call `run node record`, create receipts or copy logs into a Run.
