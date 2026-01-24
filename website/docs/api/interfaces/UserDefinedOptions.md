# 接口: UserDefinedOptions

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/index.ts:13](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/index.ts#L13)

## 0.重要配置

### disabled?

> `optional` **disabled**: `boolean | DisabledOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:36](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L36)

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

***

### customAttributes?

> `optional` **customAttributes**: `ICustomAttributes`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:57](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L57)

自定义 `wxml` 标签属性的转换规则。

#### 备注

默认会转换所有标签上的 `class` 与 `hover-class`。此配置允许通过 `Map` 或对象为特定标签指定需要转换的属性字符串或正则表达式数组。
- 使用 `'*'` 作为键可为所有标签追加通用规则。
- 支持传入 `Map<string | RegExp, (string | RegExp)[]>` 以满足复杂匹配需求。
- 常见场景包括通过组件 `prop` 传递类名，或对三方组件的自定义属性做匹配，更多讨论见 [issue#129](https://github.com/sonofmagic/weapp-tailwindcss/issues/129#issuecomment-1340914688) 与 [issue#134](https://github.com/sonofmagic/weapp-tailwindcss/issues/134#issuecomment-1351288238)。
如果自定义规则已经覆盖默认的 `class`/`hover-class`，可开启 [`disabledDefaultTemplateHandler`](/docs/api/interfaces/UserDefinedOptions#disableddefaulttemplatehandler) 以关闭内置模板处理器。

#### 示例

```js
const customAttributes = {
  '*': [/[A-Za-z]?[A-Za-z-]*[Cc]lass/],
  'van-image': ['custom-class'],
  'ice-button': ['testClass'],
}
```

***

### customReplaceDictionary?

> `optional` **customReplaceDictionary**: `Record<string, string>`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:66](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L66)

自定义 class 名称的替换字典。

#### 备注

默认策略会将小程序不允许的字符映射为等长度的替代字符串，因此无法通过结果反推出原始类名。如需完全自定义，可传入 `Record<string, string>`，只需确保生成的类名不会与已有样式冲突。示例参考 [dic.ts](https://github.com/sonofmagic/weapp-core/blob/main/packages/escape/src/dic.ts)。

#### 默认值

```ts
MappingChars2String
```

***

### ignoreTaggedTemplateExpressionIdentifiers?

> `optional` **ignoreTaggedTemplateExpressionIdentifiers**: `(string | RegExp)[]`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:77](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L77)

忽略指定标签模板表达式中的标识符。

#### 添加于

^4.0.0

#### 备注

当模板字符串被这些标识符包裹时，将跳过转义处理。

#### 默认值

```ts
['weappTwIgnore']
```

***

### ignoreCallExpressionIdentifiers?

> `optional` **ignoreCallExpressionIdentifiers**: `(string | RegExp)[]`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:86](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L86)

忽略指定调用表达式中的标识符。

#### 添加于

^4.0.0

#### 备注

使用这些方法包裹的模板字符串或字符串字面量会跳过转义，常与 `@weapp-tailwindcss/merge` 配合（如 `['twMerge', 'twJoin', 'cva']`）。

***

### cssPreflight?

> `optional` **cssPreflight**: `CssPreflightOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:115](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L115)

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

***

### cssPreflightRange?

> `optional` **cssPreflightRange**: `"all"`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:124](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L124)

控制 `cssPreflight` 注入的 DOM 选择器范围。

#### 参阅

://github.com/sonofmagic/weapp-tailwindcss/pull/62

#### 备注

仅 `view`、`text` 及其伪元素会受影响。设置为 `'all'` 可以覆盖所有元素，此时需自行处理与宿主默认样式的冲突。

***

### cssCalc?

> `optional` **cssCalc**: `boolean | (string | RegExp)[] | CssCalcOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:157](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L157)

预计算 CSS 变量或 `calc` 表达式的结果。

#### 添加于

^4.3.0

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

***

### injectAdditionalCssVarScope?

> `optional` **injectAdditionalCssVarScope**: `boolean`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:168](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L168)

是否额外注入 `tailwindcss css var scope`。

#### 添加于

^2.6.0

#### 备注

当构建链路（例如 `@tarojs/plugin-html`）移除了包含 `*` 的选择器时，可启用该选项重新写入变量作用域，以避免渐变等功能失效。

#### 默认值

```ts
false
```

***

### rewriteCssImports?

> `optional` **rewriteCssImports**: `boolean`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:177](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L177)

是否在 webpack/vite 阶段自动把 CSS 中的 `@import 'tailwindcss'` 映射为 `weapp-tailwindcss`。

#### 备注

开启后打包链路只会在处理样式时拦截 `tailwindcss` 的导入路径（JS/TS `import 'tailwindcss'` 不会被修改），让源码可以继续写 `@import 'tailwindcss';`，同时输出 weapp-tailwindcss 的样式。传入 `false` 可完全关闭该行为。

#### 默认值

```ts
true
```

***

### cssSelectorReplacement?

> `optional` **cssSelectorReplacement**: `{ root?: string | string[] | false; universal?: string | string[] | false; }`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:183](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L183)

控制 CSS 选择器的替换规则。

#### 默认值

`ts 'page'` |
| `universal?` | `string` \| `false` | **`Default`** `ts 'view'` |

***

### rem2rpx?

> `optional` **rem2rpx**: `boolean | Rem2rpxOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:219](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L219)

