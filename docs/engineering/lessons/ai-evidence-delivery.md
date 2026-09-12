---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1172
baseline: 8940eb551660176ab5f69f2086ac3a13acd161af
regressions:
  - scripts/agents/verification.test.mjs
  - packages/hbuilderx-runner/test/host-connection.test.ts
  - e2e/react-native-ci.test.ts
verification:
  - claim: "证据结构校验和旧记录兼容回归通过"
    kind: "unit"
    status: "passed"
    sha: "960bc940d13cc8e47b0036f85714a2489e52d130"
    environment: "macOS / Node 24.18.0 / pnpm 11.25.0"
    command: "CI=1 pnpm agents:test --update=none"
  - claim: "Windows/macOS/Linux × Node 22/24 六组 portable 回归通过；不替代原生桌面验收"
    kind: "ci"
    status: "passed"
    sha: "7623470bddfb3e3ada51cefbdbd6527015867220"
    environment: "GitHub hosted Windows、macOS、Linux / Node 22、24"
    url: "https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34309551585"
  - claim: "React Native Web、Android、iOS 自动验收通过"
    kind: "ci"
    status: "passed"
    sha: "7623470bddfb3e3ada51cefbdbd6527015867220"
    environment: "GitHub hosted Linux、macOS / Node 24 / Expo 54 / Android 11、iOS 18.5"
    url: "https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34309551591"
  - claim: "通过 IDE 点击运行后的 Windows 两轮连接验收"
    kind: "native"
    status: "pending"
    sha: "7623470bddfb3e3ada51cefbdbd6527015867220"
    environment: "Windows 11 交互桌面 / HBuilderX stable、alpha"
    reason: "没有可用交互桌面完成该模式的逐场景两轮验收；portable 和历史 CLI 结果不能替代"
  - claim: "macOS stable 两轮与 alpha 完整第二轮连接验收"
    kind: "native"
    status: "pending"
    sha: "7623470bddfb3e3ada51cefbdbd6527015867220"
    environment: "macOS / HBuilderX stable 5.24、alpha 5.25"
    reason: "alpha 首轮四场景完成；剩余轮次未完成，不能由 CI 通过或 PR 合并补足"
---

# 从 PR #1172 修正 AI 排障与交付流程

## 症状

本轮暴露了五类流程问题：Windows 输出协议更新后遗漏另一份 mock；Android 加速检查放在工具安装前；CI 完成后仓库复盘仍写待验证、change intent 仍描述旧 JSON；回答“最后卡在哪里”时使用泛化的启停问题或后续缺少交互桌面代替准确命令；自动跟进提示词虽有停止条件，实际仍需用户提醒停用。

## 根因与纠正

协议修改没有完整检查生产消费方、mock、fixture 和说明，宿主平台测试又掩盖 Windows 分支。已有 host-connection 回归现已显式执行三平台，旧 mock 在 macOS 模拟 win32 时能够失败，修正后通过。流程要求每次边界变更检查完整消费链；原生能力仍由真实环境验证。

工作流语法检查不能证明工具已经安装。Android 回归现已检查生命周期顺序，并实际执行带空格、中文与 & 路径的启动钩子，验证成功与非零失败退出。构建与消费 dist 的测试同样按依赖顺序执行。

原记录与 PR 正文各自追加进展却没有最终同步。本轮以明确 SHA、运行 URL 和验收范围更新对应复盘，保留原始失败与反例；change intent 按最终 Base64 协议纠正。verification 为可选结构，历史文档继续兼容；新记录不允许通过未知字段、空来源或缺失待验收原因掩盖信息遗漏。

准确卡点应表述为：最后一轮继承 stdin 对照已渲染页面，随后 project close 空日志、20 秒超时，其他只读 CLI 请求仍正常。内部等待位置未知；缺少 Windows 桌面导致新的连接模式待验收是独立问题。后续排障记录最后成功阶段、第一失败阶段和原始错误，两次相同失败没有新证据时必须改变诊断动作。

已授权自动化的停止必须落实为管理工具操作并核对状态；本次任务最终已停用为 PAUSED，不能把提示词中的停止条件当作执行结果。新流程要求按约定终止跟进，并用交接模板保留目标、授权、源码与进程归属、证据、精确阻塞和下一步。它不自动创建、恢复或管理任何定时任务。

## 验证

证据校验先运行旧实现：36 个负例未被拒绝，测试失败；补充字段校验后全部通过，并覆盖 SHA 尾部换行与真正的嵌套数组输入。最终 50 项测试通过。代码验证提交见 verification，流程和本复盘为后续说明文档，不冒充旧 SHA 已包含这些文档。

仓库级 fixture 检查错误包含文件和第二条记录位置；不可达 HTTPS 地址不会触发网络请求，带写文件语句的 command 不会执行，文档字节和 Git 状态保持不变。另运行 `pnpm agents:check`（45 份规则、19 份工程文档、238 条命令，0 错误）、脚本定向 ESLint 和 `git diff --check`；Markdown 被现有 ESLint 配置忽略，使用 agents 校验与人工差异审查，不冒充已通过 Markdown lint。校验结果只支持结构、兼容性与只读行为，不能证明任意 claim 的真实性。

#1172 的六组 portable 及 React Native 三端 CI 已通过，详见结构化来源；首次失败不删除。原生阶段详情见[Windows 进程边界](hbuilderx-windows-process-boundary.md)、[连接验收](hbuilderx-attached-acceptance.md)及 [Android 前置条件](android-ci-kvm-access.md)。

## 适用边界

原生 CLI 间歇挂起的内部根因仍未确认；Windows 交互桌面两轮、macOS stable 两轮及 alpha 完整第二轮仍待验收。不能以自动 CI 通过或 PR 合并覆盖这些限制。新校验器只检查结构，不核实远端状态、命令执行结果、因果关系或原生覆盖，也不保证 AI 从此不会误判。

## 规则评估

改进集中在[现有工程流程](../agent-workflow.md)与 agents 校验器，根 AGENTS 继续路由到该文档，不添加重复规则。本轮不涉及产品行为、demo/static 基线或 CI 触发范围，无需重建 demo；仍需人工审查证据与结论是否相符、授权边界及真正的停止条件。
