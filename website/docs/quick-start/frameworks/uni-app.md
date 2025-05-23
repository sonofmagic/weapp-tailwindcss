# uni-app cli vue2 webpack

:::warning
这是 `uni-app cli` 创建的项目的注册方式，如果你使用 `HbuilderX`，应该查看 [uni-app HbuilderX 使用方式](/docs/quick-start/frameworks/hbuilderx)
:::

:::tip
截止到 (2023/09/08)，目前所有的 `uni-app vue2 cli` 项目的 `webpack` 版本，已经切换到了 `webpack@5`，`@vue/cli@5`，`postcss@8` 了

另外如果你有旧有的 `uni-app webpack4` 项目需要迁移到 `webpack5`，可以看这篇 [旧有uni-app项目升级webpack5指南](/docs/upgrade/uni-app)
:::

```js title="vue.config.js"
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  // some option...
  // highlight-start
  configureWebpack: (config) => {
    config.plugins.push(
      new UnifiedWebpackPluginV5({
        rem2rpx: true,
      })
    )
  }
  // highlight-end
  // other option...
}

module.exports = config
```

这样所有的配置便完成了！赶紧启动你的项目试试吧！
