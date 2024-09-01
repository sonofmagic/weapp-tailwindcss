<p align="center">

<a href="https://tw.icebreaker.top">

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

> 降低开发维护成本，提升开发效率的 `小程序` `tailwindcss` 全方面解决方案
>
> 我的其他项目:
> `Tailwindcss/Unocss UI` 生成提取器: [`IceStack`](https://ui.icebreaker.top/zh-CN) 已经发布，快来用它管理你的原子化`CSS` 组件吧！

\[[国内部署的文档地址](https://tw.icebreaker.top)\] \| \[[备用Github Page](https://sonofmagic.github.io/weapp-tailwindcss/)\] \| \[[1.x文档]('./v1.md')\]

- [特性](#特性)
  - [插件介绍](#插件介绍)
- [安装与使用方式](#安装与使用方式)
- [生态和解决方案](#生态和解决方案)
- [常见问题](#常见问题)
- [现成配置好的各个框架的模板](#现成配置好的各个框架的模板)
- [旧版本迁移指南](#旧版本迁移指南)
- [配置项参考](#配置项参考)
- [变更日志](#变更日志)
- [Tips](#tips)
- [Contribute](#contribute)
- [License](#license)
- [Star History](#star-history)
- [Related projects](#related-projects)
  - [CLI 工具](#cli-工具)
  - [weapp-pandacss](#weapp-pandacss)

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

> 如果你还在使用 `tailwindcss@2` 版本，那你应该使用本插件的 `1.x`/`webpack4` 版本。另外请确保你的 `nodejs` 版本 `>=16.6.0`。目前低于 `16` 的长期维护版本(`偶数版本`) 都已经结束了生命周期，建议安装 `nodejs` 的 `LTS`版本，详见 [nodejs/release](https://github.com/nodejs/release)

## [安装与使用方式](https://tw.icebreaker.top/docs/quick-start/install)

## [生态和解决方案](https://tw.icebreaker.top/docs/community/templates)

## [常见问题](https://tw.icebreaker.top/docs/issues/)

## [现成配置好的各个框架的模板](https://tw.icebreaker.top/docs/community/templates)

## [旧版本迁移指南](https://tw.icebreaker.top/docs/migrations/v2)

## [配置项参考](https://tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions)

## [变更日志](./CHANGELOG.md)

## Tips

自从 `2.3.3` 版本开始，我发布了一个额外的包叫 `weapp-tailwindcss`,它和 `weapp-tailwindcss-webpack-plugin` 代码版本完全一致，且保持发布版本的同步。以后可以都去安装 `weapp-tailwindcss` 这个包，当然现在 `weapp-tailwindcss-webpack-plugin` 这个包也不会废弃，也会时刻保持版本的同步。

为什么要这么做的原因，主要是因为 `weapp-tailwindcss-webpack-plugin` 这个名字，已经不适合描述现在这种，多插件并存的状态了，为了以后的发展改个名。

前沿阅读: [What’s Tailwind Oxide Engine? The Next Evolution of Tailwind CSS](https://medium.com/@bomber.marek/whats-tailwind-oxide-engine-the-next-evolution-of-tailwind-css-32e7ef8e19a1)，未来 `tailwindcss` 会切换到这个引擎来大幅加快构建和运行速度，当然等它发布正式版本的时候，我也会尽可能第一时间去进行兼容新的引擎。

## Contribute

我们邀请你来贡献和帮助改进 `weapp-tailwindcss` 💚💚💚

以下有几个方式可以参与:

- 报告错误：如果您遇到任何错误或问题，请提`issue`并提供完善的错误信息和复现方式。
- 建议：有增强 `weapp-tailwindcss` 的想法吗？请提 `issue` 来分享您的建议。
- 文档：如果您对文档有更好的见解或者更棒的修辞方式，欢迎 `pr`。
- 代码：任何人的代码都不是完美的，我们欢迎你通过 `pr` 给代码提供更好的质量与活力。

## License

[MIT](./LICENSE)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=sonofmagic/weapp-tailwindcss&type=Date)](https://star-history.com/#sonofmagic/weapp-tailwindcss&Date)

## Related projects

### CLI 工具

[weapp-ide-cli](https://github.com/sonofmagic/utils/tree/main/packages/weapp-ide-cli): 一个微信开发者工具命令行，快速方便的直接启动 ide 进行登录，开发，预览，上传代码等等功能。

### weapp-pandacss

[weapp-pandacss](https://github.com/sonofmagic/weapp-pandacss) `CSS-in-JS` 编译时框架的小程序适配器
