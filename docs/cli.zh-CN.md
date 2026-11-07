# CLI Reference

CLI 是确定性交付控制工具。它不执行项目测试、调度 worker、监控源码变化或恢复 session。

## 接入与检查

```bash
node plugins/agent-harness/scripts/agent-harness.mjs init --cwd <project> --contract adapter
node plugins/agent-harness/scripts/agent-harness.mjs skills install --cwd <project>
node plugins/agent-harness/scripts/agent-harness.mjs skills uninstall --cwd <project> --dry-run --json
node plugins/agent-harness/scripts/agent-harness.mjs doctor --cwd <project>
node plugins/agent-harness/scripts/agent-harness.mjs orient next --cwd <project> --json
```

`skills uninstall` 保留 `harness/`、`.harness/`、外来 skill 和修改过的 reference。`doctor` 检查交付状态路径，不采集 Git 遥测。

`config inspect|validate|import`、`adapter inspect`、`worktree recommend`、`activation snippet`、`print-contract` 和 `intake idea` 保留设置、预览和路由职责。写入仍需相应显式选项。

## Goal 与交付计划

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal create --cwd <project> --task "<task>" --spec <spec> --work-mode local
node plugins/agent-harness/scripts/agent-harness.mjs goal validate --cwd <project> --goal <goal>
node plugins/agent-harness/scripts/agent-harness.mjs plan validate --cwd <project> --plan <target>.plan.json
node plugins/agent-harness/scripts/agent-harness.mjs execute next --cwd <project> --goal <goal> --json
node plugins/agent-harness/scripts/agent-harness.mjs execute next --cwd <project> --milestone <milestone> --json
```

相邻计划声明依赖、ownership、验收映射和 `{id, command, manual?}` 检查。旧 `inputs`／`exclude` 字段只被忽略，不计算 hash；新计划省略它们。

`execute next` 根据验收状态返回 `execute-node`、`verify-node`、`complete-goal`、`complete-milestone`、`need-user`、`reconcile`、`wait` 或 `done`。

## 完成

在 host 中实际实现并验证后，把简洁结果写入验收项，然后运行：

```bash
node plugins/agent-harness/scripts/agent-harness.mjs goal complete --cwd <project> --goal <goal> --verification "unit: 85 passed; build passed"
node plugins/agent-harness/scripts/agent-harness.mjs milestone complete --cwd <project> --milestone <milestone> --verification "integration: passed; whole-target constraints checked"
```

摘要必须包含每个所需检查 id 及实际结果。Goal 完成核对验收覆盖、必需 gate 和状态同步。Milestone 完成要求全部 Goal 加自身 whole-target 检查，不重复子 Goal 检查。

写入仅限 Goal/Milestone、任务索引和有界状态。已完成 Goal 的重复完成保持幂等。不会创建 Run、receipt、manifest、checkpoint、日志副本、内容 hash 或证据封存。

## 有界状态

```bash
node plugins/agent-harness/scripts/agent-harness.mjs maintain tasks --cwd <project> --json
node plugins/agent-harness/scripts/agent-harness.mjs artifacts inspect --cwd <project> --json
node plugins/agent-harness/scripts/agent-harness.mjs artifacts compact --cwd <project> --json
node plugins/agent-harness/scripts/agent-harness.mjs artifacts compact --cwd <project> --record --json
```

未指定 `--record` 时维护与检查只读。压缩只归档较早的已完成任务，不读取旧 Run 或比较源码。旧 Run 命令返回退役错误，旧文件不会被隐式删除。

## Language

语言优先级为 `--lang`、`AGENT_HARNESS_LANG`、`language.default`、`LC_ALL`、`LC_MESSAGES`、`LANG`，最后为 English。基础模板使用 English；回复使用用户语言。

## 验证

```bash
git diff --check
npm run test:all
npm run test:regressions
npm run test:delivery-control
npm run test:eval
npm run validate:plugin
npm run validate:plugin:local
```

外部官方验证器可通过 `--validator PATH` 或 `AGENT_HARNESS_PLUGIN_VALIDATOR` 指定。便携完整性检查是独立验证。
