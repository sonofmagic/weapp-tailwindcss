# hbuilderx 使用方式

注意: 在使用 `hbuilderx` 进行开发时，必须要给你 `tailwind.config.js` 传入绝对路径:

```js
const path = require("path");

const resolve = (p) => {
  return path.resolve(__dirname, p);
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 注意此处，一定要 `path.resolve` 一下
  content: ["./index.html", "./**/*.vue"].map(resolve),
  // ...
  corePlugins: {
    preflight: false,
  },
};
```

另外使用 `vite.config.[tj]s` 中注册 `tailwindcss` 时，也要传入绝对路径:

```js
import path from "path";
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from "weapp-tailwindcss/vite";
// 注意： 打包成 h5 和 app 都不需要开启插件配置
const isH5 = process.env.UNI_PLATFORM === "h5";
const isApp = process.env.UNI_PLATFORM === "app";
const WeappTailwindcssDisabled = isH5 || isApp;

const resolve = (p) => {
  return path.resolve(__dirname, p);
};

const vitePlugins = [uni(), uvwt({
  disabled: WeappTailwindcssDisabled
})];



const postcssPlugins = [
  require("autoprefixer")(),
  require("tailwindcss")({
    // 注意此处，手动传入你 `tailwind.config.js` 的位置
    config: resolve("./tailwind.config.js"),
  }),
];
if (!WeappTailwindcssDisabled) {
  postcssPlugins.push(
    require("postcss-rem-to-responsive-pixel")({
      rootValue: 32,
      propList: ["*"],
      transformUnit: "rpx",
    })
  );
}

export default defineConfig({
  plugins: vitePlugins,
  css: {
    postcss: {
      plugins: postcssPlugins,
    },
  },
});
```

这里推荐直接使用或者参考模板: [uni-app-vue3-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-hbuilder-template)

`hbuilderx` 正式版本的 `vue2` 项目推荐使用本插件的 `v1` 版本 [uni-app-vue2-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template)

另外出于开发体验的角度，还是推荐使用 `vscode` 作为你的开发工具，`hbuilderx` 只用于进行原生发布调试与 `ucloud` 部署用。
