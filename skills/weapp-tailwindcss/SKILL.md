---
name: weapp-tailwindcss
description: 帮助用户在 uni-app、taro、原生小程序与 uni-app x 项目中快速集成 weapp-tailwindcss，实现小程序与多端开发。
---

# weapp-tailwindcss Skill

用于业务项目中接入 `weapp-tailwindcss`，让 AI 能稳定完成“小程序 + 多端”配置与排障。

## 何时使用

- 新项目要快速启用 `tailwindcss + weapp-tailwindcss`
- 已有 `uni-app` / `taro` / `uni-app x` / 原生小程序 项目要迁移
- 需要同时兼顾小程序与 `H5` / `App` / 其他端构建
- 出现样式不生效、`rpx` 任意值异常、`JS` 字符串 class 未转译等问题

## 先收集信息

缺少关键信息时，先询问用户：

- 当前框架：`uni-app` / `taro` / `uni-app x` / 原生小程序 / 其他
- 构建工具：`vite` / `webpack5` / `webpack4`
- 目标端：仅小程序，还是小程序 + `H5` / `App`
- `tailwindcss` 主版本与包管理器（尤其是否为 `pnpm@10+`）

## 执行流程

1. 初始化依赖与基础配置

- 安装 `tailwindcss`、`postcss`、`autoprefixer`
- 配置 `tailwind.config.js`，确保 `content` 或 `@source` 包括真实业务源码
- 在入口样式文件引入 `@tailwind base/components/utilities`（或等价 `@import`）

2. 安装并激活 `weapp-tailwindcss`

- 安装 `weapp-tailwindcss`
- 在 `package.json` 添加 `postinstall: "weapp-tw patch"`
- 若使用 `pnpm@10+`，提醒执行 `pnpm approve-builds weapp-tailwindcss`
- 补丁失效时可引导执行 `npx weapp-tw patch --clear-cache`

3. 按框架注册插件

- `uni-app cli vue3 vite`：使用 `weapp-tailwindcss/vite`，并在 `vite.config` 内联注册 `postcss`
- `uni-app cli vue2 webpack`：使用 `weapp-tailwindcss/webpack`（或历史项目按版本选 `webpack4`）
- `taro webpack5`：在 `webpackChain` 注册 `UnifiedWebpackPluginV5`
- `taro vite`：用 `weapp-tailwindcss/vite` + 内联 `postcss`，并处理 css 变量注入
- `uni-app x`：使用 `vite` + `weapp-tailwindcss/vite`，按官方专题配置
- 原生小程序：优先引导到官方模板（`gulp` / `webpack`）

4. 验证与回归

- 先跑开发态编译，再跑目标端构建
- 至少验证 3 类样式：基础工具类、任意值（含 `rpx`）、变体/伪类
- 若 `JS/TS` 内 class 不生效，优先检查 `content/@source` 是否覆盖该文件

## 输出要求

输出结果需包含：

1. 修改文件清单
2. 可直接复制的配置片段
3. 安装/运行命令
4. 验证步骤与预期结果

## 关键约束

- 不要省略 `weapp-tw patch`，否则 `rpx` 与 `JS` 转译链路可能失效
- 不要把小程序转译插件无条件应用到纯 `H5` 场景
- 不要忽略 `content/@source` 范围配置；这会直接导致 class 不生成
- 对版本不确定时，优先给出与官方文档一致的最小可用方案，再做增量优化
