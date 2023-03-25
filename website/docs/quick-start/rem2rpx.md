# rem 转 rpx (或 px)

前面我们安装配置好了 `tailwindcss`，接下来一步便是配置 `rem` 转 `rpx`

## 为什么要配置这一步呢？

这是因为 `tailwindcss` 里面工具类的长度单位，默认都是 `rem`，比如:

```css
.m-4{
  margin: 1rem;
}
.h-4{
  height: 1rem; 
}
/*......*/
```

这在 `h5` 环境下自适应良好。但小程序里面，我们大部分情况都是使用 `rpx` 这个单位来进行自适应，所以就需要把默认的 `rem` 单位转化成 `rpx`。

## 配置tailwindcss单位转化

### 两种转化方式(二者选其一即可)

1. 假如你想要把项目里，所有的 `rem` 都转化成 `rpx`，那么 `postcss plugin`: [postcss-rem-to-responsive-pixel](https://www.npmjs.com/package/postcss-rem-to-responsive-pixel) 适合你。

2. 假如你想缩小一下范围，只把 `tailwindcss` 生成的工具类的单位，从 `rem` 转变为 `rpx`，那么 `tailwindcss preset`: [tailwindcss-rem2px-preset](https://www.npmjs.com/package/tailwindcss-rem2px-preset) 适合你。

推荐第一种转化方式，这会把项目里所有你编写的，或者引入的第三方控件里的 `rem` 单位，全部转化为 `rpx`，当然这个包也提供了各种配置项，帮助你进行更加细致的操作。

### 1. `postcss-rem-to-responsive-pixel` (推荐)

首先我们安装它:

```sh
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
    },
  },
};
```

### 2. `tailwindcss-rem2px-preset`

同样我们安装它：

```sh
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
