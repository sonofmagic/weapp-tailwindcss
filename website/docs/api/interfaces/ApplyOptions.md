---
title: "ApplyOptions"
description: "Tailwind 运行时行为配置。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "ApplyOptions"
  - "ApplyOptions 接口"
  - "ApplyOptions 类型定义"
  - "TypeScript"
---

# ApplyOptions

Tailwind 运行时行为配置。

## 属性

### overwrite?

> 可选 | **overwrite**: `boolean`

是否允许覆盖已有运行时缓存或上下文状态。

***

### exposeContext?

> 可选 | **exposeContext**: `boolean | ExposeContextOptions`

是否暴露运行时 Tailwind context，或配置具体暴露方式。

***

### extendLengthUnits?

> 可选 | **extendLengthUnits**: `false | ExtendLengthUnitsOptions`

扩展长度单位支持，传入 `false` 可完全关闭。
