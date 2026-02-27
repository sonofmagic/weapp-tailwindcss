---
name: weapp-tailwindcss
description: 帮助用户在 uni-app、taro、uni-app x 与原生小程序项目中接入和排障 weapp-tailwindcss。Use when 用户提到 weapp-tailwindcss、小程序 Tailwind 不生效、rpx 任意值、JS 字符串 class、space-y/space-x、weapp-tw patch、content/@source、twMerge/cva/tv。
---

# weapp-tailwindcss Skill

用于业务项目接入 `weapp-tailwindcss`，并让 AI 稳定完成“小程序 + 多端”配置、排障与 Tailwind 写法规范落地。

> 本 Skill 服务“项目使用者”场景，不是仓库内部二次开发指南。

## 适用任务

- 新项目快速启用 `tailwindcss + weapp-tailwindcss`
- 老项目迁移（`uni-app` / `taro` / `uni-app x` / 原生小程序）
- 多端协同（小程序 + `H5` / `App`）配置
- 样式不生效、`rpx` 任意值异常、`JS` 字符串 class 未转译等问题排查
- 需要“Tailwind class 应该怎么写”的团队规范与代码评审清单

## 任务分流

先判断用户当前任务类型，再进入对应流程：

- 集成新项目
- 迁移存量项目
- 排查已有问题
- 沉淀 Tailwind 写法规范

## 信息收集最小集

缺少关键信息时，先补齐后再输出方案：

- 当前框架：`uni-app` / `taro` / `uni-app x` / 原生小程序 / 其他
- 构建工具：`vite` / `webpack5` / `webpack4` / 其他
- 目标端：仅小程序，还是小程序 + `H5` / `App`
- `tailwindcss` 主版本（v3 / v4）与包管理器（重点确认是否 `pnpm@10+`）
- 运行环境：`node` 版本（建议 `^20.19.0 || >=22.12.0`）
- 当前诉求是“集成配置 / 问题排查 / 写法规范沉淀”中的哪一类

## 执行流程

### 1) 基线配置（所有任务通用）

- 先判断 Tailwind 主版本与扫描方式：
- `tailwindcss@3` 用 `tailwind.config.js -> content`
- `tailwindcss@4` 用入口 CSS 的 `@source`
- 扫描范围必须覆盖真实模板与脚本文件，并排除 `dist` / `unpackage` / `node_modules`
- 明确 `postinstall` 需要有 `weapp-tw patch`
- 若是 `pnpm@10+`，提醒执行 `pnpm approve-builds weapp-tailwindcss`
- 如怀疑补丁缓存或目标记录异常，可使用 `weapp-tw patch --clear-cache`

### 2) 按任务类型执行

- 集成/迁移任务：
- 优先读取 [references/integration-playbook.md](references/integration-playbook.md)
- 按框架给出“可复制最小配置”，不要只给概念
- 多端场景下，明确 `disabled` 条件，避免把小程序插件能力无条件作用到纯 `H5`

- 排障任务：
- 优先读取 [references/troubleshooting-playbook.md](references/troubleshooting-playbook.md)
- 先按“症状 -> 最短排查路径”输出步骤，再给修复示例
- 明确每一步“期望现象/验证点”，避免模糊建议

- 写法规范任务：
- 读取 [references/tailwind-writing-best-practices.md](references/tailwind-writing-best-practices.md)
- 按“推荐写法 / 反例 / 评审清单”输出
- 需要运行时拼类时，优先 `@weapp-tailwindcss/merge` / `cva` / `variants`
- 涉及封装重命名时，提醒 `ignoreCallExpressionIdentifiers`

### 3) 回归验证（所有任务都要给）

- 先跑开发态，再跑目标端构建
- 至少验证 3 类样式：基础工具类、任意值（含 `rpx`）、变体/伪类
- 若 `JS/TS` 中 class 不生效，优先检查 `content/@source` 是否覆盖该文件与扩展名
- 若 `space-y-*` / `space-x-*` 不生效，固定优先级：
- 先改结构（子节点落到 `view/text` 或外层补 `view`）
- 再评估 `virtualHost`
- 最后才扩展 `cssChildCombinatorReplaceValue`（保持最小标签集合）

## 输出格式要求

最终输出必须包含：

1. 结论（适用框架、Tailwind 版本、目标端）
2. 修改文件清单（按文件逐条列出）
3. 可直接复制的配置片段
4. 安装/运行命令（默认 `pnpm`）
5. 验证步骤与预期结果
6. 回滚方案（至少一条）

若用户要求“规范沉淀”，额外补充：

- 推荐写法（Do）
- 禁止写法（Don't）
- 最小回归检查清单（Code Review Checklist）

## 关键约束

- 不要省略 `weapp-tw patch`，否则 `rpx` 与 `JS` 转译链路可能失效
- 不要把小程序转译插件无条件应用到纯 `H5` 场景
- 不要忽略 `content/@source` 范围配置；这会直接导致 class 不生成
- 不要建议“运行时自由拼接 class 字符串”作为常规方案；优先枚举化或 `cva/tv`
- 对 `text-[22rpx]`、`bg-[22rpx]` 等二义性任意值，提供 `length:` / `color:` 前缀作为兜底写法
- 涉及 `twMerge` / `twJoin` / `cva` / `cn` / `tv` 的封装或重命名时，提醒配置 `ignoreCallExpressionIdentifiers`
- 需要原样透传第三方类名时，优先使用 `weappTwIgnore`
- 对 `space-y-*` / `space-x-*`，默认按 `view + view`（含 `text`）处理，不要假设会自动覆盖全部标签
- `space-y-*` / `space-x-*` 的标签扩展应最小化，只加入业务确实需要的标签，避免选择器污染
- 不要提供与仓库原则冲突的建议：`JS` 转译基于 `classNameSet` 精确命中，禁止启发式兜底转译
- 对版本不确定时，优先给出与官方文档一致的最小可用方案，再做增量优化

## 引用资料

- [references/integration-playbook.md](references/integration-playbook.md)
  - 在“新接入/迁移”类问题中优先读取
  - 直接复用其中的最小配置骨架与验证清单
- [references/troubleshooting-playbook.md](references/troubleshooting-playbook.md)
  - 在“样式不生效/行为异常”类问题中优先读取
  - 按症状路径输出排查步骤，不跳步
- [references/tailwind-writing-best-practices.md](references/tailwind-writing-best-practices.md)
  - 在用户要求“Tailwind 写法建议、团队规范、代码评审清单、动态类治理”时读取
  - 按“决策顺序 + 示例 + 反例 + 验证步骤”输出，不只给概念
