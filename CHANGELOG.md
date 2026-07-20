# Changelog

## Unreleased

## 0.9.0 - 2026-07-20

- Added project-neutral `artifactPolicy` configuration for tracked or
  local-only Runs, durable evidence roots, terminal retention windows,
  latest-Run protection, bounded status snapshots, and task archives.
- Added deterministic `artifacts inspect`, `artifacts compact`, and
  `artifacts prune` commands with read-only previews, archive-first recording,
  explicit apply semantics, configured-root containment, and durable
  state-sync evidence checks.
- Normalized decorated terminal task states while preserving active and
  unknown Runs and refusing destructive cleanup when evidence is incomplete.
- Aligned schemas, templates, skills, references, bilingual CLI and contract
  docs, README guidance, and deterministic regression coverage with the new
  artifact lifecycle contract.
- Dogfooded the policy by bounding the repository task index and status
  snapshot, archiving exact historical task blocks, and retaining every Run.

## 0.8.0 - 2026-07-19

- Added the Codex-native execution bridge: runtime Goal owns the current
  long-running outcome, Codex Plan owns transient steps, and the runtime owns
  Thread/subagent execution.
- Defined three execution paths: `codex-direct`, bounded
  `codex-direct-postflight`, and `durable-harness`.
- Changed controller semantics so controller means outcome and accepted-state
  owner; only explicit `gate-only` or review-only direction forbids foreground
  implementation.
- Scoped configured completion gates to durable Goal/Run completion and kept
  existing enforced Runs protected from postflight bypass.
- Replaced generic explorer/worker DAG expansion with minimal durable execution
  and verification nodes while leaving delegation decisions to Codex.
- Added deterministic behavior traces for runtime Goal/Plan ordering,
  postflight-only state sync, direct work without Harness artifacts, bounded
  native-capability fallback, and enforced-Run protection.
- Updated skills, prompts, templates, README, usage, contracts, CLI guidance,
  presentation, and release documentation for the 0.8.0 behavior.

## 0.7.0 - 2026-07-18

- Refocused Agent Harness on persistent project control: deterministic config
  and doctor checks, adapter paths, repository Goal/Run/DAG state, delivery
  evidence, and controller-owned acceptance gates.
- Returned ordinary clear change/build execution, worker scheduling,
  concurrency, cancellation, and model selection to the Codex runtime; removed
  the public `mixed` role and the bundled explorer/implementer agent templates.
- Added configured-root, path traversal, and symlink containment for config,
  Goal, Spec, Run, DAG, status, result, and log paths.
- Made delivery state Run-scoped by recording start Git evidence and comparing
  branch, HEAD, upstream, and dirty state at completion.
- Replaced the colliding personal marketplace identity with
  `agent-harness-local` and added strict marketplace/plugin/root checks to the
  local deployment helper.
- Reduced the public routing and rule surface, narrowed implicit skill
  activation, merged duplicate references, and reframed deterministic evals as
  routing classification rather than activation provenance.
- Simplified configuration to canonical fields while retaining legacy reads
  with conflict detection, and changed the plugin `defaultPrompt` to the
  current array form.
- Fixed Windows suite spawning and locale-dependent smoke/eval assertions;
  version tests now compare canonical sources instead of hard-coding a release.

## 0.6.0 - 2026-07-09

- Made task completion explicitly include state-sync evidence or
  `State Sync Notes`, while preserving the accepted-state owner boundary for
  accepted state writes.
- Added `harness-rule:bounded-status-snapshot` so configured status files are
  current-state snapshots rather than append-only history logs.
- Updated workflow guidance, templates, generated prompts, protocol docs, CLI
  docs, README files, and deterministic checks for state-sync completion and
  bounded status semantics.
- Updated package/plugin version metadata and release docs for the `0.6.0`
  state-discipline line.

## 0.5.0 - 2026-07-06

- Added `docs/cybernetic-stability.md` as the dedicated control-theory inspired
  stability model for Agent Harness.
- Documented Harness as a semantic control loop with intent/setpoint selection,
  sensor freshness, measurement snapshots, remaining gap, feedback quality,
  and stability/saturation pause triggers.
- Added stable cybernetic stability protocol anchors for intent/setpoint
  selection, sensor freshness, measurement snapshots, remaining gap, feedback
  quality, and stability/saturation across task routing, workflow skills,
  templates, generated guidance, and deterministic checks.
- Updated README / README.zh-CN positioning and release notes for the `0.5.0`
  cybernetic stability line.

## 0.4.0 - 2026-07-02

- Added `docs/HARNESSES.md` as the project-neutral Agent Harness capability
  matrix for runtime/control surfaces, boundaries, default worker behavior, and
  suite routing.
- Added stable `harness-rule:*` protocol anchors for gate-only controller
  behavior, local delivery ceilings, worker surface defaults, project-neutral
  core content, and state-sync evidence.
- Added deterministic suite routing through `scripts/test-suites.mjs`,
  `npm run test:protocol`, `npm run test:presentation`, and
  `npm run test:all`.
- Added GitHub presentation assets, release notes, repository topic guidance,
  and README first-screen badges/links for the profile-pinned repository.

## 0.3.0 - 2026-06-30

- Removed legacy wrapper skills from the public plugin surface.
- Kept the shipped plugin focused on `harness:orient`, `harness:intake`,
  `harness:init`, and `harness:execute`.

## 0.2.0 - 2026-06-29

- Introduced workflow-controller skills and aligned plugin packaging metadata.

## 0.1.0 - 2026-06-21

- Established the initial Agent Harness project layout, goal handoff, run
  preparation, and adapter contract foundation.
