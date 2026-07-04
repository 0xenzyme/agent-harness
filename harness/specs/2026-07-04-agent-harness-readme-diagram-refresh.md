# Agent Harness README Diagram Refresh

Status: Accepted
Date: 2026-07-04

## Source

User asked whether current project docs are unified under the new terminology
and whether diagrams need to be redone. After inspection, user agreed that the
current thread should act as Controller and complete the docs improvement task.

## Terminology Baseline

This spec inherits the accepted terminology decisions from
`harness/specs/2026-07-04-agent-harness-terminology-simplification.md`:

- User-facing hierarchy: `Roadmap -> Milestone -> Goal -> Task -> Run`.
- `Milestone` is the roadmap-level progress outcome; new docs and templates
  must not teach `Stage` as the long-term term.
- `Goal` is the main Harness work unit.
- `Task` is a Goal-internal checklist or execution breakdown.
- `Run` is an execution attempt and evidence record, not a thread/session.
- `Priority` / `P0` / `P1` / `P2` / `P3` are priority labels only.

## Scope

- Refresh README diagram assets that still reinforce old task-first framing or
  omit the new `Milestone` / `Task` distinction.
- Add maintainable SVG sources for regenerated README diagrams.
- Update presentation or smoke checks so diagram sources are protected by the
  same terminology contract.
- Keep existing documentation wording changes from the terminology cleanup
  intact.

## Non-Goals

- No new protocol behavior, CLI semantics, workflow skill behavior, plugin
  activation behavior, package version bump, release, deploy, commit, push, or
  external publication.
- Do not rewrite historical evidence records.
- Do not change diagrams that already match the new terminology unless a
  concrete old-term conflict is found.

## Acceptance Criteria

- `docs/assets/readme/adapter-model.png` is regenerated from an SVG source and
  visually presents the adapter model with Roadmap, Milestone, Goal, Task, Run,
  and Evidence concepts.
- `docs/assets/readme/adapter-execution-model.png` is regenerated from an SVG
  source and visually presents the execution flow as accepted direction moving
  through Roadmap, Milestone, Goal, Tasks, Run, verification, gate, and sync.
- `docs/assets/readme/adapter-artifact-map.png` is inspected and either left
  unchanged with evidence that it already uses `Milestones`, or updated if it
  contains outdated terminology.
- Presentation/smoke checks assert that regenerated diagram sources include
  the new terminology and avoid the previous task-first diagram phrase.
- Verification evidence is recorded in the Harness run.

## Validation

- Visual inspection of regenerated PNG assets.
- `node --check scripts/test-suites.mjs`
- `node --check tests/smoke.mjs`
- `npm run test:presentation`
- `npm run test:protocol`
- `npm run test:smoke`
- `npm run validate:plugin`
- `git diff --check`
- Harness `goal validate` and `run status --json`.

## Pause Conditions

- The accepted terminology spec conflicts with a newer user instruction.
- The available local render tool cannot generate deterministic PNGs from SVG
  sources, and no acceptable local alternative exists.
- Updating the diagrams requires a broader product-direction choice beyond the
  accepted terminology hierarchy.
- Any requested action would require credentials, paid APIs, destructive Git
  operations, release, deploy, commit, push, or production access.
