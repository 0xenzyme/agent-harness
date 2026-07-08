# 在项目中使用 Agent Harness

这页只回答一个问题：在已经安装或接入 Agent Harness 的项目里，你想推进某件事时，可以对 Codex 输入什么。

这里不是安装说明，也不是完整协议说明。更详细的接入、CLI、goal/run/evidence 边界分别见 [`install.zh-CN.md`](install.zh-CN.md) 和 [`cli.zh-CN.md`](cli.zh-CN.md)。English version: [`usage.md`](usage.md).

## 常用一句话版本

```text
用 harness 看当前项目下一步。
```

```text
按照 harness，把当前 thread 作为主控，完成这个任务。
```

```text
用 harness 记录这个想法，先别做：<idea>
```

```text
用 harness 执行 <goal path>，验证并同步状态。
```

```text
用 harness 作为主控，推进 spec1 直到完成。
```

```text
当前 thread 做 gate-only 主控，只审 evidence。
```

```text
今天的工作要收尾了，按照 harness 记录一下，方便明天继续。
```

## 看项目进度和下一步任务

当你刚打开一个项目，不确定下一步该做什么：

```text
用 harness 看一下当前项目状态，告诉我下一步最安全做什么，先不要改文件。
```

如果项目不在当前目录：

```text
用 harness 看 /path/to/project，告诉我现在能执行什么、还有什么需要我确认。
```

如果刚完成一轮实现，想知道 next：

```text
已经实现完了，用 harness 看一下 next 是什么。
```

## 记录想法

当你有一个需求、bug、优化点或粗略想法，只想先放进项目队列：

```text
用 harness 记录这个想法，先不要实现：
<写下想法>
```

如果你希望 Codex 先预览它会怎么归类，再由你确认是否记录：

```text
用 harness 先预览这个想法应该放哪里，等我确认后再记录：
<写下想法>
```

## 看还有什么需要人工确认

当任务比较大，或你不确定是否已经可以自动推进：

```text
用 harness 看一下现在还有什么需要人工确认的。
```

如果你关心的是某个任务、里程碑或 spec：

```text
用 harness 看一下 <任务/里程碑/spec 路径> 还有什么需要人工确认的。
```

## 执行一个已确认的 goal

当 goal、spec 或 accepted scope 已经明确，可以开始实现：

```text
用 harness 执行 <goal path>，做完验证并同步状态。
```

如果你给的是 spec 而不是 goal：

```text
用 harness 按 <spec path> 推进，缺 goal/run 就按项目规则补齐。
```

如果你要完成某个 milestone，而不是下一个小任务：

```text
用 harness 看 <milestone id> 还差什么，先推进下一个已确认项。
```

## 让当前 thread 做主控

当你希望当前对话负责控场、拆解、调度和验收，但不直接改代码：

```text
用 harness 作为主控，推进 spec1 直到完成。
```

也可以说得更自然：

```text
按照 harness，把当前 thread 作为主控，完成这个任务。
```

如果你要强调主控只验收 evidence，不直接实现：

```text
当前 thread 作为 gate-only 主控，用 harness 推进 spec1，只审 evidence，不直接改实现。
```

如果你希望另开一个可见的主控对话：

```text
启动一个新 Thread 作为主控执行这项任务。
```

如果你希望当前对话自己改代码，就不要叫主控，直接说实现：

```text
用 harness 实现 spec1，验证并同步状态。
```

## 收尾和明天继续

当今天的工作要结束，需要记录状态和后续入口：

```text
今天的工作要收尾了，按照 harness 记录一下，方便明天继续。
```

如果你想检查还有没有文档、状态或验收遗漏：

```text
用 harness 看一下还有没有要收尾的，尤其是文档、状态和验收记录。
```

如果实现已经完成，但还需要人工验收：

```text
用 harness 建一个待验收清单，简单记录下来，然后做收尾。
```

## 检查是否真的完成

当你想知道某个任务是否已经可以关闭：

```text
用 harness 检查 <goal/task/milestone> 是否真的完成，还差什么。
```

如果已经实现但状态还没同步：

```text
用 harness 验证 <goal path> 已完成的工作，并同步 task/status/run evidence。
```

