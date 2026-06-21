---
title: 跨多端开发 CSS 兼容
description: weapp-tailwindcss 在小程序、H5/Web、普通 App WebView 与 uni-app x 原生 App 构建中的当前配置口径。
keywords:
  - 跨多端开发CSS兼容
  - multi platform
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - uni-app x
  - taro
  - mpx
---

# 跨多端开发 CSS 兼容

`weapp-tailwindcss` 的主要职责仍然是让 Tailwind CSS 在小程序环境可用。但从 v5 开始，H5/Web 与普通 uni-app App WebView 构建通常也应该保留插件：生成器会按环境变量自动切到 `web` 目标，输出浏览器原生 Tailwind CSS，而不是小程序转义选择器。

## 目标端如何判断

生成器默认目标是 `weapp`。命中以下环境变量时会自动切到 `web`：

| 场景 | 环境变量 |
| --- | --- |
| 显式指定 | `WEAPP_TW_TARGET=web`、`WEAPP_TAILWINDCSS_TARGET=web` |
| uni-app H5 | `UNI_PLATFORM=h5` |
| 普通 uni-app App WebView | `UNI_PLATFORM=app`、`UNI_PLATFORM=app-plus`，且 `UNI_UTS_PLATFORM` 不是 `app-*` |
| uni-app x Web | `UNI_UTS_PLATFORM=h5`、`web`、`web-*` |
| Mpx Web | `MPX_CLI_MODE=web`、`MPX_CURRENT_TARGET_MODE=web` |
| Taro H5 | `TARO_ENV=h5` |

`target` 表示 CSS 输出形态，不是平台枚举。`uni-app x` 的 `app-android`、`app-ios`、`app-harmony` 这类原生 App 目标不会被当成 Web，也不需要配置 `target: 'app'`。这类目标继续使用小程序输出族，并通过 `uniAppX` 预设处理 `uvue` 与 App 端差异。

## 什么时候禁用插件

H5/Web 构建不要再写旧版的禁用逻辑：

```ts title="不推荐"
const isH5 = process.env.UNI_PLATFORM === 'h5'

WeappTailwindcss({
  disabled: isH5,
})
```

当前推荐保持插件启用：

```ts title="推荐"
WeappTailwindcss({
  rem2rpx: true,
})
```

`disabled` 只适合“完全不希望插件参与”的构建，例如 RN、Harmony 或独立原生构建。对于 uni-app、uni-app x、Taro、Mpx 的 H5/Web 目标，通常不需要禁用。

如果自定义构建环境没有注入上述变量，可以显式指定 Web 输出：

```ts
WeappTailwindcss({
  generator: {
    target: 'web',
  },
})
```

## 各框架最小配置

### uni-app

```ts title="vite.config.ts"
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss({
      rem2rpx: true,
    }),
  ],
})
```

当 `UNI_PLATFORM=h5`、`app` 或 `app-plus` 时，生成器默认目标会自动切换为 `web`。如果某个 App 构建不希望插件参与，再只针对 App 显式禁用：

```ts
const isApp = process.env.UNI_PLATFORM === 'app' || process.env.UNI_PLATFORM === 'app-plus'

WeappTailwindcss({
  disabled: isApp,
  rem2rpx: true,
})
```

### uni-app x

`uni-app x` 建议使用 `uniAppX` 预设。Tailwind CSS 4 建议显式传入入口 CSS 的绝对路径。

```ts title="vite.config.ts"
import path from 'node:path'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss(
      uniAppX({
        base: __dirname,
        cssEntries: [
          path.resolve(__dirname, 'main.css'),
        ],
        rem2rpx: true,
      }),
    ),
  ],
})
```

`UNI_UTS_PLATFORM=h5`、`web` 或 `web-*` 时会自动走 `web` 输出。`app-android`、`app-ios`、`app-harmony` 这类原生 App 目标使用 `uniAppX` 预设处理，不要额外写 `target: 'app'`。

:::warning uni-app x 原生 App 限制
`uvue` 原生 App 端不要依赖 `gap`、`gap-x-*`、`gap-y-*`。`space-x-*`、`space-y-*` 也不要作为 uni-app x 的主要布局方案。请改用子项显式 `mt-*` / `ml-*`，或封装固定结构的间距组件。
:::

### Mpx

```js title="mpx.config.js"
const { WeappTailwindcss } = require('weapp-tailwindcss/webpack')

module.exports = {
  configureWebpack(config) {
    config.plugins.push(
      new WeappTailwindcss({
        appType: 'mpx',
        rem2rpx: true,
      }),
    )
  },
}
```

当 `MPX_CLI_MODE=web` 或 `MPX_CURRENT_TARGET_MODE=web` 时，生成器默认目标会自动切换为 `web`。`wx`、`ali`、`swan`、`qq`、`tt`、`dd` 等小程序目标继续走小程序输出。

### Taro

```ts title="config/index.ts"
import { WeappTailwindcss } from 'weapp-tailwindcss/webpack'

export default {
  webpackChain(chain) {
    chain.merge({
      plugin: {
        install: {
          plugin: WeappTailwindcss,
          args: [
            {
              rem2rpx: true,
            },
          ],
        },
      },
    })
  },
}
```

