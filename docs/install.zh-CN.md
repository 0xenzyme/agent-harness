# 安装 Agent Harness

Agent Harness 有两层安装面：

1. **控制面（CLI）** — 任何能跑 Node 的 host。
2. **技能发现** — 下游项目的 `.agents/skills/`，让扫描 Agent Skills 约定的
   host 能找到 `orient`、`intake`、`init` 和 `execute`。

`.agents/skills/` 是跨客户端发现路径，不是每个 host 的唯一目录。Cursor 还
可能读 `.cursor/skills/`，Claude Code 还可能读 `.claude/skills/`。不要使用
`.agent/skill`。

Codex marketplace 安装仍然有效，见附录。`npm run validate:plugin` 校验的是
Codex pack，不是 core 协议门槛。

## 控制面

从本仓库 checkout：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd /path/to/project
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd /path/to/project --contract adapter
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd /path/to/project
```

如果环境提供 `agent-harness` 命令，使用相同的子命令。

## 技能发现

把四个公开 skill 安装到下游项目：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs skills install --cwd /path/to/project
```

会复制：

```text
.agents/skills/orient/
.agents/skills/intake/
.agents/skills/init/
.agents/skills/execute/
.agents/references/
```

源仍在 `plugins/agent-harness/skills/`。`--dry-run --json` 预览，`--force`
覆盖。个人全局安装可用 `~/.agents/skills/`；不要写入 Cursor 保留目录
`~/.cursor/skills-cursor/`。

然后对当前 host 输入：

```text
使用 harness:orient 检查这个项目。
```

四个公开 skill 是 `harness:orient`、`harness:intake`、`harness:init` 和
`harness:execute`。普通、明确的 change/build 请求由当前 host 直接执行；
execute 用于 recovery、audit、persistent state sync、milestone、DAG、
multi-worker、high-risk durable control，或对执行前已有状态做显式 bounded
postflight sync。长时间 controller 工作在 host 暴露能力时使用 runtime
outcome 和 transient plan。

## 附录：Codex marketplace

本地 checkout：

```bash
codex plugin marketplace add /path/to/agent-harness
```

仓库 metadata 声明唯一 marketplace identity `agent-harness-local`。注册只会
添加 marketplace，不会安装 plugin。

打开 Codex 的 Plugins Directory，从 `agent-harness-local` 安装 `harness`。
卸载和更新也通过 Plugins Directory 完成。

Codex 专有的 Goal/Plan/Thread 名称只写在
`plugins/agent-harness/hosts/codex/execution.md`。可选高级
`harness_reviewer.toml` 模板是 read-only，并继承 parent model 和
reasoning effort。
