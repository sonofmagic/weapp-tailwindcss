---
title: WeappTailwindcssPostcssPluginOptions
description: WeappTailwindcssPostcssPluginOptions 的类型说明，列出公开属性、参数和使用边界。
keywords:
  - weapp-tailwindcss
  - API
  - 接口文档
  - 配置项
  - 小程序
  - tailwindcss
  - 微信小程序
  - WeappTailwindcssPostcssPluginOptions
  - WeappTailwindcssPostcssPluginOptions interface
  - WeappTailwindcssPostcssPluginOptions 类型定义
  - TypeScript
---

# WeappTailwindcssPostcssPluginOptions

## 属性

### generator?

> `optional` **generator**: `import("./generator").WeappTailwindcssGeneratorOptions`

#### target?

> `optional` **target**: `WeappTailwindcssGeneratorTarget`

生成目标。小程序构建默认使用 `weapp`，H5/Web 与普通 uni-app App WebView 默认使用 `web`。

##### 备注

`target` 表示 CSS 输出形态，不是平台枚举。uni-app x Android/iOS 这类原生 App 目标继续使用 `weapp` 输出族，
并通过 `uniAppX`、`platform` 与单位转换配置处理 App 差异。
#### config?

> `optional` **config**: `string`

Tailwind 配置文件路径，兼容原 Tailwind PostCSS 插件的 `config` 选项。
#### styleOptions?

> `optional` **styleOptions**: `Partial<IStyleHandlerOptions>`

传给小程序 CSS 兼容转换器的额外配置。
#### importFallback?

> `optional` **importFallback**: `boolean`

将 `@import "weapp-tailwindcss"` 作为 Tailwind CSS v4 生成入口的兜底别名。

适用于框架无法把 `@import "tailwindcss"` 改写到 `weapp-tailwindcss` 包入口的场景，默认开启。
#### tailwindcssV3Compatibility?

> `optional` **tailwindcssV3Compatibility**: `boolean`

Tailwind CSS v4 小程序生成模式默认注入 v3 默认值兼容层，保持升级前的视觉行为。

设为 `false` 时，完全使用 Tailwind CSS v4 原生默认值。

***

### version?

> `optional` **version**: `3 | 4`

***

### config?

> `optional` **config**: `string`

***

### postcssPlugin?

> `optional` **postcssPlugin**: `string`

***

### candidates?

> `optional` **candidates**: `Iterable<string>`

***

### scanSources?

> `optional` **scanSources**: `boolean | import("tailwindcss-patch").TailwindV4SourcePattern[]`

***

### sources?

> `optional` **sources**: `TailwindV4CandidateSource[]`

***

### styleOptions?

> `optional` **styleOptions**: `Partial<IStyleHandlerOptions>`

#### isMainChunk?

> `optional` **isMainChunk**: `boolean`
#### cssPreflight?

> `optional` **cssPreflight**: `CssPreflightOptions`
#### cssInjectPreflight()?

> `optional` **cssInjectPreflight()**: `InjectPreflight`
#### escapeMap?

> `optional` **escapeMap**: `Record<string, string>`
#### ctx?

> `optional` **ctx**: `{ variablesScopeWeakMap: WeakMap<object, any>; isVariablesScope: (rule: WeakKey) => boolean; markVariablesScope: (rule: WeakKey) => void; }`
#### platform?

> `optional` **platform**: `string`
#### postcssOptions?

> `optional` **postcssOptions**: `Partial<Omit<Result, "file">>`
#### cssRemoveProperty?

> `optional` **cssRemoveProperty**: `boolean`
#### cssRemoveHoverPseudoClass?

> `optional` **cssRemoveHoverPseudoClass**: `boolean`
#### cssPresetEnv?

> `optional` **cssPresetEnv**: `PresetEnvOptions`
#### autoprefixer?

> `optional` **autoprefixer**: `WeappAutoprefixerOptions`
#### cssCalc?

> `optional` **cssCalc**: `boolean | CssCalcOptions | (string | RegExp)[]`
#### atRules?

> `optional` **atRules**: `{ property?: boolean | undefined; supports?: boolean | undefined; media?: boolean | undefined; }`
#### uniAppX?

> `optional` **uniAppX**: `boolean`
#### uniAppXCssTarget?

> `optional` **uniAppXCssTarget**: `"uvue"`
#### uniAppXUnsupported?

> `optional` **uniAppXUnsupported**: `UniAppXUnsupportedMode`
#### majorVersion?

> `optional` **majorVersion**: `number`
#### cssPreflightRange?

> `optional` **cssPreflightRange**: `"all"`
#### cssChildCombinatorReplaceValue?

> `optional` **cssChildCombinatorReplaceValue**: `string | string[]`
#### injectAdditionalCssVarScope?

> `optional` **injectAdditionalCssVarScope**: `boolean`
#### cssSelectorReplacement?

> `optional` **cssSelectorReplacement**: `{ root?: string | string[] | false | undefined; universal?: string | string[] | false | undefined; }`
#### rem2rpx?

> `optional` **rem2rpx**: `boolean | Rem2rpxOptions`
#### px2rpx?

> `optional` **px2rpx**: `boolean | Px2rpxOptions`
#### unitsToPx?

> `optional` **unitsToPx**: `boolean | UnitsToPxOptions`
#### unitConversion?

> `optional` **unitConversion**: `UnitConversionOptions`

***

### projectRoot?

> `optional` **projectRoot**: `string`

***

### cwd?

> `optional` **cwd**: `string`

***

### base?

> `optional` **base**: `string`

***

### baseFallbacks?

> `optional` **baseFallbacks**: `string[]`

***

### css?

> `optional` **css**: `string`

***

### cssSources?

> `optional` **cssSources**: `TailwindV4CssSource[]`

***

### cssEntries?

> `optional` **cssEntries**: `string[]`

***

### packageName?

> `optional` **packageName**: `string`
