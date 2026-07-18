# 安装 Agent Harness

## 注册 marketplace

本地 checkout：

```bash
codex plugin marketplace add /path/to/agent-harness
```

仓库 metadata 声明唯一 marketplace identity `agent-harness-local`。注册只会
添加 marketplace，不会安装 plugin。

## 从 Plugins Directory 安装

打开 Codex 的 Plugins Directory，从 `agent-harness-local` 安装 `harness`。
卸载和更新也通过 Plugins Directory 完成。

## 验证

新建 Codex task 后输入：

```text
使用 harness:orient 检查这个项目。
```

四个公开 skill 是 `harness:orient`、`harness:intake`、`harness:init` 和
`harness:execute`。普通、明确的 change/build 请求由 Codex 直接执行；
execute 只用于 recovery、audit、state sync、milestone、DAG、multi-worker
和 high-risk durable control。

Harness 不安装 explorer/implementer agent，也不默认固定 model/effort。
可选高级 `harness_reviewer.toml` 模板是 read-only，并继承 parent model 和
reasoning effort。
