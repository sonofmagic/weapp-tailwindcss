
<p align="center">

<a href="https://weapp-tw.icebreaker.top">

<img src="./assets/logo.png" alt="weapp-tailwindcss-logo" width="128">
</a>

<br>

<h1 align="center">weapp-tailwindcss</h1>

</p>

> 简体中文(zh-cn) | [English](./README_en.md)

![star](https://badgen.net/github/stars/sonofmagic/weapp-tailwindcss)
![dm0](https://badgen.net/npm/dm/weapp-tailwindcss)
![dm1](https://badgen.net/npm/dm/weapp-tailwindcss-webpack-plugin)
![license](https://badgen.net/npm/license/weapp-tailwindcss)
[![test](https://github.com/sonofmagic/weapp-tailwindcss/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/sonofmagic/weapp-tailwindcss/actions/workflows/test.yml)
[![codecov](https://codecov.io/gh/sonofmagic/weapp-tailwindcss/branch/main/graph/badge.svg?token=zn05qXYznt)](https://codecov.io/gh/sonofmagic/weapp-tailwindcss)

> `小程序` + `tailwindcss` 全方面解决方案  
> 想试试在小程序里使用 `CSS-in-JS` 思想？ 👉🏻👉🏻试试 [`weapp-pandacss`](https://github.com/sonofmagic/weapp-pandacss)

\[[国内部署的文档地址](https://weapp-tw.icebreaker.top)\] \| \[[备用Github Page](https://sonofmagic.github.io/weapp-tailwindcss/)\] \| \[[1.x文档]('./v1.md')\]

- [Tips](#tips)
- [特性](#特性)
  - [插件介绍](#插件介绍)
- [安装与使用方式](#安装与使用方式)
- [从 v1 迁移到 v2](#从-v1-迁移到-v2)
- [配置项参考](#配置项参考)
- [使用tailwindcss任意值(arbitrary values)](#使用tailwindcss任意值arbitrary-values)
- [常见问题](#常见问题)
- [变更日志](#变更日志)
- [Related projects](#related-projects)
  - [CLI 工具](#cli-工具)
  - [模板 template](#模板-template)
    - [如何选择？](#如何选择)
    - [使用`uni-app cli`进行构建 `vscode`开发](#使用uni-app-cli进行构建-vscode开发)
    - [使用`hbuilderx` 进行构建和开发](#使用hbuilderx-进行构建和开发)
    - [使用`tarojs`进行构建 `vscode`开发](#使用tarojs进行构建-vscode开发)
    - [原生小程序开发模板](#原生小程序开发模板)
  - [tailwindcss plugin / util](#tailwindcss-plugin--util)
  - [weapp-pandacss](#weapp-pandacss)
- [Bugs \& Issues](#bugs--issues)

## Tips

自从 `2.3.3` 版本开始，我发布了一个额外的包叫 `weapp-tailwindcss`,它和 `weapp-tailwindcss-webpack-plugin` 代码版本完全一致，且保持发布版本的同步。以后可以都去安装 `weapp-tailwindcss` 这个包(当然现在 `webpack-plugin` 这个包也不会废弃，也会时刻保持版本的同步)。为什么要这么做的原因，主要是因为 `weapp-tailwindcss-webpack-plugin` 这个名字，已经不适合描述现在这种，多插件并存的状态了，为了以后的发展就改了个名字。

前沿阅读: [What’s Tailwind Oxide Engine? The Next Evolution of Tailwind CSS](https://medium.com/@bomber.marek/whats-tailwind-oxide-engine-the-next-evolution-of-tailwind-css-32e7ef8e19a1)，未来 `tailwindcss` 会切换到这个引擎来大幅加快构建和运行速度，当然等它发布正式版本的时候，我也会尽可能第一时间去进行兼容新的引擎。

## 特性

| 不仅仅是`webpack`                                   | 主流框架与原生开发支持                          |
| --------------------------------------------------- | ----------------------------------------------- |
| ![wepback+vite+gulp](./assets/weapp-tw-plugins.png) | ![frameworks](./assets/weapp-tw-frameworks.png) |

核心插件支持 `webpack`/`vite`/`gulp`进行打包，涵盖了市面上几乎所有的主流开发小程序的框架。

这些插件能够自动识别并精确处理所有 `tailwindcss` 的工具类来适配小程序环境。同时这些插件还有对`tailwindcss`生成的工具类名，进行压缩和混淆的能力。这个能力可以缩短`css`选择器的长度，减小生成样式的体积，同时让生产环境中的类名变得不可阅读。

### 插件介绍

从 `weapp-tailwindcss/webpack` 导出的`UnifiedWebpackPluginV5` 是一个核心插件，所有使用 `webpack5` 进行打包的框架都可以使用它。

从 `weapp-tailwindcss/vite` 导出的`UnifiedViteWeappTailwindcssPlugin` 为 `vite` 专用插件，配置项和使用方式和 `webpack` 插件是一致的。

而我们的 `gulp` 插件方法，可以从 `weapp-tailwindcss/gulp` 导出。

目前，这些插件支持最新版本的 `tailwindcss v3.x.x` 版本和 `webpack5`，`vite` 和 `gulp`。

> 如果你还在使用 `tailwindcss@2` 版本，那你应该使用本插件的 `1.x` 版本。另外请确保你的 `nodejs` 版本 `>=16.6.0`。目前低于 `16` 的长期维护版本(`偶数版本`) 都已经结束了生命周期，建议安装 `nodejs` 的 `LTS`版本，详见 [nodejs/release](https://github.com/nodejs/release)

## [安装与使用方式](https://weapp-tw.icebreaker.top/docs/quick-start/install)

## [从 v1 迁移到 v2](https://weapp-tw.icebreaker.top/docs/migrations/v1)

<!-- ## [js文件内容中taiwlindcss类名的精确转化与忽略策略](https://weapp-tw.icebreaker.top/docs/options/comments) -->

## [配置项参考](https://weapp-tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions)

## [使用tailwindcss任意值(arbitrary values)](https://tailwindcss.com/docs/adding-custom-styles#using-arbitrary-values)

## [常见问题](https://weapp-tw.icebreaker.top/docs/issues/)

## [变更日志](./CHANGELOG.md)

## Related projects

### CLI 工具

[weapp-ide-cli](https://github.com/sonofmagic/utils/tree/main/packages/weapp-ide-cli): 一个微信开发者工具命令行，快速方便的直接启动 ide 进行登录，开发，预览，上传代码等等功能。

### 模板 template

#### 如何选择？

假如你仅仅是开发一个`小程序` + `h5` 的组合，那么使用 `vscode` 模板就足够了

假如你的项目构建的重点平台是 `app` 那么还是推荐使用 `hbuilderx` 模板，因为 `hbuilderx` 自带了一套 `app` 构建和调试的工具链，可以更好的支持你的开发。

#### 使用`uni-app cli`进行构建 `vscode`开发

[uni-app-vite-vue3-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template)

[uni-app-vue2-tailwind-vscode-template](https://github.com/sonofmagic/uni-app-vue2-tailwind-vscode-template)

#### 使用`hbuilderx` 进行构建和开发

[uni-app-vue3-tailwind-hbuilder-template](https://github.com/sonofmagic/uni-app-vue3-tailwind-hbuilder-template)

#### 使用`tarojs`进行构建 `vscode`开发

[taro-react-tailwind-vscode-template](https://github.com/sonofmagic/taro-react-tailwind-vscode-template)

#### 原生小程序开发模板

[weapp-tailwindcss-gulp-template(gulp打包)](https://github.com/sonofmagic/weapp-tailwindcss/tree/main/demo/gulp-app)

[weapp-native-mina-tailwindcss-template(webpack打包)](https://github.com/sonofmagic/weapp-native-mina-tailwindcss-template)

### tailwindcss plugin / util

- [css-to-tailwindcss-plugin](https://github.com/sonofmagic/icestack/tree/main/packages/css-to-tailwindcss-plugin) transform your `css/scss` to `tailwindcss plugin`

- [weapp-tailwindcss-children](https://github.com/sonofmagic/weapp-tailwindcss-children)

### weapp-pandacss

[weapp-pandacss](https://github.com/sonofmagic/weapp-pandacss) `CSS-in-JS` 编译时框架的小程序适配器

## Bugs & Issues

目前这个插件正在快速的开发中，如果遇到 `Bug` 或者想提出 `Issue`

[欢迎提交到此处](https://github.com/sonofmagic/weapp-tailwindcss/issues)
