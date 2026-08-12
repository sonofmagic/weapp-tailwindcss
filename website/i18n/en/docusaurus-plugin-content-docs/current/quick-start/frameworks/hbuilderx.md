---
title: How to use uni-app HBuilderX
description: How to configure the HBuilderX Vue3 Vite project to access Tailwind CSS 4 and weapp-tailwindcss, as well as suggestions for processing Vue2 Webpack stock projects.
keywords:
  - quick start
  - Install
  - Configuration
  - uni-app
  - HBuilderX
  - Usage
  - quick start
  - frameworks
  - weapp-tailwindcss
  - tailwindcss
  - Mini program
  - WeChat applet
  - taro
  - mpx
---

# uni-app HBuilderX usage

:::caution
This article contains both `HBuilderX` routes:

- `HBuilderX Vue3 Vite`: Recommended
- `HBuilderX Vue2 Webpack`: only for maintenance of existing projects
  :::

## HBuilderX Vue3 Vite

This route is suitable for Vue3 Vite projects created by HBuilderX. HBuilderX will change `process.cwd()` at runtime, so it is recommended to use absolute paths for both scan paths and `cssEntries`.

The current documentation is for `tailwindcss@4`. The current documentation only maintains Tailwind CSS 4 access instructions.

### CSS entry

```css title="src/app.css"
@import "tailwindcss";
@source "../pages/**/*.{html,js,ts,jsx,tsx,vue}";
@source "../components/**/*.{html,js,ts,jsx,tsx,vue}";
@source not "../uni_modules";
@source not "../unpackage";
```

The entry of Tailwind 4 should only be placed in the pure `.css` file. Do not write directly into the `scss`, `less`, and `sass` entries. VS Code IntelliSense can point `tailwindCSS.experimental.configFile` to this CSS file when needed.

The entry CSS still has to be actually introduced by the project, such as `src/App.vue` in the global `<style>` of `@import "./app.css";`. `cssEntries` is the entry recognition configuration for `weapp-tailwindcss` and will not replace HBuilderX / uni-app to include the CSS file into the build graph.

### vite.config.[tj]s

Pass in the absolute path of the entry CSS when registering `WeappTailwindcss`:

```js title="vite.config.[tj]s"
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

const projectRoot = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss({
      cssOptions: {
        rem2rpx: true,
      },
      tailwindcssBasedir: projectRoot,
      cssEntries: [
        resolve(projectRoot, 'src/app.css'),
      ],
    })
  ],
})
```

```vue title="src/App.vue"
<style>
@import "./app.css";
</style>
```

`UNI_PLATFORM=h5`, `app` or `app-plus`, the generator default target will automatically switch to `web`, and there is no need to write If your custom build environment does not inject these variables, you can specify web output explicitly:

```js
WeappTailwindcss({
  generator: {
    target: "web",
  },
  cssOptions: {
    rem2rpx: true,
  },
  tailwindcssBasedir: projectRoot,
  cssEntries: [
    resolve(projectRoot, "src/app.css"),
  ],
});
```

`disabled` is only suitable for standalone native or custom builds that do not want plugins to be involved at all, and is not a general configuration for H5/normal App WebView.

Do not register the Tailwind official build plug-in in build mode, and do not register `@tailwindcss/postcss` or `@tailwindcss/vite`. When the project already has PostCSS configuration, only keep the non-Tailwind plug-ins required by the framework or business needs.

`hbuilderx` The official version of the `vue2` project is no longer adapted to the current version due to the use of `webpack4` and `postcss7`. Please stay in the old version for existing projects, or migrate to the `HBuilderX Vue3 Vite` / `uni-app cli vue2 webpack5` link.

## HBuilderX and uni-app CLI environment summary

First confirm the build link actually used by the project. The following are common combinations during document maintenance. The project is subject to the compilation plug-in installed by the native HBuilderX:

|                  | webpack  | vite | postcss  |
| ---------------- | -------- | ---- | -------- |
| HBuilderX Vue2   | webpack4 | x    | postcss7 |
| uni-app CLI Vue2 | webpack5 | x    | postcss8 |
| HBuilderX Vue3   | x        | √    | postcss8 |
| uni-app CLI Vue3 | x        | √    | postcss8 |

The current version recommends using Vite or Webpack5 links. HBuilderX Vue2 Webpack4 project recommends staying with the old version of the plugin, or migrating to Vue3 Vite / uni-app CLI Vue2 Webpack5.

## HBuilderX Vue2 Webpack (stock project) {#hbuilderx-vue2-webpack}

The current version no longer has built-in Webpack4 / PostCSS7 / Tailwind CSS v2 compatible entry. If you must maintain the `hbuilderx vue2` project, please continue to use the older version of `weapp-tailwindcss`, or migrate to the Vite / Webpack5 link recommended above.

## It is not recommended to globally change the HBuilderX Vue2 compiler

:::caution
The following approach will change the HBuilderX built-in compiler and affect all HBuilderX Vue2 projects on the same machine. Don't use it in daily projects unless you know the cost of rollback.
:::

Early HBuilderX Vue2 projects were usually locked into Webpack4 / PostCSS7. Some people will directly upgrade `HBuilderX/plugins/uniapp-cli`, loader, `@vue/cli-*` and `postcss` in `postcss-loader` and change the built-in link to Webpack5 / PostCSS8.

This is not a recommended path. It will make the global compilation environment of HBuilderX inconsistent with the status of the official plug-in. It may also become invalid after upgrading HBuilderX or reinstalling the compilation plug-in.

> macOS uniapp-cli path is in /Applications/HBuilderX.app/Contents/HBuilderX/plugins/uniapp-cli
>
> The Windows path is usually also in the HBuilderX installation directory. You need to install the Vue2 compilation plug-in first before this directory will appear.

A more stable approach is to migrate the project, or use uni-app CLI to maintain the Vue2 Webpack5 link separately. Such a project corresponds to a set of dependencies, making it easy to troubleshoot problems.

## Video demonstration

<iframe src="//player.bilibili.com/player.html?aid=411561123&bvid=BV1EV41197Ps&cid=1413438914&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
