# 跨端注意事项

## 何时开启插件

本插件主要作用于小程序环境，让开发者可以在小程序环境下可以使用 `tailwindcss` 的特性

然而在 `h5` 和 `app` 中，它们本来就是 `tailwindcss` 支持的环境，所以是没有必要开启本插件的。

所以你可以这样写:

```js
const isH5 = process.env.UNI_PLATFORM === "h5";
// uni-app v2
const isApp = process.env.UNI_PLATFORM === "app-plus";
// uni-app v3
// const isApp = process.env.UNI_PLATFORM === "app";
const WeappTailwindcssDisabled = isH5 || isApp;

// 2种选一即可 region start
// 1. 传递 disabled option
const vitePlugins = [uni(), uvwt({
  disabled: WeappTailwindcssDisabled
})];

// 2. 按照条件设置插件
const vitePlugins = [uni()];

if (!WeappTailwindcssDisabled) {
  vitePlugins.push(
    uvwt()
  );
}
// region end
```

## uni-app 打包安卓 `rgb()` 颜色失效问题

这是由于 `uni-app` 打包成安卓中 `webview` 内核版本较低，无法兼容 `rgb(245 247 255 / var(--tw-bg-opacity))` 这样的 `css` 写法导致的

这时候我们需要把这个写法，转换为兼容写法: `rgba(245, 247, 255, var(--tw-bg-opacity))`，具体解决方案:

### 安装 `postcss-preset-env`

```bash
# npm / yarn / pnpm
npm i -D postcss-preset-env
```

### 设置 `postcss.config.js`

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      browsers: 'chrome >= 50', // configure a compatible browser version
    },
  },
};
```

这样，所有的 `rgb` 和 `/` 写法就被转化成兼容写法了。

相关issue详见:<https://github.com/tailwindlabs/tailwindcss/issues/7618#issuecomment-1140693288>
