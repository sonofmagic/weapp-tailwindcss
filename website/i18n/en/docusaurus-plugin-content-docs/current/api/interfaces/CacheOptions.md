---
title: CacheOptions
description: Tailwind class name cache configuration.
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - CacheOptions
  - CacheOptions interface
  - CacheOptions type definition
  - TypeScript
---

# CacheOptions

Tailwind class name cache configuration.

## Properties

### enabled?

> Optional | **enabled**: `boolean`

Whether to enable caching.

---

### cwd?

> Optional | **cwd**: `string`

The working directory used when resolving cache paths.

---

### dir?

> Optional | **dir**: `string`

Cache files are written to the directory.

---

### file?

> Optional | **file**: `string`

Cache file name. When not passed in, `class-cache.json` will be used in the derived cache directory.

---

### strategy?

> Optional | **strategy**: `CacheStrategy`

The strategy used when merging a new class name list with an existing cache.

---

### driver?

> Optional | **driver**: `CacheDriver`

Cache persistence method. By default `file` is used.
