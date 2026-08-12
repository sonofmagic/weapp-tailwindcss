---
title: Used with NutUI
description: How the Taro project handles CSS variables when using NutUI, @tarojs/plugin-html and weapp-tailwindcss at the same time.
keywords:
  - FAQ
  - Troubleshooting
  - compatibility
  - NutUI
  - used together
  - issues
  - use with nutui
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - uni-app
  - taro
  - mpx
---

# Used with NutUI

When a Taro project uses the Vue or React version of [NutUI](https://nutui.jd.com), `@tarojs/plugin-html` is usually enabled at the same time.

`@tarojs/plugin-html` may delete Tailwind's CSS variable initialization area during the build process. The result is that utility classes that rely on variables, such as `drop-shadow-2xl`, `translate-1/2`, gradients, rings, etc., become invalid.

At this point you can turn on `cssOptions.injectAdditionalCssVarScope`. It will add a copy of the Tailwind CSS variable initialization scope to prevent the variable class name from being lost on the applet. See [`cssOptions`](/docs/api/options/important#cssoptions) for the configuration entry.

Example:

```diff
const { WeappTailwindcss } = require('weapp-tailwindcss/webpack')

{
  mini: {
    webpackChain(chain, webpack) {
      chain.merge({
        plugin: {
          install: {
            plugin: WeappTailwindcss,
            args: [{
              cssOptions: {
                rem2rpx: true,
+               injectAdditionalCssVarScope: true
              }
            }]
          }
        }
      })
    }
  }
}
```

## Alternative to older Taro versions

Some older Taro versions can retain related selectors via `postcss-html-transform`. Prioritize using the above `cssOptions.injectAdditionalCssVarScope`; only when the old project cannot be upgraded, consider the following method.

```js
// config/index.js
config = {
  // ...
  mini: {
    // ...
    postcss: {
      htmltransform: {
        enable: true,
// Set to false to not remove * related selector blocks
// Tailwind CSS variable initialization area may be deleted after opening
// You need to use config to set a layer. The official document is wrong.
        config: {
          removeCursorStyle: false,
        }
      },
    },
  },
}
```

## See

- [taro official documentation](https://docs.taro.zone/docs/use-h5#plugin-postcss-configuration item)
- Related Issue: [#155](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/155)