rem 到 rpx 的转换配置。

#### 添加于

^3.0.0

#### 备注

传入 `true` 使用默认配置，或提供 [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel) 支持的完整选项。
```ts
{
  rootValue: 32,
  propList: ['*'],
  transformUnit: 'rpx',
}
```

***

### px2rpx?

> `optional` **px2rpx**: `boolean | Px2rpxOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:228](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L228)

px 到 rpx 的转换配置。

#### 添加于

^4.3.0

#### 备注

传入 `true` 启用默认映射（`1px = 1rpx`），或通过对象自定义更多行为。

***

### cssPresetEnv?

> `optional` **cssPresetEnv**: `PresetEnvOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:238](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L238)

`postcss-preset-env` 的配置项。

#### 添加于

^4.0.0

#### 参阅

- ://preset-env.cssdb.org/
- ://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env#readme

***

### tailwindcss?

> `optional` **tailwindcss**: `TailwindUserOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:246](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L246)

为不同版本的 Tailwind 配置行为。

#### 添加于

^4.0.0

***

### cssEntries?

> `optional` **cssEntries**: `string[]`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:256](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L256)

指定 tailwindcss@4 的入口 CSS。

#### 添加于

^4.2.6

#### 备注

未配置时无法加载自定义插件，等价于设置 `tailwindcss.v4.cssEntries`。

***

### uniAppX?

> `optional` **uniAppX**: `boolean`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/important.ts:264](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/important.ts#L264)

配置 uni-app x 场景的行为。

#### 添加于

^4.2.0

## 1.文件匹配

### htmlMatcher?

> `optional` **htmlMatcher**: `((name: string) => boolean)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:9](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L9)

匹配需要处理的 `wxml` 等模板文件。

***

### cssMatcher?

> `optional` **cssMatcher**: `((name: string) => boolean)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:15](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L15)

匹配需要处理的 `wxss` 等样式文件。

***

### jsMatcher?

> `optional` **jsMatcher**: `((name: string) => boolean)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:21](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L21)

匹配需要处理的编译后 `js` 文件。

***

### mainCssChunkMatcher?

> `optional` **mainCssChunkMatcher**: `((name: string, appType?: AppType) => boolean)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:29](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L29)

匹配负责注入 Tailwind CSS 变量作用域的 CSS Bundle。

#### 备注

在处理 `::before`/`::after` 等不兼容选择器时，建议手动指定文件位置。

***

### wxsMatcher?

> `optional` **wxsMatcher**: `((name: string) => boolean)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:40](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L40)

匹配各端的 `wxs`/`sjs`/`.filter.js` 文件。

#### 备注

配置前请确保在 `tailwind.config.js` 的 `content` 中包含对应格式。

#### 默认值

```ts
()=>false
```

***

### inlineWxs?

> `optional` **inlineWxs**: `boolean`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:65](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L65)

是否转义 `wxml` 中的内联 `wxs`。

#### 备注

使用前同样需要在 `tailwind.config.js` 中声明 `wxs` 格式。

#### 默认值

```ts
false
```

#### 示例

```html
<!-- index.wxml -->
<wxs module="inline">
// 我是内联wxs
// 下方的类名会被转义
var className = "after:content-['我是className']"
module.exports = {
className: className
}
</wxs>
<wxs src="./index.wxs" module="outside"/>
<view><view class="{{inline.className}}"></view><view class="{{outside.className}}"></view></view>
```

## 2.生命周期

### onLoad?

