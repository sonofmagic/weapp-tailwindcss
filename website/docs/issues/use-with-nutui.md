# 和 NutUI 一起使用

`taro` 使用 [NutUI](https://nutui.jd.com) 的 `vue` 和 `react` 版本的共同注意点:

由于 [NutUI](https://nutui.jd.com) 必须要配合 `@tarojs/plugin-html` 一起使用。

然而 `@tarojs/plugin-html` 这个插件，默认情况下它会移除整个 `tailwindcss` 注入的 `css var` 区域块，这会造成所有 `tw-*` 相关变量找不到，导致样式大量挂掉的问题。例如（`drop-shadow-2xl` 等样式）。

此时可以使用这个插件的 [`injectAdditionalCssVarScope`](/docs/api/interfaces/UserDefinedOptions#injectadditionalcssvarscope) 配置项，把它设为 `true`，这能在插件内部启用功能，来重新注入整个 `tailwindcss` 的 `css` 中的 `var` 区域块。

按照初始的配置，只需要添加一行即可，示例如下：

```diff
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')

{
  mini: {
    webpackChain(chain, webpack) {
      chain.merge({
        plugin: {
          install: {
            plugin: UnifiedWebpackPluginV5,
            args: [{
              appType: 'taro',
+             injectAdditionalCssVarScope: true
            }]
          }
        }
      })
    }
  }
}
```

## 可能有用但是过时的方案（部分 taro 版本有用）

~~需要去配置一下 `postcss-html-transform` 这个插件~~（实在找不到方法可以尝试一下）

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
        // 假如开启这个配置，它会把 tailwindcss 整个 css 的 var 区域块直接去除掉
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

- [taro 官方文档](https://taro-docs.jd.com/docs/use-h5#插件-postcss-配置项)
- 相关 Issue：[#155](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/155)
