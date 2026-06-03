---
title: Taro
description: Taro Webpack / Vite 项目接入 weapp-tailwindcss@5，并同时说明 Tailwind CSS 3 和 4 的入口差异。
keywords:
  - 快速开始
  - 安装
  - 配置
  - Taro
  - 所有框架
  - quick start
  - frameworks
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - rax
  - mpx
---
# Taro

Taro v4 可以使用 Webpack 或 Vite 构建。`weapp-tailwindcss@5` 两条链路都支持，但推荐优先使用 Webpack；Taro Vite 的样式链路仍有不少历史问题，更适合作为已有项目的排障参考。

:::caution
如果 `tailwindcss` 工具类不生效，先检查微信开发者工具是否开启了 `代码自动热重载`。关闭它后再重新预览。

如果你同时使用 `NutUI`，或启用了 `@tarojs/plugin-html`，请先看这个[注意事项](/docs/issues/use-with-nutui)。

<!-- 有群友遇到了转义特殊字符失败，之后变成了空格的文件，结果 `node_modules` 删了重新安装就好了。 -->

:::

下列配置适用于 Taro 的 `react` / `preact` / `vue2` / `vue3`。

## Tailwind CSS 版本选择

框架注册方式和 Tailwind 版本没有强绑定，主要差异在 `src/app.css`：

| Tailwind 版本 | 安装 | CSS 入口 | 扫描配置 |
| --- | --- | --- | --- |
| 3.x | `pnpm add -D tailwindcss@3 weapp-tailwindcss` | `@tailwind base;` 等指令 | `tailwind.config.js` 的 `content` |
| 4.x | `pnpm add -D tailwindcss weapp-tailwindcss` | `@import "tailwindcss";` | CSS 入口里的 `@source` |

小程序构建只注册 `WeappTailwindcss`。不要再在 PostCSS 中注册 `tailwindcss` 或 `@tailwindcss/postcss`，也不要为 Taro Vite 注册 `@tailwindcss/vite`。

### Tailwind CSS 3.x 入口

```css title="src/app.css"
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```js title="tailwind.config.js"
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx,vue}',
    '!./dist/**/*',
    '!./node_modules/**/*',
  ],
  corePlugins: {
    preflight: false,
  },
}
```

### Tailwind CSS 4.x 入口

```css title="src/app.css"
@import "tailwindcss";
@source "./pages/**/*.{ts,tsx,jsx,js,vue}";
@source "./components/**/*.{ts,tsx,jsx,js,vue}";
@source not "../dist";
@source not "../node_modules";
```

Tailwind 4 的入口请放在纯 `.css` 文件里。业务样式可以继续使用 Sass/Less，但不要把 `@import "tailwindcss"` 直接写进预处理入口。

## 使用 Webpack 作为打包工具

### 注册插件

在项目的配置文件 `config/index` 中注册。Taro 迁移到 v5 时，小程序和 H5 都需要注册 `WeappTailwindcss`：小程序目标会输出小程序可用 CSS，`TARO_ENV=h5` 时会自动切到 Web 目标。

```js title="config/index.[jt]s"
const { WeappTailwindcss } = require('weapp-tailwindcss/webpack')
const path = require('node:path')
// 使用 ts 配置时，可以改用下方 import 写法
// import { WeappTailwindcss } from 'weapp-tailwindcss/webpack'
// import path from 'node:path'

const weappTailwindcssOptions = {
  rem2rpx: true,
  cssEntries: [
    path.resolve(__dirname, '../src/app.css'),
  ],
}

function registerWeappTailwindcss(chain) {
  chain.merge({
    plugin: {
      install: {
        plugin: WeappTailwindcss,
        args: [weappTailwindcssOptions],
      },
    },
  })
}

