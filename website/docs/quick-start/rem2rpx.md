# 2. rem 转 rpx (或 px)

前面我们安装配置好了 `tailwindcss`，接下来一步便是配置 `rem` 转 `rpx`

## 为什么要配置这一步呢？

这是因为 `tailwindcss` 里面工具类的长度单位，默认都是 `rem`，比如:

```css
.m-4 {
  margin: 1rem;
}
.h-4 {
  height: 1rem; 
}
/*......*/
```

`rem`这个单位在 `h5` 环境下自适应良好，但小程序环境下，我们大部分情况都是使用 `rpx` 这个单位来进行自适应，所以就需要把默认的 `rem` 单位转化成 `rpx`。

## 三种转化方式(根据你的需求选其一即可)

## 插件内置 rem 转 rpx 功能 (推荐)

在 `^3.0.0` 版本中，所有插件都内置了 `rem2rpx` 参数，默认不开启，要启用它只需将它设置成 `true` 即可

```diff
// vite.config.js
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite'
UnifiedViteWeappTailwindcssPlugin({
+ rem2rpx: true
})
// webpack
const { UnifiedWebpackPluginV5 } = require('weapp-tailwindcss/webpack')
new UnifiedWebpackPluginV5({
+ rem2rpx: true
})
```

设置为 `true` 相当于 `rem2rpx` 传入下方这样一个配置对象:

```js
{
  // 32 意味着 1rem = 32rpx
  rootValue: 32,
  // 默认所有属性都转化
  propList: ['*'],
  // 转化的单位,可以变成 px / rpx
  transformUnit: 'rpx'
}
```

当然你也可以自行传入一个 `object` 来进行更多配置，具体的配置项见 [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel)

### 优势

这种方式 **最简单**，和插件集成度高，传入一个配置就好了。

## 外置 postcss 插件

<!-- 假如你想要把项目里，所有的 `rem` 都转化成 `rpx`，那么 `postcss plugin`: [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel) 适合你。 -->

<!-- 推荐第一种转化方式，这会把项目里所有你编写的，或者引入的第三方控件里的 `rem` 单位，全部转化为 `rpx`，同时这个包也提供了各种配置项，帮助你进行更加细致的操作。 -->

首先我们安装 [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel)

```bash
npm i -D postcss-rem-to-responsive-pixel
```

安装好之后，把它注册进你的 `postcss.config.js` 即可:

```js
// postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-rem-to-responsive-pixel': {
      // 32 意味着 1rem = 32rpx
      rootValue: 32,
      // 默认所有属性都转化
      propList: ['*'],
      // 转化的单位,可以变成 px / rpx
      transformUnit: 'rpx',
      // postcss-rem-to-responsive-pixel@6 版本添加了 disabled 参数，用来禁止插件的转化
      // disabled: process.env.TARO_ENV === 'h5' || process.env.TARO_ENV === 'rn'
    },
  },
};
```

:::tip

一些用户在使用 `tarojs` 开发的时候，错误的把 `tailwindcss` 配置在了 `config/index.js` 的 `postcss` 里，导致不生效。

原因实际上是因为 `config/index.js` 的 `postcss`这个配置，只是用来配置 `tarojs` **内置** `postcss` 插件的参数。

要使用 `tailwindcss`，你需要在项目根目录，新建一个 `postcss.config.js`，然后把上面的代码写入进去。
:::

### 优势

这种方式 **最灵活**，你可以自由的决定 `postcss` 插件的加载顺序，也可以按你自己的策略按需加载插件 (比如特定目录下的样式才接受这个插件的转化)

## 外置 tailwindcss 插件

你想缩小一下范围，只把 `tailwindcss` 生成的工具类的单位，从 `rem` 转变为 `rpx`，那么 `tailwindcss preset`: [tailwindcss-rem2px-preset](https://www.npmjs.com/package/tailwindcss-rem2px-preset) 适合你。

同样我们安装它：

```bash
npm i -D tailwindcss-rem2px-preset
```

然后在 `tailwind.config.js` 中，注册这个预设：

```js
// tailwind.config.js

module.exports = {
  presets: [
    require('tailwindcss-rem2px-preset').createPreset({
      // 32 意味着 1rem = 32rpx
      fontSize: 32,
      // 转化的单位,可以变成 px / rpx
      unit: 'rpx'
    })
  ],
  // ...
}
```

这样即可完成 `tailwindcss` 默认工具类的 `rem` 转 `rpx` 的配置了。

### 优势

这种方式受影响范围 **最小**，因为 `preset` 方式处理 `tailwindcss`,不会把你写的其他样式里的 `rem` 转化成 `rpx`
