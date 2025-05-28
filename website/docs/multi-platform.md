# 跨多端应用开发注意事项

## 何时开启插件

本插件主要作用于小程序环境，让开发者可以在小程序环境下可以使用 `tailwindcss` 的特性

然而在 `h5` 和 `app` 中，它们本来就是 `tailwindcss` 支持的环境，所以是没有必要开启本插件的。

所以你可以这样传入 `disabled` 选项。

### uni-app 示例

比如 `uni-app`:

```js title="vite.config.[jt]s"
const isH5 = process.env.UNI_PLATFORM === "h5";
// uni-app v2
// const isApp = process.env.UNI_PLATFORM === "app-plus";
// uni-app v3
const isApp = process.env.UNI_PLATFORM === "app";
// 只在小程序平台开启 weapp-tailwindcss 插件
// highlight-next-line
const WeappTailwindcssDisabled = isH5 || isApp;

const vitePlugins = [
  uni(), 
  uvwt({
    // highlight-next-line
    disabled: WeappTailwindcssDisabled
  })
];
```

### Taro 示例

```js title="config/index.ts"
const isH5 = process.env.TARO_ENV === "h5";
const isApp = process.env.TARO_ENV === "rn";
// highlight-next-line
const WeappTailwindcssDisabled = isH5 || isApp;

webpackChain(chain) {
  chain.merge({
    plugin: {
      install: {
        plugin: UnifiedWebpackPluginV5,
        args: [
          {
            // highlight-next-line
            disabled: WeappTailwindcssDisabled,
            rem2rpx: true
          }
        ]
      }
    }
  });
},
```

其他的框架，请自行在对应的文档中，发掘不同目标平台的环境变量判断方式。

## uni-app 打包安卓 `rgb()` 颜色失效问题

这是由于 `uni-app` 打包成安卓中 `webview` 内核版本较低，无法兼容 `rgb(245 247 255 / var(--tw-bg-opacity))` 这样的 `css` 写法导致的

这时候我们需要把这个写法，转换为兼容写法: `rgba(245, 247, 255, var(--tw-bg-opacity))`，具体解决方案:

### 安装 `postcss-preset-env`

```bash npm2yarn
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
