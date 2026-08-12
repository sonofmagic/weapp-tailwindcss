---
title: Develop CSS compatibility across multiple terminals
description: The current configuration caliber of weapp-tailwindcss in mini programs, H5/Web, ordinary App WebView and uni-app x native App construction.
keywords:
  - Develop CSS compatibility across multiple terminals
  - multi platform
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - uni-app x
  - taro
  - mpx
---

# Develop CSS compatibility across multiple terminals

The main responsibility of `weapp-tailwindcss` is still to make Tailwind CSS available in the applet environment. But starting from v5, H5/Web and ordinary uni-app App WebView builds should generally retain plug-ins: the generator will automatically switch to the `web` target according to the environment variable, and output the browser's native Tailwind CSS instead of the applet escape selector.

## How does the target determine?

The generator default target is `weapp`. When the following environment variable is hit, it will automatically switch to `web`:

| Scenario                     | Environment variables                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| Explicitly specified         | `WEAPP_TW_TARGET=web`, `WEAPP_TAILWINDCSS_TARGET=web`                              |
| uni-app H5                   | `UNI_PLATFORM=h5`                                                                  |
| Ordinary uni-app App WebView | `UNI_PLATFORM=app`, `UNI_PLATFORM=app-plus`, and `UNI_UTS_PLATFORM` is not `app-*` |
| uni-app x Web                | `UNI_UTS_PLATFORM=h5`、`web`、`web-*`                                              |
| Mpx Web                      | `MPX_CLI_MODE=web`、`MPX_CURRENT_TARGET_MODE=web`                                  |
| Taro H5                      | `TARO_ENV=h5`                                                                      |

`target` represents the CSS output form, not the platform enumeration. Native App targets such as `uni-app x`'s `app-android`, `app-ios`, and `app-harmony` will not be regarded as web, and `target: 'app'` does not need to be configured. This type of target continues to use the applet output family, and uses the `uniAppX` preset to handle the differences between `uvue` and the App side.

## When to disable plugins

Don’t write the old version of disabling logic when building H5/Web:

```ts title="Not recommended"
const isH5 = process.env.UNI_PLATFORM === 'h5'

WeappTailwindcss({
  disabled: isH5,
})
```

The current recommendation is to keep the plugin enabled:

```ts title="Recommended"
WeappTailwindcss({
  cssOptions: {
    rem2rpx: true,
  },
})
```

`disabled` is only suitable for builds that "don't want plugins at all", such as RN, Harmony or standalone native builds. For H5/Web targets of uni-app, uni-app x, Taro, Mpx, Weapp-vite, disabling is usually not required.

If your custom build environment does not inject the above variables, you can specify web output explicitly:

```ts
WeappTailwindcss({
  generator: {
    target: 'web',
  },
})
```

## Minimum configuration of each framework

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

When `UNI_PLATFORM=h5`, `app` or `app-plus`, the generator default target automatically switches to `web`. If your custom build does not inject these environment variables, you can specify web output explicitly:

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

Only standalone native builds that do not want plug-ins to be involved at all need to treat `disabled` separately as an advanced escape hatch.

### uni-app x

`uni-app x` It is recommended to use the `uniAppX` preset. Tailwind CSS 4 recommends explicitly passing in the absolute path of the entry CSS.

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

`UNI_UTS_PLATFORM=h5`, `web` or `web-*` will automatically output `web`. Native App targets such as `app-android`, `app-ios`, and

:::warning uni-app x native app limitations
Do not rely on `uvue`, `gap`, or `gap-x-*` for the `gap-y-*` native app. `space-x-*` and `space-y-*` should not be used as the main layout scheme of uni-app x. Please use the child explicit `mt-*` / `ml-*` instead, or encapsulate the spacing component of the fixed structure.
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

When `MPX_CLI_MODE=web` or `MPX_CURRENT_TARGET_MODE=web`, the generator default target automatically switches to `web`. Mini program targets such as `wx`, `ali`, `swan`, `qq`, `tt`, and

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

When `TARO_ENV=h5`, the generator default target automatically switches to `web`. If the RN build does not want the plugin to be involved, `disabled: process.env.TARO_ENV === 'rn'` can be set explicitly for RN only.

## Do not register the Tailwind generation plug-in repeatedly

In the mini program construction link, Tailwind CSS style generation is uniformly handed over to `weapp-tailwindcss`. Do not register additional plug-ins for H5, App or HMR compatibility:

- `@tailwindcss/postcss`
- `@tailwindcss/vite`

If the project already has `postcss.config.js`, only keep the non-Tailwind plug-ins required by the business. When you need to configure modern CSS compatible transformations, the `WeappTailwindcss` and `cssOptions.cssPresetEnv` options that come with `cssOptions.autoprefixer` are preferred.

## Modern CSS compatible with App WebView

Ordinary uni-app App WebView or some lower version kernels may not support modern color writing methods such as `rgb(245 247 255 / var(--tw-bg-opacity))`. Currently, there is no need to install and register `postcss-preset-env` in the project. It can be configured directly through the plug-in options:

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

