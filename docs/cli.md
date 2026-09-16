# CLI Reference

The primary user path is to ask the current coding agent to use the
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
presentation, protocol, smoke, and regression coverage should all run. Use
`npm run test:regressions` for the focused CLI hardening suite.

`npm run test:eval` is deterministic and does not measure model activation.
An opt-in live check requires explicit model/cost authorization:

```bash
AGENT_HARNESS_LIVE_EVAL=1 npm run test:eval:live -- --model gpt-6-astra --reasoning-effort high --output evals/results/live-gpt-6-astra.json
```

The live runner refuses a GPT-6 Astra claim unless Codex reports the runtime model.

## Initialize Or Import Projects

Initialize an adapter-contract downstream project:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
node plugins/agent-harness/scripts/agent-harness.mjs skills install --cwd /path/to/project
```

`skills install` copies the four public skills to `.agents/skills/` and the
protocol references to `.agents/references/`. Preview with `--dry-run --json`.
This is the default skill-discovery path; Codex marketplace install is optional.

The same `init` options work for a fixed contract. `--task-index` sets the
configured task file and `--idea-inbox` creates an optional Markdown inbox;
the paths are written to `.harness/config.json` and are checked for containment.

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract fixed --task-index docs/tasks.md --idea-inbox docs/intake.md
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

Preview a new idea or requirement before recording it. Preview is read-only;
when the adapter declares an idea inbox, recording writes the unaccepted
candidate there and leaves the Goal index unchanged:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow"
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --json
```

Record the candidate only after explicit confirmation. Adapter projects with a
configured idea inbox use that inbox; projects without one fall back to a
supported markdown Goal index:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --record --priority P2 --section Next
```

Preview deterministic Goal/status maintenance from the configured Task/Goal
state, bounded status, and recent Run records:

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
configured durable-evidence references to local-only Runs without writing. Run counts distinguish
operational `active`, known `terminal`, and `unmanaged` legacy/invalid entries;
the three classifications cover every inspected entry:

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
Conditions`, `Execution Role`, and authoritative state/evidence sections.

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

Prepared run packets include `manifest.json`, `dag.json`, `dag.md`, and
`agents/<node>/prompt.md`. `manifest.json` binds the prepared Goal/Spec
execution contract and DAG shape; changing those inputs after preparation is
rejected and requires a new Run. Harness records ready nodes, ownership, verification,
and candidate evidence; the host owns worker selection, delegation,
concurrency, and cancellation. `run prepare` does not start workers or pin
model/effort. Task/Goal remains the accepted-state authority; Run packets store
execution and verification evidence, while status remains a bounded projection.

Inspect a prepared run:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --json
```

### Run checkpoint and recovery

Checkpointing is default-disabled and does not affect ordinary managed Runs or
Codex fast paths. An adapter may provide the default for new Goals, while each
Goal persists the resolved policy:

```json
{
  "checkpoint": {
    "defaultPolicy": "disabled",
    "stages": ["diagnosis", "delivery"],
    "adapterDimensions": {
      "deliveryReadiness": ["pending", "ready"]
    }
  }
}
```

Enable it explicitly when creating a Goal:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --spec harness/specs/accepted.md --checkpoint-policy enforced
```

`Checkpoint Stages` is copied from config into each new Goal and bound by the
immutable manifest. `currentStage` and `lastCompletedStage` must be `null` or
belong to that finite vocabulary, so they remain recovery labels instead of an
undeclared second stage state machine.

An enforced `run prepare` creates an independent `checkpoint.json`. The
manifest binds only its path, schema version, and resolved policy; it does not
hash mutable checkpoint content. `status.json` holds a reference without
copying revision/control state. Inspect and validate with:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run validate --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --json
node plugins/agent-harness/scripts/agent-harness.mjs run checkpoint show --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --json
node plugins/agent-harness/scripts/agent-harness.mjs run checkpoint validate --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --json
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --json
```

Every mutation supplies the freshly read `--expected-revision` and uses the
Run lock plus atomic write. When an external effect is uncertain, enter
reconciliation and prohibit blind retry:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run checkpoint update --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --expected-revision 0 --control-state reconciliation-required --next-action "inspect authoritative deployment state" --pause-reason "deployment may have completed before state sync failed" --required-evidence '["authoritative deployment status"]' --prohibited-actions '["retry deployment"]' --reconciliation-required true --json
```

Clearing reconciliation also requires `--evidence-reference`, `--observed-at`,
and `--observed-source`. Goal/Spec contract drift only permits the old Run to
enter `replan-required`; after a replacement Run is prepared and validated it
may become `superseded`. Never rebind the old manifest. A `completed`
checkpoint requires a terminal DAG but does not complete the Goal. Multiple
active checkpoints make `orient next` pause until `--run` selects one.

Record a node start before launch, then record its result. Node IDs are generated
per task size; inspect `run status --json` (or `dag.json`) before copying a command.
For the current default medium/large DAG, the IDs are `execution` and
`verification`; a second concurrent writer requires `--isolation-evidence`:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run node record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --node execution --phase running --summary "Starting accepted implementation"
node plugins/agent-harness/scripts/agent-harness.mjs run node record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --node execution --phase completed --summary "Implementation evidence recorded" --verification "Focused checks passed"
node plugins/agent-harness/scripts/agent-harness.mjs run node record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --node verification --phase running --summary "Starting verification"
node plugins/agent-harness/scripts/agent-harness.mjs run node record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --node verification --phase blocked --summary "Blocked by a failed verification command"
```

Record a Run outcome without modifying source files or performing external
actions itself:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase completed --summary "Implemented and verified" --verification "npm test passed"
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase completed --summary "Gate accepted" --verification "npm test passed" --gate-evidence "Reviewed implementer output and run evidence"
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase blocked --summary "Blocked by missing credential"
```

`run record` refreshes accepted Run evidence in `status.json` and the Run log.
Node and Run records use an exclusive Run lock and atomic artifact writes, so
concurrent record commands cannot produce partial JSON or overwrite a log.
Completed Runs require verification, every generated DAG node to be completed
(including advisory/small DAGs), required checklist items, durable gates, and
synchronized authoritative Task/Goal state with concrete State Sync Notes. The
Goal must reference the exact Run path; a blocked Goal cannot complete a Run.

Active `running` or `blocked` nodes block completion; cancellation or supersession is a
cooperative controller signal, not proof that a worker runtime stopped.

Configured `gates.requiredForCompletion` and `gates.blocking` apply to durable
Goal/Run completion. They do not require ordinary host-direct work or bounded
postflight-only state updates to create a Run. Once a Run is prepared,
postflight wording cannot bypass its DAG, gates, or evidence.

The CLI records durable state; it does not implement host runtime outcome or
transient plan. Skills bind long-running controller work to the host's native
outcome and plan capabilities when exposed.

Legacy Goal and Run delivery fields remain readable for the `0.10.0`
compatibility boundary, but current validation, completion, maintenance, and
status output ignore them. New artifacts do not emit those fields.

Status-only or otherwise unprepared legacy Run directories remain inspectable
for migration, but are marked `unmanaged` and cannot automatically move Tasks
to Done or qualify for `artifacts prune --apply`. Configured artifact-policy
paths must be repo-relative; `doctor` exits non-zero when required Harness paths
are missing.
