# CLI Reference

The primary user path is to ask Codex or another coding agent to use the
`harness:*` workflow skills. The CLI is deterministic tooling for agents,
operators, diagnostics, scripted adoption, and plugin maintainers.

Run commands from a checked-out copy of this repository unless a packaged
`agent-harness` binary is available in your environment.

## Validate The Plugin

```bash
npm run validate:plugin
npm run test:smoke
```

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

The adapter contract requires an accepted spec:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --spec harness/specs/task-title.md
```

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

Inspect a prepared run:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title
```

Record a run outcome without modifying source files, pushing, or opening PRs:

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase completed --summary "Implemented and verified" --verification "npm test passed"
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase completed --summary "Gate accepted" --verification "npm test passed" --gate-evidence "Reviewed implementer output and run evidence"
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase blocked --summary "Blocked by missing credential"
```
