---
title: 🧩 文件匹配
sidebar_label: 🧩 文件匹配
sidebar_position: 2
---

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/index.ts:13](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/index.ts#L13)

本页收录 6 个配置项，来源于 `UserDefinedOptions`。

## 配置一览

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| [htmlMatcher](#htmlmatcher) | <code>(name: string) => boolean</code> | — | 匹配需要处理的 `wxml` 等模板文件。 |
| [cssMatcher](#cssmatcher) | <code>(name: string) => boolean</code> | — | 匹配需要处理的 `wxss` 等样式文件。 |
| [jsMatcher](#jsmatcher) | <code>(name: string) => boolean</code> | — | 匹配需要处理的编译后 `js` 文件。 |
| [mainCssChunkMatcher](#maincsschunkmatcher) | <code>(name: string, appType?: AppType) => boolean</code> | — | 匹配负责注入 Tailwind CSS 变量作用域的 CSS Bundle。 |
| [wxsMatcher](#wxsmatcher) | <code>(name: string) => boolean</code> | <code>()=>false</code> | 匹配各端的 `wxs`/`sjs`/`.filter.js` 文件。 |
| [inlineWxs](#inlinewxs) | <code>boolean</code> | <code>false</code> | 是否转义 `wxml` 中的内联 `wxs`。 |

## 详细说明

### htmlMatcher

> 可选 | 类型: `(name: string) => boolean`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:9](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L9)

匹配需要处理的 `wxml` 等模板文件。

#### 参数

##### name

`string`

#### 返回

`boolean`

### cssMatcher

> 可选 | 类型: `(name: string) => boolean`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:15](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L15)

匹配需要处理的 `wxss` 等样式文件。

#### 参数

##### name

`string`

#### 返回

`boolean`

### jsMatcher

> 可选 | 类型: `(name: string) => boolean`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:21](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L21)

匹配需要处理的编译后 `js` 文件。

#### 参数

##### name

`string`

#### 返回

`boolean`

### mainCssChunkMatcher

> 可选 | 类型: `(name: string, appType?: AppType) => boolean`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:29](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L29)

匹配负责注入 Tailwind CSS 变量作用域的 CSS Bundle。

#### 备注

在处理 `::before`/`::after` 等不兼容选择器时，建议手动指定文件位置。

#### 参数

##### name

`string`

##### appType?

`AppType`

#### 返回

`boolean`

### wxsMatcher

> 可选 | 类型: `(name: string) => boolean` | 默认值: `()=>false`

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:40](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L40)

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

定义于: [packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts:65](https://github.com/sonofmagic/weapp-tailwindcss/blob/59073fec6f66bb3fbd1d15468f6e89437dc3f862/packages/weapp-tailwindcss/src/types/user-defined-options/matcher.ts#L65)

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
