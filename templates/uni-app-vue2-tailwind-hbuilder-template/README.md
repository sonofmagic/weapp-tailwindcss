# uni-app-vue2-tailwind-hbuilder-template

> 由于hbuilderx更新之后，它和tailwindcss v2的热更新产生了冲突，导致了 [#9](https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template/issues/9) 这个问题。
>
> 想要绕过，你可以使用 vue3 版本，或者使用 vue2 的 cli 版本,它们都可以使用最新的 tailwindcss v3 版本！
>
> 此版本废弃！！

注意(重要)：此版本由于目前 hbuilderX 含(alpha)版本，针对 `webpack` 打包的项目，只能使用 `postcss7` 无法使用最新的 `postcss8`，导致这个模板只能使用 `tailwindcss v2`，相比 `tailwindcss v3`，失去了许多的功能特性。所以建议你使用:

- vue3 vite vscode模板 [uni-app-vite-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template)  
- vue2 vscode模板 [uni-app-vue2-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-vscode-template)
- vue3 HbuilderX[uni-app-vue3-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-hbuilder-template)

- [uni-app-vue2-tailwind-hbuilder-template](#uni-app-vue2-tailwind-hbuilder-template)
  - [模板介绍](#模板介绍)
  - [使用方式](#使用方式)
  - [注意](#注意)
  - [HbuilderX 智能提示工具](#hbuilderx-智能提示工具)
  - [Related projects](#related-projects)
    - [插件核心](#插件核心)
    - [CLI 工具](#cli-工具)
    - [模板 template](#模板-template)
    - [预设 tailwindcss preset](#预设-tailwindcss-preset)
  - [Bugs \& Issues](#bugs--issues)

这是一个使用 `hbuilderx` + `uni-app` + `vue2` + `tailwind` 构建的小程序模板。可以直接在 `hbuilderx` 中导入运行。

## 使用方式

先在项目目录下，执行 `yarn` 进行安装，然后在 `hbuilderx` 中打开项目，进行运行和发布。

## 注意

在项目里面添加目录，在里面写 `.vue` 文件的时候，记得更新 `tailwind.config.js` 的 `content` 数组，把新的目录包裹进去。不然 `tailwindcss` 是不会生成添加的目录里面的 `class` 的！

比如你添加一个 `components` 文件夹，你就在 `content` 加入 `resolve("./components/**/*.{vue,js,ts,jsx,tsx,wxml}"),`, 小程序分包同理。

## HbuilderX 智能提示工具

DCloud-HBuilderX团队提供了对应的插件，可以去

<https://ext.dcloud.net.cn/plugin?id=8560> 进行下载，即可产生智能提示。

## Related projects

### 插件核心

[weapp-tailwindcss-webpack-plugin](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin) 提供转义功能，欢迎 `fork`/`star`

### CLI 工具

[weapp-ide-cli](https://github.com/sonofmagic/utils/tree/main/packages/weapp-ide-cli): 一个微信开发者工具命令行，快速方便的直接启动 ide 进行登录，开发，预览，上传代码等等功能。

### 模板 template

[uni-app-vite-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template)

[uni-app-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-vscode-template)

[uni-app-vue2-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-vscode-template)

[weapp-native-mina-tailwindcss-template](https://github.com/sonofmagic/weapp-native-mina-tailwindcss-template)

### 预设 tailwindcss preset

[tailwindcss-miniprogram-preset](https://github.com/sonofmagic/tailwindcss-miniprogram-preset)

## Bugs & Issues

目前这个插件正在快速的开发中，如果遇到 `Bug` 或者想提出 `Issue`

[欢迎提交到此处](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues)
