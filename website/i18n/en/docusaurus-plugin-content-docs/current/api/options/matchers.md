---
title: 🧩 File matching
sidebar_label: 🧩 File matching
sidebar_position: 2
description: '🧩 File matching: 7 UserDefinedOptions configuration items, including type, default value and source code description.'
keywords:
  - weapp-tailwindcss
  - API
  - Interface documentation
  - Configuration items
  - Mini program
  - tailwindcss
  - WeChat applet
  - file match
  - 🧩 File matching
  - File matching configuration
  - Plug-in parameters
---

This page contains 7 configuration items, sourced from `UserDefinedOptions`.

## Configuration overview

| Configuration item                          | Type                                   | Default value            | Description                                                                                              |
| ------------------------------------------- | -------------------------------------- | ------------------------ | -------------------------------------------------------------------------------------------------------- |
| [htmlMatcher](#htmlmatcher)                 | <code>(name: string) => boolean</code> | —                        | Match template files such as `wxml` that need to be processed.                                           |
| [cssMatcher](#cssmatcher)                   | <code>(name: string) => boolean</code> | —                        | Match style files such as `wxss` that need to be processed.                                              |
| [jsMatcher](#jsmatcher)                     | <code>(name: string) => boolean</code> | —                        | Match compiled `js` files that need to be processed.                                                     |
| [transform](#transform)                     | <code>TransformOptions</code>          | —                        | Control which source code modules or products need to enter the `weapp-tailwindcss` translation process. |
| [mainCssChunkMatcher](#maincsschunkmatcher) |                                        |
| [wxsMatcher](#wxsmatcher)                   | <code>(name: string) => boolean</code> | <code>() => false</code> | Match `wxs`/`sjs`/`.filter.js` files.                                                                    |
| [inlineWxs](#inlinewxs)                     | <code>boolean</code>                   | <code>false</code>       | Whether to escape inline `wxs` in `wxml`.                                                                |

## Detailed description

### htmlMatcher

> Optional | Type: `(name: string) => boolean`

Match template files such as `wxml` that need to be processed.

#### Parameters

##### name

`string`

#### return

`boolean`

### cssMatcher

> Optional | Type: `(name: string) => boolean`

Match the `wxss` and other style files that need to be processed.

#### Parameters

##### name

`string`

#### return

`boolean`

### jsMatcher

> Optional | Type: `(name: string) => boolean`

Matches the compiled `js` files that need to be processed.

#### Parameters

##### name

`string`

#### return

`boolean`

### transform

> Optional | Type: `TransformOptions`

Control which source code modules or products need to enter the `weapp-tailwindcss` translation process.

#### Remark

This configuration only affects the HTML/CSS/JS translation of `weapp-tailwindcss` and does not affect Tailwind CSS `@source`/content token scanning.
In the Vite build, the JS chunk will determine the source code module based on Rollup `moduleIds`/`modules`; when a JS chunk does not meet `include` or all source code modules hit `exclude`, the JS AST translation of the chunk will be skipped.
HTML/CSS assets will be prioritized based on Rollup `originalFileName`/`originalFileNames`. If missing, the output file name will be used.
`exclude` has a higher priority than `include`; multi-source products will be skipped as a whole only when all sources hit `exclude`.

#### Example

```ts
transform: {
  include: ['src/**.{wxml,js,ts,vue,css,scss}'],
  exclude: ['src/generated/**', /\/openapi\//],
}
```

### mainCssChunkMatcher

> Optional | Type: `(name: string, appType?: AppType) => boolean`

Declare the CSS Bundle responsible for hosting Tailwind CSS global variable scope.

#### Remark

The default is not to infer the main style from the framework, platform or file name. When main style semantics are required, the user should explicitly return `true` according to the real product name in the current build graph.
You can distinguish different ends by combining `appType`, environment variables or framework configuration.

#### Parameters

##### name

`string`

##### appType?

`AppType`

#### return

`boolean`

### wxsMatcher

> Optional | Type: `(name: string) => boolean` | Default: `()=>false`

Match `wxs`/`sjs`/`.filter.js` files on each side.

#### Remark

Please ensure that the corresponding format is included in `tailwind.config.js` of `content` before configuring.

#### default value

```ts
()=>false
```

#### Parameters

##### name

`string`

#### return

`boolean`

### inlineWxs

> Optional | Type: `boolean` | Default: `false`

Whether to escape inline `wxml` in `wxs`.

#### Remark

The `tailwind.config.js` format also needs to be declared in `wxs` before use.

#### default value

```ts
false
```

#### Example

```html
<!-- index.wxml -->
<wxs module="inline">
//I am inline wxs
//The class names below will be escaped
var className = "after:content-['I am className']"
  module.exports = {
    className: className
  }
</wxs>
<wxs src="./index.wxs" module="outside"/>
<view><view class="{{inline.className}}"></view><view class="{{outside.className}}"></view></view>
```
