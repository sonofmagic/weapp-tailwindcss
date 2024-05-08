# Rax (react)

在根目录下创建一个 `build.plugin.js` 文件，然后在 `build.json` 中注册：

```json title="build.json"
{
  "plugins": [
    "./build.plugin.js"
  ],
}
```

回到 `build.plugin.js`

```js title="build.plugin.js"
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
module.exports = ({ context, onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    config.plugin('UnifiedWebpackPluginV5').use(UnifiedWebpackPluginV5, [
      {
        appType: 'rax',
      },
    ]);
  });
};

```
