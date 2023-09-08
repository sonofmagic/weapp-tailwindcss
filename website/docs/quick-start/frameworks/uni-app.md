# uni-app (vue2/3)

:::tip
截止到今天(2023/09/08)，目前所有的 `uni-app vue2` 版本，已经切换到了 `webpack5`，`@vue/cli 5.x`，所以不需要去特意使用 `uni-app vue2 alpha`版本了！
<!-- **在创建uni-app项目时，请选择uni-app alpha版本**  

这是因为，目前默认创建的版本还是 `@vue/cli 4.x` 的版本，使用 `webpack 4.x` 和 `postcss 7.x`，而 `alpha` 版本使用 `@vue/cli 5.x` ，内部使用 `webpack 5.x` 和 `postcss 8.x`，这才可以使用最新版本的 `tailwindcss` 和本插件的最新插件版本。

如果你使用 `@vue/cli 4.x` 版本，你可以使用非 `Unified` 开头的`v1`版本的插件，不过它们的开发体验要比 `Unified` 开头的插件差一些。

通过 `@vue/cli` 创建的方式为：

```bash
vue create -p dcloudio/uni-preset-vue#alpha my-alpha-project
``` -->

另外如果你有旧有的 `uni-app webpack4` 项目需要迁移到 `webpack5`，可以看这篇 [旧有uni-app项目升级webpack5指南](/docs/upgrade/uni-app)
:::

```js
// 在 vue.config.js 里注册
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  // some option...
  configureWebpack: (config) => {
    config.plugins.push(
      new UnifiedWebpackPluginV5({
        appType: 'uni-app'
      })
    )
  }
  // other option...
}

module.exports = config
```

这样所有的配置便完成了！赶紧启动你的项目试试吧！
