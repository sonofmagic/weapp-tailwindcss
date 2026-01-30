---
title: ✅ 重要配置
sidebar_label: ✅ 重要配置
sidebar_position: 1
---

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/index.ts:13](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/index.ts#L13)

本页收录 16 个配置项，来源于 `UserDefinedOptions`。

## 配置一览

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| [disabled](#disabled) | <code>boolean &#124; DisabledOptions</code> | — | 是否禁用此插件。 |
| [customAttributes](#customattributes) | <code>ICustomAttributes</code> | — | 自定义 `wxml` 标签属性的转换规则。 |
| [customReplaceDictionary](#customreplacedictionary) | <code>Record<string, string></code> | <code>MappingChars2String</code> | 自定义 class 名称的替换字典。 |
| [ignoreTaggedTemplateExpressionIdentifiers](#ignoretaggedtemplateexpressionidentifiers) | <code>(string &#124; RegExp)[]</code> | <code>['weappTwIgnore']</code> | 忽略指定标签模板表达式中的标识符。 |
| [ignoreCallExpressionIdentifiers](#ignorecallexpressionidentifiers) | <code>(string &#124; RegExp)[]</code> | — | 忽略指定调用表达式中的标识符。 |
| [cssPreflight](#csspreflight) | <code>CssPreflightOptions</code> | — | 控制在视图节点上注入的 CSS 预设。 |
| [cssPreflightRange](#csspreflightrange) | <code>"all"</code> | — | 控制 `cssPreflight` 注入的 DOM 选择器范围。 |
| [cssCalc](#csscalc) | <code>boolean &#124; (string &#124; RegExp)[] &#124; CssCalcOptions</code> | — | 预计算 CSS 变量或 `calc` 表达式的结果。 |
| [injectAdditionalCssVarScope](#injectadditionalcssvarscope) | <code>boolean</code> | <code>false</code> | 是否额外注入 `tailwindcss css var scope`。 |
| [rewriteCssImports](#rewritecssimports) | <code>boolean</code> | <code>true</code> | 是否在 webpack/vite 阶段自动把 CSS 中的 `@import 'tailwindcss'` 映射为 `weapp-tailwindcss`。 |
| [cssSelectorReplacement](#cssselectorreplacement) | <code>{ root?: string &#124; string[] &#124; false; universal?: string &#124; string[] &#124; false; }</code> | 详见下方 | 控制 CSS 选择器的替换规则。 |
| [rem2rpx](#rem2rpx) | <code>boolean &#124; Rem2rpxOptions</code> | — | rem 到 rpx 的转换配置。 |
| [px2rpx](#px2rpx) | <code>boolean &#124; Px2rpxOptions</code> | — | px 到 rpx 的转换配置。 |
| [cssPresetEnv](#csspresetenv) | <code>PresetEnvOptions</code> | — | `postcss-preset-env` 的配置项。 |
| [tailwindcss](#tailwindcss) | <code>TailwindUserOptions</code> | — | 为不同版本的 Tailwind 配置行为。 |
| [cssEntries](#cssentries) | <code>string[]</code> | — | 指定 tailwindcss@4 的入口 CSS。 |

## 详细说明

### disabled

> 可选 | 类型: `boolean | DisabledOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:36](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L36)

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

import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'

uvtw({
  disabled,
})
```

### customAttributes

> 可选 | 类型: `ICustomAttributes`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:57](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L57)

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

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:66](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L66)

自定义 class 名称的替换字典。

#### 备注

默认策略会将小程序不允许的字符映射为等长度的替代字符串，因此无法通过结果反推出原始类名。如需完全自定义，可传入 `Record<string, string>`，只需确保生成的类名不会与已有样式冲突。示例参考 [dic.ts](https://github.com/sonofmagic/weapp-core/blob/main/packages/escape/src/dic.ts)。

#### 默认值

```ts
MappingChars2String
```

### ignoreTaggedTemplateExpressionIdentifiers

> 可选 | 类型: `(string | RegExp)[]` | 默认值: `['weappTwIgnore']` | 版本: ^4.0.0

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:77](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L77)

忽略指定标签模板表达式中的标识符。

#### 备注

当模板字符串被这些标识符包裹时，将跳过转义处理。

#### 默认值

```ts
['weappTwIgnore']
```

### ignoreCallExpressionIdentifiers

> 可选 | 类型: `(string | RegExp)[]` | 版本: ^4.0.0

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:86](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L86)

忽略指定调用表达式中的标识符。

#### 备注

使用这些方法包裹的模板字符串或字符串字面量会跳过转义，常与 `@weapp-tailwindcss/merge` 配合（如 `['twMerge', 'twJoin', 'cva']`）。

### cssPreflight

> 可选 | 类型: `CssPreflightOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:115](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L115)

控制在视图节点上注入的 CSS 预设。

#### 参阅

://github.com/sonofmagic/weapp-tailwindcss/issues/7

#### 备注

默认会向所有 `view`/`text` 元素注入 Tailwind 风格的基础样式，可通过此配置禁用、调整或补充规则，受 `cssPreflightRange` 影响。

#### 示例

```js
cssPreflight: {
  'box-sizing': 'border-box',
  'border-width': '0',
  'border-style': 'solid',
  'border-color': 'currentColor',
}

cssPreflight: false

cssPreflight: {
  'box-sizing': false,
  background: 'black',
}
```

### cssPreflightRange

> 可选 | 类型: `"all"`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:124](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L124)

控制 `cssPreflight` 注入的 DOM 选择器范围。

#### 参阅

://github.com/sonofmagic/weapp-tailwindcss/pull/62

#### 备注

仅 `view`、`text` 及其伪元素会受影响。设置为 `'all'` 可以覆盖所有元素，此时需自行处理与宿主默认样式的冲突。

### cssCalc

> 可选 | 类型: `boolean | (string | RegExp)[] | CssCalcOptions` | 版本: ^4.3.0

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:157](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L157)

预计算 CSS 变量或 `calc` 表达式的结果。

#### 备注

解决部分机型对 `calc` 计算不一致的问题，可传入布尔值、选项对象或自定义匹配列表（支持正则）。在启用计算后，可通过 `includeCustomProperties` 指定需要保留的变量。

#### 示例

```css
// 原始输出
page,
:root {
  --spacing: 8rpx;
}
.h-2 {
  height: calc(var(--spacing) * 2);
}
```

```css
// 启用 cssCalc 后
.h-2 {
  height: 16rpx;
  height: calc(var(--spacing) * 2);
}
```

```js
cssCalc: ['--spacing']
cssCalc: { includeCustomProperties: ['--spacing'] }
```

### injectAdditionalCssVarScope

> 可选 | 类型: `boolean` | 默认值: `false` | 版本: ^2.6.0

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:168](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L168)

是否额外注入 `tailwindcss css var scope`。

#### 备注

当构建链路（例如 `@tarojs/plugin-html`）移除了包含 `*` 的选择器时，可启用该选项重新写入变量作用域，以避免渐变等功能失效。

#### 默认值

```ts
false
```

### rewriteCssImports

> 可选 | 类型: `boolean` | 默认值: `true`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:177](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L177)

是否在 webpack/vite 阶段自动把 CSS 中的 `@import 'tailwindcss'` 映射为 `weapp-tailwindcss`。

#### 备注

开启后打包链路只会在处理样式时拦截 `tailwindcss` 的导入路径（JS/TS `import 'tailwindcss'` 不会被修改），让源码可以继续写 `@import 'tailwindcss';`，同时输出 weapp-tailwindcss 的样式。传入 `false` 可完全关闭该行为。

#### 默认值

```ts
true
```

### cssSelectorReplacement

> 可选 | 类型: `{ root?: string | string[] | false; universal?: string | string[] | false; }` | 默认值: 详见下方

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:183](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L183)

控制 CSS 选择器的替换规则。

#### 默认值

```ts
{
  root: ['page', '.tw-root', 'wx-root-portal-content'],
  universal: ['view', 'text'],
}
```

#### root

用于替换 CSS 中的 `:root` 选择器，决定 Tailwind `--tw-*` 变量的作用域。支持 `string | string[] | false`：

- `false`：不替换 `:root`。
- `string` / `string[]`：将 `:root` 展开为对应选择器列表。

默认包含 `['page', '.tw-root', 'wx-root-portal-content']`。其中 `.tw-root` 用于“自定义根容器”场景：只需在容器节点上加 `class="tw-root"`，即可复用变量作用域，无需额外配置；`wx-root-portal-content` 用于覆盖 RootPortal 等根容器。

**RootPortal/弹层容器场景**

当 `RootPortal` 或类似根容器无法继承 `app.wxss` 里挂在 `page` 下的变量时，可将容器选择器追加到 `root` 中，让 Tailwind 变量在该容器内生效：

```ts
cssSelectorReplacement: {
  root: ['page', '.tw-root', 'wx-root-portal-content'],
}
```

#### universal

用于替换 CSS 中的通配选择器 `*`。小程序环境普遍不支持 `*`，因此默认替换为 `['view', 'text']`。

- `false`：保留 `*`（仅在宿主支持通配选择器时使用）。
- `string` / `string[]`：将 `*` 展开为更多标签/组件（例如需要覆盖自定义组件或更多基础组件时）。

### rem2rpx

> 可选 | 类型: `boolean | Rem2rpxOptions` | 版本: ^3.0.0

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:219](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L219)

rem 到 rpx 的转换配置。

#### 备注

传入 `true` 使用默认配置，或提供 [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel) 支持的完整选项。
```ts
{
  rootValue: 32,
  propList: ['*'],
  transformUnit: 'rpx',
}
```

### px2rpx

> 可选 | 类型: `boolean | Px2rpxOptions` | 版本: ^4.3.0

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:228](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L228)

px 到 rpx 的转换配置。

#### 备注

传入 `true` 启用默认映射（`1px = 1rpx`），或通过对象自定义更多行为。

### cssPresetEnv

> 可选 | 类型: `PresetEnvOptions` | 版本: ^4.0.0

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:238](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L238)

`postcss-preset-env` 的配置项。

#### 参阅

- ://preset-env.cssdb.org/
- ://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#readme

### tailwindcss

> 可选 | 类型: `TailwindUserOptions` | 版本: ^4.0.0

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:246](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L246)

为不同版本的 Tailwind 配置行为。

### cssEntries

> 可选 | 类型: `string[]` | 版本: ^4.2.6

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:256](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L256)

指定 tailwindcss@4 的入口 CSS。

#### 备注

未配置时无法加载自定义插件，等价于设置 `tailwindcss.v4.cssEntries`。
