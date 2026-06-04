---
title: TailwindCssOptions
description: High-level Tailwind patch configuration shared across versions.
keywords:
  - weapp-tailwindcss
  - API
  - 接口文档
  - 配置项
  - 小程序
  - tailwindcss
  - 微信小程序
  - TailwindCssOptions
  - TailwindCssOptions interface
  - TailwindCssOptions 类型定义
  - TypeScript
---

# TailwindCssOptions

High-level Tailwind patch configuration shared across versions.

## 属性

### config?

> `optional` **config**: `string`

Path to a Tailwind config file when auto-detection is insufficient.

***

### cwd?

> `optional` **cwd**: `string`

Custom working directory used when resolving config-relative paths.

***

### postcssPlugin?

> `optional` **postcssPlugin**: `string`

Optional PostCSS plugin name to use instead of the default.

***

### version?

> `optional` **version**: `3 | 4 | 2`

Explicit Tailwind CSS major version used by the current project. When omitted, the installed package version is inferred.

***

### packageName?

> `optional` **packageName**: `string`

Tailwind package name if the project uses a fork.

***

### resolve?

> `optional` **resolve**: `PackageResolvingOptions`

Package resolution options forwarded to `local-pkg`.

#### paths?

> `optional` **paths**: `string[]`
#### platform?

> `optional` **platform**: `"auto" | "posix" | "win32"`

##### 默认值

```ts
'auto'
Resolve path as posix or win32
```

***

### v2?

> `optional` **v2**: `TailwindV2Options`

Overrides applied when patching Tailwind CSS v2.

#### config?

> `optional` **config**: `string`

Path to a Tailwind config file when auto-detection is insufficient.
#### cwd?

> `optional` **cwd**: `string`

Custom working directory used when resolving config-relative paths.
#### postcssPlugin?

> `optional` **postcssPlugin**: `string`

Optional PostCSS plugin name to use instead of the default.

***

### v3?

> `optional` **v3**: `TailwindV3Options`

Overrides applied when patching Tailwind CSS v3.

#### config?

> `optional` **config**: `string`

Path to a Tailwind config file when auto-detection is insufficient.
#### cwd?

> `optional` **cwd**: `string`

Custom working directory used when resolving config-relative paths.
#### postcssPlugin?

> `optional` **postcssPlugin**: `string`

Optional PostCSS plugin name to use instead of the default.

***

### v4?

> `optional` **v4**: `TailwindV4Options`

Options specific to Tailwind CSS v4 patching.

#### base?

> `optional` **base**: `string`

Base directory used when resolving v4 content sources and configs.
#### css?

> `optional` **css**: `string`

Raw CSS passed directly to the v4 design system.
#### cssSources?

> `optional` **cssSources**: `TailwindV4CssSource[]`

构建器在 CSS 落盘前捕获的内存 CSS 入口。
#### cssEntries?

> `optional` **cssEntries**: `string[]`

Set of CSS entry files that should be scanned for `@config` directives.
#### sources?

> `optional` **sources**: `SourceEntry[]`

Overrides the content sources scanned by the oxide scanner.
#### bareArbitraryValues?

> `optional` **bareArbitraryValues**: `boolean | { units?: string[]; }`

Enables UnoCSS-style bare arbitrary values such as `p-10%` and `p-2.5px`.
