# Taro (所有框架)

目前 Taro v4 同时支持了 `Webpack` 和 `Vite` 进行打包编译，`weapp-tailwindcss` 这 `2` 者都支持，但是配置有些许的不同

:::caution
假如你写了 `tailwindcss` 工具类不生效，可能是由于微信开发者工具默认开启了 `代码自动热重载` 功能，关闭它即可生效。

假如你和 `NutUI` 一起使用，或者启用了 `@tarojs/plugin-html` 插件，请一定要查看这个[注意事项](/docs/issues/use-with-nutui)!

<!-- 有群友遇到了转义特殊字符失败，之后变成了空格的文件，结果 `node_modules` 删了重新安装就好了。 -->
:::

下列配置同时支持 `taro` 的 `react` / `preact` / `vue2` / `vue3` 所有框架


## 使用 Webpack 作为打包工具

### 注册插件

在项目的配置文件 `config/index` 中注册:

```js title="config/index.[jt]s"
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
      // highlight-start
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
      // highlight-end
      // region end
    }
  }
}
```

然后正常运行项目即可，相关的配置可以参考模板 [taro-react-tailwind-vscode-template](https://github.com/sonofmagic/taro-react-tailwind-vscode-template)

:::info
`weapp-tailwindcss/webpack` 对应的插件 `UnifiedWebpackPluginV5` 对应 `webpack@5`

`weapp-tailwindcss/webpack4` 对应的插件 `UnifiedWebpackPluginV4` 对应 `webpack@4`

在使用 `Taro` 时，检查一下 `config/index` 文件的配置项 `compiler`，来确认你的 `webpack` 版本，推荐使用 `'webpack5'`

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

## 使用 Vite 作为打包工具

<!-- :::danger
Taro Vite 目前存在一些 bug 还没有修复，不推荐使用! 

下方注册方式会存在部分样式丢失的情况
::: -->

由于 `taro@4` 的 `vite` 版本，目前加载 `postcss.config.js` 配置是失效的，所以我们目前暂时只能使用内联 `postcss` 插件的写法

### 在 `config/index.ts` 中注册插件

```ts title="config/index.[jt]s"
import type { Plugin } from 'vite'
import tailwindcss from 'tailwindcss'
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from 'weapp-tailwindcss/vite'

const baseConfig: UserConfigExport<'vite'> = {
  // ... 其他配置
  // highlight-start
  compiler: {
    type: 'vite',
    vitePlugins: [
      {
        // 通过 vite 插件加载 postcss,
        name: 'postcss-config-loader-plugin',
        config(config) {
          // 加载 tailwindcss
          if (typeof config.css?.postcss === 'object') {
            config.css?.postcss.plugins?.unshift(tailwindcss())
          }
        },
      },
      uvtw({
        // rem转rpx
        rem2rpx: true,
        // 除了小程序这些，其他平台都 disable
        disabled: process.env.TARO_ENV === 'h5' || process.env.TARO_ENV === 'harmony' || process.env.TARO_ENV === 'rn',
        // 由于 taro vite 默认会移除所有的 tailwindcss css 变量，所以一定要开启这个配置，进行css 变量的重新注入
        injectAdditionalCssVarScope: true,
      })
    ] as Plugin[] // 从 vite 引入 type, 为了智能提示
  },
  // highlight-end
  // ... 其他配置
}
```

`tailwindcss` 即可注册成功，正常使用了

这段代码的意思为，在 `vite` 里注册 `postcss` 插件和 `vite` 插件

> `vite.config.ts` 只有在运行小程序的时候才会加载，`h5` 不会，所以只能通过这种方式进行 `小程序` + `h5` 双端兼容


## 视频演示

<iframe src="//player.bilibili.com/player.html?aid=966499437&bvid=BV1UW4y1w7VM&cid=1411385502&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
