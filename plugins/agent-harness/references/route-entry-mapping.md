# Public Entry Mapping

Agent Harness publishes four skills:

- `harness:orient`: inspect durable state without mutation.
- `harness:intake`: preview or explicitly record unaccepted work.
- `harness:init`: audit, initialize, import, or repair Harness setup.
- `harness:execute`: control accepted durable work that needs recovery, audit,
  state sync, milestone/DAG, multi-worker, or high-risk boundaries.

Ordinary clear change/build requests use Codex directly. Clarifying or shaping
scope and asking a blocking question are ordinary actions, not route names.
Creating a repository Goal is an action inside `harness:execute` when durable
control is required. Proposal competition is an explicit advanced read-only
technique, not a public skill or default route.
