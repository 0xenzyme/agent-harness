# 使用 Agent Harness

让当前 coding-agent host 推进已接受的工作。接入和命令见
[`install.zh-CN.md`](install.zh-CN.md) 与 [`cli.zh-CN.md`](cli.zh-CN.md)。

```text
用 harness 看当前项目下一步。
用 harness 记录这个想法，先不要实现：<idea>
用 harness 执行 <goal path>，验证并同步状态。
```

普通明确改动直接由 host 完成。已经关联既有 Task/Goal/status 的简单工作，只做有界 postflight 更新。

对于已接受 Goal/Milestone，始终保持完整目标。Controller 读取相邻计划，在 host 内实现或委派，检查 candidate 输出，把实际变更文件和验证结果写入验收项。`execute next` 持续推进，直到完成或遇到真实暂停条件。

验收满足后，使用 `goal complete` 或 `milestone complete` 加 `--verification`。摘要包含每个所需检查 id 和实际结果，只更新交付状态。

不要为 Harness 创建 Run、receipt、checkpoint、hash、日志副本或会话转录。恢复使用 host 的 session／history。后续代码变化是常态：直接验证新改动，不重开旧 Goal，也不比较旧输入。

需要只审时显式指定 `gate-only`。长任务在 host 暴露时使用 runtime outcome 和 transient plan。创建 session／worker 的授权不等于 worktree、commit、push、deploy 或 release 授权。
