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
  cssOptions: {
    rem2rpx: true,
  },
})
```

`disabled` 只适合“完全不希望插件参与”的构建，例如 RN、Harmony 或独立原生构建。对于 uni-app、uni-app x、Taro、Mpx、Weapp-vite 的 H5/Web 目标，通常不需要禁用。

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
      cssOptions: {
        rem2rpx: true,
      },
    }),
  ],
})
```

当 `UNI_PLATFORM=h5`、`app` 或 `app-plus` 时，生成器默认目标会自动切换为 `web`。如果自定义构建没有注入这些环境变量，可以显式指定 Web 输出：

```ts
WeappTailwindcss({
  generator: {
    target: 'web',
  },
  cssOptions: {
    rem2rpx: true,
  },
})
```

只有完全不希望插件参与的独立原生构建，才需要把 `disabled` 当作高级逃生口单独处理。

### uni-app x

`uni-app x` 建议使用 `uniAppX` 预设。Tailwind CSS 4 建议显式传入入口 CSS 的绝对路径。

```ts title="vite.config.ts"
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { uniAppX } from 'weapp-tailwindcss/presets'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss(
      uniAppX({
        base: projectRoot,
        cssEntries: [
          resolve(projectRoot, 'main.css'),
        ],
        cssOptions: {
          rem2rpx: true,
        },
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
        cssOptions: {
          rem2rpx: true,
        },
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
              cssOptions: {
                rem2rpx: true,
              },
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

如果项目已有 `postcss.config.js`，只保留业务需要的非 Tailwind 插件即可。需要配置现代 CSS 兼容转换时，优先使用 `WeappTailwindcss` 自带的 `cssOptions.cssPresetEnv` 和 `cssOptions.autoprefixer` 选项。

## 现代 CSS 与 App WebView 兼容

普通 uni-app App WebView 或部分低版本内核可能不支持 `rgb(245 247 255 / var(--tw-bg-opacity))` 这类现代颜色写法。当前不需要在项目里额外安装并注册 `postcss-preset-env`，可以直接通过插件选项配置：

```ts
WeappTailwindcss({
  cssOptions: {
    rem2rpx: true,
    cssPresetEnv: {
      browsers: 'chrome >= 50',
    },
  },
})
```

`cssOptions.autoprefixer` 默认启用，用于为小程序 WebView 补齐 `-webkit-` 等兼容前缀，例如让 `bg-clip-text` 输出 `-webkit-background-clip: text`。如果确实需要关闭，可以显式传入：

```ts
WeappTailwindcss({
  cssOptions: {
    autoprefixer: false,
  },
})
```

## CSS 变量计算模式

Tailwind CSS 4 下，CSS 变量与 `calc()` 的预计算默认关闭。这样可以避免 `var()` 中的大体积值被展开后，再被 Autoprefixer 复制到兼容声明中。例如图标插件生成的 `--svg` data URI 默认只会保留一份。

:::warning 微信小程序的 --spacing 与 rpx 限制
`--spacing: 1rpx` 可以生成工具类，但运行时 `calc` 的尺寸可能与直接 `rpx` 不同，用户也反馈 `3rpx` 等奇数基数受影响。在 `5.5.6` 的 uni-app 微信构建复现中，显式配置 `cssCalc: ['--spacing']` 仍可能保留表达式。以下预计算示例以成功取得变量值为前提，不能仅凭开启选项判断问题已解决。具体对照、版本范围和处理方式见 [微信小程序 --spacing 与 rpx 计算限制](./issues/spacing-rpx.md)。
:::

需要对构建期已知的值预计算时，可以显式开启：

```ts
WeappTailwindcss({
  cssOptions: {
    cssCalc: true,
  },
})
```

成功展开变量时，可以补充预计算声明并保留后面的原始 `var()` / `calc()` 声明。两条声明在目标运行时中的尺寸未必相同：后面的有效表达式仍可能覆盖静态值，因此仅增加 fallback 不保证消除微信的计算偏差。需要完全使用预计算结果时，应显式选择要处理的固定变量，并检查最终产物。

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

对上述可解析的根变量，显式启用 `cssOptions.cssCalc` 后可以补出预计算结果，并保留原声明：

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
  cssOptions: {
    cssCalc: ['--spacing'],
  },
})
```

成功预计算后，匹配 `--spacing` 的原始 `var()` / `calc()` 声明会被清理，该示例输出为：

```css
.h-2 {
  height: 16rpx;
}
```

```ts
WeappTailwindcss({
  cssOptions: {
    cssCalc: {
      includeCustomProperties: ['--spacing'],
      preserve: true,
    },
  },
})
```

也可以使用正则：

```ts
WeappTailwindcss({
  cssOptions: {
    cssCalc: [/^--(gap|spacing)$/],
  },
})
```

静态化后的属性不再响应运行时对 `--spacing` 的覆盖。页面、组件或主题切换需要动态修改该变量时，不要直接采用此配置来冻结它；单独设置 `@theme inline` 也不能保证消除 `calc`，详见上面的限制说明。

如果需要明确关闭，也可以传入：

```ts
WeappTailwindcss({
  cssOptions: {
    cssCalc: false,
  },
})
```

### 减少 `.mx-*` 的重复间距声明

例如使用 `mx-1` 时，Tailwind CSS 4 可能先生成变量形式：

```css
.mx-1 {
  margin-left: var(--spacing);
  margin-right: var(--spacing);
}
```

沿用上面的 `--spacing: 8rpx`，当 `cssCalc` 成功展开根变量并保留原始声明时，会看到四条属性：

```css
.mx-1 {
  margin-left: 8rpx;
  margin-right: 8rpx;
  margin-left: var(--spacing);
  margin-right: var(--spacing);
}
```

按需求选择以下配置：

```ts
// 只保留 Tailwind 原始的 CSS 变量，关闭预计算，产物最少。
WeappTailwindcss({
  cssOptions: {
    cssCalc: false,
  },
})
```

```ts
// 成功预计算后保留 rpx 结果，清理 --spacing 对应的原始声明。
// 仅用于固定主题值，并检查最终产物是否完成预计算。
WeappTailwindcss({
  cssOptions: {
    cssCalc: ['--spacing'],
  },
})
```

第二种配置成功预计算后的结果是：

```css
.mx-1 {
  margin-left: 8rpx;
  margin-right: 8rpx;
}
```

`cssCalc: false` 不生成预计算 fallback；`cssCalc: ['--spacing']` 则在成功预计算后保留静态结果并清理重复的变量声明。修改后请重新构建目标端，检查实际 WXSS/CSS 中的最终属性值，并在目标设备上与直接长度对照。若仍保留 `calc(var(--spacing) * N)`，请按 [已知限制](./issues/spacing-rpx.md) 排查，不要假定配置已生效。

## 多端单位转换

如果同一套代码需要按平台处理单位，优先使用 `cssOptions.unitConversion.platforms`。平台名称会兼容 `weapp`/`mp-weixin`、`h5`/`web`、`app-plus`/`app` 等常见别名；未显式传入 `cssOptions.platform` 时，会从常见构建环境变量推断。

```ts
import { unitConversionComposeRules, unitConversionPresets } from 'weapp-tailwindcss'

WeappTailwindcss({
  cssOptions: {
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
