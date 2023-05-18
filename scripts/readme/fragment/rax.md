
在根目录下创建一个 `build.plugin.js` 文件，然后在 `build.json` 中注册：

```json
{
  "plugins": [
    "./build.plugin.js"
  ],
}
```

回到 `build.plugin.js`

```js
// build.plugin.js
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin/webpack')
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
