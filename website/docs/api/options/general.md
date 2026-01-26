---
title: ⚙️ 一般配置
sidebar_label: ⚙️ 一般配置
sidebar_position: 4
---

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/index.ts:13](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/index.ts#L13)

本页收录 15 个配置项，来源于 `UserDefinedOptions`。

## 配置一览

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| [supportCustomLengthUnitsPatch](#supportcustomlengthunitspatch) | <code>boolean &#124; ILengthUnitsPatchOptions</code> | — | 控制 Tailwind 自定义长度单位补丁。 |
| [appType](#apptype) | <code>AppType</code> | — | 声明所使用的框架类型。 |
| [arbitraryValues](#arbitraryvalues) | <code>IArbitraryValues</code> | — | TailwindCSS 任意值的相关配置。 |
| [jsPreserveClass](#jspreserveclass) | <code>(keyword: string) => boolean &#124; undefined</code> | <code>保留所有带 `*` js字符串字面量</code> | 控制 JS 字面量是否需要保留。 |
| [replaceRuntimePackages](#replaceruntimepackages) | <code>boolean &#124; Record<string, string></code> | — | 是否替换运行时依赖包名。 |
| [disabledDefaultTemplateHandler](#disableddefaulttemplatehandler) | <code>boolean</code> | <code>false</code> | 禁用默认的 `wxml` 模板替换器。 |
| [tailwindcssBasedir](#tailwindcssbasedir) | <code>string</code> | — | 指定用于获取 Tailwind 上下文的路径。 |
| [cache](#cache) | <code>boolean &#124; ICreateCacheReturnType</code> | — | 控制缓存策略。 |
| [babelParserOptions](#babelparseroptions) | <code>(Partial<Options> & { cache?: boolean; cacheKey?: string; })</code> | — | `@babel/parser` 的配置选项。 |
| [cssChildCombinatorReplaceValue](#csschildcombinatorreplacevalue) | <code>string &#124; string[]</code> | <code>'view + view'</code> | 自定义 Tailwind 子组合器的替换值。 |
| [postcssOptions](#postcssoptions) | <code>Partial<Omit<import("/Users/yangqiming/Documents/GitHub/weapp-tailwindcss/node_modules/.pnpm/postcss-load-config@6.0.1_jiti@2.6.1_postcss@8.5.6_tsx@4.21.0_yaml@2.8.2/node_modules/postcss-load-config/src/index").Result, "file">></code> | — | `postcss` 的配置选项。 |
| [cssRemoveHoverPseudoClass](#cssremovehoverpseudoclass) | <code>boolean</code> | <code>`true`</code> | 是否移除 CSS 中的 `:hover` 选择器。 |
| [cssRemoveProperty](#cssremoveproperty) | <code>boolean</code> | <code>`true`</code> | 是否移除 `@property` 节点。 |
| [tailwindcssPatcherOptions](#tailwindcsspatcheroptions) | <code>TailwindcssPatchOptions</code> | — | 自定义 patcher 参数。 |
| [logLevel](#loglevel) | <code>"info" &#124; "warn" &#124; "error" &#124; "silent"</code> | — | 控制命令行日志输出级别。 |

## 详细说明

### supportCustomLengthUnitsPatch

> 可选 | 类型: `boolean | ILengthUnitsPatchOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:21](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L21)

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

### appType

> 可选 | 类型: `AppType`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:30](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L30)

声明所使用的框架类型。

#### 备注

用于辅助定位主要的 CSS bundle，以便默认的 `mainCssChunkMatcher` 做出更准确的匹配，未传入时将尝试自动猜测变量注入位置。

### arbitraryValues

> 可选 | 类型: `IArbitraryValues`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:37](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L37)

TailwindCSS 任意值的相关配置。

### jsPreserveClass

> 可选 | 类型: `(keyword: string) => boolean | undefined` | 默认值: `保留所有带 \`*\` js字符串字面量` | 版本: ^2.6.1

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:47](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L47)

控制 JS 字面量是否需要保留。

#### 备注

当 Tailwind 与 JS 字面量冲突时，可通过回调返回 `true` 保留当前值，返回 `false` 或 `undefined` 则继续转义。默认保留所有带 `*` 的字符串字面量。

#### 默认值

```ts
保留所有带 `*` js字符串字面量
```

#### 参数

##### keyword

`string`

#### 返回

`boolean | undefined`

### replaceRuntimePackages

> 可选 | 类型: `boolean | Record<string, string>`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:66](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L66)

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

### disabledDefaultTemplateHandler

> 可选 | 类型: `boolean` | 默认值: `false` | 版本: ^2.6.2

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:77](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L77)

禁用默认的 `wxml` 模板替换器。

#### 备注

启用后模板匹配完全交由 [`customAttributes`](/docs/api/options/important#customattributes) 管理，需要自行覆盖默认的 `class` / `hover-class` 等匹配规则。

#### 默认值

```ts
false
```

### tailwindcssBasedir

> 可选 | 类型: `string` | 版本: ^2.9.3

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:103](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L103)

指定用于获取 Tailwind 上下文的路径。

#### 备注

在 linked 或 monorepo 场景下可手动指向目标项目的 `package.json` 所在目录。

### cache

> 可选 | 类型: `boolean | ICreateCacheReturnType` | 版本: ^3.0.11

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:111](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L111)

控制缓存策略。

### babelParserOptions

> 可选 | 类型: `(Partial<Options> & { cache?: boolean; cacheKey?: string; })` | 版本: ^3.2.0

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:119](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L119)

`@babel/parser` 的配置选项。

### cssChildCombinatorReplaceValue

> 可选 | 类型: `string | string[]` | 默认值: `'view + view'`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:136](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L136)

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

### postcssOptions

> 可选 | 类型: `Partial<Omit<import("/Users/yangqiming/Documents/GitHub/weapp-tailwindcss/node_modules/.pnpm/postcss-load-config@6.0.1_jiti@2.6.1_postcss@8.5.6_tsx@4.21.0_yaml@2.8.2/node_modules/postcss-load-config/src/index").Result, "file">>` | 版本: ^3.2.0

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:144](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L144)

`postcss` 的配置选项。

### cssRemoveHoverPseudoClass

> 可选 | 类型: `boolean` | 默认值: `\`true\`` | 版本: ^3.2.1

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:155](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L155)

是否移除 CSS 中的 `:hover` 选择器。

#### 参阅

://github.com/sonofmagic/weapp-tailwindcss/issues/293

#### 备注

小程序不支持 `:hover`，需要使用组件的 `hover-class`，因此默认删除相关节点。

#### 默认值

`true`

### cssRemoveProperty

> 可选 | 类型: `boolean` | 默认值: `\`true\`` | 版本: ^4.1.2

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:165](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L165)

是否移除 `@property` 节点。

#### 备注

微信小程序可识别 `@property`，但支付宝暂不支持，默认移除以避免构建失败。

#### 默认值

`true`

### tailwindcssPatcherOptions

> 可选 | 类型: `TailwindcssPatchOptions`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:172](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L172)

自定义 patcher 参数。

### logLevel

> 可选 | 类型: `"info" | "warn" | "error" | "silent"`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/general.ts:180](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/general.ts#L180)

控制命令行日志输出级别。

#### 备注

默认 `info`，可设置为 `silent` 屏蔽全部输出。
