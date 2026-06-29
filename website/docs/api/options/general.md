---
title: "⚙️ 一般配置"
sidebar_label: "⚙️ 一般配置"
sidebar_position: 4
description: "⚙️ 一般配置：6 个 UserDefinedOptions 配置项，包含类型、默认值和源码说明。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "一般配置"
  - "⚙️ 一般配置"
  - "一般配置 配置"
  - "插件参数"
---

本页收录 6 个配置项，来源于 `UserDefinedOptions`。

## 配置一览

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| [cssSourceTrace](#csssourcetrace) | <code>CssSourceTraceUserOptions</code> | <code>false</code> | 在输出 CSS 中为工具类规则标注 token 来源文件。 |
| [babelParserOptions](#babelparseroptions) | <code>(Partial<Options> & { cache?: boolean &#124; undefined; cacheKey?: string &#124; undefined; cacheMaxEntries?: number &#124; undefined; cacheMaxSourceLength?: number &#124; undefined; })</code> | — | `@babel/parser` 的配置选项。 |
| [experimentalJsFastPath](#experimentaljsfastpath) | <code>boolean &#124; "oxc"</code> | — | 实验性 JS 转译快路径。 |
| [postcssOptions](#postcssoptions) | <code>Partial<Omit<Result, "file">></code> | — | `postcss` 的配置选项。 |
| [tailwindcssRuntimeOptions](#tailwindcssruntimeoptions) | [`TailwindCssRuntimeOptions`](../interfaces/TailwindCssRuntimeOptions.md) | — | 自定义 Tailwind CSS 运行时参数。 |
| [logLevel](#loglevel) | <code>"info" &#124; "warn" &#124; "error" &#124; "silent"</code> | — | 控制命令行日志输出级别。 |

## 详细说明

### cssSourceTrace

> 可选 | 类型: `CssSourceTraceUserOptions` | 默认值: `false`

在输出 CSS 中为工具类规则标注 token 来源文件。

#### 备注

默认关闭。开启后会在生成的 CSS 规则前插入 `tokens: token <= source-file` 注释，
用于排查某条工具类来自哪个源码文件。可传入 `{ root }` 控制注释里的相对路径基准。
该能力面向调试与 demo 验收，生产构建通常保持关闭以减少产物体积。

#### 默认值

```ts
false
```

### babelParserOptions

> 可选 | 类型: `(Partial<Options> & { cache?: boolean | undefined; cacheKey?: string | undefined; cacheMaxEntries?: number | undefined; cacheMaxSourceLength?: number | undefined; })` | 版本: ^3.2.0

`@babel/parser` 的配置选项。

### experimentalJsFastPath

> 可选 | 类型: `boolean | "oxc"`

实验性 JS 转译快路径。

#### 备注

当前仅在调用侧关闭 source map，且没有模块图、模块替换、ignore 调用/标签模板语义时尝试 OXC。
OXC npm 包本身要求 Node `^20.19.0 || >=22.12.0`，Node 18 环境会自动回退到 Babel。

### postcssOptions

> 可选 | 类型: `Partial<Omit<Result, "file">>` | 版本: ^3.2.0

`postcss` 的配置选项。

### tailwindcssRuntimeOptions

> 可选 | 类型: [`TailwindCssRuntimeOptions`](../interfaces/TailwindCssRuntimeOptions.md)

自定义 Tailwind CSS 运行时参数。

### logLevel

> 可选 | 类型: `"info" | "warn" | "error" | "silent"`

控制命令行日志输出级别。

#### 备注

默认 `info`，可设置为 `silent` 屏蔽全部输出。
