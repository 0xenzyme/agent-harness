# Artifact Lifecycle

Keep only delivery state:

- a bounded current status snapshot;
- an actionable task index with a bounded recent-Done window;
- Goals and Milestones with accepted outcomes, verification summaries,
  remaining gaps and true decisions;
- adapter-owned project documents.

Sessions, workers, full logs, terminals, transcripts and resume belong to the
host or CI. Do not mirror them into Harness artifacts.

Old Run directories may exist as historical data. Do not use them to route,
complete, reopen or verify current work. Pruning an explicitly identified old
local Run is a separate destructive operation, never part of state sync.

Compaction archives completed task entries when configured limits are exceeded.
It does not inspect source hashes or revalidate old execution evidence.
