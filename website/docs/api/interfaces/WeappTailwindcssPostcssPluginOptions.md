---
title: "WeappTailwindcssPostcssPluginOptions"
description: "`weapp-tailwindcss` PostCSS 插件配置。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "WeappTailwindcssPostcssPluginOptions"
  - "WeappTailwindcssPostcssPluginOptions 接口"
  - "WeappTailwindcssPostcssPluginOptions 类型定义"
  - "TypeScript"
---

# WeappTailwindcssPostcssPluginOptions

`weapp-tailwindcss` PostCSS 插件配置。

## 属性

### generator?

> 可选 | **generator**: `import("./generator").WeappTailwindcssGeneratorOptions`

生成器配置，用于控制目标端、Tailwind 配置路径和 v4 兼容层。

#### target?

> 可选 | **target**: `WeappTailwindcssGeneratorTarget`

生成目标。小程序构建默认使用 `weapp`，H5/Web 与普通 uni-app App WebView 默认使用 `web`。

##### 备注

`target` 表示 CSS 输出形态，不是平台枚举。uni-app x Android/iOS 这类原生 App 目标继续使用 `weapp` 输出族，
并通过 `uniAppX`、`platform` 与单位转换配置处理 App 差异。
#### config?

> 可选 | **config**: `string`

Tailwind 配置文件路径，兼容原 Tailwind PostCSS 插件的 `config` 选项。
#### styleOptions?

> 可选 | **styleOptions**: `Partial<IStyleHandlerOptions>`

传给小程序 CSS 兼容转换器的额外配置。
#### importFallback?

> 可选 | **importFallback**: `boolean`

将 `@import "weapp-tailwindcss"` 作为 Tailwind CSS v4 生成入口的兜底别名。

适用于框架无法把 `@import "tailwindcss"` 改写到 `weapp-tailwindcss` 包入口的场景，默认开启。
#### tailwindcssV3Compatibility?

> 可选 | **tailwindcssV3Compatibility**: `boolean`

Tailwind CSS v4 小程序生成模式默认注入 v3 默认值兼容层，保持升级前的视觉行为。

设为 `false` 时，完全使用 Tailwind CSS v4 原生默认值。

***

### version?

> 可选 | **version**: `3 | 4`

显式指定 Tailwind CSS 主版本。未传入时会从 CSS 与依赖环境推断。

***

### config?

> 可选 | **config**: `string`

Tailwind 配置文件路径。

***

### postcssPlugin?

> 可选 | **postcssPlugin**: `string`

Tailwind PostCSS 插件名称。

***

### candidates?

> 可选 | **candidates**: `Iterable<string>`

额外传入的候选类名。

***

### scanSources?

> 可选 | **scanSources**: `boolean | import("tailwindcss-patch").TailwindV4SourcePattern[]`

是否扫描 Tailwind v4 源码入口中的候选类名。

***

### sources?

> 可选 | **sources**: `TailwindV4CandidateSource[]`

额外传入的 Tailwind v4 内联候选来源。

***

### styleOptions?

> 可选 | **styleOptions**: `Partial<IStyleHandlerOptions>`

传给小程序 CSS 兼容转换器的额外配置。

#### isMainChunk?

> 可选 | **isMainChunk**: `boolean`
#### cssPreflight?

> 可选 | **cssPreflight**: `CssPreflightOptions`
#### cssInjectPreflight()?

> 可选 | **cssInjectPreflight()**: `InjectPreflight`
#### escapeMap?

> 可选 | **escapeMap**: `Record<string, string>`
#### ctx?

> 可选 | **ctx**: `{ variablesScopeWeakMap: WeakMap<object, any>; isVariablesScope: (rule: WeakKey) => boolean; markVariablesScope: (rule: WeakKey) => void; }`
#### platform?

> 可选 | **platform**: `string`
#### postcssOptions?

> 可选 | **postcssOptions**: `Partial<Omit<Result, "file">>`
#### cssRemoveProperty?

> 可选 | **cssRemoveProperty**: `boolean`
#### cssRemoveHoverPseudoClass?

> 可选 | **cssRemoveHoverPseudoClass**: `boolean`
#### cssPresetEnv?

> 可选 | **cssPresetEnv**: `PresetEnvOptions`
#### autoprefixer?

> 可选 | **autoprefixer**: `WeappAutoprefixerOptions`
#### cssCalc?

> 可选 | **cssCalc**: `boolean | CssCalcOptions | (string | RegExp)[]`
#### atRules?

> 可选 | **atRules**: `{ property?: boolean | undefined; supports?: boolean | undefined; media?: boolean | undefined; }`
#### uniAppX?

> 可选 | **uniAppX**: `boolean`
#### uniAppXCssTarget?

> 可选 | **uniAppXCssTarget**: `"uvue"`
#### uniAppXUnsupported?

> 可选 | **uniAppXUnsupported**: `UniAppXUnsupportedMode`
#### majorVersion?

> 可选 | **majorVersion**: `number`
#### cssPreflightRange?

> 可选 | **cssPreflightRange**: `"all"`
#### cssChildCombinatorReplaceValue?

> 可选 | **cssChildCombinatorReplaceValue**: `string | string[]`
#### injectAdditionalCssVarScope?

> 可选 | **injectAdditionalCssVarScope**: `boolean`
#### cssSelectorReplacement?

> 可选 | **cssSelectorReplacement**: `{ root?: string | string[] | false | undefined; universal?: string | string[] | false | undefined; }`
#### rem2rpx?

> 可选 | **rem2rpx**: `boolean | Rem2rpxOptions`
#### px2rpx?

> 可选 | **px2rpx**: `boolean | Px2rpxOptions`
#### unitsToPx?

> 可选 | **unitsToPx**: `boolean | UnitsToPxOptions`
#### unitConversion?

> 可选 | **unitConversion**: `UnitConversionOptions`

***

### projectRoot?

> 可选 | **projectRoot**: `string`

***

### cwd?

> 可选 | **cwd**: `string`

***

### base?

> 可选 | **base**: `string`

***

### baseFallbacks?

> 可选 | **baseFallbacks**: `string[]`

***

### css?

> 可选 | **css**: `string`

***

### cssSources?

> 可选 | **cssSources**: `TailwindV4CssSource[]`

***

### cssEntries?

> 可选 | **cssEntries**: `string[]`

***

### packageName?

> 可选 | **packageName**: `string`
