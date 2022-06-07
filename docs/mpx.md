# mpx框架的使用方法

Mpx 是滴滴出行下，一款具有优秀开发体验和深度性能优化的增强型跨端小程序框架。

`mpx` 中使用 `webpack5` 和 `postcss8` ， 所以使用方式如下:

## 1.安装

```bash
yarn add -D weapp-tailwindcss-webpack-plugin postcss-rem-to-responsive-pixel tailwindcss postcss autoprefixer
# 需要用 sass 需要额外安装
yarn add -D sass-loader sass
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
  content: ['./src/**/*.{html,js,ts,mpx}'],
  theme: {
    extend: {}
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
```

## 3. 在 `app.mpx` 引入 `tailwindcss`

```scss
// scss
@import 'tailwindcss/base';
@import 'tailwindcss/utilities';
// or 
@tailwind base;
@tailwind utilities;
```

> 使用 `scss` 需要额外配置 `getRules` 配置文件，见 [mpx#css-预编译](https://mpxjs.cn/guide/basic/css.html#css-%E9%A2%84%E7%BC%96%E8%AF%91)


## 4. 使用此插件

在 `build/getPlugins.js` 中引入插件

```js
// build/getPlugins.js
const { MpxWeappTailwindcssWebpackPluginV5 } = require('weapp-tailwindcss-webpack-plugin')
// then 

plugins.push(new MpxWeappTailwindcssWebpackPluginV5())
```

现在你就可以使用 `jit` 中的很多特性了！