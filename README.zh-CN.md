# Agent Harness

[English](README.md)

[![Version](https://img.shields.io/badge/version-0.6.0-0f766e)](CHANGELOG.md)
[![Codex Plugin](https://img.shields.io/badge/Codex-plugin-111827)](plugins/agent-harness/.codex-plugin/plugin.json)
[![Protocol](https://img.shields.io/badge/test-protocol_passed-2563eb)](scripts/test-suites.mjs)
[![Smoke](https://img.shields.io/badge/smoke-passed-16a34a)](tests/smoke.mjs)
[![License](https://img.shields.io/badge/license-MIT-7c3aed)](LICENSE)

Agent Harness 是一个面向 Codex 和 coding-agent work 的 adapter-driven
control plane。它把已经确认的方向转成 milestones、goals、goal-internal
tasks、runs、worker execution、verification、gates 和 state sync。

```text
roadmap -> milestone -> goal -> tasks -> run -> evidence -> state sync
```

[Capability Matrix](docs/HARNESSES.md) · [Cybernetic Stability](docs/cybernetic-stability.md) ·
[GitHub Presentation](docs/github-presentation.md) · [Changelog](CHANGELOG.md) ·
[v0.6.0 Release Notes](docs/releases/v0.6.0.md) ·
[使用说明](docs/usage.zh-CN.md)

![Agent Harness social preview](docs/assets/github/social-preview.svg)

## 价值主张

Agent Harness 面向的是“人已经定完方向之后”的阶段。

在真实项目里，用户经常会先定出 `M1` 到 `M5` 这样的 roadmap，讨论完 `M5`
的产品方向，并判断后续不再需要产品判断、凭证、生产访问或破坏性操作。这个时候，
“完成 M5” 不应该被解释成“写完或验收下一个小 spec 就停下”。它应该表示：

```text
accepted direction -> milestone completion map -> executable goals / run DAG
-> worker execution -> control-lane verification -> state sync
```

人仍然负责方向、授权和真正需要人工判断的 gate。Harness 应该在 project
adapter 边界内负责剩余执行机制：

- 读取当前 roadmap、milestone、spec、goal、task 和 run 状态；
- 把 `complete M5` / `推进完成M5` 这类 milestone request 展开成明确的
  milestone items；
- 当当前 thread 是 main control 时，调度 worker execution；
- 在接受状态前验证 concrete evidence；
- 要求执行者在 task completion 中返回 `State Sync Notes`，由
  accepted-state owner 验证并写入 accepted state；
- 保持 `tasks`、bounded `status` snapshots、goals、runs 和 gate records
  对齐；
- 只在真实 human gate 时暂停，例如产品方向不清、约束冲突、需要凭证、付费
  API、生产访问、破坏性操作，或 delivery 超出 policy。

核心承诺不是“agent 会改文件”。核心承诺是 coding agent 不会在 roadmap、
spec、implementation、verification 和 handoff 之间丢失上下文。父级
milestone 必须等 mapped subitems 全部完成后才能关闭；`M5-S0` 这样的
source-spec acceptance 不能静默变成父级 `M5` completion。

## 问题

当一个人同时维护多个软件项目时，真正消耗精力的往往不是写某一行代码，而是开发过程中的协调工作：追踪任务、判断下一步是否安全、准备 goal prompt、检查 evidence、记住每个项目的边界。Agent Harness 的目标是把这些工作推到稳定的 harness 层，让 coding agent 能自动化处理更多开发循环，减少人的调度负担并提升推进效率。

## Adapter Model

Agent Harness 是一个 adapter-driven workflow。plugin 提供稳定协议，每个项目维护一个薄 adapter，项目 artifacts 记录真实的 task、spec、goal、run 和 gate 事实。

`adapter contract` 不是单个文件，而是一套项目执行模型：它把 task intake、roadmap 方向、milestone 规划、spec、goal、run、gate 和 evidence 串起来。

核心原则：

```text
Plugin defines protocol. Adapter defines overrides. Artifacts record facts.
```

也就是说：plugin 定义通用协议，adapter 定义项目覆盖，artifacts 记录项目事实。

![Agent Harness Adapter Model](docs/assets/readme/adapter-model.png)

## Design Principles

Agent Harness 保持控制平面小而可检查：

- Proposal competition 是可选的 Shape protocol。它可以比较路线和风险，但
  不直接执行被选中的路线。
- 已接受的状态应留下 evidence trail，例如 task entries、specs、goals、
  runs、gate records、command summaries 或 review notes。
- Orient 时要把 durable artifacts 和 active control thread 中更新的
  conversation-confirmed state 对齐；发现 stale artifacts 时先报告并同步，再推荐
  execution。
- Packaging 保持 disciplined：docs、skills、templates、marketplace
  metadata、validation commands 和 version metadata 应描述同一套真实暴露的
  行为。
- Status files 是 bounded current-state snapshots，不是 append-only history
  logs；详细历史属于 tasks、goals、runs 和 gate records。
- Plugin docs 和 templates 保持 project-neutral。本地产品规则、凭证、端
  口、provider policies 和生产流程属于 project adapters 与 artifacts。
- Route explanations 保持 lightweight：Codex 应简短说明为什么正在
  orient、shape、execute、ask、使用 worktree 或留在 local checkout。
- `harness-rule:cybernetic-stability`：控制闭环要保持稳定。target selection、sensor freshness、measurement
  snapshots、remaining gap、feedback quality 和 saturation limits 应足够明确，
  避免 stale state、false completion 和 route oscillation。

runtime/control surfaces、默认 worker 行为、protocol anchors，以及不同
surface 对应的验证套件，见
[Agent Harness capability matrix](docs/HARNESSES.md)。
控制论启发的稳定性模型见
[Cybernetic Stability](docs/cybernetic-stability.md)。

## Influences

Agent Harness 部分受 b3ehive 的 controller-led agent work 思路启发：更小的
workflow entry points、显式 route selection、把 proposal competition 作为可
选 Shape work、accepted state 前保留 inspectable evidence，以及保持
packaging discipline。Agent Harness 会把这些思想翻译成自己的 fixed/adapter
contracts，而不是引入 b3ehive 的项目结构或本地项目策略。

## Artifact Map

adapter contract 项目通过 `.harness/config.json` 和 project adapter 解析 artifact paths。plugin core 不需要写入具体项目的产品名、数据库边界、生产规则、端口、凭证或发布策略。

常见 adapter artifacts 包括：

- `Task Index`：当前任务和 backlog 的 source of truth。
- `Roadmap`：更长期的产品或工程方向。
- `Milestones`：roadmap 上的阶段性成果、gates 和 deferred registers。
- `Specs`：已确认的范围、非目标、关键决策和验证方式。
- `Goals`：带 scope、acceptance 和内部 tasks 的主要工作单元。
- `Tasks`：Goal 内部的 checklist 或 execution breakdown。
- `Runs / Logs`：一次执行尝试、状态、prompt、execution DAG、subagent
  guidance、worker node prompts 和 evidence。
- `Gate Records`：review、integration、acceptance 和 state-sync 决策。

用户可见术语主线是：

```text
Roadmap -> Milestone -> Goal -> Task -> Run
```

`Goal` 是 Harness 的主要工作单位。`Task` 是 Goal 内部的具体拆解。`Run`
是一次执行尝试和 evidence record，不等于 thread 或 session。`P0` / `P1`
/ `P2` / `P3` 只表示优先级；`M1` / `M2` / `M5` 表示 roadmap milestone。

![Adapter Artifact Map](docs/assets/readme/adapter-artifact-map.png)

## Package Shape

这个仓库同时是 source project 和 Codex local marketplace：

- `.agents/plugins/marketplace.json` 暴露本地 plugin。
- `plugins/agent-harness/` 是可安装的 Codex plugin。
- `plugins/agent-harness/skills/` 包含 Codex skills。
- `plugins/agent-harness/references/` 包含 canonical harness protocols。
- `plugins/agent-harness/schemas/` 包含 machine-readable contract schemas。
- `plugins/agent-harness/templates/` 包含 starter templates。
- `plugins/agent-harness/scripts/agent-harness.mjs` 提供一个小型 CLI。
- `evals/` 包含 project-neutral evaluation fixture blueprints。

当前仓库里的 `harness/` 和 `.harness/` 是 Agent Harness 自身开发用的
project adapter state，不是安装到 plugin 里的内容。可安装 plugin 内容来自
`plugins/agent-harness/`；下游项目只有在 `harness:init` 或 CLI init/import
时，才会得到自己的 adapter artifacts。

## Plugin Skills

Codex 会把这个 plugin 暴露为 `harness`。主要 workflow-controller entry path
是四个 workflow skills：

- `harness:orient`：只读理解项目状态、当前 todo、blockers，并推荐下一步
  route。
- `harness:init`：初始化新项目、迁移旧项目、运行 doctor/import，并预览
  activation instructions。
- `harness:intake`：捕获和 triage 新想法、新需求、bug 或 Idea Inbox
  Thread notes；只有明确确认后才 record。
- `harness:execute`：执行已确认的 goal、spec、task breakdown 或 run
  packet，然后验证、review `State Sync Notes`，并同步 task/status/run
  evidence。

旧的 artifact-oriented wrapper skills 不再发布。按 route 选择 workflow
skill：setup/adoption 用 `init`，只读状态用 `orient`，新想法用 `intake`，
已确认执行用 `execute`。

当前 package 没有依赖已确认的 localized plugin description schema。面向用
户的 plugin / skill descriptions 使用现有 description 字段里的 zh-CN/en
bilingual fallback；运行时回复仍按用户语言输出。

### Which Skill Should I Use?

| 场景 | Skill |
| --- | --- |
| 给项目接入 Agent Harness、迁移已有 task index、运行 doctor/import，或预览 activation。 | `harness:init` |
| 只读查看项目状态、todo、blockers 或下一步 route，不编辑文件。 | `harness:orient` |
| 捕获或 triage 新想法、新需求、bug 或 capture-thread note。 | `harness:intake` |
| 完成已确认的 goal、spec、task breakdown 或 run packet，然后验证、review `State Sync Notes`，并同步状态。 | `harness:execute` |

## 在项目中怎么用

大多数用户不需要先手动运行 CLI，也不需要在 prompt 里写具体 skill 名。安装
或接入 `harness` 后，直接让 Codex “用 harness” 推进即可。更完整的 prompt 示例见
[`docs/usage.zh-CN.md`](docs/usage.zh-CN.md)。

最常用的是这几类：

```text
用 harness 看当前项目下一步。
```

```text
用 harness 记录这个想法，先别做：<idea>
```

```text
用 harness 执行 <goal path>，验证并同步状态。
```

```text
当前 thread 做 gate-only 主控，只审 evidence。
```

如果要让当前对话控场推进某个 spec，也可以直接写：

```text
把当前 thread 作为主控，推进 spec 直到完成。
```

常规用户路径是：

```text
用 harness 接入项目 -> 看状态或记录想法 -> 确认 scope/goal -> 执行 -> 验证 -> 同步状态
```

CLI 仍然保留，作为 agents、operators 和 maintainers 的确定性工具，但不是
多数用户的 primary first-use path。中文接入说明见
[`docs/install.zh-CN.md`](docs/install.zh-CN.md)，详细命令示例见
[CLI reference](docs/cli.zh-CN.md)。

## Acceptance And Validation

worker output、automation output、inbox notes 和 proposal competition results
都只是 candidate evidence，直到 control lane 完成验证。accepted completion 需
要具体 evidence，例如 changed files、command summaries、run records、gate
records 或 human review notes。带有 `Spec Acceptance Checklist` 的 goal 必须让
每个 checklist item satisfied；adapter-required completion gates 必须在
`Required Gate Evidence` 中记录具体 evidence 和 `Status: satisfied`。

本仓库的 documentation 或 plugin-surface 变更应使用：

```bash
git diff --check
npm run test:protocol
npm run test:smoke
npm run validate:plugin
```

只改 protocol anchors、smoke behavior、eval fixtures 或 packaging 时，可以
根据 [capability matrix](docs/HARNESSES.md) 选择更窄的 suite。

尚未接入 suite routing 的旧自动化，最低本地检查仍是：

```bash
git diff --check
npm run test:smoke
npm run validate:plugin
```

还要对当前 active goal 运行 goal validation；具体 CLI 形式见
[`docs/install.zh-CN.md`](docs/install.zh-CN.md)。

只有 eval docs 或 eval fixtures 变化时才运行 `npm run test:eval`。

## Workflow

人负责 steering：目标、产品方向和约束。Harness 在 adapter 边界内作为执行引擎自动推进；当需要验收、授权、凭证、生产访问或解除阻塞时，再升级到 Human Gate。

![Adapter Execution Model](docs/assets/readme/adapter-execution-model.png)

推荐的用户级 adapter workflow：

```text
用 harness 接入项目 -> 看状态或记录想法 -> 确认 scope/goal -> 执行 -> 验证 -> 同步状态
```

在底层，Harness 通过确定性的本地工具记录 route decisions、run packets、
acceptance evidence、delivery state 和 status snapshots。工具边界保持受控：
不会启动 Codex、创建 daemon、deploy，或自行执行 delivery step。Delivery 由
当前 goal 的 Delivery State policy 控制。

Conditional plugin bootstrap 仍然 defer。当前通过校验的 plugin manifest 不
声明 session hook，因此安装 Agent Harness skills 不会向无 harness 项目注入
harness instructions。

Idea Inbox Thread 是 capture lane，不是 execution lane。使用
`harness:intake` 或 `intake idea` 先 preview 并在确认后 record 原始 notes；
只有 control thread 接受 route 后，才把它们提升为 spec、goal 或 execution。

Proposal competition 仍是 documented Shape protocol。它可以为模糊任务比较
routes、risks 和 coverage，但不执行被选中的路线；当前 package 也不会安装
新的 `harness:compete` skill。

## Evaluation And Examples

Project-neutral adoption examples 位于
[`docs/examples/downstream-project-shapes.md`](docs/examples/downstream-project-shapes.md)。
它覆盖 new adapter projects、existing adapter imports、fixed compatibility
projects、non-harness projects 和 messy realistic projects。

Evaluation blueprint 位于 [`evals/`](evals/)。它定义 fixture shapes、scenario
prompts、expected outcomes 和 semi-automatic scoring plan，用来评价不同项目
形态下的 agent behavior。这些 fixtures 评价 route choice、evidence quality、
boundary preservation 和 state discipline，不依赖真实下游仓库。

## Install In Codex

中文安装与使用说明见 [`docs/install.zh-CN.md`](docs/install.zh-CN.md)。

本地开发时，把这个仓库加入 marketplace root：

```bash
codex plugin marketplace add <path-to-agent-harness-repo>
```

仓库发布到 GitHub 后，可以在另一台机器上这样安装：

```bash
codex plugin marketplace add <owner>/<repo>
```

Codex 会读取 `.agents/plugins/marketplace.json` 并暴露 `harness` plugin。

## Current Design Bias

当前版本线是 `0.6.0`。它在 `0.5.0` 的
[cybernetic stability model](docs/cybernetic-stability.md) 之上，收紧 state
discipline：task completion 必须产出 state-sync evidence 或
`State Sync Notes`，configured status files 是 bounded current-state
snapshots，而不是 append-only history logs。

这次升级是实用导向的：Harness 完成任务时不仅要有可验证 completion
evidence，还要返回 accepted-state owner 需要的 state-sync notes。目标是减少
stale status files、隐藏的 handoff gaps、false completion claims 和无限增长的
status 文件。

当前版本刻意保持边界清晰：

- 创建稳定的文件和目录。
- 给 Codex 一个一致的方式来定位 task、spec、goal 和 run artifacts。
- 推荐 worktree 行为，但不强制创建 branch。
- 从 report-only loops 开始，而不是直接进入无人值守修复循环。
- 在凭证、付费 API、生产访问、破坏性操作、超出当前 goal policy 的 delivery、
  deploy 或 release 前显式暴露 escalation point。

目标是加强开发自动化，同时把控制点、evidence 和需要升级给人的边界保持清楚。

## Roadmap

未来 Agent Harness 应该让控制合同可以被其他 coding agents 使用，而不只服务
Codex。方向是建立 agent-neutral adapter layer，覆盖 task/spec/goal/run
packets、capability declarations、verification results 和 state-sync
evidence。支持其他 coding agents 前，应先为每个 agent surface 定义明确的
safety boundaries、result-packet expectations 和 validation fixtures。

delegation 应保持 capability-driven：先判断某个 coding-agent surface 是否能
创建隔离工作、返回 execution result packet、报告 changed files 和
verification，并遵守 no-daemon / no-push 边界。如果能力不存在，Agent
Harness 应 fallback 到 foreground manual execution，而不是假装已经具备并行
或隔离实现能力。
