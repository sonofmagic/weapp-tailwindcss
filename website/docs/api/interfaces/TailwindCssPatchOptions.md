---
title: TailwindCssPatchOptions
description: Root configuration consumed by the Tailwind CSS patch runner.
keywords:
  - weapp-tailwindcss
  - API
  - 接口文档
  - 配置项
  - 小程序
  - tailwindcss
  - 微信小程序
  - TailwindCssPatchOptions
  - TailwindCssPatchOptions interface
  - TailwindCssPatchOptions 类型定义
  - TypeScript
---

# TailwindCssPatchOptions

Root configuration consumed by the Tailwind CSS patch runner.

## 属性

### projectRoot?

> `optional` **projectRoot**: `string`

Base directory used when resolving Tailwind resources.
Defaults to `process.cwd()`.

***

### tailwindcss?

> `optional` **tailwindcss**: `TailwindCssOptions`

Preferred Tailwind runtime configuration.

#### config?

> `optional` **config**: `string`

Path to a Tailwind config file when auto-detection is insufficient.
#### cwd?

> `optional` **cwd**: `string`

Custom working directory used when resolving config-relative paths.
#### postcssPlugin?

> `optional` **postcssPlugin**: `string`

Optional PostCSS plugin name to use instead of the default.
#### version?

> `optional` **version**: `3 | 4 | 2`

Explicit Tailwind CSS major version used by the current project. When omitted, the installed package version is inferred.
#### packageName?

> `optional` **packageName**: `string`

Tailwind package name if the project uses a fork.
#### resolve?

> `optional` **resolve**: `PackageResolvingOptions`

Package resolution options forwarded to `local-pkg`.
#### v2?

> `optional` **v2**: `TailwindV2Options`

Overrides applied when patching Tailwind CSS v2.
#### v3?

> `optional` **v3**: `TailwindV3Options`

Overrides applied when patching Tailwind CSS v3.
#### v4?

> `optional` **v4**: `TailwindV4Options`

Options specific to Tailwind CSS v4 patching.

***

### apply?

> `optional` **apply**: `ApplyOptions`

Preferred patch toggles.

#### overwrite?

> `optional` **overwrite**: `boolean`

Whether patched files can be overwritten on disk.
#### exposeContext?

> `optional` **exposeContext**: `boolean | ExposeContextOptions`

Whether to expose runtime Tailwind contexts (or configure how they are exposed).
#### extendLengthUnits?

> `optional` **extendLengthUnits**: `false | ExtendLengthUnitsOptions`

Extends the length-unit patch or disables it entirely.

***

### extract?

> `optional` **extract**: `ExtractOptions`

Preferred extraction output settings.

#### write?

> `optional` **write**: `boolean`

Whether to produce an output file.
#### file?

> `optional` **file**: `string`

Optional absolute or relative path to the output file.
#### format?

> `optional` **format**: `"json" | "lines"`

Output format, defaults to JSON when omitted.
#### pretty?

> `optional` **pretty**: `number | boolean`

Pretty-print spacing (truthy value enables indentation).
#### removeUniversalSelector?

> `optional` **removeUniversalSelector**: `boolean`

Whether to strip the universal selector (`*`) from the final list.

***

### filter()?

> `optional` **filter()**: `(className: string) => boolean`

Optional function that filters final class names.

#### 参数

##### className

`string`

#### 返回

`boolean`

***

### cache?

> `optional` **cache**: `boolean | CacheOptions`

Cache configuration or boolean to enable/disable quickly.
