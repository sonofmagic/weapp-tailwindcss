---
title: "TailwindV4Options"
description: "Tailwind CSS v4 提取配置。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "TailwindV4Options"
  - "TailwindV4Options 接口"
  - "TailwindV4Options 类型定义"
  - "TypeScript"
---

# TailwindV4Options

Tailwind CSS v4 提取配置。

## 属性

### base?

> 可选 | **base**: `string`

解析 v4 内容来源与配置时使用的基准目录。

***

### css?

> 可选 | **css**: `string`

直接传给 v4 设计系统的原始 CSS。

***

### cssSources?

> 可选 | **cssSources**: `TailwindV4CssSource[]`

构建器在 CSS 落盘前捕获的内存 CSS 入口。

***

### cssEntries?

> 可选 | **cssEntries**: `string[]`

Tailwind CSS 4 入口文件列表，用于识别入口中的 `@import "tailwindcss"`、`@source` 与 `@config`。入口 CSS 仍然需要被项目实际 import 或纳入构建图，`cssEntries` 不会替代框架生成该 CSS 资产。

类型上保持可选，是为了兼容内存 CSS 来源；业务项目应显式传入绝对路径。多入口、分包、独立分包、Webpack/Gulp/自定义构建和多平台构建都应该写清楚这些入口。

***

### sources?

> 可选 | **sources**: `SourceEntry[]`

覆盖 oxide 扫描器默认扫描的内容来源。

***

### bareArbitraryValues?

> 可选 | **bareArbitraryValues**: `boolean | { units?: string[]; }`

是否启用 UnoCSS 风格的裸任意值，例如 `p-10%`、`p-2.5px`。
