---
title: "TailwindCssOptions"
description: "按 Tailwind 版本划分的运行时配置。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "TailwindCssOptions"
  - "TailwindCssOptions 接口"
  - "TailwindCssOptions 类型定义"
  - "TypeScript"
---

# TailwindCssOptions

按 Tailwind 版本划分的运行时配置。

## 属性

### config?

> 可选 | **config**: `string`

Tailwind 配置文件路径。自动识别不够准确时可以显式传入。

***

### cwd?

> 可选 | **cwd**: `string`

解析 Tailwind 配置相对路径时使用的工作目录。

***

### postcssPlugin?

> 可选 | **postcssPlugin**: `string`

自定义 PostCSS 插件名称。未传入时使用默认名称。

***

### version?

> 可选 | **version**: `4`

当前项目使用的 Tailwind CSS 主版本。未传入时会从已安装包推断。

***

### packageName?

> 可选 | **packageName**: `string`

Tailwind 包名。项目使用分支包时可以改这里。

***

### resolve?

> 可选 | **resolve**: `PackageResolvingOptions`

传给 `local-pkg` 的包解析配置。

#### paths?

> 可选 | **paths**: `string[]`
#### platform?

> 可选 | **platform**: `"posix" | "win32" | "auto"`

##### 默认值

```ts
'auto'
Resolve path as posix or win32
```

***

### v4?

> 可选 | **v4**: `TailwindV4Options`

Tailwind CSS v4 提取与 CSS 入口选项。

#### base?

> 可选 | **base**: `string`

解析 v4 内容来源与配置时使用的基准目录。
#### css?

> 可选 | **css**: `string`

直接传给 v4 设计系统的原始 CSS。
#### cssSources?

> 可选 | **cssSources**: `import("@tailwindcss-mangle/engine").TailwindV4CssSource[]`

构建器在 CSS 落盘前捕获的内存 CSS 入口。
#### cssEntries?

> 可选 | **cssEntries**: `string[]`

需要扫描 `@config` 指令的 CSS 入口文件。
#### sources?

> 可选 | **sources**: `SourceEntry[]`

覆盖 oxide 扫描器默认扫描的内容来源。
#### bareArbitraryValues?

> 可选 | **bareArbitraryValues**: `boolean | { units?: string[]; }`

是否启用 UnoCSS 风格的裸任意值，例如 `p-10%`、`p-2.5px`。
