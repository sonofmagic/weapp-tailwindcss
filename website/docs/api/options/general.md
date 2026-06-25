---
title: "⚙️ 一般配置"
sidebar_label: "⚙️ 一般配置"
sidebar_position: 4
description: "⚙️ 一般配置：19 个 UserDefinedOptions 配置项，包含类型、默认值和源码说明。"
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

本页收录 19 个配置项，来源于 `UserDefinedOptions`。

## 配置一览

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| [supportCustomLengthUnits](#supportcustomlengthunits) | <code>boolean &#124; LengthUnitsRuntimeOptions</code> | — | 控制 Tailwind 自定义长度单位支持。 |
| [appType](#apptype) | <code>AppType</code> | — | 声明所使用的框架类型。 |
| [arbitraryValues](#arbitraryvalues) | <code>IArbitraryValues</code> | — | TailwindCSS 任意值的相关配置。 |
| [unocss](#unocss) | <code>boolean &#124; IUnocssCompatibilityOptions</code> | <code>false</code> | 启用部分 UnoCSS class 写法兼容。 |
| [jsPreserveClass](#jspreserveclass) | <code>(keyword: string) => boolean &#124; undefined</code> | — | 控制 JS 字面量是否需要保留。 |
| [jsArbitraryValueFallback](#jsarbitraryvaluefallback) | <code>boolean &#124; "auto"</code> | — | 控制 JS 任意值类名在 classNameSet 异常时的受控兜底策略。 |
| [replaceRuntimePackages](#replaceruntimepackages) | <code>boolean &#124; Record<string, string></code> | — | 是否替换运行时依赖包名。 |
| [rewriteCssImports](#rewritecssimports) | <code>boolean</code> | <code>false</code> | 是否把 CSS 中的 Tailwind 包入口改写到 `weapp-tailwindcss` 内部样式入口。 |
| [generator](#generator) | <code>import("../..").WeappTailwindcssGeneratorOptions</code> | — | 控制 Tailwind CSS 直接生成目标端 CSS 的策略。 |
| [cssSourceTrace](#csssourcetrace) | <code>CssSourceTraceUserOptions</code> | <code>false</code> | 在输出 CSS 中为工具类规则标注 token 来源文件。 |
| [disabledDefaultTemplateHandler](#disableddefaulttemplatehandler) | <code>boolean</code> | <code>false</code> | 禁用默认的 `wxml` 模板替换器。 |
| [tailwindcssBasedir](#tailwindcssbasedir) | <code>string</code> | — | 指定用于获取 Tailwind 上下文的路径。 |
| [cache](#cache) | <code>boolean &#124; ICreateCacheReturnType</code> | — | 控制缓存策略。 |
| [babelParserOptions](#babelparseroptions) | <code>(Partial<Options> & { cache?: boolean &#124; undefined; cacheKey?: string &#124; undefined; cacheMaxEntries?: number &#124; undefined; cacheMaxSourceLength?: number &#124; undefined; })</code> | — | `@babel/parser` 的配置选项。 |
| [experimentalJsFastPath](#experimentaljsfastpath) | <code>boolean &#124; "oxc"</code> | — | 实验性 JS 转译快路径。 |
| [postcssOptions](#postcssoptions) | <code>Partial<Omit<import(".pnpm/postcss-load-config@6.0.1_jiti@2.7.0_postcss@8.5.15_tsx@4.22.4_yaml@2.9.0/node_modules/postcss-load-config").Result, "file">></code> | — | `postcss` 的配置选项。 |
| [cssOptions](#cssoptions) | <code>CssOptions</code> | — | CSS 生成与兼容后处理的微调配置。 |
| [tailwindcssRuntimeOptions](#tailwindcssruntimeoptions) | <code>TailwindCssRuntimeOptions</code> | — | 自定义 Tailwind CSS 运行时参数。 |
| [logLevel](#loglevel) | <code>"info" &#124; "warn" &#124; "error" &#124; "silent"</code> | — | 控制命令行日志输出级别。 |

## 详细说明

### supportCustomLengthUnits

> 可选 | 类型: `boolean | LengthUnitsRuntimeOptions`

控制 Tailwind 自定义长度单位支持。

#### 参阅

https://github.com/sonofmagic/weapp-tailwindcss/issues/110

#### 备注

TailwindCSS 3.2.0 起对任意值执行长度单位校验，会将未声明的 `rpx` 识别为颜色。本选项默认开启，并由构建运行时自动接管。

### appType

> 可选 | 类型: `AppType`

声明所使用的框架类型。

#### 备注

用于区分框架运行环境。Vite 产物样式关系会优先从构建图和真实 bundle 文件中推导，不应依赖固定的主样式文件名。

### arbitraryValues

> 可选 | 类型: `IArbitraryValues`

TailwindCSS 任意值的相关配置。

### unocss

> 可选 | 类型: `boolean | IUnocssCompatibilityOptions` | 默认值: `false`

启用部分 UnoCSS class 写法兼容。

#### 备注

默认关闭。传入 `true` 后会启用 Tailwind CSS v4 裸任意值生成。class 字符转义继续由
`customReplaceDictionary` 控制，JS 转译仍遵循 `classNameSet` 精确命中原则。

#### 默认值

```ts
false
```

### jsPreserveClass

> 可选 | 类型: `(keyword: string) => boolean | undefined` | 版本: ^2.6.1

控制 JS 字面量是否需要保留。

#### 备注

当 Tailwind 与 JS 字面量冲突时，可通过回调返回 `true` 保留当前值，返回 `false` 或 `undefined` 则继续转义。默认保留所有带 `*` 的字符串字面量。

#### 参数

##### keyword

`string`

#### 返回

`boolean | undefined`

### jsArbitraryValueFallback

> 可选 | 类型: `boolean | "auto"`

控制 JS 任意值类名在 classNameSet 异常时的受控兜底策略。

#### 备注

为避免误伤业务字符串，兜底仅在 class 语义上下文生效。
- `false`：关闭兜底；
- `true`：始终开启受控兜底；
- `'auto'`：仅 TailwindCSS v4 且 classNameSet 为空时启用。

### replaceRuntimePackages

> 可选 | 类型: `boolean | Record<string, string>`

是否替换运行时依赖包名。

#### 备注

适用于运行时包名需要重定向的场景，例如：
- 小程序侧无法直接安装 `tailwind-merge`/`class-variance-authority`/`tailwind-variants`，需要替换为内置的 weapp 版本。
- 企业内私有镜像/多包发布导致运行时包名不同，希望在转换后统一到目标包名。
传入 `true` 使用内置替换表，或传入对象自定义映射。

#### 示例

```ts
replaceRuntimePackages: {
  'tailwind-merge': '@weapp-tailwindcss/merge',
  'class-variance-authority': '@weapp-tailwindcss/cva',
}
```

### rewriteCssImports

> 可选 | 类型: `boolean` | 默认值: `false`

是否把 CSS 中的 Tailwind 包入口改写到 `weapp-tailwindcss` 内部样式入口。

#### 备注

默认关闭。Tailwind CSS v4 项目应保留 `@import "tailwindcss"` 原始入口，由
`weapp-tailwindcss` 基于 CSS AST/source 结果生成目标端 CSS。仅在需要兼容旧项目
或特定框架无法正常解析 Tailwind 包入口时显式开启。

#### 默认值

```ts
false
```

### generator

> 可选 | 类型: `import("../..").WeappTailwindcssGeneratorOptions`

控制 Tailwind CSS 直接生成目标端 CSS 的策略。

#### 备注

默认值会按构建环境推断：小程序构建使用 `weapp`，H5/Web 与普通 uni-app App WebView 使用 `web`。
uni-app x 原生 App 目标继续通过 `uniAppX` 配置处理 uvue/App 约束，不需要配置 `target: 'app'`。

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

### disabledDefaultTemplateHandler

> 可选 | 类型: `boolean` | 默认值: `false` | 版本: ^2.6.2

禁用默认的 `wxml` 模板替换器。

#### 备注

启用后模板匹配完全交由 [`customAttributes`](/docs/api/options/important#customattributes) 管理，需要自行覆盖默认的 `class` / `hover-class` 等匹配规则。

#### 默认值

```ts
false
```

### tailwindcssBasedir

> 可选 | 类型: `string` | 版本: ^2.9.3

指定用于获取 Tailwind 上下文的路径。

#### 备注

在 linked 或 monorepo 场景下可手动指向目标项目的 `package.json` 所在目录。

### cache

> 可选 | 类型: `boolean | ICreateCacheReturnType` | 版本: ^3.0.11

控制缓存策略。

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

> 可选 | 类型: `Partial<Omit<import(".pnpm/postcss-load-config@6.0.1_jiti@2.7.0_postcss@8.5.15_tsx@4.22.4_yaml@2.9.0/node_modules/postcss-load-config").Result, "file">>` | 版本: ^3.2.0

`postcss` 的配置选项。

### cssOptions

> 可选 | 类型: `CssOptions` | 版本: ^4.3.4

CSS 生成与兼容后处理的微调配置。

#### 备注

后续用于控制生成 CSS 的兼容兜底、变量保留、规则修剪等细粒度行为。
`cssPreflight`、`cssPreflightRange`、`cssChildCombinatorReplaceValue`、`cssPresetEnv`、`autoprefixer`、
`atRules`、`injectAdditionalCssVarScope`、`cssSelectorReplacement`、`rem2rpx`、`px2rpx`、`unitsToPx`、
`unitConversion`、`platform`、`cssRemoveHoverPseudoClass`、`cssRemoveProperty`、`cssCalc`
与 `tailwindcssV4GradientFallback` 都推荐放在这里。

### tailwindcssRuntimeOptions

> 可选 | 类型: `TailwindCssRuntimeOptions`

自定义 Tailwind CSS 运行时参数。

### logLevel

> 可选 | 类型: `"info" | "warn" | "error" | "silent"`

控制命令行日志输出级别。

#### 备注

默认 `info`，可设置为 `silent` 屏蔽全部输出。
