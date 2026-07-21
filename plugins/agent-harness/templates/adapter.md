# Project Harness Adapter

Harness contract: adapter

This adapter records project-specific harness decisions. Generic rules live in
the Agent Harness plugin references.

## Artifact Paths

- Goal index: `harness/tasks.md`
  - Compatibility note: the storage filename and config key remain
    `tasks` / `taskIndex`; user-facing project state should treat top-level
    entries as Goals.
- Status file: `harness/status.md`
- Specs: `harness/specs/`
- Goals: `harness/goals/`
- Milestones: `harness/milestones/`
- Runs / logs: `.harness/runs/`
- Gate records: `.harness/runs/`
- Deferred register: `harness/milestones/`
- Mental models: `harness/mental-models/`
- Mental model index: `harness/mental-models/README.md`

## Source Of Truth

- Task/Goal records own accepted phase: `active`, `completed`, or `blocked`.
- Runs retain execution and verification evidence.
- Status is a bounded projection and does not define completion.

## Design Principles

- Optional proposal competition:
- Inspectable evidence trail:
- Packaging / validation discipline:
- Project-neutral public docs:
- Lightweight route explanation:

## Config Validation

- Schema: `plugins/agent-harness/schemas/config.schema.json`
- Command: `agent-harness config validate --cwd .`
- Result:

## Language Policy

- Machine-readable source: `.harness/config.json` `language.default`
- Allowed project values: `auto`, `en`, `zh-CN`
- Project preference: `auto`
- CLI precedence: `--lang` -> `AGENT_HARNESS_LANG` -> `language.default` ->
  `LC_ALL` -> `LC_MESSAGES` -> `LANG` -> `en`
- Current artifact boundary: supported CLI messages can be localized; generated
  Goal/Spec/Run/status bodies and base templates remain English until localized
  renderers are implemented.
- Runtime response policy: follow the user's language while preserving code,
  commands, paths, APIs, package/skill/model names, abbreviations, and Git
  commit messages in their original form.

## Commentary Policy

- Machine-readable source: `.harness/config.json`
  `communication.commentary`
- Allowed values: `minimal`, `balanced`, `audit`
- Project preference: `minimal`
- Boundary: this shapes Harness instructions and generated artifacts; it does
  not filter Codex messages or override host-required updates.

## Artifact Lifecycle Policy

- Machine-readable source: `.harness/config.json` `artifactPolicy`
- Status is a bounded current snapshot, not append-only history.
- The active Goal index retains actionable work and a bounded recent-Done
  window; older terminal records move to the configured archive.
- Run tracking is `tracked` by default; projects may opt into `local-only`.
- Lifecycle commands default to preview. Compaction requires `--record`;
  deletion requires `artifacts prune --apply` and all retention/evidence gates.

## Idea Inbox Policy

- Capture thread:
- Promotion rule:
- Non-execution boundary:

## Optional Competition Policy

- Recommended when:
- Allowed outputs:
- Forbidden actions:
- Control-lane acceptance:

## Hard Boundaries

- Do not use credentials, paid APIs, production data, destructive operations,
  push, PR, deploy, publish, or release without explicit approval.

## Preflight Requirements

-

## State Sync Requirements

- Treat the configured status file as a bounded current-state snapshot. Replace
  current sections when syncing state; keep historical details in Goal index
  entries, Goal files, run logs, and gate records.
- Ordinary work may use Codex directly. Postflight sync updates existing state
  only and creates no lifecycle solely for bookkeeping.

## Codex-Native Execution

- Runtime Goal owns accepted long-running outcomes.
- Codex Plan owns transient execution steps.
- Harness Goal/Run owns durable recovery, evidence, gates, and state sync.
- Controller may implement unless explicitly `gate-only` or review-only.

## External Actions Policy

-

## Validation Commands

-

## Durable Completion Gates

- spec
- execution
- integration

These gates apply only when completing a durable Goal/Run. They do not promote
ordinary direct or postflight-only work into a Run.

## Goal Kinds

- `development`: scoped implementation, review, repair, or documentation work.
- `observe`: ongoing monitoring that records signals and may produce follow-up
  Goal entries after triage.

## Adapter-Owned Overrides

-
