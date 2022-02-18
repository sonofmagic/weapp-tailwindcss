# rax 使用方法

`rax` 可使用 `webpack5` 和 `postcss8` ， 所以使用方式如下

## 1.安装

```bash
yarn add -D weapp-tailwindcss-webpack-plugin postcss-rem-to-responsive-pixel tailwindcss postcss autoprefixer
```

## 2. 创建 `postcss.config.js` 和 `tailwind.config.js`

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-rem-to-responsive-pixel': {
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    }
  }
}
```

```js
//tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {}
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
```

## 3. 创建全局样式文件 `src/global.scss`

```scss
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
```

## 4. 使用此插件

### 创建 `build.plugin.js`

```js
// build.plugin.js
const { RaxTailwindcssWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')

module.exports = ({ context, onGetWebpackConfig }) => {
  onGetWebpackConfig((config) => {
    // compiler.webpack.version 5.65.0
    config.plugin('RaxTailwindcssWebpackPluginV5').use(RaxTailwindcssWebpackPluginV5)
  })
}
```

然后引入 `build.json`

```json
{
  "targets": [
    // "miniapp",
    "wechat-miniprogram"
  ],
  "webpack5": true,
  "plugins": ["./build.plugin.js"],
  "postcssrc": true
}
```

现在你就可以使用 `jit` 中的很多特性了！

## rax 注意点

rax 内置的 postcss 会默认移除

`selector .space-y-\[1\.6rem\] > :not([hidden]) ~ :not([hidden]) is not supported in miniapp css, so it will be deleted`

`selector .divide-x-\[10px\] > :not([hidden]) ~ :not([hidden]) is not supported in miniapp css, so it will be deleted`

这些节点。
