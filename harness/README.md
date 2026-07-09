# Agent Harness Project Adapter

Harness contract: adapter

This adapter records project-specific rules for the Agent Harness repository.
Generic protocol lives in the plugin references under
`plugins/agent-harness/references/`.

## Artifact Paths

- Goal index: `harness/tasks.md`
  - Compatibility note: the storage filename and config key remain
    `tasks` / `taskIndex` until the CLI/schema storage contract is migrated.
    User-facing project state should treat top-level entries as Goals.
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

- Public package shape and first-use workflow: `README.md`
- Project contracts: `docs/project-contract.md`
- Mental model and loop boundaries: `harness/mental-models/README.md`
- Goal state and backlog: `harness/tasks.md`
- Current execution status: `harness/status.md`

## Terminology Contract

This project adapter uses the current Agent Harness terminology:

```text
Roadmap -> Milestone -> Goal -> Task -> Run
```

- `Roadmap`: long-range direction that contains Milestones.
- `Milestone`: roadmap-level outcome such as `M5`; it usually requires
  multiple Goals and cannot be closed by one leaf Task.
- `Goal`: the primary Harness work unit. Users confirm direction, scope,
  acceptance, and pause conditions at this level.
- `Task`: concrete breakdown inside a Goal, such as checklist items, worker
  nodes, or implementation subparts.
- `Run`: one execution attempt and evidence record for a Goal. A Run is not a
  Codex thread or session.
- `Priority`: `P0` / `P1` / `P2` / `P3` labels are priorities only, not Goal
  names, Task names, or Milestone identifiers.

Intent normalization for this repository:

- "完成这个任务", "开发这个任务", or "use harness for this task" means the
  current `Goal` unless the user explicitly names a Task item.
- "这个任务包含哪些步骤 / 子任务 / checklist" asks for the Goal's `Tasks`.
- "完成 M2" or "推进 M5" means complete the named `Milestone`.
- "再跑一次", "this execution", or "上次失败那次" refers to a `Run`.

## Hard Boundaries

- Do not add network services, persistent daemons, watchers, automatic Codex
  session launching, push, PR, deploy, publish, or release behavior without a
  separate approved design.
- Do not copy downstream project product names, provider rules, production
  rules, DB shape, ports, slots, route lists, or credential policies into
  plugin core.
- Keep plugin contracts stable and explicit.

## Preflight Requirements

- Read `AGENTS.md` before editing.
- Inspect `.harness/config.json` and this adapter before goal or run work.
- Use the current checkout unless the user explicitly asks for an isolated
  worktree.

## State Sync Requirements

- Update `harness/tasks.md` after meaningful Goal or Task state changes.
- Update `harness/status.md` after execution or verification as a bounded
  current-state snapshot. Replace current sections instead of appending
  historical focus logs; keep detailed history in `harness/tasks.md`, Goal
  files, run logs, and gate records.
- Keep docs, skills, templates, CLI help, and tests aligned when changing the
  public command surface.

## Commit / PR / Ship Policy

- Do not commit, push, open PRs, publish, or release unless explicitly asked.

## Validation Commands

```bash
npm run validate:plugin
npm run test:smoke
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd .
```

## Enabled Gates

- spec
- execution
- integration

## Goal Kinds

- `development`: scoped implementation, review, repair, or documentation Goal.
- `observe`: harness-defined ongoing observation. This repository currently
  has no project-specific observe sources configured.

## Adapter-Owned Overrides

- Public terminology uses `fixed` and `adapter` contracts.
- New examples should use `--contract adapter`, not a versioned or historical
  command form.
- New adapter and storage artifacts should use `Milestone Completion Map`;
  `Stage Completion Map` is legacy compatibility language only.
