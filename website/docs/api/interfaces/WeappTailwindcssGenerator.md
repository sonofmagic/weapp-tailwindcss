---
title: WeappTailwindcssGenerator
description: WeappTailwindcssGenerator 的类型说明，列出公开属性、参数和使用边界。
keywords:
  - weapp-tailwindcss
  - API
  - 接口文档
  - 配置项
  - 小程序
  - tailwindcss
  - 微信小程序
  - WeappTailwindcssGenerator
  - WeappTailwindcssGenerator interface
  - WeappTailwindcssGenerator 类型定义
  - TypeScript
---

# WeappTailwindcssGenerator

## 属性

### generate()

> **generate()**: `(options?: WeappTailwindcssGenerateOptions) => Promise<WeappTailwindcssGenerateResult>`

#### 参数

##### options?

`WeappTailwindcssGenerateOptions`

#### 返回

`Promise<WeappTailwindcssGenerateResult>`

***

### source

> **source**: `TailwindV3ResolvedSource | import("tailwindcss-patch").TailwindV4ResolvedSource`

***

### validateCandidates()

> **validateCandidates()**: `((candidates: Iterable<string>) => Promise<Set<string>>) | ((candidates: Iterable<string>) => Promise<Set<string>>)`

#### 参数

##### candidates

`Iterable<string>`

#### 返回

`Promise<Set<string>>`
