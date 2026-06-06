---
title: "WeappTailwindcssGenerateResult"
description: "weapp-tailwindcss 生成器的输出结果。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "WeappTailwindcssGenerateResult"
  - "WeappTailwindcssGenerateResult 接口"
  - "WeappTailwindcssGenerateResult 类型定义"
  - "TypeScript"
---

# WeappTailwindcssGenerateResult

weapp-tailwindcss 生成器的输出结果。

## 属性

### css

> **css**: `string`

转换后的 CSS。

***

### rawCss

> **rawCss**: `string`

Tailwind 原始输出 CSS。

***

### incrementalCss?

> 可选 | **incrementalCss**: `string`

本次增量新增的转换后 CSS。

***

### incrementalRawCss?

> 可选 | **incrementalRawCss**: `string`

本次增量新增的 Tailwind 原始 CSS。

***

### classSet

> **classSet**: `Set<string>`

成功生成的 class 集合。

#### size

> **size**: `number`
#### __@toStringTag@9916

> **__@toStringTag@9916**: `string`

***

### rawCandidates

> **rawCandidates**: `Set<string>`

输入侧的原始候选 class 集合。

#### size

> **size**: `number`
#### __@toStringTag@9916

> **__@toStringTag@9916**: `string`

***

### dependencies

> **dependencies**: `string[]`

生成依赖的文件列表。

***

### sources

> **sources**: `import("tailwindcss-patch").TailwindV4SourcePattern[] | TailwindV3SourcePattern[]`

Tailwind 配置解析出的扫描规则。

***

### root

> **root**: `import("tailwindcss-patch").TailwindV4CompiledSourceRoot`

v3 生成器没有编译后的 source root，固定为 `null`。

***

### target

> **target**: `"weapp" | "web" | "tailwind"`

实际生成目标。
