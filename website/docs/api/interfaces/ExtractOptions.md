---
title: "ExtractOptions"
description: "ExtractOptions 的类型说明，列出公开属性、参数和使用边界。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "ExtractOptions"
  - "ExtractOptions 接口"
  - "ExtractOptions 类型定义"
  - "TypeScript"
---

# ExtractOptions

类名提取结果的输出配置。

## 属性

### write?

> 可选 | **write**: `boolean`

是否写出提取结果文件。

***

### file?

> 可选 | **file**: `string`

输出文件路径，可传绝对路径或相对路径。

***

### format?

> 可选 | **format**: `"json" | "lines"`

输出格式。未传入时使用 JSON。

***

### pretty?

> 可选 | **pretty**: `number | boolean`

JSON 格式化缩进。传入可判定为真的值会启用缩进。

***

### removeUniversalSelector?

> 可选 | **removeUniversalSelector**: `boolean`

是否从最终列表中移除通配选择器 `*`。
