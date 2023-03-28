# Taro v3 (所有框架)

`taro` 是一个优秀的框架，很多方面要比 `uni-app` 要强，另外 `rn` 虽然也有很多坑，但总比 `weex` 要好上不少。

这个配置同时支持 `taro` 的 `react` / `preact` / `vue2` / `vue3` ...所有框架

:::tip
**在使用Taro时，检查一下把 config/index 的配置项 compiler 设置为 'webpack5'**

**另外不要开启二次编译缓存!**

```js
cache: {
  enable: false
},
```

这会导致二次编译时，直接跳过插件的转义。目前这块我正在处理中。
:::

在项目的配置文件 `config/index` 中注册:

```js
// config/index
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')

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

运行项目即可
