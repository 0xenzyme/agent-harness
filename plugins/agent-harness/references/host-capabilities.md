# Host Capabilities

Core uses capability names, not vendor-specific tool requirements:

- `runtimeOutcome`: cross-turn outcome and continuation when exposed.
- `transientPlan`: short-lived steps; do not mirror them into Git.
- `delegation`: host-managed workers, scheduling and cancellation.
- `isolation`: separate worktrees or non-overlapping writer scope.
- `resultPacket`: changed files, actual verification, risks and remaining work.

When a capability is unavailable, continue in the current session. Never invent
runtime ids or create repository artifacts that imitate host state.

Worker output is candidate evidence. The outcome owner reviews the delivered
result before updating Goal/Milestone/status. Sessions, transcripts, full logs
and resume stay in the host or CI.
