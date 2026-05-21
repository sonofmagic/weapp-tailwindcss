---
title: 使用 doctor 命令诊断项目配置
description: 使用 weapp-tailwindcss doctor 快速检查 Node.js、Tailwind CSS、框架依赖和构建器配置。
keywords:
  - 常见问题
  - 故障排查
  - doctor
  - 诊断命令
  - weapp-tailwindcss
  - tailwindcss
  - postcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - mpx
---

# 使用 doctor 命令诊断项目配置

当项目出现样式未生成、JS 中的 class 未转义、CSS 入口没有被扫描、插件没有在目标端生效等问题时，可以先运行 `doctor` 命令收集项目配置状态。

```bash
pnpm exec weapp-tailwindcss doctor
```

如果你不在项目根目录，可以通过 `--cwd` 指定业务项目目录：

```bash
pnpm exec weapp-tailwindcss doctor --cwd ./packages/miniprogram
```

## 检查内容

`doctor` 命令只读取本地项目文件，不会修改项目配置。当前会检查以下内容：

| 检查项 | 说明 |
| --- | --- |
| `package.json` | 确认命令是否运行在项目根目录 |
| Node.js | 检查当前 Node.js 是否满足最低版本要求 |
| 包管理器 | 识别 `packageManager`、`pnpm-lock.yaml`、`package-lock.json` 或 `yarn.lock` |
| `weapp-tailwindcss` | 检查当前项目是否安装本插件 |
| `tailwindcss` | 检查 Tailwind CSS 是否可解析，并尽量读取实际安装版本 |
| Tailwind 配置 | 检查 `tailwind.config.*` 是否存在 |
| PostCSS 配置 | 检查 `postcss.config.*` 是否存在 |
| 生成模式配置 | 检查 v5 项目是否应移除 Tailwind 官方 PostCSS / Vite 生成插件 |
| 框架依赖 | 识别 Taro、uni-app、MPX、Remax、Rax |
| 构建器配置 | 识别 `vite.config.*` 或 `webpack.config.*` |

## 输出说明

普通输出适合人工排查：

```bash
pnpm exec weapp-tailwindcss doctor
```

JSON 输出适合在 issue、CI 或自动化脚本中使用：

```bash
pnpm exec weapp-tailwindcss doctor --json
```

严格模式会在存在 `warn` 或 `error` 时返回非零退出码，适合放在项目检查脚本中：

```bash
pnpm exec weapp-tailwindcss doctor --strict
```

## 常见诊断结果

### 未检测到 package.json

说明命令大概率没有运行在项目根目录。请切换到业务项目根目录后重试，或者使用 `--cwd` 指定目录。

```bash
pnpm exec weapp-tailwindcss doctor --cwd ./demo/uni-app-vue3-vite
```

### 未检测到 tailwindcss

说明当前项目没有安装 `tailwindcss`，或者依赖无法从当前目录解析。请先确认依赖安装完成，再重新运行诊断命令。

### 生成模式项目仍注册 Tailwind 官方生成插件

`weapp-tailwindcss@5` 默认由 `WeappTailwindcss` 构建器插件接管 Tailwind CSS 生成。小程序构建里不要再同时注册 `@tailwindcss/postcss`、`@tailwindcss/vite` 或 Tailwind CSS 3.x 的 `tailwindcss` PostCSS 插件。

如果项目已有 `postcss.config.*`，只保留业务自己的非 Tailwind 插件。Tailwind CSS 4.x 的入口 CSS 使用 `@import "tailwindcss"` 与 `@source`；常规 Vite 项目会自动识别入口，多入口、入口未被构建器引入或自动识别失败时，再通过 `cssEntries` 显式传给 `WeappTailwindcss`。

### 未检测到 tailwind.config.*

对于 Tailwind CSS v3 项目，请检查 `tailwind.config.*` 的 `content` 是否覆盖页面、组件和脚本文件。

对于 Tailwind CSS v4 项目，未检测到 `tailwind.config.*` 不一定是问题。v4 支持 CSS-first 配置，但如果 JS 字符串中的 class 没有被识别，仍需要检查 CSS 入口中的 `@source`。

## issue 反馈建议

提交 issue 时，建议附上以下信息：

```bash
pnpm exec weapp-tailwindcss doctor --json
```

同时补充：

| 信息 | 示例 |
| --- | --- |
| 框架 | Taro / uni-app / MPX / 原生小程序 |
| 构建器 | Vite / Webpack / Gulp |
| Tailwind CSS 版本 | v3 / v4 |
| 目标端 | 微信小程序 / H5 / App / 鸿蒙 |
| 复现命令 | `pnpm dev:mp-weixin` |

这样可以更快判断问题属于依赖安装、Tailwind 扫描范围、PostCSS 注册、插件禁用条件还是小程序端限制。