`cssOptions.autoprefixer` is enabled by default and is used to complete compatible prefixes such as `-webkit-` for the mini program WebView, for example, let `bg-clip-text` output `-webkit-background-clip: text`. If you really need to close it, you can pass it in explicitly:

```ts
WeappTailwindcss({
  cssOptions: {
    autoprefixer: false,
  },
})
```

## CSS variable calculation mode

Under Tailwind CSS 4, precalculation of CSS variables and `calc()` is turned off by default. This prevents large values in `var()` from being expanded and then copied into the compatibility declaration by Autoprefixer. For example, only one copy of the `--svg` data URI generated by the icon plug-in will be kept by default.

When you need to solve the problem of inconsistent calculations of `calc` and `rpx` on some models, you can explicitly enable it:

```ts
WeappTailwindcss({
  cssOptions: {
    cssCalc: true,
  },
})
```

When enabled, a precomputed statement will be added, and the original `var()` / `calc()` statement will be retained by default. This can maintain CSS cascading compatibility, but will cause two equivalent properties to appear in a single tool class; if the target applet will give priority to subsequent original declarations when running, or if you want to reduce the size of CSS, you need to explicitly specify the CSS variables to be cleaned.

For example Tailwind CSS 4 generates:

```css
page,
:root {
  --spacing: 8rpx;
}
.h-2 {
  height: calc(var(--spacing) * 2);
}
```

After explicitly enabling `cssOptions.cssCalc`, the precomputed results will be supplemented and the original statement will be retained:

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

If you want variables such as `--spacing` to completely use precomputed results to avoid subsequent original `calc()` overwriting the bottom value, you can pass in an array or object:

```ts
WeappTailwindcss({
  cssOptions: {
    cssCalc: ['--spacing'],
  },
})
```

At this time, the original `--spacing` / `var()` declaration matching `calc()` will be deleted, and the output will become:

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

You can also use regular expressions:

```ts
WeappTailwindcss({
  cssOptions: {
    cssCalc: [/^--(gap|spacing)$/],
  },
})
```

If you need to explicitly close it, you can also pass in:

```ts
WeappTailwindcss({
  cssOptions: {
    cssCalc: false,
  },
})
```

### Reduce repeated spacing declarations of `.mx-*`

For example, when using `mx-1`, Tailwind CSS 4 may first generate the variable form:

```css
.mx-1 {
  margin-left: var(--spacing);
  margin-right: var(--spacing);
}
```

After turning on `cssCalc`, `weapp-tailwindcss` will additionally calculate `8rpx`. When the original variable declaration is retained by default, you will end up with four properties:

```css
.mx-1 {
  margin-left: 8rpx;
  margin-right: 8rpx;
  margin-left: var(--spacing);
  margin-right: var(--spacing);
}
```

Select the following configurations according to your needs:

```ts
// Only keep Tailwind's original CSS variables, turn off precomputation, and have minimal output.
WeappTailwindcss({
  cssOptions: {
    cssCalc: false,
  },
})
```

```ts
// Keep the rpx precomputation result and delete the original statement corresponding to --spacing.
// Suitable for small program runtimes that need to be compatible with incomplete support for CSS variables or calc().
WeappTailwindcss({
  cssOptions: {
    cssCalc: ['--spacing'],
  },
})
```

The result of the second configuration is:

```css
.mx-1 {
  margin-left: 8rpx;
  margin-right: 8rpx;
}
```

The difference between `cssCalc: false` and `cssCalc: ['--spacing']` is that the former does not generate a precomputed fallback, while the latter retains the precomputed `rpx` results but removes duplicate variable declarations. After modification, please re-execute the target-side build and check the actual generated `app.wxss`, `app.ttss` or corresponding platform CSS files; if the spacing fails when running in a lower version after turning off precomputation, use the second configuration instead.

## Multiterminal unit conversion

If the same set of code needs to handle units by platform, use `cssOptions.unitConversion.platforms` first. The platform name will be compatible with common aliases such as `weapp`/`mp-weixin`, `h5`/`web`, `app-plus`/`app`; when `cssOptions.platform` is not passed in explicitly, it will be inferred from common build environment variables.

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

## H5 SVG icon offset

If Tailwind Preflight is enabled on the H5 side, `svg` may be set to `display: block` by default, and some icons will be offset. It can be overridden according to the H5 condition in the global style:

```css
@import "tailwindcss";

/* #ifdef H5 */
svg {
  display: initial;
}
/* #endif */
```

## Verification suggestions

After changing the configuration across multiple terminal projects, at least verify the following:

- Mini program target: Whether basic tool classes, arbitrary values, pseudo classes or variant selectors are generated and translated normally.
- H5/Web target: Whether the output is the browser's native selector instead of the applet escaped selector.
- Normal App WebView: Whether modern color functions, `calc()`, `rpx` related styles are accepted by the target kernel.
- uni-app x native App: avoid using `gap`, `space-x-*`, `space-y-*` as core layout capabilities.

Commonly used commands are selected according to project framework:

```bash npm2yarn
npm run dev:h5
npm run build:h5
npm run dev:mp-weixin
npm run build:mp-weixin
```
