# uni-app 使用此插件打包成 app 的使用方式和注意事项

## 平台判断

```js
// platform.js
const isH5 = process.env.UNI_PLATFORM === "h5";
const isApp = process.env.UNI_PLATFORM === "app";
// 在 h5 环境和 app 环境禁用插件
const WeappTailwindcssDisabled = isH5 || isApp;
```

此时的 `postcss.config.js` 就需要根据环境禁用 `rem2rpx` 转化了，因为 `h5` 和 `app` 根本不认识 `rpx` 这个单位:

```js
const path = require("path");
const { WeappTailwindcssDisabled } = require("./platform");

module.exports = {
  plugins: [
    require("autoprefixer")({
      remove: process.env.UNI_PLATFORM !== "h5",
    }),
    require("tailwindcss")({
      config: path.resolve(__dirname, "./tailwind.config.js"),
    }),
    // rem 转 rpx
    WeappTailwindcssDisabled
      ? undefined
      : require("postcss-rem-to-responsive-pixel/postcss7")({
          rootValue: 32,
          propList: ["*"],
          transformUnit: "rpx",
        }),
  ],
};
```

同时在这种情形下，你需要把 `webpack plugin` 给禁用了:

```js
// vue.config.js
/**
 * @type {import('@vue/cli-service').ProjectOptions}
 */
const config = {
  //....
  configureWebpack: {
    plugins: [
      new UniAppWeappTailwindcssWebpackPluginV4({
        // 只需传入 disabled，即可禁用， WeappTailwindcssDisabled 的值见上
        disabled: WeappTailwindcssDisabled,
      }),
    ],
  },
  //....
};
```

同样 `vite` 也是这样处理：

```js
// vite.config.js
// ...
// vite 插件配置
const vitePlugins = [uni()];

const postcssPlugins = [
  require("autoprefixer")(),
  require("tailwindcss")({
    config: resolve("./tailwind.config.js"),
  }),
];
if (!WeappTailwindcssDisabled) {
  vitePlugins.push(vwt());
  postcssPlugins.push(
    require("postcss-rem-to-responsive-pixel")({
      rootValue: 32,
      propList: ["*"],
      transformUnit: "rpx",
    })
  );
  postcssPlugins.push(postcssWeappTailwindcssRename({}));
}
// https://vitejs.dev/config/
export default defineConfig({
  plugins: vitePlugins,
  // 假如 postcss.config.js 不起作用，请使用内联 postcss Latset
  css: {
    postcss: {
      plugins: postcssPlugins,
    },
  },
});

```

详见对应模板的 `vue.config.js`/`vite.config.js` 中的 `h5` 和 `app` 平台禁用插件配置。

[uni-app-vue2-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template)

[uni-app-vue3-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-hbuilder-template)