{
  mini: {
    webpackChain(chain, webpack) {
      // highlight-start
      registerWeappTailwindcss(chain)
      // highlight-end
    }
  },
  h5: {
    webpackChain(chain, webpack) {
      // highlight-start
      registerWeappTailwindcss(chain)
      // highlight-end
    }
  }
}
```

然后正常运行项目即可。Tailwind 3 和 4 都建议显式配置 `cssEntries`，这样 Webpack 链路能稳定定位 Tailwind 入口。不要在 H5 里写 `disabled: process.env.TARO_ENV === 'h5'`。

:::info
`weapp-tailwindcss/webpack` 对应的推荐插件名 `WeappTailwindcss` 适用于 `webpack@5`

在使用 `Taro` 时，检查一下 `config/index` 文件的配置项 `compiler`，来确认你的 `webpack` 版本。`weapp-tailwindcss@5` 不再内置 Webpack4 入口，推荐使用 `'webpack5'`

如果你使用了 [`taro-plugin-compiler-optimization`](https://www.npmjs.com/package/taro-plugin-compiler-optimization)，建议移除。它会让打包结果变得混乱。详见 [issues/123](https://github.com/sonofmagic/weapp-tailwindcss/issues/123) [issues/131](https://github.com/sonofmagic/weapp-tailwindcss/issues/131)

<!-- 还有不要和 `terser-webpack-plugin` 一起注册使用，这会导致转义功能失效 详见 [**常见问题**](/docs/issues#taro-webpack5-环境下这个插件和-terser-webpack-plugin-一起使用会导致插件转义功能失效) 和 [issues/142](https://github.com/sonofmagic/weapp-tailwindcss/issues/142) -->

`taro` 的 `prebundle` 也容易干扰排查。如果项目启动异常且原因不明，可以先关闭这个配置。

<!--
**另外不要开启二次编译缓存!**

```js
// 禁止二次编译缓存
cache: {
  enable: false
},
```

开启它会导致二次编译时，直接跳过插件的转义。另外还有一个 -->

<!-- `taro` 开发时热更新的问题，开发中保存 `tailwind.config.js` 文件，触发热更新会导致所有样式挂掉，此时重新保存任意 `jsx/tsx` 文件恢复正常。 -->

:::

## 使用 Vite 作为打包工具

:::danger
`Taro Vite` 目前整体稳定性较差，已知问题和样式链路 bug 较多，不推荐在新项目里使用。

如果你没有强依赖 `Taro Vite`，优先选择 `Taro Webpack`、`uni-app`、`weapp-vite` 等更稳定的方案。
:::

Taro Vite 需要把 `WeappTailwindcss` 注册到 `config/index` 的 `compiler.vitePlugins`，这样小程序和 H5 都能走同一份插件配置。Tailwind CSS 由 `WeappTailwindcss` 生成，不需要再注册 Tailwind 官方 Vite 或 PostCSS 插件。

### 在 `config/index.ts` 中注册插件

```ts title="config/index.[jt]s"
import type { Plugin } from 'vite'
import path from 'node:path'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const baseConfig: UserConfigExport<'vite'> = {
  // ... 其他配置
  // highlight-start
  compiler: {
    type: 'vite',
    vitePlugins: [
      WeappTailwindcss({
        // rem转rpx
        rem2rpx: true,
        cssEntries: [
          path.resolve(__dirname, '../src/app.css'),
        ],
        // Taro Vite 可能移除 Tailwind CSS 变量，需要重新注入变量作用域
        injectAdditionalCssVarScope: true,
      })
    ] as Plugin[] // 从 vite 引入 type, 为了智能提示
  },
  // highlight-end
  // ... 其他配置
}
```

Tailwind CSS 生成由 `weapp-tailwindcss` 接管，不需要再把 Tailwind 官方生成插件注册到 PostCSS 或 Vite 配置里。`src/app.css` 按上方版本选择写 Tailwind 3 或 4 的入口。

`TARO_ENV=h5` 时，生成器默认目标会自动切换为 `web`，不再需要写 `disabled: process.env.TARO_ENV === 'h5'`。如果 RN 或 Harmony 构建不希望插件参与，可以只针对这些目标显式设置 `disabled`。

> `vite.config.ts` 只有在运行小程序时才会加载，`h5` 不会。小程序 + h5 双端兼容请把插件注册放在 `config/index` 的 `compiler.vitePlugins` 中。
> `Taro Vite` 当前仍然不稳定，这部分内容仅作为历史方案和排障参考，不建议作为新项目默认选型。

## 视频演示

<iframe src="//player.bilibili.com/player.html?aid=966499437&bvid=BV1UW4y1w7VM&cid=1411385502&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
