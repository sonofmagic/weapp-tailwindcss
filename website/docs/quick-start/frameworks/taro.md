# Taro v3 (所有框架)

`taro` 是一个优秀的框架，很多方面要比 `uni-app` 要强，另外 `rn` 虽然也有很多坑，但总比 `weex` 要好上不少。

这个配置同时支持 `taro` 的 `react` / `preact` / `vue2` / `vue3` ...所有框架

:::tip
**在使用Taro时，检查一下把 config/index 的配置项 compiler 设置为 'webpack5'**

另外假如你使用了 [`taro-plugin-compiler-optimization`](https://www.npmjs.com/package/taro-plugin-compiler-optimization) 记得把它干掉。因为和它一起使用时，它会使整个打包结果变得混乱。[issues/123](https://github.com/sonofmagic/weapp-tailwindcss/issues/123) [issues/131](https://github.com/sonofmagic/weapp-tailwindcss/issues/131)

还有不要和 `terser-webpack-plugin` 一起注册使用，这会导致转义功能失效 详见 [**常见问题**](/docs/issues#taro-webpack5-环境下这个插件和-terser-webpack-plugin-一起使用会导致插件转义功能失效) 和 [issues/142](https://github.com/sonofmagic/weapp-tailwindcss/issues/142)

还有 `taro` 的 `prebundle` 功能老是出错，最近更新之后，由于 `prebundle` 默认开启，有时候连 `taro cli` 初始化的模板项目都跑不起来，假如遇到问题找不到原因，可以尝试关闭这个配置。
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

:::caution
假如你和 `NutUI` 一起使用，请一定要查看这个[注意事项](/docs/issues/use-with-nutui)
:::

在项目的配置文件 `config/index` 中注册:

```js
// config/index
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')

{
  mini: {
    webpackChain(chain, webpack) {
      chain.merge({
        plugin: {
          install: {
            plugin: UnifiedWebpackPluginV5,
            args: [{
              appType: 'taro'
            }]
          }
        }
      })
    }
  }
}
```

然后正常运行项目即可，相关的配置可以参考模板 [taro-react-tailwind-vscode-template](https://github.com/sonofmagic/taro-react-tailwind-vscode-template)
