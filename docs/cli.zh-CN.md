# CLI Reference

主要用户路径是让 Codex 或其他 coding agent 使用 `harness:*` workflow
skills。CLI 是 agents、operators、diagnostics、scripted adoption 和 plugin
maintainers 使用的确定性工具。

如果你想先了解中文接入流程、main control / worker 分工、goal/run/evidence
边界，先读 [`install.zh-CN.md`](install.zh-CN.md)。本页只保留 CLI command
reference。

下面的例子使用 repo-local Node script path。如果环境里已经提供
`agent-harness` binary，可以用同样的 subcommands 和 options 调用该 binary。

## 验证命令

[Agent Harness capability matrix](HARNESSES.md) 说明 protocol、smoke、eval
和 plugin-validation suites 各自覆盖哪些 surface。

```bash
git diff --check
npm run test:protocol
npm run validate:plugin
npm run test:smoke
```

对 goal-backed work，在准备或完成 run 前先验证 goal：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
```

如果修改了 eval documentation 或 eval fixtures，运行 `npm run test:eval`。
如果需要同时跑 protocol 和 smoke coverage，运行 `npm run test:all`。

## 初始化或导入项目

初始化 adapter-contract 下游项目：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
```

导入已经有 adapter 和 task index 的 adapter 项目，不创建第二个任务索引：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --dry-run
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md
```

已有项目可以在 import 时覆盖 adapter artifact paths。使用 `--dry-run --json`
先检查完整 proposed config：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --status docs/status.md --specs docs/specs --goals docs/goals --milestones docs/milestones --runs .harness/runs --gate-records .harness/runs --deferred-register docs/milestones --mental-model docs/mental-model.md --mental-model-index docs/mental-model.md --mental-models docs/mental-models --dry-run --json
```

如果项目已经有 `todolist.md`，`init --contract adapter` 会沿用它，不会再创
建并行的 `harness/tasks.md`。真实执行 `config import` 会写入 machine
config，并创建缺失的支持产物，例如配置的 status 文件和 runs 目录。

## 检查项目

检查下游项目：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
```

打印用于 `AGENTS.md` 的 project-scope activation snippet，不写文件：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs activation snippet --cwd /path/to/project
```

当前没有启用 plugin-level `SessionStart` bootstrap。本地验证显示，当前
plugin validator 会拒绝 `.codex-plugin/plugin.json` 里的 `hooks` 字段；保持
manifest hook-free 是当前边界，用来避免 Agent Harness 影响没有接入 harness
的项目。

查看解析后的 config 和 adapter 路径：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config inspect --cwd /path/to/project --json
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs adapter inspect --cwd /path/to/project --json
```

只读汇总当前状态并推荐下一步，不开始执行：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project --json
```

`orient next` 会按 task state 选择路线。P0/P1 的 `todo` 或 `spec-draft` task
如果没有 spec，会推荐 shape / 确认 accepted scope，而不是输出不可执行的
`goal create`。带 spec 的 `spec-ready` 会推荐 `goal create --spec ...`；
`goal-ready` 会优先推荐已有 goal validation 和 `run prepare`。

## Intake And Maintenance

预览一个新想法或新需求，不修改 task index：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow"
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --json
```

用户明确确认后，才把候选项追加到支持的 markdown task index：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs intake idea --cwd /path/to/project --idea "Add a new import flow" --record --priority P2 --section Next
```

从当前 git state 和 recent run records 预览确定性的 task/status maintenance：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --json
```

把保守的 maintenance snapshot 写入配置的 status 文件；只有当 completed run
提供精确证据且 task index 可安全写入时，才应用 task 更新：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd /path/to/project --record
```

推荐当前任务应该继续使用当前 checkout、切到 worktree，还是先询问：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs worktree recommend --cwd /path/to/project --json
```

## Language

使用中文命令输出：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project --lang zh-CN
```

## Goals And Runs

从配置的 task index 创建 goal handoff：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title"
```

默认情况下，adapter goal 应引用已确认的 spec：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --spec harness/specs/task-title.md
```

如果 adapter scope 已经被接受，但明确没有单独 spec，使用显式 spec-less 路径：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --allow-no-spec
```

不带 `--allow-no-spec` 时，adapter `goal create` 省略 `--spec` 仍会失败。
Spec-less goal 不能降低安全要求：仍必须验证 `Scope`、`Non-Goals`、
`Verification`、`Completion Conditions`、`Pause Conditions`、`Execution Role`
和 `Delivery State`。

准备 run 之前，列出、查看并验证 goals：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal list --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs goal inspect --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md --json
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md --json
```

从 goal 准备 run packet：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
```

准备好的 run packet 会包含 `dag.json`、`dag.md` 和
`agents/<node>/prompt.md`。controller 默认把 ready worker nodes 分发到
`codex-cli-subagent` surface。新的 Codex thread 是显式、可见、长期的
handoff lane，不是默认 worker surface。`run prepare` 本身不会启动 workers。
Run packet 也会记录 conversation route、execution context lock 和当前
delivery state，避免把本地 worktree 执行误解为已 commit、push、integrate 或
ship。

查看已准备的 run：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --json
```

在启动依赖节点前，先记录一个 execution DAG node 的结果：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run node record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --node explorer --phase completed --summary "Mapped implementation ownership" --verification "Read-only review completed"
node plugins/agent-harness/scripts/agent-harness.mjs run node record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --node worker --phase blocked --summary "Blocked by overlapping file ownership"
```

记录 run 结果；`run record` 本身不修改源码，也不执行 delivery step：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase completed --summary "Implemented and verified" --verification "npm test passed"
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase completed --summary "Gate accepted" --verification "npm test passed" --gate-evidence "Reviewed implementer output and run evidence"
node plugins/agent-harness/scripts/agent-harness.mjs run record --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --phase blocked --summary "Blocked by missing credential"
```

`run record` 会刷新 `status.json` 和 run log 里的 delivery state。
`implemented-local` 和 `validated-local` 只证明 working-tree implementation 或
local verification。只有当 target delivery state 不高于 `validated-local` 时，
它们才足以支撑 completed run；否则应继续已授权的 delivery pipeline，或记录缺
少的 evidence 为 `delivery pending`。

对 completed run，`run record` 会强制检查 goal 的 Target delivery state。
如果目标是 `review-open`、`integrated` 或 `released/shipped`，在完成已授权的
交付步骤后，用 `--review-url`、`--integration-ref` 或 `--release-ref` 传入
外部证据。`--pr-url` 和 `--merge-sha` 仍作为兼容别名保留。
