---
title: WeappTailwindcssGenerateOptions
description: WeappTailwindcssGenerateOptions 的类型说明，列出公开属性、参数和使用边界。
keywords:
  - weapp-tailwindcss
  - API
  - 接口文档
  - 配置项
  - 小程序
  - tailwindcss
  - 微信小程序
  - WeappTailwindcssGenerateOptions
  - WeappTailwindcssGenerateOptions interface
  - WeappTailwindcssGenerateOptions 类型定义
  - TypeScript
---

# WeappTailwindcssGenerateOptions

## 属性

### scanSources?

> `optional` **scanSources**: `boolean | import("tailwindcss-patch").TailwindV4SourcePattern[]`

***

### target?

> `optional` **target**: `WeappTailwindcssGeneratorTarget`

***

### styleOptions?

> `optional` **styleOptions**: `Partial<IStyleHandlerOptions>`

***

### tailwindcssV3Compatibility?

> `optional` **tailwindcssV3Compatibility**: `boolean`

***

### candidates?

> `optional` **candidates**: `Iterable<string>`

***

### sources?

> `optional` **sources**: `TailwindV3CandidateSource[] & import("tailwindcss-patch").TailwindV4CandidateSource[]`

***

### incrementalCache?

> `optional` **incrementalCache**: `boolean`

***

### bareArbitraryValues?

> `optional` **bareArbitraryValues**: `boolean | { units?: string[]; }`

Enables UnoCSS-style bare arbitrary values such as `p-10%` and `p-2.5px`.
