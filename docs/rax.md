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

### 1. rax 默认移除样式

rax 内置的 postcss 会默认移除

`selector .space-y-\[1\.6rem\] > :not([hidden]) ~ :not([hidden]) is not supported in miniapp css, so it will be deleted`

`selector .divide-x-\[10px\] > :not([hidden]) ~ :not([hidden]) is not supported in miniapp css, so it will be deleted`

这些节点。

### 2. 无法使用最新的 `postcss8` 和 `tailwindcss3` ?

有时候由于一些项目的历史原因(比如依赖的插件只支持 `postcss7` ) , 我们不得不在项目里使用低版本的 `postcss7` 和 `tailwindcss2` 。

此时需要把 `tailwind.config.js` 更改为 `tailwindcss2` 的配置:

```js
module.exports = {
  mode: 'jit',
  purge: {
    content: ['./src/**/*.{js,ts,jsx,tsx,wxml}'],
  },
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
```

原因详见 https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/23

### 3. rax 默认样式覆盖问题

`rax` 很多元素有默认样式，比如 `rax-view` `rax-text` 
```css
.rax-view-v2 {
   box-sizing: border-box;
   display: flex;
   flex-direction: column;
   flex-shrink: 0;
   align-content: flex-start;
   border: 0 solid black;
   margin: 0;
   padding: 0;
   min-width: 0;
}
.rax-text-v2 {
  box-sizing: border-box;
  display: block;
  font-size: 32rpx;
  white-space: pre-wrap;
}
/* 还有很多 */
```

这些样式，默认都会在优先级上覆盖 `tailwindcss` 生成的样式，造成写了`class`样式却没有效果。

这时候可以利用样式的优先级来覆盖默认样式，或者也可以这样写:

```html
<View className="!border-[10px] !border-[#098765] !border-solid !border-opacity-[0.44]"></View>
```

在每个 `class` 前加 `!` 代表着对应 `tailwindcss` 生成的样式每一条`css`都会加 `!important`。