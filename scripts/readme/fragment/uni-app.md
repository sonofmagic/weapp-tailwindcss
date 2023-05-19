
**在创建uni-app项目时，请选择uni-app alpha版本**

```bash
vue create -p dcloudio/uni-preset-vue#alpha my-alpha-project
```

这是因为默认创建的版本还是 `@vue/cli 4.x` 的版本，使用 `webpack4` 和 `postcss7`，而 `alpha` 版本使用 `@vue/cli 5.x` 即 `webpack5` 和 `postcss8`，这可以使用最新版本的 `tailwindcss` 和本插件。

```js
// 在 vue.config.js 里注册
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin/webpack')
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
