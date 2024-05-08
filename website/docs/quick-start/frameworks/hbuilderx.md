# uni-app HbuilderX 使用方式

## 默认使用方式

> 配置会稍微复杂一些，这里推荐直接使用或者参考模板: [uni-app-vue3-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-hbuilder-template)

### tailwind.config.js

注意: 在使用 `hbuilderx` 进行开发时，由于目录结构和启动项的不同，你必须要给你 `tailwind.config.js` 传入**绝对路径**:

```js title="tailwind.config.js"
const path = require("path");

const resolve = (p) => {
  return path.resolve(__dirname, p);
};
/** @type {import('tailwindcss').Config} */
module.exports = {
  // 注意此处，一定要 `path.resolve` 一下, 传入绝对路径
  // 你要有其他目录，比如 components，也必须在这里，添加一下
  content: ["./index.html", "./pages/**/*.{html,js,ts,jsx,tsx,vue}"].map(resolve),
  // ...
  corePlugins: {
    preflight: false,
  },
};
```

### vite.config.[tj]s

另外使用 `vite.config.[tj]s` 中注册 `tailwindcss` 时，也要传入绝对路径:

```js title="vite.config.[tj]s"
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

export default defineConfig({
  plugins: [uni(), uvwt({
    rem2rpx: true,
    disabled: WeappTailwindcssDisabled
  })],
  css: {
    postcss: {
      plugins: [
        require("tailwindcss")({
          // 注意此处，手动传入你 `tailwind.config.js` 的绝对路径
          config: resolve("./tailwind.config.js"),
        }),
        require("autoprefixer"),
      ],
    },
  },
});
```

`hbuilderx` 正式版本的 `vue2` 项目,由于使用 `webpack4` 和 `postcss7`，所以只能使用本插件的 `weapp-tailwindcss/webpack4` 或 `v1` 版本， [uni-app-vue2-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template)，或者下方也有一种 `Hack hbuilderx vue2 Way`

<!-- 另外出于开发体验的角度，还是推荐使用 `vscode` 作为你的开发工具，`hbuilderx` 只用于进行原生发布调试与 `ucloud` 部署用。 -->

## Hack hbuilderx vue2 Way

:::caution
以下方式为全局 Hack, 可能会在 `hbuilderx` 升级后出现问题
:::

`hbuilderx` 和 `hbuilderx alpha` 新建的 `vue2` 项目，发现它们的 `webpack` 版本被锁死在了 **`4`** ，我又用 `cli` 创建了一个 `vue2` 项目，发现已经是 `webpack5` 了，看起来只有 `cli` 创建的项目，会被默认升级 `webpack5`。

当然这并不意味着 `hbuilderx` 创建的 `vue2` 项目无法使用最新的这个插件，我们可以强行升级 `HBuilderX/plugins/uniapp-cli` 中的依赖，使得它适配 `webpack5`

> Macos uniapp-cli 路径在  /Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli
>
> Windows 的路径应该也在类似的地方，记得要先下载 vue2 的编译器，这个文件夹才有

来到 `uniapp-cli` 这个项目路径，执行 `yarn upgradeInteractive --latest` 升级项目依赖，重点升级 `@vue/cli-*` 相关包到 `5`

这时候 `webpack` 已经被升级到 `5` 版本了，然后你升级其他的 `loader` 到适配 `webpack5` 的版本(通常是最新版本)

再安装 `postcss` 和 `postcss-loader` 的最新版本，这时候你就把整个 `uni-app vue2` 项目的 `hbuilderx` 内置 `cli` 从 `webpack4`,`postcss7`变为了 `webpack5`,`postcss8` 了

不过代价是什么呢？那就是，这项改动是全局的！

你要想恢复设置，那只有重新安装 `uni-app vue2` 编译插件，或者重新安装整个 `hbuilderx`，所以这里还是推荐使用 `cli` 方式去创建项目，保证一个项目一个编译模式，你要节省空间就用 `pnpm`, 想用什么版本编译就用什么版本。

## 视频演示

<iframe src="//player.bilibili.com/player.html?aid=411561123&bvid=BV1EV41197Ps&cid=1413438914&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

## Hbuilderx 与 uni-app cli 环境汇总

首先，你需要知道你的项目究竟使用的是什么打包工具，截止今天 `2023/12/18` 目前如下所示:

|                  | webpack  | vite | postcss  |
| ---------------- | -------- | ---- | -------- |
| hbuilderx vue2   | webpack4 | x    | postcss7 |
| uni-app cli vue2 | webpack5 | x    | postcss8 |
| hbuilderx vue3   | x        | √    | postcss8 |
| uni-app cli vue3 | x        | √    | postcss8 |

也就是说，目前 `hbuilderx vue2` 的项目是最老的，无法使用最新版本的 `tailwindcss`，其他都可以使用。
