---
title: "WeappTailwindcssGenerator"
description: "weapp-tailwindcss 统一生成器实例。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "WeappTailwindcssGenerator"
  - "WeappTailwindcssGenerator 接口"
  - "WeappTailwindcssGenerator 类型定义"
  - "TypeScript"
---

# WeappTailwindcssGenerator

weapp-tailwindcss 统一生成器实例。

## 属性

### generate()

> **generate()**: `(options?: WeappTailwindcssGenerateOptions) => Promise<WeappTailwindcssGenerateResult>`

生成目标 CSS。

#### 参数

##### options?

`WeappTailwindcssGenerateOptions`

#### 返回

`Promise<WeappTailwindcssGenerateResult>`

***

### source

> **source**: `import("tailwindcss-patch").TailwindV4ResolvedSource`

解析后的 Tailwind CSS 4 source。

***

### validateCandidates()

> **validateCandidates()**: `((candidates: Iterable<string>) => Promise<Set<string>>) | ((candidates: Iterable<string>) => Promise<Set<string>>)`

校验候选 class，并返回 Tailwind 能识别的集合。

#### 参数

##### candidates

`Iterable<string>`

#### 返回

`Promise<Set<string>>`
