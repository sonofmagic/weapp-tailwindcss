---
name: weapp-tailwindcss
description: 帮助用户在 uni-app、taro、原生小程序与 uni-app x 项目中集成 weapp-tailwindcss，并输出 Tailwind CSS 写法最佳实践（动态类、任意值、rpx、merge、content/@source）与排障步骤。
---

# weapp-tailwindcss Skill

用于业务项目接入 `weapp-tailwindcss`，并让 AI 稳定完成“小程序 + 多端”配置、排障与 Tailwind 写法规范落地。

## 适用任务

- 新项目快速启用 `tailwindcss + weapp-tailwindcss`
- 老项目迁移（`uni-app` / `taro` / `uni-app x` / 原生小程序）
- 多端协同（小程序 + `H5` / `App`）配置
- 样式不生效、`rpx` 任意值异常、`JS` 字符串 class 未转译等问题排查
- 需要“Tailwind class 应该怎么写”的团队规范与代码评审清单

## 先收集信息

缺少关键信息时，先补齐：

- 当前框架：`uni-app` / `taro` / `uni-app x` / 原生小程序 / 其他
- 构建工具：`vite` / `webpack5` / `webpack4`
- 目标端：仅小程序，还是小程序 + `H5` / `App`
- `tailwindcss` 主版本（v3 / v4）与包管理器（尤其是否为 `pnpm@10+`）
- 当前诉求是“集成配置”、“问题排查”还是“写法规范沉淀”

## 执行流程

1. 先确定 Tailwind 主版本与扫描方式

- `tailwindcss@3`：使用 `tailwind.config.js` 的 `content`
- `tailwindcss@4`：使用入口 CSS 的 `@source`
- 确保扫描范围覆盖真实模板与脚本文件，且排除 `dist` / `unpackage` / `node_modules`

2. 安装并激活 `weapp-tailwindcss`

- 安装 `weapp-tailwindcss`
- 在 `package.json` 添加 `postinstall: "weapp-tw patch"`
- 若使用 `pnpm@10+`，提醒执行 `pnpm approve-builds weapp-tailwindcss`
- 补丁失效时可引导执行 `npx weapp-tw patch --clear-cache`

3. 按框架注册插件并给出最小配置

- `uni-app cli vue3 vite`：使用 `weapp-tailwindcss/vite`，并在 `vite.config` 内联注册 `postcss`
- `uni-app cli vue2 webpack`：使用 `weapp-tailwindcss/webpack`（或历史项目按版本选 `webpack4`）
- `taro webpack5`：在 `webpackChain` 注册 `UnifiedWebpackPluginV5`
- `taro vite`：用 `weapp-tailwindcss/vite` + 内联 `postcss`，并处理 css 变量注入
- `uni-app x`：使用 `vite` + `weapp-tailwindcss/vite`，按官方专题配置
- 原生小程序：优先引导到官方模板（`gulp` / `webpack`）

4. 根据任务类型补充专项指导

- 如果用户要“写法最佳实践”，读取 [references/tailwind-writing-best-practices.md](references/tailwind-writing-best-practices.md) 并按其中模板输出
- 如果用户要“运行时拼类”，优先推荐 `@weapp-tailwindcss/merge` / `cva` / `variants` 组合
- 如果用户反馈“压缩后失效”，提醒保留关键函数名，或补充 `ignoreCallExpressionIdentifiers`

5. 验证与回归

- 先跑开发态编译，再跑目标端构建
- 至少验证 3 类样式：基础工具类、任意值（含 `rpx`）、变体/伪类
- 若 `JS/TS` 内 class 不生效，优先检查 `content/@source` 是否覆盖该文件与扩展名
- 若 `space-y-*` / `space-x-*` 不生效，按固定优先级排查：
  1. 先改结构（子节点改为 `view/text` 或外层包裹 `view`）
  2. 再评估 `virtualHost`
  3. 最后才扩展 `cssChildCombinatorReplaceValue`

## 输出要求

输出结果需包含：

1. 修改文件清单
2. 可直接复制的配置片段
3. 安装/运行命令
4. 验证步骤与预期结果
5. 若用户要求规范沉淀，额外给出：
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
- 对版本不确定时，优先给出与官方文档一致的最小可用方案，再做增量优化

## 引用资料

- [references/tailwind-writing-best-practices.md](references/tailwind-writing-best-practices.md)
  - 在用户要求“Tailwind 写法建议、团队规范、代码评审清单、动态类治理”时读取
  - 按“决策顺序 + 示例 + 反例 + 验证步骤”输出，不只给概念
