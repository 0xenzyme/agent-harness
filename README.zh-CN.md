# Agent Harness

[English](README.md)

[![Version](https://img.shields.io/badge/version-0.14.0-0f766e)](CHANGELOG.md)
[![Codex Plugin](https://img.shields.io/badge/Codex-plugin-111827)](plugins/agent-harness/.codex-plugin/plugin.json)
[![Protocol](https://img.shields.io/badge/protocol-checks-0369a1)](docs/HARNESSES.md)
[![Smoke](https://img.shields.io/badge/smoke-checks-1d4ed8)](docs/HARNESSES.md)
[![License](https://img.shields.io/badge/license-MIT-7c3aed)](LICENSE)

Agent Harness 是面向 coding agent 的 adapter-driven control plane。它把已确认的方向转成可交付、可验证的结果，减少人持续充当 task router 的负担。

```text
Roadmap -> Milestone -> Goal -> Task -> Verified delivery
```

[快速开始](#在项目中怎么用) · [工作方式](#工作方式) ·
[能力矩阵](docs/HARNESSES.md) · [更新日志](CHANGELOG.md) ·
[v0.14.0 发布说明](docs/releases/v0.14.0.md) ·
[社交预览](docs/assets/github/social-preview.svg)

## 在项目中怎么用

### 1. 让当前 host 使用 Harness

```text
用 harness 看当前项目下一步。
用 harness 记录这个想法，先不要实现：增加一个 import flow。
用 harness 执行 harness/goals/YYYY-MM-DD-task-title.md，验证并同步状态。
```

### 2. 用 CLI 接入项目

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd <project> --contract adapter
node plugins/agent-harness/scripts/agent-harness.mjs skills install --cwd <project>
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd <project>
```

Skill 安装到 `.agents/skills/`。`skills uninstall` 只删除已安装 skill 和字节一致的 reference，不删除项目数据。Codex 与 Grok 的 marketplace 安装可选，见[安装说明](docs/install.zh-CN.md)和 [Plugins Directory](https://github.com/0xenzyme/agent-harness)。

### 3. 需要时指定入口

| 场景 | Skill |
| --- | --- |
| 接入、导入、doctor、activation 预览 | `harness:init` |
| 只读查看交付状态和下一动作 | `harness:orient` |
| 收集未确认想法 | `harness:intake` |
| 推进已接受 Goal/Milestone 或同步已有状态 | `harness:execute` |

普通明确改动直接由 host 完成。`host-direct-postflight` 只更新已有状态。已接受目标使用 `durable-harness`，但不创建 Run。

## 工作方式

Host 负责 runtime outcome、transient plan、session、resume、worker、终端和完整验证输出。Harness 负责目标、依赖、约束、简洁验证结果和有界交付状态。

计划位于 `<target-filename>.plan.json`，声明 Goal/Task 依赖、ownership、验收映射和验证命令。Controller 执行 `execute next`，在 host 内实现与验证，把实际结果写入验收项，然后完成目标：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal complete --cwd <project> --goal <goal> --verification "unit: 85 passed; integration: passed"
node plugins/agent-harness/scripts/agent-harness.mjs milestone complete --cwd <project> --milestone <milestone> --verification "integration: passed; hard constraints checked"
```

CLI 核对已记录的验收，不运行测试，也不推断成功。它只写 Goal/Milestone、任务索引和有界状态，不创建 Run、DAG、receipt、checkpoint、源码 hash、日志副本或证据封存。后续代码变化不会重开已完成目标；新改动独立验证。

## 为什么使用 Agent Harness

- 持续推进 Milestone，直到所有必需 Goal 和整体验收完成。
- 区分局部实现、整体验收与全局约束。
- Worker 输出经 outcome owner 验证后才接受。
- 通过 adapter 管理项目路径、gate 和特定约束。
- 仅在范围、授权、验证或产品决策真正阻塞时暂停。
- 用有界状态和任务压缩替代执行历史记录。

旧 Run/checkpoint 配置在迁移时忽略。旧文件可保留为历史资料，但不参与路由、完成、清理或重新验证。

## 安全与验收

写入和验收引用不得越过配置根目录。委派前确定 local/worktree/ask。未获授权不 commit、push、deploy 或 release。Status 是当前状态投影，不是过程日志。

见 [Project Contract](docs/project-contract.md)、[能力矩阵](docs/HARNESSES.md) 和 [Delivery Plan](plugins/agent-harness/references/planned-execution.md)。

## 仓库与验证

```bash
git diff --check
npm run test:all
npm run validate:plugin
```

外部官方插件验证器可能不可用；`npm run validate:plugin:local` 是独立的便携完整性检查。

## 文档

- [使用说明](docs/usage.zh-CN.md)
- [安装说明](docs/install.zh-CN.md)
- [CLI Reference](docs/cli.zh-CN.md)
- [Capability Matrix](docs/HARNESSES.md)
- [Project Contract](docs/project-contract.md)
- [Control Feedback](docs/cybernetic-stability.md)
- [GitHub Presentation](docs/github-presentation.md)
- [v0.14.0 Release Notes](docs/releases/v0.14.0.md)
- [Changelog](CHANGELOG.md)
- [贡献说明](CONTRIBUTING.md)
- [行为准则](CODE_OF_CONDUCT.md)
