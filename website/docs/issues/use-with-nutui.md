---
title: 和 NutUI 一起使用
description: Taro 项目同时使用 NutUI、@tarojs/plugin-html 和 weapp-tailwindcss 时的 CSS 变量处理方式。
keywords:
  - 常见问题
  - 故障排查
  - 兼容性
  - NutUI
  - 一起使用
  - issues
  - use with nutui
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - mpx
---
# 和 NutUI 一起使用

Taro 项目使用 [NutUI](https://nutui.jd.com) 的 Vue 或 React 版本时，通常会同时启用 `@tarojs/plugin-html`。

`@tarojs/plugin-html` 可能会在构建过程中删掉 Tailwind 的 CSS 变量初始化区域。结果是依赖变量的工具类失效，例如 `drop-shadow-2xl`、`translate-1/2`、渐变、ring 等。

此时可以开启 `cssOptions.injectAdditionalCssVarScope`。它会补一份 Tailwind CSS 变量初始化作用域，避免变量类名在小程序端丢失。配置入口见 [`cssOptions`](/docs/api/options/general#cssoptions)。

示例：

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

## 旧 Taro 版本的备选方案

部分旧 Taro 版本可以通过 `postcss-html-transform` 保留相关选择器。优先使用上面的 `cssOptions.injectAdditionalCssVarScope`；只有旧项目无法升级时，再考虑下面的方式。

```js
// config/index.js
config = {
  // ...
  mini: {
    // ...
    postcss: {
      htmltransform: {
        enable: true,
        // 设置成 false 表示 不去除 * 相关的选择器区块
        // 开启后可能删除 Tailwind CSS 变量初始化区域
        // 需要用 config 套一层，官方文档上是错的
        config: {
          removeCursorStyle: false,
        }
      },
    },
  },
}
```

## 参见

- [taro 官方文档](https://docs.taro.zone/docs/use-h5#插件-postcss-配置项)
- 相关 Issue：[#155](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/155)
