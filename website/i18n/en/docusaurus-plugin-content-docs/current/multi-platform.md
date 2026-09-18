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
| uni-app x Web                | `UNI_UTS_PLATFORM=h5`, `web`, `web-*`                                              |
| Mpx Web                      | `MPX_CLI_MODE=web`, `MPX_CURRENT_TARGET_MODE=web`                                  |
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

:::warning WeChat --spacing and rpx limitations
`--spacing: 1rpx` can generate utilities, but runtime `calc` can produce a different size from a direct `rpx` length. Native WXSS checks also reproduced a discrepancy with a `3rpx` base. Prefer `px` for fixed pixel dimensions, or a final static `rpx` length for scaling with the window width. If retaining a runtime base, consider larger or even `rpx` values, but even values do not guarantee accuracy and still require device testing. In the `5.5.6` uni-app WeChat reproduction, even explicit `cssCalc: ['--spacing']` can leave the expression unresolved. The examples below assume variable values can be resolved; enabling the option alone does not establish that the issue is fixed. See [WeChat --spacing and rpx calculation limits](./issues/spacing-rpx.md) for comparisons, version scope, and guidance.
:::

To precompute values known at build time, enable the option explicitly:

```ts
WeappTailwindcss({
  cssOptions: {
    cssCalc: true,
  },
})
```

When variable expansion succeeds, a precomputed declaration can be added while retaining the later original `var()` / `calc()` declaration. Their rendered sizes are not necessarily identical: a valid later expression can still override the static value. Adding a fallback alone therefore does not guarantee correct WeChat sizing. To use only precomputed values, explicitly select fixed variables and inspect the final output.

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

For the resolvable root variable above, enabling `cssOptions.cssCalc` can add a precomputed result while retaining the original declaration:

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

After successful precomputation, matching original `var()` / `calc()` declarations using `--spacing` are removed. This example becomes:

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

Static properties no longer respond to runtime overrides of `--spacing`. Do not use this configuration to freeze a variable that pages, components, or theme switches need to update dynamically. Using `@theme inline` alone also does not guarantee removal of `calc`; see the limitations above.

To disable precomputation explicitly, use:

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

Using the same `--spacing: 8rpx` as above, successful root variable expansion with the original declarations retained produces four properties:

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
// Keep static results and remove original declarations after successful precomputation.
// Use only for fixed theme values and inspect the final output.
WeappTailwindcss({
  cssOptions: {
    cssCalc: ['--spacing'],
  },
})
```

After successful precomputation, the second configuration produces:

```css
.mx-1 {
  margin-left: 8rpx;
  margin-right: 8rpx;
}
```

`cssCalc: false` does not generate precomputed fallbacks. `cssCalc: ['--spacing']` retains static results and removes duplicate variable declarations after successful precomputation. Rebuild the target, inspect the final properties in WXSS/CSS, and compare rendered sizes with direct lengths on the target device. If `calc(var(--spacing) * N)` remains, follow the [known limitations](./issues/spacing-rpx.md) instead of assuming the configuration has taken effect.

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
