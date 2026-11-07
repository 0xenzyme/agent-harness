# Work Routing

- Ordinary clear question, review, change or build: `host-direct`.
- Already tracked simple work needing a bounded state update:
  `host-direct-postflight`.
- Read-only Goal/status/next-action inspection: `harness:orient`.
- Rough unaccepted capture: `harness:intake`.
- Explicit setup/import/migration: `harness:init`.
- Accepted Goal/Milestone delivery: `harness:execute`.

Use the lightest path that delivers the complete objective. Do not add process
artifacts because Harness is installed. Recovery, sessions, workers and full
logs belong to the host. Harness records accepted outcomes, dependencies,
concise verification and bounded delivery state.

Legacy `codex-direct` names remain aliases. A Goal nested in an accepted
Milestone does not replace the parent target.
