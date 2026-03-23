---
title: ApplyOptions
description: Preferred options for runtime patch behavior.
keywords:
  - weapp-tailwindcss
  - API
  - 接口文档
  - 配置项
  - 小程序
  - tailwindcss
  - 微信小程序
  - ApplyOptions
  - ApplyOptions interface
  - ApplyOptions 类型定义
  - TypeScript
---

# ApplyOptions

Preferred options for runtime patch behavior.

## 属性

### overwrite?

> `optional` **overwrite**: `boolean`

Whether patched files can be overwritten on disk.

***

### exposeContext?

> `optional` **exposeContext**: `boolean | ExposeContextOptions`

Whether to expose runtime Tailwind contexts (or configure how they are exposed).

***

### extendLengthUnits?

> `optional` **extendLengthUnits**: `false | ExtendLengthUnitsOptions`

Extends the length-unit patch or disables it entirely.
