由于 `remax` 内置的 `webpack` 版本为 `4` , `postcss` 版本为 `7`, 所以还是只能使用 `@tailwindcss/postcss7-compat` 版本。

#### 1. 于是我们开始安装:

```bash
yarn add -D weapp-tailwindcss-webpack-plugin postcss-rem-to-responsive-pixel tailwindcss@npm:@tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9
```

> [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel) 是一个由本人撰写的 postcss 插件，支持 `rem` -> `rpx`，同时支持 `postcss7` 和 `postcss8`，[配置见此](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel)

##### Usage

```js
// postcss 8:
require('postcss-rem-to-responsive-pixel')
// postcss 7:
require('postcss-rem-to-responsive-pixel/postcss7')
```

#### 2. 然后添加 `tailwind.config.js`:

```js
// 基础配置，无需任何preset
// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/remax-app/tailwind.config.js
/** @type {import('@types/tailwindcss/tailwind-config').TailwindConfig} */
module.exports = {
  mode: 'jit',
  purge: {
    content: ['./src/**/*.{js,ts,jsx,tsx,wxml}']
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {}
  },
  variants: {},
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
```

#### 3. 再添加 `postcss.config.js`

```js
// 参考示例
// https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/remax-app/postcss.config.js
module.exports = ({ options }) => ({
  plugins: {
    // 继承 remax 默认的插件配置
    ...options.plugins,
    tailwindcss: {},
    autoprefixer: {},
    'postcss-rem-to-responsive-pixel/postcss7': {
      rootValue: 32,
      propList: ['*'],
      transformUnit: 'rpx'
    }
  }
})
```

#### 4. 添加 `.env` 设置 `TAILWIND_MODE`

```plain
# https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/blob/main/demo/remax-app/.env
# 假如 jit 模式 HMR 失效
TAILWIND_MODE=watch
```

这是为了兼容 postcss7 的 HMR 方案，如果你是用的是 postcss8 就不需要了。

#### 5. 在 `src/app.css` 中添加:

```scss
/*每个页面公共css */
// scss 需要安装 yarn add -D sass sass-loader@^10
// 小程序需要 'base' 来注入变量，但不需要 html preflight
@tailwind base;
@tailwind utilities;
// scss
// @import 'tailwindcss/base';
// @import 'tailwindcss/utilities';
```

#### 6. 在根目录下修改 `remax.config.js`

```js
// remax.config.js
const { RemaxWeappTailwindcssWebpackPluginV4 } = require('weapp-tailwindcss-webpack-plugin')

module.exports = {
  one: true,
  output: 'dist/' + process.env.REMAX_PLATFORM,
  configWebpack({ config, webpack, addCSSRule }) {
    config.plugin('RemaxWeappTailwindcssWebpackPluginV4').use(RemaxWeappTailwindcssWebpackPluginV4)
  }
}
```

现在，您就可以在 `remax` 中使用 `jit` 的大部分特性了！
