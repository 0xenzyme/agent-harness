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
codex plugin marketplace add 0xenzyme/agent-harness
```

marketplace entry 指向：

```text
./plugins/agent-harness
```

只有 `plugins/agent-harness/` 会作为 plugin 内容安装。这个仓库里的
`harness/` 和 `.harness/` 是 Agent Harness 自身开发用的 project adapter
state，不会被安装到下游项目。下游项目在 `harness:init` 或 CLI
`init` / `config import` 后，会拥有自己的 adapter artifacts。

project-neutral 的 [Agent Harness capability matrix](HARNESSES.md) 汇总了
control surfaces、worker defaults、rule anchors、边界和验证套件。

## 推荐入口

大多数用户不需要先手动运行 CLI，也不需要在 prompt 里写具体 skill 名。安装
`harness` 后，推荐让 Codex 或另一个能访问该 plugin 的 coding agent 在目标
项目里直接“用 harness”：

```text
用 harness 看 /path/to/project 下一步。
用 harness 记录这个想法，先别做：增加新的导入流程。
用 harness 执行 harness/goals/YYYY-MM-DD-task-title.md，验证并同步状态。
```

更多“想做某件事时该输入什么”的中文 prompt 示例见
[`usage.zh-CN.md`](usage.zh-CN.md)。

四个 workflow skills 的分工：

| 场景 | Skill |
| --- | --- |
| 接入新项目、迁移已有 Goal index、运行 doctor/import，或预览 activation。 | `harness:init` |
| 只读查看状态、todo、blocker 和下一步 route，不改文件。 | `harness:orient` |
| 收集或 triage 新想法、需求、bug、capture-thread note。 | `harness:intake` |
| 从已确认 scope 准备 Goal，或执行已确认的 goal/spec/run，并完成验证和状态同步。 | `harness:execute` |

`shape`、`goal`、`competition`、`ask` 是内部 route，不是额外 skill：
shape/competition 由 `harness:orient` 只读处理；已授权 Goal 准备进入
`harness:execute`；ask 等待最小阻塞问题的答案。

旧的 artifact-oriented `harness-*` wrapper skills 不再发布。新用法应按 route
选择上面的四个 workflow skills。

## 接入下游项目

新 adapter-contract 项目可以通过 agent 触发 `harness:init`，或由 operator
直接运行 CLI：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
```

如果下游项目已经有 adapter 文档和以 task-index-compatible 文件保存的 Goal
index，例如 `todolist.md`，不要创建第二个 Goal index；先 dry-run，再 import：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --dry-run
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md
```

如果项目已经使用 `docs/mental-model.md`、`docs/milestones` 等路径，可以在
import 时传入 path overrides，并先用 `--dry-run --json` 检查 proposed config：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config import --cwd /path/to/project --task-index todolist.md --milestones docs/milestones --deferred-register docs/milestones --mental-model docs/mental-model.md --mental-model-index docs/mental-model.md --mental-models docs/mental-models --dry-run --json
```

真实 import 会写入 `.harness/config.json`，并创建缺失的支持产物，例如配置的
status 文件和 runs 目录。

检查解析后的路径和配置：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs config inspect --cwd /path/to/project --json
node plugins/agent-harness/scripts/agent-harness.mjs config validate --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs adapter inspect --cwd /path/to/project --json
```

## 语言策略

语言属于 project adapter policy。通过项目 `.harness/config.json` 声明
machine-readable default：

```json
{
  "language": {
    "default": "zh-CN"
  }
}
```

支持值为 `auto`、`en` 和 `zh-CN`。CLI 的选择优先级是：

```text
--lang -> AGENT_HARNESS_LANG -> language.default -> LC_ALL -> LC_MESSAGES -> LANG -> en
```

单次命令需要覆盖时，可以使用 `--lang zh-CN` 或环境变量：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project --lang zh-CN
AGENT_HARNESS_LANG=zh-CN node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
```

`auto` 表示 deterministic CLI 继续读取后面的 locale candidates；CLI 无法
看到用户当前的 conversation language。当前 localization 只覆盖已经支持的
human-facing CLI messages。`init`、`goal create` 和 `run prepare` 生成的
artifacts，以及 base templates，目前仍是英文；`--lang` 不会翻译这些文件。

