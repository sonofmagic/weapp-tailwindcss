---
title: ExtractOptions
description: Preferred options for extraction output behavior.
keywords:
  - weapp-tailwindcss
  - API
  - 接口文档
  - 配置项
  - 小程序
  - tailwindcss
  - 微信小程序
  - ExtractOptions
  - ExtractOptions interface
  - ExtractOptions 类型定义
  - TypeScript
---

# ExtractOptions

Preferred options for extraction output behavior.

## 属性

### write?

> `optional` **write**: `boolean`

Whether to produce an output file.

***

### file?

> `optional` **file**: `string`

Optional absolute or relative path to the output file.

***

### format?

> `optional` **format**: `"json" | "lines"`

Output format, defaults to JSON when omitted.

***

### pretty?

> `optional` **pretty**: `number | boolean`

Pretty-print spacing (truthy value enables indentation).

***

### removeUniversalSelector?

> `optional` **removeUniversalSelector**: `boolean`

Whether to strip the universal selector (`*`) from the final list.
