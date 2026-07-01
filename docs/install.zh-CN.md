# 安装与使用说明

这份文档面向中文使用者，说明如何安装 Agent Harness、如何在下游项目里
接入，以及日常应该怎样让 coding agent 使用 harness。

这不是 `docs/project-contract.md` 的完整中文镜像；协议级 source of truth 仍
是英文 contract 文档和 plugin references。这里保留用户路径、常用命令、主控
线程、worker subagent、goal/run/evidence 和验证边界的中文说明。

## 本地安装

Agent Harness 作为 Codex marketplace repo 分发。本地开发时，从任意目录把
这个仓库加入 marketplace：

```bash
codex plugin marketplace add <path-to-agent-harness-repo>
```

然后重启 Codex，并从 plugin directory 安装 `harness`。

仓库发布到 GitHub 后，可以在另一台机器上添加：

```bash
codex plugin marketplace add <owner>/<repo>
```

marketplace entry 指向：

```text
./plugins/agent-harness
```

只有 `plugins/agent-harness/` 会作为 plugin 内容安装。这个仓库里的
`harness/` 和 `.harness/` 是 Agent Harness 自身开发用的 project adapter
state，不会被安装到下游项目。下游项目在 `harness:init` 或 CLI
`init` / `config import` 后，会拥有自己的 adapter artifacts。

## 推荐入口

大多数用户不需要先手动运行 CLI。安装 `harness` 后，推荐让 Codex 或另一个能
访问该 plugin 的 coding agent 在目标项目里使用 workflow skills：

```text
Use harness:init in /path/to/project to adopt Agent Harness. Preview activation and do not edit AGENTS.md without my approval.
Use harness:orient in /path/to/project and tell me the next safe route.
Use harness:intake to triage this idea without implementing it: Add a new import flow.
Use harness:execute for the confirmed goal in harness/goals/YYYY-MM-DD-task-title.md. Verify and sync state evidence.
```

四个 workflow skills 的分工：

| 场景 | Skill |
| --- | --- |
| 接入新项目、迁移已有 task index、运行 doctor/import，或预览 activation。 | `harness:init` |
| 只读查看状态、todo、blocker 和下一步 route，不改文件。 | `harness:orient` |
| 收集或 triage 新想法、需求、bug、capture-thread note。 | `harness:intake` |
| 执行已确认的 task、spec、goal、run，并完成验证和状态同步。 | `harness:execute` |

旧的 artifact-oriented `harness-*` wrapper skills 不再发布。新用法应按 route
选择上面的四个 workflow skills。

## 接入下游项目

新 adapter-contract 项目可以通过 agent 触发 `harness:init`，或由 operator
直接运行 CLI：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
```

如果下游项目已经有 adapter 文档和 task index，例如 `todolist.md`，不要创建
第二个 task index；先 dry-run，再 import：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --dry-run
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md
```

真实 import 会写入 `.harness/config.json`，并创建缺失的支持产物，例如配置的
status 文件和 runs 目录。

检查解析后的路径和配置：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config inspect --cwd /path/to/project --json
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs adapter inspect --cwd /path/to/project --json
```

中文命令输出可以使用 `--lang zh-CN` 或环境变量：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project --lang zh-CN
AGENT_HARNESS_LANG=zh-CN node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
```

## Main Control 与 Worker

如果你希望当前 thread 作为 main control、control lane、gate、reviewer、judge
或 acceptance lane，请直接说明。Harness 默认把这类请求视为 `gate-only`。

在 `gate-only` 中，当前 thread 可以读取 artifacts、检查 worker output、运行
verification、要求修正、接受或阻塞状态；它不直接修改 implementation files。
明确的实现工作应交给 worker。准备好的 run packet 会包含 `dag.json`、
`dag.md` 和 `agents/<node>/prompt.md`，并默认把 worker nodes 派发到
`codex-cli-subagent` surface（当该 surface 可用时）。

只有当你明确希望当前 thread 也改文件，或 confirmed goal / run 已声明该角色
时，才使用 `implementer` 或 `mixed`。不要因为任务看起来低风险就自动把
control lane 升级成 `mixed`。

## Goal、Run 与 Evidence

Agent Harness 的工作单元可以理解为：

```text
task with status + spec + DAG + goal + gate
```

小任务不一定每次都需要单独的 spec、goal 和 run，但它们的边界仍应清楚：
scope、non-goals、verification、completion conditions 和 pause conditions
应能被检查。

创建 goal 和 run packet 的常见 CLI：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --spec harness/specs/task-title.md
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --json
```

worker output、automation output、inbox notes 和 proposal competition
results 都只是 candidate evidence。accepted completion 需要具体 evidence，
例如 changed files、command summaries、run records、gate records 或 human
review notes。带有 `Spec Acceptance Checklist` 的 goal 必须让每个 checklist
item 都 `satisfied`；adapter-required gates 必须在 `Required Gate Evidence`
里记录具体 evidence 和 `Status: satisfied`。

Delivery State 要和实际证据一致。`validated-local` 表示本地验证通过，不等于
已经 commit、push、review-open、integrated、published 或 released。除非
goal 的 Delivery State policy 明确授权，不要执行 commit、push、review、
integration、publish 或 release。

## 验证命令

本仓库 documentation 或 plugin-surface 变更的基本验证：

```bash
git diff --check
npm run test:smoke
npm run validate:plugin
```

goal-backed work 还应验证 active goal：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd . --goal harness/goals/<goal-file>.md
```

只有 eval docs 或 eval fixtures 改动时，才运行：

```bash
npm run test:eval
```

## 继续阅读

- 中文 README: [`../README.zh-CN.md`](../README.zh-CN.md)
- 中文 CLI reference: [`cli.zh-CN.md`](cli.zh-CN.md)
- 英文 install source: [`install.md`](install.md)
- 英文 project contract source of truth: [`project-contract.md`](project-contract.md)
