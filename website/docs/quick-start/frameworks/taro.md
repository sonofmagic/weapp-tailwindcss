# Taro v3 (所有框架)

`taro` 是一个优秀的框架，很多方面要比 `uni-app` 要强，另外 `rn` 虽然也有很多坑，但总比 `weex` 要好上不少。

这个配置同时支持 `taro` 的 `react` / `preact` / `vue2` / `vue3` 所有框架

:::caution
假如你写了 `tailwindcss` 工具类不生效，可能是由于微信开发者工具默认开启了 `代码自动热重载` 功能，关闭它即可生效。

假如你和 `NutUI` 一起使用，请一定要查看这个[注意事项](/docs/issues/use-with-nutui)
:::

## 注册插件

在项目的配置文件 `config/index` 中注册:

```js
// config/index.[jt]s
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
// 假如你使用 ts 配置，则使用下方 import 的写法
// import { UnifiedWebpackPluginV5 } from 'weapp-tailwindcss/webpack'

{
  // 找到 mini 这个配置
  mini: {
    // postcss: { /*...*/ },
    // 中的 webpackChain, 通常紧挨着 postcss 
    webpackChain(chain, webpack) {
      // 复制这块区域到你的配置代码中 region start
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
      // region end
    }
  }
}
```

然后正常运行项目即可，相关的配置可以参考模板 [taro-react-tailwind-vscode-template](https://github.com/sonofmagic/taro-react-tailwind-vscode-template)

:::tip
`weapp-tailwindcss/webpack` 对应的插件 `UnifiedWebpackPluginV5` 对应 `webpack5`

`weapp-tailwindcss/webpack4` 对应的插件 `UnifiedWebpackPluginV4` 对应 `webpack4`

在使用 `Taro` 时，检查一下 `config/index` 文件的配置项 `compiler`，来确认你的 `webpack` 版本，推荐使用 'webpack5'

另外假如你使用了 [`taro-plugin-compiler-optimization`](https://www.npmjs.com/package/taro-plugin-compiler-optimization) 记得把它干掉。因为和它一起使用时，它会使整个打包结果变得混乱。详见 [issues/123](https://github.com/sonofmagic/weapp-tailwindcss/issues/123) [issues/131](https://github.com/sonofmagic/weapp-tailwindcss/issues/131)

<!-- 还有不要和 `terser-webpack-plugin` 一起注册使用，这会导致转义功能失效 详见 [**常见问题**](/docs/issues#taro-webpack5-环境下这个插件和-terser-webpack-plugin-一起使用会导致插件转义功能失效) 和 [issues/142](https://github.com/sonofmagic/weapp-tailwindcss/issues/142) -->

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

## 视频演示

<iframe src="//player.bilibili.com/player.html?aid=966499437&bvid=BV1UW4y1w7VM&cid=1411385502&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