> `optional` **onLoad**: `(() => void)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts:7](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts#L7)

插件 `apply` 初始调用时触发。

***

### onStart?

> `optional` **onStart**: `(() => void)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts:13](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts#L13)

开始处理前触发。

***

### onUpdate?

> `optional` **onUpdate**: `((filename: string, oldVal: string, newVal: string) => void)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts:19](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts#L19)

匹配并修改文件后触发。

***

### onEnd?

> `optional` **onEnd**: `(() => void)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts:25](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/lifecycle.ts#L25)

结束处理时触发。

## 3.一般配置

### supportCustomLengthUnitsPatch?

> `optional` **supportCustomLengthUnitsPatch**: `boolean | ILengthUnitsPatchOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:21](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L21)

控制 Tailwind 自定义长度单位补丁。

#### 参阅

://github.com/sonofmagic/weapp-tailwindcss/issues/110

#### 备注

TailwindCSS 3.2.0 起对任意值执行长度单位校验，会将未声明的 `rpx` 识别为颜色。本选项默认开启以注入 `rpx` 支持。当 Node.js 在插件执行前已缓存 `tailwindcss` 模块时，首轮运行可能未生效，可通过在 `postinstall` 中执行 `weapp-tw patch` 提前打补丁。
```diff
"scripts": {
+  "postinstall": "weapp-tw patch"
}
```

***

### appType?

> `optional` **appType**: `AppType`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:30](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L30)

声明所使用的框架类型。

#### 备注

用于辅助定位主要的 CSS bundle，以便默认的 `mainCssChunkMatcher` 做出更准确的匹配，未传入时将尝试自动猜测变量注入位置。

***

### arbitraryValues?

> `optional` **arbitraryValues**: `IArbitraryValues`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:37](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L37)

TailwindCSS 任意值的相关配置。

***

### jsPreserveClass?

> `optional` **jsPreserveClass**: `((keyword: string) => boolean | undefined)`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:47](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L47)

控制 JS 字面量是否需要保留。

#### 添加于

^2.6.1

#### 备注

当 Tailwind 与 JS 字面量冲突时，可通过回调返回 `true` 保留当前值，返回 `false` 或 `undefined` 则继续转义。默认保留所有带 `*` 的字符串字面量。

#### 默认值

```ts
保留所有带 `*` js字符串字面量
```

***

### replaceRuntimePackages?

> `optional` **replaceRuntimePackages**: `boolean | Record<string, string>`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:66](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L66)

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

***

### disabledDefaultTemplateHandler?

> `optional` **disabledDefaultTemplateHandler**: `boolean`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:77](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L77)

禁用默认的 `wxml` 模板替换器。

#### 添加于

^2.6.2

#### 备注

启用后模板匹配完全交由 [`customAttributes`](/docs/api/interfaces/UserDefinedOptions#customattributes) 管理，需要自行覆盖默认的 `class` / `hover-class` 等匹配规则。

#### 默认值

```ts
false
```

***

### tailwindcssBasedir?

> `optional` **tailwindcssBasedir**: `string`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:103](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L103)

指定用于获取 Tailwind 上下文的路径。

#### 添加于

^2.9.3

#### 备注

在 linked 或 monorepo 场景下可手动指向目标项目的 `package.json` 所在目录。

***

### cache?

> `optional` **cache**: `boolean | ICreateCacheReturnType`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:111](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L111)

控制缓存策略。

#### 添加于

^3.0.11

***

### babelParserOptions?

> `optional` **babelParserOptions**: `(Partial<Options> & { cache?: boolean; cacheKey?: string; })`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:119](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L119)

`@babel/parser` 的配置选项。

#### 添加于

^3.2.0

***

### cssChildCombinatorReplaceValue?

> `optional` **cssChildCombinatorReplaceValue**: `string | string[]`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:136](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L136)

自定义 Tailwind 子组合器的替换值。

#### 备注

为兼容小程序缺乏 `:not([hidden])~` 支持的限制，默认会将 `.space-x-4` 等选择器替换为 `view + view`。可传入字符串或字符串数组以扩展适用标签。
```css
// 数组示例
.space-y-4>view + view,text + text{}

// 字符串示例
.space-y-4>view,text,button,input ~ view,text,button,input{}
```

#### 默认值

```ts
'view + view'
```

***

### postcssOptions?

> `optional` **postcssOptions**: `Partial<Omit<import("/Users/yangqiming/Documents/GitHub/weapp-tailwindcss/node_modules/.pnpm/postcss-load-config@6.0.1_jiti@2.6.1_postcss@8.5.6_tsx@4.21.0_yaml@2.8.2/node_modules/postcss-load-config/src/index").Result, "file">>`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:144](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L144)

`postcss` 的配置选项。

#### 添加于

^3.2.0

***

### cssRemoveHoverPseudoClass?

> `optional` **cssRemoveHoverPseudoClass**: `boolean`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:155](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L155)

是否移除 CSS 中的 `:hover` 选择器。

#### 添加于

^3.2.1

#### 参阅

://github.com/sonofmagic/weapp-tailwindcss/issues/293

#### 备注

小程序不支持 `:hover`，需要使用组件的 `hover-class`，因此默认删除相关节点。

#### 默认值

`true`

***

### cssRemoveProperty?

> `optional` **cssRemoveProperty**: `boolean`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:165](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L165)

是否移除 `@property` 节点。

#### 添加于

^4.1.2

#### 备注

微信小程序可识别 `@property`，但支付宝暂不支持，默认移除以避免构建失败。

#### 默认值

`true`

***

### tailwindcssPatcherOptions?

> `optional` **tailwindcssPatcherOptions**: `TailwindcssPatchOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:172](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L172)

自定义 patcher 参数。

***

### logLevel?

> `optional` **logLevel**: `"info" | "warn" | "error" | "silent"`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:180](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L180)

控制命令行日志输出级别。

#### 备注

默认 `info`，可设置为 `silent` 屏蔽全部输出。

## 属性

### runtimeLoaderPath?

> `optional` **runtimeLoaderPath**: `string`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:85](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L85)

内部使用的运行时加载器路径。

***

### runtimeCssImportRewriteLoaderPath?

> `optional` **runtimeCssImportRewriteLoaderPath**: `string`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:93](https://github.com/sonofmagic/weapp-tailwindcss/blob/466e1a6d3054938750559124e17bc11a577953a0/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L93)

内部使用的 CSS import 重写加载器路径。