当 `TARO_ENV=h5` 时，生成器默认目标会自动切换为 `web`。如果 RN 构建不希望插件参与，可以只针对 RN 显式设置 `disabled: process.env.TARO_ENV === 'rn'`。

## 不要重复注册 Tailwind 生成插件

小程序构建链路里，Tailwind CSS 的样式生成统一交给 `weapp-tailwindcss`。不要为了兼容 H5、App 或 HMR 问题再额外注册这些插件：

- `@tailwindcss/postcss`
- `@tailwindcss/vite`

如果项目已有 `postcss.config.js`，只保留业务需要的非 Tailwind 插件即可。需要配置现代 CSS 兼容转换时，优先使用 `WeappTailwindcss` 自带的 `cssPresetEnv` 和 `autoprefixer` 选项。

## 现代 CSS 与 App WebView 兼容

普通 uni-app App WebView 或部分低版本内核可能不支持 `rgb(245 247 255 / var(--tw-bg-opacity))` 这类现代颜色写法。当前不需要在项目里额外安装并注册 `postcss-preset-env`，可以直接通过插件选项配置：

```ts
WeappTailwindcss({
  rem2rpx: true,
  cssPresetEnv: {
    browsers: 'chrome >= 50',
  },
})
```

`autoprefixer` 默认启用，用于为小程序 WebView 补齐 `-webkit-` 等兼容前缀，例如让 `bg-clip-text` 输出 `-webkit-background-clip: text`。如果确实需要关闭，可以显式传入：

```ts
WeappTailwindcss({
  autoprefixer: false,
})
```

## CSS 变量计算模式

Tailwind CSS 4 下，如果没有显式配置 `cssCalc`，插件会默认启用 CSS 变量与 `calc()` 的预计算。

需要注意的是，默认模式只会补充一条预计算声明，不会删除后面的原始 `calc()` 声明。这样可以保持 CSS 级联兼容，但如果目标小程序运行时会优先采用后续 `calc()`，你需要显式指定要清理的 CSS 变量。

例如 Tailwind CSS 4 生成：

```css
page,
:root {
  --spacing: 8rpx;
}
.h-2 {
  height: calc(var(--spacing) * 2);
}
```

启用默认 `cssCalc` 后会补出预计算结果，并保留原声明：

```css
page,
:root {
  --spacing: 8rpx;
}
.h-2 {
  height: 16rpx;
  height: calc(var(--spacing) * 2);
}
```

如果你希望 `--spacing` 这类变量完全使用预计算结果，避免后续原始 `calc()` 覆盖兜底值，可以传入数组或对象：

```ts
WeappTailwindcss({
  cssCalc: ['--spacing'],
})
```

此时匹配 `--spacing` 的原始 `calc()` 声明会被删除，输出会变成：

```css
.h-2 {
  height: 16rpx;
}
```

```ts
WeappTailwindcss({
  cssCalc: {
    includeCustomProperties: ['--spacing'],
    preserve: true,
  },
})
```

也可以使用正则：

```ts
WeappTailwindcss({
  cssCalc: [/^--(gap|spacing)$/],
})
```

需要关闭 Tailwind CSS 4 默认的 `cssCalc` 时，传入：

```ts
WeappTailwindcss({
  cssCalc: false,
})
```

## 多端单位转换

如果同一套代码需要按平台处理单位，优先使用 `unitConversion.platforms`。平台名称会兼容 `weapp`/`mp-weixin`、`h5`/`web`、`app-plus`/`app` 等常见别名；未显式传入 `platform` 时，会从常见构建环境变量推断。

```ts
import { unitConversionComposeRules, unitConversionPresets } from 'weapp-tailwindcss'

WeappTailwindcss({
  unitConversion: {
    platforms: {
      'mp-weixin': {
        rules: unitConversionComposeRules(
          unitConversionPresets.pxToRpx({ ratio: 2 }),
          unitConversionPresets.remToRpx({ rootValue: 16 }),
        ),
      },
      h5: {
        rules: [
          unitConversionPresets.rpxToPx({ ratio: 0.5 }),
        ],
      },
    },
  },
})
```

## H5 SVG 图标偏移

如果 H5 端启用了 Tailwind Preflight，`svg` 默认可能被设置为 `display: block`，部分图标会出现偏移。可以在全局样式里按 H5 条件覆盖：

```css
@import "tailwindcss";

/* #ifdef H5 */
svg {
  display: initial;
}
/* #endif */
```

## 验证建议

跨多端项目改完配置后，至少分别验证以下内容：

- 小程序目标：基础工具类、任意值、伪类或变体选择器是否正常生成和转译。
- H5/Web 目标：输出是否为浏览器原生选择器，而不是小程序转义选择器。
- 普通 App WebView：现代颜色函数、`calc()`、`rpx` 相关样式是否被目标内核接受。
- uni-app x 原生 App：避免使用 `gap`、`space-x-*`、`space-y-*` 作为核心布局能力。

常用命令按项目框架选择：

```bash npm2yarn
npm run dev:h5
npm run build:h5
npm run dev:mp-weixin
npm run build:mp-weixin
```
