---
status: partial
issue: https://github.com/weapp-tailwindcss/weapp-tailwindcss/pull/1269
baseline: 62d46fc5a001ad4d5e81b23c87457911ba5db920
regressions:
  - e2e/watch/hot-update/demo/uni-app-x-vdom-tailwindcss-v4.test.ts
  - e2e/demo-workflow-native-cancellation.test.ts
  - e2e/watch-command-lifecycle.test.ts
---

# uni-app x 微信 watch 的首次增量 CPU 采样

## 症状

前轮微信 watch 在原有 420 秒总预算内没有完成。18 个首次非初始 plugin total 的中位数为 4141ms，均超过 500ms。细分日志中的 `tasks.css`、`entries.plan` 等记录的是包含异步等待的墙钟耗时，保存的输出 CSS 又不含原始任务、缓存和 registry 状态，不能据此构造忠实重放或直接认定 CPU 热点。

主机持续高负载使速度比较受到干扰，但不能由此推导“无法继续任何诊断”。此前将这个限制扩大到独立微信 CPU 采样的判断需要纠正。原生 Alpha 的停止完成信号问题仍然存在；微信 watch 则通过本轮绑定的 Alpha Node 和 `uni.js` 启动独立编译器，不进入共享 IDE 的原生 launch。新的 Harmony 预检只读取系统、布局与截图，也不启动 App 或 quickFix。

## 根因与纠正

本轮只补充真实采样证据，尚未证明原性能失败的唯一根因，也没有根据不稳定样本修改产品逻辑。

使用忽略目录中的临时 preload，通过 `NODE_OPTIONS --require` 只观察同时满足四项身份的进程：Alpha Node、编译器入口、真实项目根以及 `UNI_PLATFORM=mp-weixin`。preload 原样转发 `stdout.write` 的参数与返回值，不修改厂商安装、构建内容、日志内容或测试门槛。完整脚本随证据保存。

一轮构建会输出两个 `total`：主插件的 `generateBundle` 汇总，以及独立 `cssFinalizer` 汇总。第二个 `total` 仍可能属于初始构建，不能把它当成首次增量。本轮在初始两个汇总后的 `DONE Build complete. Watching for changes...` 启动 profiler；确认下一轮包含 `sourceCandidates.watchChange` 和 `generateBundle`、不含 `configResolved`，再等待其 finalizer 与 DONE 后停止。

原始 profile 和采集状态落盘后才通过本轮取消文件退出。沿用 240 秒 mutation、420 秒整体与 500ms plugin 门槛，禁止跳过构建，最大尝试次数为 1。主动取消的测试结果仍记为失败/退出 130，不改写为通过。

## 验证

代码为 `62d46fc5a001ad4d5e81b23c87457911ba5db920`。新轮次 `0152800b-7ff5-42bf-ab8d-98e45485c1b1` 完成全部探针、当前会话真实输入/点击/截图、verify、领取及阶段复查，再执行现有 VDOM 微信 watch 用例。prepare、verify 和 consumer 使用一致的 `pnpm exec tsx` 启动环境。

前一轮 `5277c884-5613-4819-a094-f0cbf796f293` 的 verify 已失败并终止：computer use 返回 JPEG 字节，被错误保存为 PNG 文件名，触发 `unrecognised content at end of stream`。这是证据保存错误。恢复轮次保留原始 JPEG，再仅转换图片编码生成 PNG，记录命令与两份 SHA-256；重新 prepare 和真实交互，没有复用失败报告或修改失败状态。

证据位于 `e2e/.artifacts/uni-app-x-alpha/0152800b-7ff5-42bf-ab8d-98e45485c1b1/watch-cpu/`：

- `incremental.cpuprofile`：原始 CPU profile。
- `capture.json`：精确编译器身份、采样确认、首次差量编译、结束时间、原始 HMR 事件、进程 CPU 与资源计数器。
- `preload.cjs`、`orchestration.ts`：本轮实际诊断脚本。
- `report.json`：`diagnostic-captured-cancelled`，保留退出 130 和预期取消原因。
- `cleanup-and-login.json`：源码字节、所属进程和登录态的独立收尾核对。

原始编译日志为 `.tmp/alpha-watch-cpu-62d46fc5a.log`。以下结果属于一次有采样开销的真实增量诊断，不能与无采样历史耗时直接比较：

| 观测 | 结果与限制 |
| --- | --- |
| profile | 8293 个样本，13915.000ms；包含初始完成后的空闲等待与 profiler 启动开销 |
| profiler 启动 | 首个样本 814.375ms 位于 `node:inspector post`，不能计为编译器工作 |
| 真实增量窗口 | 从首次“开始差量编译”到停止请求约 5393.401ms；采样启动 ACK 早于此窗口 |
| 插件日志 | 主插件 total 1101ms，其中 `generateBundle` 935ms；后续 finalizer total 41ms，不满足 500ms 门槛 |
| 进程 CPU | ACK 到停止请求期间 user 4472.373ms、system 642.089ms，覆盖整个 Node 进程及其线程，不对应单个插件 |
| 调度干扰 | 同期 46528 次非自愿上下文切换，load 约 48→54，主机 16 个逻辑 CPU |
| 收尾 | 三个被核对的源码文件与 HEAD 字节一致，工作树干净；采样报告记录的 20 个 PID 全部退出；prepare 退出 0、门禁 finished、临时标签清零；微信服务 19355 登录仍为 true |

profile 的时钟原点与 `process.hrtime` 不同，本轮没有记录跨时钟校准对。以结束时刻对齐的阶段划分只能作为估算，不能给出逐样本的精确阶段归属。

完整 profile 的 idle 权重为 7982.541ms，GC 权重为 1064.715ms。厂商 UTS 的 `transform → getCompiled/getCached → TypeScript synchronizeHostData/getProgram` 调用链具有约 1358.957ms 权重、705 个样本；权重仍不等于该函数的实际 CPU 时间。

`extractProjectCandidatesWithPositions` 的 210.459ms 权重只有 34 个样本，其中 9 个大间隔贡献 169.876ms；`path.relative` 的主要 45.082ms 中，一次间隔就占 43.583ms。不能据这些长间隔声称路径计算或 Babel 解析就是已证明的性能根因。

较稳定的仓库线索是 `getCombinedSourceCandidatesForEntries`：102.583ms 权重、75 个样本、最大间隔 4.5ms，其中来源匹配有 97.708ms、72 个样本。对应 `bundle-markup-candidates.ts` 的 `valuesForEntries` 会为每次范围查询遍历同一候选集合并解析文件/来源路径。下一步应先复现相同查询的重复工作，再评估集合生命周期内的复用；需要保护包含/排除条件、文件替换与删除、符号链接和返回 Set 的修改隔离。此处记录的是可验证线索，不是优化完成或速度收益结论。

## 适用边界

本轮没有完成 watch，也没有完成 Alpha 16 阶段或扩展 46 阶段。真实微信编译器的 CPU 诊断不能替代微信 IDE 页面验收，更不能证明 Android、iOS 或 Harmony 的严格 HMR 和停止协议已修复。

采集器的合成验证只证明身份不匹配时不注入、两个 total 的处理及采样落盘逻辑，不计为真实设备验收。原始首次失败与本轮主动取消均保留；后续性能比较仍使用固定任务起始提交 `4488cabc9` 和原采样/阈值。

## 规则评估

不新增或放宽规则。现有真实门禁、原始失败保留、有限复测和资源归属要求足够。恢复动作是正确保存真实截图并完成新的预检；高负载限制性能结论，不替代对独立诊断路径的具体安全评估。
