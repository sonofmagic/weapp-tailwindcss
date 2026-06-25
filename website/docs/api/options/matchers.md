---
title: "🧩 文件匹配"
sidebar_label: "🧩 文件匹配"
sidebar_position: 2
description: "🧩 文件匹配：7 个 UserDefinedOptions 配置项，包含类型、默认值和源码说明。"
keywords:
  - "weapp-tailwindcss"
  - "API"
  - "接口文档"
  - "配置项"
  - "小程序"
  - "tailwindcss"
  - "微信小程序"
  - "文件匹配"
  - "🧩 文件匹配"
  - "文件匹配 配置"
  - "插件参数"
---

本页收录 7 个配置项，来源于 `UserDefinedOptions`。

## 配置一览

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| [htmlMatcher](#htmlmatcher) | <code>(name: string) => boolean</code> | — | 匹配需要处理的 `wxml` 等模板文件。 |
| [cssMatcher](#cssmatcher) | <code>(name: string) => boolean</code> | — | 匹配需要处理的 `wxss` 等样式文件。 |
| [jsMatcher](#jsmatcher) | <code>(name: string) => boolean</code> | — | 匹配需要处理的编译后 `js` 文件。 |
| [transform](#transform) | <code>TransformOptions</code> | — | 控制哪些源码模块或产物需要进入 `weapp-tailwindcss` 转译流程。 |
| [mainCssChunkMatcher](#maincsschunkmatcher) | <code>(name: string, appType?: AppType) => boolean</code> | — | 声明负责承载 Tailwind CSS 全局变量作用域的 CSS Bundle。 |
| [wxsMatcher](#wxsmatcher) | <code>(name: string) => boolean</code> | <code>()=>false</code> | 匹配各端的 `wxs`/`sjs`/`.filter.js` 文件。 |
| [inlineWxs](#inlinewxs) | <code>boolean</code> | <code>false</code> | 是否转义 `wxml` 中的内联 `wxs`。 |

## 详细说明

### htmlMatcher

> 可选 | 类型: `(name: string) => boolean`

匹配需要处理的 `wxml` 等模板文件。

#### 参数

##### name

`string`

#### 返回

`boolean`

### cssMatcher

> 可选 | 类型: `(name: string) => boolean`

匹配需要处理的 `wxss` 等样式文件。

#### 参数

##### name

`string`

#### 返回

`boolean`

### jsMatcher

> 可选 | 类型: `(name: string) => boolean`

匹配需要处理的编译后 `js` 文件。

#### 参数

##### name

`string`

#### 返回

`boolean`

### transform

> 可选 | 类型: `TransformOptions`

控制哪些源码模块或产物需要进入 `weapp-tailwindcss` 转译流程。

#### 备注

该配置只影响 `weapp-tailwindcss` 的 HTML/CSS/JS 转译，不影响 Tailwind CSS `@source`/content token 扫描。
Vite 构建中 JS chunk 会基于 Rollup `moduleIds`/`modules` 判断源码模块；当一个 JS chunk 不满足 `include` 或所有源码模块都命中 `exclude` 时，跳过该 chunk 的 JS AST 转译。
HTML/CSS asset 会优先基于 Rollup `originalFileName`/`originalFileNames` 判断，缺失时使用输出文件名兜底。
`exclude` 优先级高于 `include`；多来源产物只有全部来源都命中 `exclude` 时才整体跳过。

#### 示例

```ts
transform: {
  include: ['src/**.{wxml,js,ts,vue,css,scss}'],
  exclude: ['src/generated/**', /\/openapi\//],
}
```

### mainCssChunkMatcher

> 可选 | 类型: `(name: string, appType?: AppType) => boolean`

声明负责承载 Tailwind CSS 全局变量作用域的 CSS Bundle。

#### 备注

默认不根据框架、平台或文件名推断主样式。需要主样式语义时，应由用户按当前构建图中的真实产物名显式返回 `true`。
可结合 `appType`、环境变量或框架配置自行区分不同端。

#### 参数

##### name

`string`

##### appType?

`AppType`

#### 返回

`boolean`

### wxsMatcher

> 可选 | 类型: `(name: string) => boolean` | 默认值: `()=>false`

匹配各端的 `wxs`/`sjs`/`.filter.js` 文件。

#### 备注

配置前请确保在 `tailwind.config.js` 的 `content` 中包含对应格式。

#### 默认值

```ts
()=>false
```

#### 参数

##### name

`string`

#### 返回

`boolean`

### inlineWxs

> 可选 | 类型: `boolean` | 默认值: `false`

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
