---
title: uni-app HBuilderX 使用方式
description: HBuilderX Vue3 Vite 项目接入 weapp-tailwindcss 的配置方式，以及 Vue2 Webpack 存量项目的处理建议。
keywords:
  - 快速开始
  - 安装
  - 配置
  - uni-app
  - HBuilderX
  - 使用方式
  - quick start
  - frameworks
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - taro
  - rax
  - mpx
---
# uni-app HBuilderX 使用方式

:::caution
本文同时包含两条 `HBuilderX` 路线：

- `HBuilderX Vue3 Vite`：推荐
- `HBuilderX Vue2 Webpack`：仅供存量项目维护
:::

## HBuilderX Vue3 Vite

这条路线适合 HBuilderX 创建的 Vue3 Vite 项目。HBuilderX 会改变运行时的 `process.cwd()`，所以扫描路径和 `cssEntries` 都建议使用绝对路径。

Tailwind CSS 3 和 4 的框架注册方式一样，差异只在 CSS 入口和扫描配置：

| Tailwind 版本 | CSS 入口 | 扫描配置 |
| --- | --- | --- |
| 3.x | `@tailwind base;` 等指令 | `tailwind.config.js` 的 `content` |
| 4.x | `@import "tailwindcss";` | CSS 入口里的 `@source` |

### tailwind.config.js

Tailwind CSS 3.x 项目使用 `tailwind.config.js`：

```js title="tailwind.config.js"
const path = require('node:path')

const resolve = (p) => {
  return path.resolve(__dirname, p)
}
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './pages/**/*.{html,js,ts,jsx,tsx,vue}',
    './components/**/*.{html,js,ts,jsx,tsx,vue}',
    '!./uni_modules/**/*',
    '!./unpackage/**/*',
  ].map(resolve),
  corePlugins: {
    preflight: false,
  },
}
```

### CSS 入口

Tailwind CSS 3.x:

```css title="src/app.css"
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Tailwind CSS 4.x:

```css title="src/app.css"
@import "tailwindcss";
@source "../pages/**/*.{html,js,ts,jsx,tsx,vue}";
@source "../components/**/*.{html,js,ts,jsx,tsx,vue}";
@source not "../uni_modules";
@source not "../unpackage";
```

Tailwind 4 的入口只放在纯 `.css` 文件里，不要直接写进 `scss`、`less`、`sass` 入口。VS Code IntelliSense 需要时，可以把 `tailwindCSS.experimental.configFile` 指向这个 CSS 文件。

### vite.config.[tj]s

注册 `WeappTailwindcss` 时传入入口 CSS 的绝对路径：

```js title="vite.config.[tj]s"
import path from 'node:path'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const resolve = (p) => {
  return path.resolve(__dirname, p)
}

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss({
      rem2rpx: true,
      tailwindcssBasedir: __dirname,
      cssEntries: [
        resolve('src/app.css'),
      ],
    })
  ],
})
```

`UNI_PLATFORM=h5`、`app` 或 `app-plus` 时，生成器默认目标会自动切换为 `web`，不再需要写 `disabled: WeappTailwindcssDisabled`。如果 App 构建不希望插件参与，可以只针对 App 目标显式禁用：

```js
const isApp = process.env.UNI_PLATFORM === "app" || process.env.UNI_PLATFORM === "app-plus";

WeappTailwindcss({
  disabled: isApp,
  rem2rpx: true,
  tailwindcssBasedir: __dirname,
  cssEntries: [
    resolve("src/app.css"),
  ],
});
```

生成模式下不要再注册 Tailwind 官方生成插件。Tailwind 3 不要注册 `tailwindcss` PostCSS 插件；Tailwind 4 不要注册 `@tailwindcss/postcss` 或 `@tailwindcss/vite`。项目已有 PostCSS 配置时，只保留框架或业务需要的非 Tailwind 插件。

`hbuilderx` 正式版本的 `vue2` 项目由于使用 `webpack4` 和 `postcss7`，不再适配当前版本。存量项目请继续停留在旧版本，或者迁移到 `HBuilderX Vue3 Vite` / `uni-app cli vue2 webpack5` 链路。

## HBuilderX 与 uni-app CLI 环境汇总

先确认项目实际使用的构建链路。下面是文档维护时的常见组合，项目以本机 HBuilderX 安装的编译插件为准：

|                  | webpack  | vite | postcss  |
| ---------------- | -------- | ---- | -------- |
| HBuilderX Vue2 | webpack4 | x | postcss7 |
| uni-app CLI Vue2 | webpack5 | x | postcss8 |
| HBuilderX Vue3 | x | √ | postcss8 |
| uni-app CLI Vue3 | x | √ | postcss8 |

当前版本推荐使用 Vite 或 Webpack5 链路。HBuilderX Vue2 Webpack4 项目建议停留在旧版插件，或迁移到 Vue3 Vite / uni-app CLI Vue2 Webpack5。

## HBuilderX Vue2 Webpack（存量项目） {#hbuilderx-vue2-webpack}

当前版本不再内置 Webpack4 / PostCSS7 / Tailwind CSS v2 兼容入口。如果你必须维护 `hbuilderx vue2` 项目，请继续使用旧版 `weapp-tailwindcss`，或迁移到上方推荐的 Vite / Webpack5 链路。

## 不建议全局改 HBuilderX Vue2 编译器

:::caution
下面这种做法会改动 HBuilderX 内置编译器，影响同一台机器上的所有 HBuilderX Vue2 项目。除非你清楚回滚成本，否则不要在日常项目里使用。
:::

早期 HBuilderX Vue2 项目通常锁在 Webpack4 / PostCSS7。有人会直接升级 `HBuilderX/plugins/uniapp-cli` 里的 `@vue/cli-*`、loader、`postcss` 和 `postcss-loader`，把内置链路改到 Webpack5 / PostCSS8。

这不是推荐路径。它会让 HBuilderX 的全局编译环境和官方插件状态不一致，升级 HBuilderX 或重新安装编译插件后也可能失效。

> macOS uniapp-cli 路径在 /Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli
>
> Windows 的路径通常也在 HBuilderX 安装目录下。需要先安装 Vue2 编译插件，这个目录才会出现。

更稳的做法是迁移项目，或者用 uni-app CLI 单独维护 Vue2 Webpack5 链路。这样一个项目对应一套依赖，排查问题也简单。

## 视频演示

<iframe src="//player.bilibili.com/player.html?aid=411561123&bvid=BV1EV41197Ps&cid=1413438914&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
