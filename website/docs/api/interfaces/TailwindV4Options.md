---
title: TailwindV4Options
description: Additional configuration specific to Tailwind CSS v4 extraction.
keywords:
  - weapp-tailwindcss
  - API
  - 接口文档
  - 配置项
  - 小程序
  - tailwindcss
  - 微信小程序
  - TailwindV4Options
  - TailwindV4Options interface
  - TailwindV4Options 类型定义
  - TypeScript
---

# TailwindV4Options

Additional configuration specific to Tailwind CSS v4 extraction.

## 属性

### base?

> `optional` **base**: `string`

Base directory used when resolving v4 content sources and configs.

***

### css?

> `optional` **css**: `string`

Raw CSS passed directly to the v4 design system.

***

### cssEntries?

> `optional` **cssEntries**: `string[]`

Set of CSS entry files that should be scanned for `@config` directives.

***

### sources?

> `optional` **sources**: `SourceEntry[]`

Overrides the content sources scanned by the oxide scanner.
