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

`npm run test:eval` is deterministic and does not measure model activation.
An opt-in live check requires explicit model/cost authorization:

```bash
AGENT_HARNESS_LIVE_EVAL=1 npm run test:eval:live -- --model gpt-5.6 --reasoning-effort high --output evals/results/live-gpt-5.6.json
```

The live runner refuses a GPT-5.6 claim unless Codex reports the runtime model.

## Initialize Or Import Projects

Initialize an adapter-contract downstream project:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
```

Import an existing adapter project that already has an adapter and a Goal index
stored in a task-index-compatible file, without creating a second Goal index:

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

`config inspect` also reports the effective `communication.commentary` policy,
its configured/default source, `Report cadence`, and `Notify on` contract.

Summarize current status and recommend the next action without starting work:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project --json
```

`orient next` routes by Goal state. `P0` / `P1` / `P2` / `P3` are priorities
only, not Goal, Task, or milestone identifiers. For `P0` / `P1` `todo` or
`spec-draft` Goals without a spec, it recommends shaping or confirming
accepted scope instead of printing an unusable `goal create` command.
`spec-ready` Goals with a linked spec route to `goal create --spec ...`;
`goal-ready` Goals prefer existing goal validation and `run prepare`.

## Intake And Maintenance

Preview a new idea or requirement before modifying the Goal index:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow"
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --json
```

Append the candidate to a supported markdown Goal index only after explicit
confirmation:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --record --priority P2 --section Next
```

Preview deterministic Goal/status maintenance from current git state and
recent run records:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --json
```

Record a conservative maintenance snapshot in the configured status file by
replacing the existing snapshot section, and only apply exact completed-run
task updates when they can be written safely:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --record
```

Inspect bounded status, active/Done task state, Run counts/bytes/phases, and
tracked references to local-only Runs without writing:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs artifacts inspect --cwd /path/to/project --json
```

Preview task compaction, then explicitly archive exact completed task blocks
before replacing the active index:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs artifacts compact --cwd /path/to/project --json
node plugins/agent-harness/scripts/agent-harness.mjs artifacts compact --cwd /path/to/project --record --json
```

Preview Run retention candidates. Actual deletion requires `--apply`, a
`local-only` Run policy, terminal state, expired retention, containment, and a
Goal that references the Run with State Sync Notes:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs artifacts prune --cwd /path/to/project --json
node plugins/agent-harness/scripts/agent-harness.mjs artifacts prune --cwd /path/to/project --apply --json
```

Recommend whether to use the current checkout, a worktree, or ask first:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd /path/to/project --json
```

## Language

Set the project adapter default in `.harness/config.json`:

```json
{
  "language": {
    "default": "zh-CN"
  }
}
```

Supported values are `auto`, `en`, and `zh-CN`. Selection precedence is
`--lang`, `AGENT_HARNESS_LANG`, `language.default`, `LC_ALL`, `LC_MESSAGES`,
then `LANG`; the final fallback is English.

Override one command:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project --lang zh-CN
```

This affects supported CLI messages only. Goal, Spec, status, run packet, and
other generated artifact bodies currently use English templates/renderers;
`--lang` does not translate them. `auto` uses process locale for deterministic
CLI execution, not the language of a Codex conversation.

## Goals And Runs

User-facing hierarchy is `Roadmap -> Milestone -> Goal -> Task -> Run`.
`Goal` is the main Harness work unit. `Task` means a concrete checklist or
execution breakdown inside a Goal. A `Run` is one execution attempt and
evidence record, not a Codex thread or session.

Create a goal handoff from the configured Goal index:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title"
```

The `--task` flag is a compatibility lookup into the configured Goal index
storage path (`taskIndex`). It creates a `Goal`; the storage label does not make
`Task` the primary Harness work unit.

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
`agents/<node>/prompt.md`. Harness records ready nodes, ownership, verification,
and candidate evidence; the Codex runtime owns worker selection, delegation,
concurrency, and cancellation. `run prepare` does not start workers or pin
model/effort. Run packets also record the start Git snapshot so historical
upstream state is not confused with this Run's delivery evidence.

Inspect a prepared run:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --json
```

Record a node start before launch, then record its result. A second concurrent
writer requires `--isolation-evidence`:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run node record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --node explorer --phase running --summary "Launching read-only explorer"
node plugins/agent-harness/scripts/agent-harness.mjs run node record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --node explorer --phase completed --summary "Mapped implementation ownership" --verification "Read-only review completed"
node plugins/agent-harness/scripts/agent-harness.mjs run node record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --node worker-b --phase running --summary "Launching isolated writer" --isolation-evidence "separate locked worktree /tmp/worker-b"
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

Completed enforced-DAG runs also require every worker node to be resolved.
Active `running` nodes block completion; cancellation or supersession is a
cooperative controller signal, not proof that a worker runtime stopped.

Configured `gates.requiredForCompletion` and `gates.blocking` apply to durable
Goal/Run completion. They do not require ordinary Codex-direct work or bounded
postflight-only state updates to create a Run. Once a Run is prepared and
enforced, postflight wording cannot bypass its DAG, gates, or evidence.

The CLI records durable state; it does not implement Codex runtime Goal or
Plan. Skills bind long-running controller work to the host's native Goal and
Plan capabilities when exposed.

For completed runs, `run record` enforces the goal's Target delivery state. If
the target is `review-open`, `integrated`, or `released/shipped`, pass external
evidence with `--review-url`, `--integration-ref`, or `--release-ref` after
performing the authorized delivery step. `--pr-url` and `--merge-sha` remain
compatibility aliases.
