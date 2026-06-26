---
title: "✅ 重要配置"
sidebar_label: "✅ 重要配置"
sidebar_position: 1
description: "✅ 重要配置：7 个 UserDefinedOptions 配置项，包含类型、默认值和源码说明。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "重要配置"
  - "✅ 重要配置"
  - "重要配置 配置"
  - "插件参数"
---

本页收录 7 个配置项，来源于 `UserDefinedOptions`。

## 配置一览

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| [disabled](#disabled) | <code>boolean &#124; { plugin?: boolean &#124; undefined; }</code> | — | 是否禁用此插件。 |
| [customAttributes](#customattributes) | <code>ICustomAttributes</code> | — | 自定义 `wxml` 标签属性的转换规则。 |
| [customReplaceDictionary](#customreplacedictionary) | <code>Record<string, string></code> | <code>MappingChars2String</code> | 自定义 class 名称的替换字典。 |
| [ignoreTaggedTemplateExpressionIdentifiers](#ignoretaggedtemplateexpressionidentifiers) | <code>(string &#124; RegExp)[]</code> | <code>['weappTwIgnore']</code> | 忽略指定标签模板表达式中的标识符。 |
| [ignoreCallExpressionIdentifiers](#ignorecallexpressionidentifiers) | <code>(string &#124; RegExp)[]</code> | — | 忽略指定调用表达式中的标识符。 |
| [tailwindcss](#tailwindcss) | <code>import("@/tailwindcss/runtime-types").TailwindCssOptions</code> | — | 为不同版本的 Tailwind 配置行为。 |
| [cssEntries](#cssentries) | <code>string[]</code> | — | 指定 tailwindcss@4 的入口 CSS。 |

## 详细说明

### disabled

> 可选 | 类型: `boolean | { plugin?: boolean | undefined; }`

是否禁用此插件。

#### 备注

在多平台构建场景下常用：小程序构建保持默认，非小程序环境（H5、App）传入 `true` 即可跳过转换。

#### 示例

```ts
// uni-app vue3 vite
import process from 'node:process'

const isH5 = process.env.UNI_PLATFORM === 'h5'
const isApp = process.env.UNI_PLATFORM === 'app'
const disabled = isH5 || isApp

import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

WeappTailwindcss({
  disabled,
})
```

### customAttributes

> 可选 | 类型: `ICustomAttributes`

自定义 `wxml` 标签属性的转换规则。

#### 备注

默认会转换所有标签上的 `class` 与 `hover-class`。此配置允许通过 `Map` 或对象为特定标签指定需要转换的属性字符串或正则表达式数组。
- 使用 `'*'` 作为键可为所有标签追加通用规则。
- 支持传入 `Map<string | RegExp, (string | RegExp)[]>` 以满足复杂匹配需求。
- 常见场景包括通过组件 `prop` 传递类名，或对三方组件的自定义属性做匹配，更多讨论见 [issue#129](https://github.com/sonofmagic/weapp-tailwindcss/issues/129#issuecomment-1340914688) 与 [issue#134](https://github.com/sonofmagic/weapp-tailwindcss/issues/134#issuecomment-1351288238)。
如果自定义规则已经覆盖默认的 `class`/`hover-class`，可开启 [`disabledDefaultTemplateHandler`](/docs/api/options/general#disableddefaulttemplatehandler) 以关闭内置模板处理器。

#### 示例

```js
const customAttributes = {
  '*': [/[A-Za-z]?[A-Za-z-]*[Cc]lass/],
  'van-image': ['custom-class'],
  'ice-button': ['testClass'],
}
```

### customReplaceDictionary

> 可选 | 类型: `Record<string, string>` | 默认值: `MappingChars2String`

自定义 class 名称的替换字典。

#### 备注

默认策略会将小程序不允许的字符映射为等长度的替代字符串，因此无法通过结果反推出原始类名。如需完全自定义，可传入 `Record<string, string>`，只需确保生成的类名不会与已有样式冲突。示例参考 [dic.ts](https://github.com/sonofmagic/weapp-core/blob/main/packages/escape/src/dic.ts)。

#### 默认值

```ts
MappingChars2String
```

### ignoreTaggedTemplateExpressionIdentifiers

> 可选 | 类型: `(string | RegExp)[]` | 默认值: `['weappTwIgnore']` | 版本: ^4.0.0

忽略指定标签模板表达式中的标识符。

#### 备注

当模板字符串被这些标识符包裹时，将跳过转义处理。

#### 默认值

```ts
['weappTwIgnore']
```

### ignoreCallExpressionIdentifiers

> 可选 | 类型: `(string | RegExp)[]` | 版本: ^4.0.0

忽略指定调用表达式中的标识符。

#### 备注

使用这些方法包裹的模板字符串或字符串字面量会跳过转义，常与 `@weapp-tailwindcss/merge` 配合（如 `['twMerge', 'twJoin', 'cva']`）。

### tailwindcss

> 可选 | 类型: `import("@/tailwindcss/runtime-types").TailwindCssOptions` | 版本: ^4.0.0

为不同版本的 Tailwind 配置行为。

### cssEntries

> 可选 | 类型: `string[]` | 版本: ^4.2.6

指定 tailwindcss@4 的入口 CSS。

#### 备注

等价于设置 `tailwindcss.v4.cssEntries`。Tailwind CSS 4 项目推荐显式配置入口 CSS 的绝对路径；多入口、分包、独立分包、Webpack/Gulp/自定义构建和多平台构建都应该写清楚这些入口。`cssEntries` 只负责入口识别，入口样式文件仍然要被项目实际 import 或纳入构建图。

虽然类型上是可选项，运行时也会尽力从构建图自动发现入口，但这不适合作为长期配置契约。显式配置可以避免某些平台产物名、CSS 合并策略或分包输出差异导致 Tailwind CSS 生成不完整。
