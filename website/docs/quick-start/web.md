---
title: Web 直接使用
description: 在纯 Web / Vite 项目中直接使用 weapp-tailwindcss 生成浏览器原生 Tailwind CSS。
keywords:
  - Web
  - H5
  - Vite
  - Tailwind CSS
  - weapp-tailwindcss
  - generator target web
  - cssEntries
  - 浏览器原生 CSS
  - Web 直接使用
  - vite plugin
---

# Web 直接使用

`weapp-tailwindcss` 可以直接用于纯 Web 项目。它适合小程序、H5/Web 共用同一套 Tailwind CSS 生成链路，或者在普通 Vite Web 项目里验证浏览器原生输出。

## 安装依赖

如果项目已经安装过 `tailwindcss` 和 `weapp-tailwindcss`，可以跳过这一步。

```bash npm2yarn
npm install -D tailwindcss weapp-tailwindcss
```

## 准备 CSS 入口

入口 CSS 仍然要被 Web 项目实际引入。`cssEntries` 只负责让 `weapp-tailwindcss` 稳定读取这个入口里的 `@import "tailwindcss"`、`@source` 与 `@config`，不会替代 Vite 生成 CSS 资产。

```ts title="src/main.ts"
import './style.css'
```

```css title="src/style.css"
@import "tailwindcss";

@source "./**/*.{html,js,ts,jsx,tsx,vue}";
```

## 注册 Vite 插件

纯 Web 项目建议显式配置 `generator.target: 'web'`。这样生成结果会保留浏览器原生 Tailwind CSS 选择器，不会生成小程序转义后的 class。

```ts title="vite.config.ts"
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    WeappTailwindcss({
      generator: {
        target: 'web',
      },
      cssEntries: [
        path.resolve(__dirname, 'src/style.css'),
      ],
    }),
  ],
})
```

选择这条链路后，不要再同时注册 `@tailwindcss/vite` 或 `@tailwindcss/postcss` 来生成同一份 Tailwind CSS。Taro H5、uni-app H5、Mpx Web 等多端框架会按环境变量自动切到 `web` 目标；自定义 Web 构建或纯 Vite 项目建议显式配置。更多目标判断规则见 [跨多端开发 CSS 兼容](/docs/multi-platform)。
