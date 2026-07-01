# CLI Reference

The primary user path is to ask Codex or another coding agent to use the
`harness:*` workflow skills. The CLI is deterministic tooling for agents,
operators, diagnostics, scripted adoption, and plugin maintainers.

The examples below use the repo-local Node script path. If your environment
provides an `agent-harness` binary, use the same subcommands and options with
that binary.

## Validation Commands

The [Agent Harness capability matrix](HARNESSES.md) maps protocol, smoke, eval,
and plugin-validation suites to the surfaces they cover.

```bash
git diff --check
npm run test:presentation
npm run test:protocol
npm run validate:plugin
npm run test:smoke
```

For goal-backed work, validate the goal before preparing or completing a run:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
```

Run `npm run test:presentation` when README, GitHub presentation, social
preview, changelog, or release-note surfaces change. Run `npm run test:eval`
when eval documentation or eval fixtures change. Run `npm run test:all` when
presentation, protocol, and smoke coverage should all run.

## Initialize Or Import Projects

Initialize an adapter-contract downstream project:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
```

Import an existing adapter project that already has an adapter and task index,
without creating a second task index:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --dry-run
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md
```

Existing projects can override adapter artifact paths during import. Use
`--dry-run --json` to inspect the full proposed config before writing:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --status docs/status.md --specs docs/specs --goals docs/goals --milestones docs/milestones --runs .harness/runs --gate-records .harness/runs --deferred-register docs/milestones --mental-model docs/mental-model.md --mental-model-index docs/mental-model.md --mental-models docs/mental-models --dry-run --json
```

If a project already has `todolist.md`, `init --contract adapter` preserves it
instead of creating a parallel `harness/tasks.md`. A real `config import`
writes the machine config and creates missing support artifacts such as the
configured status file and runs directory.

## Inspect Projects

Check a downstream project:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
```

Print a project-scope activation snippet for `AGENTS.md` without writing
files:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs activation snippet --cwd /path/to/project
```

Plugin-level `SessionStart` bootstrap is intentionally not enabled yet. Local
validation shows the current plugin validator rejects `hooks` in
`.codex-plugin/plugin.json`; keeping the manifest hook-free is the current
boundary that prevents Agent Harness from affecting non-harness projects.

Inspect resolved config and adapter paths:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config inspect --cwd /path/to/project --json
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs adapter inspect --cwd /path/to/project --json
```

Summarize current status and recommend the next action without starting work:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project --json
```

`orient next` routes by task state. For P0/P1 `todo` or `spec-draft` tasks
without a spec, it recommends shaping or confirming accepted scope instead of
printing an unusable `goal create` command. `spec-ready` tasks with a linked
spec route to `goal create --spec ...`; `goal-ready` tasks prefer existing goal
validation and `run prepare`.

## Intake And Maintenance

Preview a new idea or requirement before modifying the task index:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow"
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --json
```

Append the candidate to a supported markdown task index only after explicit
confirmation:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --record --priority P2 --section Next
```

Preview deterministic task/status maintenance from current git state and
recent run records:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --json
```

Record a conservative maintenance snapshot in the configured status file, and
only apply exact completed-run task updates when they can be written safely:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --record
```

Recommend whether to use the current checkout, a worktree, or ask first:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd /path/to/project --json
```

## Language

Use Chinese command output:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project --lang zh-CN
```

## Goals And Runs

Create a goal handoff from the configured task index:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title"
```

By default, adapter goals should reference an accepted spec:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --spec harness/specs/task-title.md
```

For accepted adapter scope that intentionally has no separate spec, use the
explicit spec-less path:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --allow-no-spec
```

Without `--allow-no-spec`, adapter goal creation still fails when `--spec` is
omitted. Spec-less goals must validate the same execution safety fields:
`Scope`, `Non-Goals`, `Verification`, `Completion Conditions`, `Pause
Conditions`, `Execution Role`, and `Delivery State`.

List, inspect, and validate goals before preparing a run:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal list --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs goal inspect --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md --json
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md --json
```

Prepare a run packet from a goal:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
```

Prepared run packets include `dag.json`, `dag.md`, and
`agents/<node>/prompt.md` files. The controller launches ready worker nodes on
the `codex-cli-subagent` surface by default. New Codex threads are explicit,
visible, long-lived handoff lanes, not the default worker surface. `run prepare`
itself does not start workers. Run packets also record conversation route,
execution context lock, and the current delivery state so local worktree
execution is not confused with committed, pushed, integrated, or shipped state.

Inspect a prepared run:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --json
```

Record one execution DAG node result before launching dependent nodes:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run node record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --node explorer --phase completed --summary "Mapped implementation ownership" --verification "Read-only review completed"
node plugins/agent-harness/scripts/agent-harness.mjs run node record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --node worker --phase blocked --summary "Blocked by overlapping file ownership"
```

Record a run outcome without modifying source files or performing delivery
steps itself:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase completed --summary "Implemented and verified" --verification "npm test passed"
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase completed --summary "Gate accepted" --verification "npm test passed" --gate-evidence "Reviewed implementer output and run evidence"
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase blocked --summary "Blocked by missing credential"
```

`run record` refreshes delivery state in `status.json` and the run log.
`implemented-local` and `validated-local` prove only working-tree
implementation or local verification. They satisfy a completed run only when
the target delivery state is no higher than `validated-local`; otherwise,
continue the authorized delivery pipeline or record `delivery pending` with the
missing evidence.

For completed runs, `run record` enforces the goal's Target delivery state. If
the target is `review-open`, `integrated`, or `released/shipped`, pass external
evidence with `--review-url`, `--integration-ref`, or `--release-ref` after
performing the authorized delivery step. `--pr-url` and `--merge-sha` remain
compatibility aliases.
