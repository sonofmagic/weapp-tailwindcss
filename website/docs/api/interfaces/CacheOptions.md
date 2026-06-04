---
title: "CacheOptions"
description: "Tailwind 类名缓存配置。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "CacheOptions"
  - "CacheOptions 接口"
  - "CacheOptions 类型定义"
  - "TypeScript"
---

# CacheOptions

Tailwind 类名缓存配置。

## 属性

### enabled?

> 可选 | **enabled**: `boolean`

是否启用缓存。

***

### cwd?

> 可选 | **cwd**: `string`

解析缓存路径时使用的工作目录。

***

### dir?

> 可选 | **dir**: `string`

缓存文件写入目录。

***

### file?

> 可选 | **file**: `string`

缓存文件名。未传入时，会在推导出的缓存目录下使用 `class-cache.json`。

***

### strategy?

> 可选 | **strategy**: `CacheStrategy`

新类名列表与已有缓存合并时使用的策略。

***

### driver?

> 可选 | **driver**: `CacheDriver`

缓存持久化方式。默认使用 `file`。
