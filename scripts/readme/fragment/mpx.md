
在 `vue.config.js` 中注册：

```js
// vue.config.js
const { defineConfig } = require('@vue/cli-service')
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')

module.exports = defineConfig({
  // other options
  configureWebpack(config) {
    config.plugins.push(new UnifiedWebpackPluginV5({
      appType: 'mpx'
    }))
  }
})

```
