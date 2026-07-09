# Changelog

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
