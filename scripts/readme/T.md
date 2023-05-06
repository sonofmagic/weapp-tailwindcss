![logo](./assets/logo.jpg)

# weapp-tailwindcss-webpack-plugin

![star](https://badgen.net/github/stars/sonofmagic/weapp-tailwindcss-webpack-plugin)
![dm](https://badgen.net/npm/dm/weapp-tailwindcss-webpack-plugin)
![license](https://badgen.net/npm/license/weapp-tailwindcss-webpack-plugin)
[![test](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/sonofmagic/weapp-tailwindcss-webpack-plugin/branch/main/graph/badge.svg?token=zn05qXYznt)](https://codecov.io/gh/sonofmagic/weapp-tailwindcss-webpack-plugin)

> 把 `tailwindcss` 带入小程序开发吧！

\[[国内部署的文档地址](https://weapp-tw.icebreaker.top)\] \| \[[1.x文档]('./v1.md')\]

- [weapp-tailwindcss-webpack-plugin](#weapp-tailwindcss-webpack-plugin)
  - [2.x 版本新特性](#2x-版本新特性)
    - [新插件介绍](#新插件介绍)
  - [Usage](#usage)
    - [1. 安装配置 tailwindcss](#1-安装配置-tailwindcss)
    - [2. `rem` 转 `px` 或 `rpx`](#2-rem-转-px-或-rpx)
    - [3. 安装这个插件](#3-安装这个插件)
      - [各个框架注册的方式](#各个框架注册的方式)
  - [从 v1 迁移](#从-v1-迁移)
  - [精确转化与忽略](#精确转化与忽略)
  - [Options 配置项](#options-配置项)
  - [使用任意值(arbitrary values)](#使用任意值arbitrary-values)
  - [变更日志](#变更日志)
  - [常见问题](#常见问题)
  - [Related projects](#related-projects)
    - [CLI 工具](#cli-工具)
    - [模板 template](#模板-template)
      - [如何选择？](#如何选择)
      - [使用`uni-app cli`进行构建 `vscode`开发](#使用uni-app-cli进行构建-vscode开发)
      - [使用`hbuilderx` 进行构建和开发](#使用hbuilderx-进行构建和开发)
      - [原生小程序开发模板](#原生小程序开发模板)
    - [tailwindcss plugin](#tailwindcss-plugin)
    - [tailwindcss preset](#tailwindcss-preset)
  - [Bugs \& Issues](#bugs--issues)

## 2.x 版本新特性

这个版本新增了 `UnifiedWebpackPluginV5`
和 `UnifiedViteWeappTailwindcssPlugin` 这种 `Unified` 开头的插件。

它们能够自动识别并精确处理所有 `tailwindcss` 的工具类。这意味着它可以同时处理所有文件中的静态或动态的 `class`。

相比`v1`版本只有处理`wxss`,`wxml`静态`class`的能力，使用`v2`版本新的插件，你再也不需要在 `js` 里引入并调用标记方法 `replaceJs`了！`2.x` 插件有精准转化 `js`/`jsx` 的能力，大大提升了 `taro` 这种动态模板框架的开发体验。

### 新插件介绍

`UnifiedWebpackPluginV5` 是一个核心插件，所有使用 `webpack` 进行打包的框架都可以使用它，只需要传入 `appType` 配置项: `uni-app`/`taro`/`rax`/`remax`/`mpx` 等等，如果不传的话，插件会去猜测公共的样式文件位置，并进行转化(有可能不准确)。

目前，这个方案只支持 `tailwindcss v3.x.x` 版本和 `webpack5`。同时这个方案依赖 `monkey patch`，所以你应该把

```json
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
```

加入你的 `package.json`。当然在安装或者更新 `tailwindcss` 后，手动执行  `npx weapp-tw patch` 效果也是一样的，看到 `patch .... successfully` 表示成功。

`UnifiedViteWeappTailwindcssPlugin` 为 `vite` 专用插件，配置项和使用方式也是和上面一致的。

## Usage

### 1. 安装配置 tailwindcss

{{install-tailwindcss}}

### 2. `rem` 转 `px` 或 `rpx`

{{rem2rpx}}

### 3. 安装这个插件

```sh
# npm / yarn /pnpm
npm i -D weapp-tailwindcss-webpack-plugin
# 可以执行一下 patch 方法
npx weapp-tw patch
```

然后把下列脚本，添加进你的 `package.json` 的 `scripts` 字段里:

```json
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
```

#### 各个框架注册的方式

{{frameworks}}

## 从 v1 迁移

在 `2.x` 版本中，可以把之前使用的 `webpack` 插件，全部更换为 `UnifiedWebpackPluginV5` 插件，不过 `vite` 插件的导出有一些小变化:

`1.x`:

```js
import vwt from 'weapp-tailwindcss-webpack-plugin/vite';
```

`2.x`:

```js
// UnifiedViteWeappTailwindcssPlugin 就是新的插件
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss-webpack-plugin/vite';
```

另外新的 `UnifiedWebpackPluginV5` 可以直接从 `weapp-tailwindcss-webpack-plugin` 引入，同时在新的 `UnifiedWebpackPluginV5` 中，之前所有的配置项都被继承了过来，只需要用它直接替换原先插件即可。

另外不要忘记把:

```json
 "scripts": {
+  "postinstall": "weapp-tw patch"
 }
```

添加进你的 `package.json` 里，然后清除原先的打包缓存之后重新打包运行。

<!-- 所以用 `uni-app` 的，建议你使用 `@vue/cli5`版本，`taro` 则切换到 `webpack5`。 -->

## 精确转化与忽略

默认对所有 `jsx`,`js`,`wxml`,`wxss`中出现的`tailwindcss`运行时工具类进行转化，如果不需要转化可以使用 `/*weapp-tw ignore*/` 前置注释。

例如:

```js
<view :class="classArray">classArray</view>
const classArray = [
  'text-[30rpx]',
  /*weapp-tw ignore*/ 'bg-[#00ff00]'
]
```

此时只有 `'text-[30rpx]'` 会被转化，`'bg-[#00ff00]'`被忽视

另外有可能出现的问题，我也写进了 [常见问题](#常见问题) 中，可以进行参考。
<!-- ### HBuilderX 创建的项目

需要创建 `vite` 版本或者 `HBuilderX`最新`alpha`版，方式同上

### uni-app 构建成 `android/ios` app

[建议配置方式](./docs/uni-app-android-and-ios.md) -->

## Options 配置项

{{options-table}}

## 使用任意值(arbitrary values)

详见 [tailwindcss/using-arbitrary-values 章节](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values)

## [变更日志](./CHANGELOG.md)

## 常见问题

> 目前微信开发者工具会默认开启 `代码自动热重载 (compileHotReLoad)` 功能，这个功能在原生开发中表现良好，但在 `uni-app` 和 `taro` 等等的框架中，存在一定的问题，详见[issues#37](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues/37)，所以如果你遇到了此类问题，建议关闭 `代码自动热重载` 功能。

[常见问题见 FAQ.md](./docs/faq.md)

## Related projects

### CLI 工具

[weapp-ide-cli](https://github.com/sonofmagic/utils/tree/main/packages/weapp-ide-cli): 一个微信开发者工具命令行，快速方便的直接启动 ide 进行登录，开发，预览，上传代码等等功能。

### 模板 template

#### 如何选择？

假如你仅仅是开发一个`小程序` + `h5` 的组合，那么使用 `vscode` 模板就足够了

假如你的项目构建的重点平台是 `app` 那么还是推荐使用 `hbuilderx` 模板，因为 `hbuilderx` 自带了一套 `app` 构建和调试的工具链，可以更好的支持你的开发。

#### 使用`uni-app cli`进行构建 `vscode`开发

[uni-app-vite-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template)

~~[uni-app-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-vscode-template)(不推荐,此版本为webpack5打包vue3,建议使用上面的vite打包vue3的模板)~~

[uni-app-vue2-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-vscode-template)

#### 使用`hbuilderx` 进行构建和开发

~~[uni-app-vue2-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-hbuilder-template)(不推荐,此版本收到hbuilderx的限制，无法升级到最新的tailwindcss)~~

[uni-app-vue3-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-hbuilder-template)

#### 原生小程序开发模板

[weapp-tailwindcss-gulp-template(gulp打包)](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/tree/main/demo/gulp-app)

[weapp-native-mina-tailwindcss-template(webpack打包)](https://github.com/sonofmagic/weapp-native-mina-tailwindcss-template)

### tailwindcss plugin

[weapp-tailwindcss-children](https://github.com/sonofmagic/weapp-tailwindcss-children)

### tailwindcss preset

[tailwindcss-miniprogram-preset](https://github.com/sonofmagic/tailwindcss-miniprogram-preset)

## Bugs & Issues

目前这个插件正在快速的开发中，如果遇到 `Bug` 或者想提出 `Issue`

[欢迎提交到此处](https://github.com/sonofmagic/weapp-tailwindcss-webpack-plugin/issues)
