---
title: Nodejs API
description: '有时候,我们不一定会使用 webpack/vite/gulp，可能是直接使用 nodejs 去构建应用，或者封装更高阶的工具，这时候可以使用api去转义你的应用。'
keywords:
  - 快速开始
  - 安装
  - 配置
  - Nodejs
  - API
  - quick start
  - frameworks
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - rax
  - mpx
---
# Nodejs API

> 版本 2.11.0+ , 此为高阶 `api`，使用起来有难度，不适合新手，假如你不清楚你在做什么，请使用 `webpack/vite/gulp` 插件

有时候,我们不一定会使用 `webpack/vite/gulp`，可能是直接使用 `nodejs` 去构建应用，或者封装更高阶的工具，这时候可以使用`api`去转义你的应用。

:::caution
普通项目推荐接入 `weapp-tailwindcss/vite` 或 `weapp-tailwindcss/webpack`。Node.js API 适合自研构建器、批处理脚本、Gulp 插件封装等场景。

如果你只是普通 `uni-app`、`Taro`、`Mpx`、`Rax` 或原生小程序项目，请优先使用对应框架页的构建器插件。
:::

## Tailwind CSS 4 前置步骤

API 只负责转译代码文本，不会替你自动运行完整框架构建。请先让入口 CSS 完成生成。当前文档面向 `tailwindcss@4`，如果项目必须继续使用 `tailwindcss@3`，请安装 `weapp-tailwindcss@4` 并查看 [v4 文档站](https://v4.tw.icebreaker.top/)。

```css title="app.css"
@import "tailwindcss";
@source "./src/**/*.{wxml,js,ts,vue}";
@source "./app.{js,ts,json}";
@source not "./dist";
```

`@source` 要包含实际源码，并排除 `node_modules`、`dist`、`unpackage` 等产物目录。只有 Tailwind 已经提取到的类名，后续 `transformJs` 才能精确命中并转译。

## 如何使用

```js
// mjs or
import { createContext } from 'weapp-tailwindcss/core'
// cjs
const { createContext } = require('weapp-tailwindcss/core')

async function main(){
  // createContext 可传入参数，类型为 UserDefinedOptions
  const ctx = createContext()
  // 3.1.0 开始 api 都是异步的，为 rust 工具链做准备
  const wxssCode = await ctx.transformWxss(rawWxssCode)
  const wxmlCode = await ctx.transformWxml(rawWxmlCode)
  const jsCode = await ctx.transformJs(rawJsCode)
  // 传入参数和输出结果均为 字符串 string

  // 然后你就可以根据结果去复写你的文件了
}

main()
```

## 自动获取运行时类名集合

通常不需要自己创建 `runtimeSet`。`createContext()` 会在 `transformWxss` 后更新运行时类名集合；如果你先处理 `transformJs` 或 `transformWxml`，它们在没有传入 `runtimeSet` 时也会自动从 Tailwind 提取结果里收集一次。

自研构建器需要显式查看或复用这份集合时，可以直接调用 `getRuntimeSet()`：

```js
const ctx = createContext()

const runtimeSet = await ctx.getRuntimeSet({
  forceCollect: true,
})

const wxmlCode = await ctx.transformWxml(rawWxmlCode)
const jsCode = await ctx.transformJs(rawJsCode)
```

这里的 `runtimeSet` 来自 Tailwind 的 `@source` 扫描结果。请先确保扫描范围覆盖真实源码；没有被 Tailwind 扫到的运行时字符串，Node.js API 不会靠猜测去转译。

## `runtimeSet` 的高级覆盖边界

`transformJs` 的核心原则是：只处理 Tailwind 实际生成过的运行时类名。`transformJs(rawJsCode, { runtimeSet })` 仍然保留给测试、自研构建器深度集成和极少数高级覆盖场景，但这个集合应该来自 `getRuntimeSet()`、`tailwindcss-patch` / Tailwind 提取结果，不能把业务 API 路径、页面路由、文件路径等普通字符串手工塞进去。

例如下面的 `order/get_order_amount` 是接口路径，不是 Tailwind class：

```js
const { code } = await ctx.transformJs(
  'call_api("order/get_order_amount", {}, "POST")',
  {
    runtimeSet: new Set(['order/get_order_amount']),
  },
)
```

如果你的自研构建流程会把普通业务字符串混进 `runtimeSet`，请先修正扫描来源；确实无法拆开时，再用 `jsPreserveClass` 兜底保护这类字符串：

```js
const ctx = createContext({
  jsPreserveClass: keyword => /^[a-z0-9_]+(?:\/[a-z0-9_]+)+$/.test(keyword),
})
```

:::tip
有一点要特别注意，在使用 `ctx.transformJs` 的时候，一定要确保 `tailwindcss` 已经执行完毕了！也就是说对应的 `postcss` 执行完毕。

因为 `js` 的转义依赖 `tailwindcss` 的执行结果，然后根据它，再去从你的代码中找到 `tailwindcss` 提取出的字符串，再进行处理的。

假如此时 `tailwindcss` 还没有执行，则插件就只能获取到一个 **空的** 提取字符串集合，这就无法进行匹配，从而导致你写在 `js` 里的类名转义失效。

比如这种情况:

```js
// index.js
const classNames = ['mb-[1.5rem]']
```

另外使用此种方式，编译缓存需要自行处理，且暂时没有类名的压缩与混淆功能
:::

## 和构建器插件的区别

| 使用方式 | 适合场景 | Tailwind CSS 生成 |
| --- | --- | --- |
| `weapp-tailwindcss/vite` | Vite 框架和 weapp-vite | 插件接管 |
| `weapp-tailwindcss/webpack` | Webpack 框架 | 插件接管 |
| `weapp-tailwindcss/core` | 自研构建器或脚本 | 需要你自己串好生成顺序 |

自定义构建器还需要显式处理 CSS 入口、`@source`、`cssEntries` 等信息；普通项目建议直接使用 [Tailwind CSS 4 各框架注册方式](/docs/quick-start/v4)。
