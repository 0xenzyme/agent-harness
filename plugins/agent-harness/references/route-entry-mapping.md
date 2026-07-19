# Public Entry Mapping

Agent Harness publishes four skills:

- `harness:orient`: inspect durable state without mutation.
- `harness:intake`: preview or explicitly record unaccepted work.
- `harness:init`: audit, initialize, import, or repair Harness setup.
- `harness:execute`: control accepted durable work or perform bounded postflight
  sync to existing tracked state.

Ordinary clear change/build requests use Codex directly. Clarifying or shaping
scope and asking a blocking question are ordinary actions, not route names.
Creating a repository Goal is an action inside `harness:execute` when durable
control is required. Proposal competition is an explicit advanced read-only
technique, not a public skill or default route.

The execution path names are not additional skills:

- `codex-direct` uses Codex without Harness execution.
- `codex-direct-postflight` maps to `harness:execute` only after execution for
  bounded verification and updates to existing state.
- `durable-harness` maps to `harness:execute` before execution.