Agent-led response 应跟随用户语言，同时保持 code、command、path、package
和 skill name、API 和 model name、abbreviation、Git commit message 的原始
形式。Human-readable project adapter 可以重复说明这一 policy，但
`.harness/config.json` 是 machine-readable source of truth。

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

## 可选：复用 Codex Custom Agents

Agent Harness 在 `plugins/agent-harness/templates/codex-agents/` 提供
project-neutral custom-agent templates：

| Named worker | Template | Model / effort | Sandbox |
| --- | --- | --- | --- |
| `harness_explorer` | `harness_explorer.toml` | `gpt-5.6-terra` / `low` | `read-only` |
| `harness_implementer` | `harness_implementer.toml` | `gpt-5.6` / `medium` | `workspace-write` |
| `harness_reviewer` | `harness_reviewer.toml` | `gpt-5.6` / `high` | `read-only` |

如果这是项目级 policy，只复制需要的 role 到该项目的 `.codex/agents/`：

```bash
mkdir -p .codex/agents
cp /path/to/agent-harness/plugins/agent-harness/templates/codex-agents/harness_explorer.toml .codex/agents/harness_explorer.toml
```

如果希望作为跨项目复用的个人 policy，复制到 `~/.codex/agents/`：

```bash
mkdir -p ~/.codex/agents
cp /path/to/agent-harness/plugins/agent-harness/templates/codex-agents/harness_reviewer.toml ~/.codex/agents/harness_reviewer.toml
```

需要在 prompt 里明确要求 Codex launch named worker，例如：“启动
`harness_explorer` custom agent，盘点这个 Goal 的 allowed scope，并返回
Execution Result Packet。”template 中的 `model` 和
`model_reasoning_effort` 会固定该 named worker 的 policy；Harness launch
packet 的 `Recommended model` 只是 advisory，不会自行改变 runtime routing。
worker output 始终只是 candidate evidence；只有 controller 能验证并接受 Goal、
Task、status、run 或 gate state。

## Goal、Run 与 Evidence

Agent Harness 的工作单元可以理解为：

```text
roadmap -> milestone -> goal -> tasks -> run -> evidence
```

`Goal` 是 Harness 的主要工作单位。`Task` 是 Goal 内部的 checklist 或
execution breakdown。`Run` 是一次执行尝试和 evidence record，不等于
Codex thread 或 session。小任务不一定每次都需要单独的 spec、goal 和 run，
但它们的边界仍应清楚：scope、non-goals、verification、completion
conditions 和 pause conditions 应能被检查。

创建 goal 和 run packet 的常见 CLI：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd /path/to/project --task "Task title" --spec harness/specs/task-title.md
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
node plugins/agent-harness/scripts/agent-harness.mjs run prepare --cwd /path/to/project --goal harness/goals/YYYY-MM-DD-task-title.md
node plugins/agent-harness/scripts/agent-harness.mjs run status --cwd /path/to/project --run .harness/runs/YYYYMMDD-HHMMSS-task-title --json
```

adapter task 如果已有 accepted scope、但明确没有单独 spec，可以使用
`--allow-no-spec` 创建 spec-less goal。生成的 goal 会记录 `Spec Policy:
allow-no-spec`，但仍必须验证 `Scope`、`Non-Goals`、`Verification`、
`Completion Conditions`、`Pause Conditions`、`Execution Role` 和
`Delivery State`，不能降低安全要求。

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

`integrated` 表示进入目标 integration line，但这条线不一定叫 `main`。当前
control branch、locked execution branch、integration target 和 release source
可以不同；具体分支由 project adapter、confirmed goal 或用户明确指令决定。

## 验证命令

本仓库 documentation 或 plugin-surface 变更的基本验证：

```bash
git diff --check
npm run test:protocol
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

如果交付前需要同时跑 protocol 和 smoke coverage，可以使用：

```bash
npm run test:all
```

## 继续阅读

- 中文 README: [`../README.md`](../README.md)
- English README: [`../README.en.md`](../README.en.md)
- 中文 CLI reference: [`cli.zh-CN.md`](cli.zh-CN.md)
- 英文 install source: [`install.md`](install.md)
- 英文 project contract source of truth: [`project-contract.md`](project-contract.md)
