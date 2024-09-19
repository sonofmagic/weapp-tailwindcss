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

> [!NOTE]
> 降低开发维护成本，提升开发效率的 `小程序` `tailwindcss` 全方面解决方案
>
> 小程序原生工具链 `weapp-vite` 已经发布，使用它改善你的原生小程序开发体验吧，更多详见 [官方文档](https://vite.icebreaker.top/)

\[[文档地址](https://tw.icebreaker.top)\] \| \[[备用文档地址](https://sonofmagic.github.io/weapp-tailwindcss/)\] \| \[[1.x文档]('./v1.md')\]

- [特性](#特性)
- [版本对应](#版本对应)
- [安装与使用方式](#安装与使用方式)
- [生态和解决方案](#生态和解决方案)
- [常见问题](#常见问题)
- [各个框架的模板](#各个框架的模板)
- [旧版本迁移指南](#旧版本迁移指南)
- [配置项参考](#配置项参考)
- [变更日志](#变更日志)
- [Tips](#tips)
- [Contribute](#contribute)
- [License](#license)
- [Star History](#star-history)
- [Related projects](#related-projects)
  - [weapp-vite](#weapp-vite)
  - [IceStack](#icestack)
  - [weapp-ide-cli](#weapp-ide-cli)
  - [weapp-pandacss](#weapp-pandacss)

## 特性

| 不仅仅是`webpack`                                   | 主流框架与原生开发支持                          |
| --------------------------------------------------- | ----------------------------------------------- |
| ![wepback+vite+gulp](./assets/weapp-tw-plugins.png) | ![frameworks](./assets/weapp-tw-frameworks.png) |

核心插件支持 `webpack`/`vite`/`gulp` 为基底的框架类小程序开发，涵盖了市面上几乎所有的主流的开发框架。

同时也支持最原生的开发者工具创建的原生小程序应用。

这些插件能够自动识别并精确处理所有 `tailwindcss` 的工具类来适配小程序环境。

## 版本对应

目前，`weapp-tailwindcss` 的 `2.x` 和 `3.x` 支持最新版本的 `tailwindcss v3.x.x` 版本和 `webpack5`，`webpack4`, `vite` 和 `gulp`。从 `3.2.0` 开始，`weapp-tailwindcss` 支持最原生的小程序开发方式。

> 如果你还在使用 `tailwindcss@2` 版本，那你应该使用从 `weapp-tailwindcss/webpack4` 导出的本插件的 `postcss7` `webpack4` 版本。另外请确保你的 `nodejs` 版本 `>=16.6.0`。目前低于 `16` 的长期维护版本(`偶数版本`) 都已经结束了生命周期，建议安装 `nodejs` 的 `LTS` 版本，详见 [nodejs/release](https://github.com/nodejs/release)

## [安装与使用方式](https://tw.icebreaker.top/docs/quick-start/install)

## [生态和解决方案](https://tw.icebreaker.top/docs/community/templates)

## [常见问题](https://tw.icebreaker.top/docs/issues/)

## [各个框架的模板](https://tw.icebreaker.top/docs/community/templates)

## [旧版本迁移指南](https://tw.icebreaker.top/docs/migrations/v2)

## [配置项参考](https://tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions)

## [变更日志](./CHANGELOG.md)

## Tips

前沿阅读: [What’s Tailwind Oxide Engine? The Next Evolution of Tailwind CSS](https://medium.com/@bomber.marek/whats-tailwind-oxide-engine-the-next-evolution-of-tailwind-css-32e7ef8e19a1)

未来 `tailwindcss@4` 会切换到这个引擎来大幅加快构建和运行速度，当然等它发布正式版本的时候，我也会尽可能第一时间去进行兼容新的引擎。

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

### weapp-vite

[weapp-vite](https://vite.icebreaker.top/): 把现代化的开发模式带入小程序开发!

### IceStack

[IceStack](https://github.com/sonofmagic/icestack): ❤️ IceStack, Web UI for Mobile, PC, open-source Css component library generator

### weapp-ide-cli

[weapp-ide-cli](https://github.com/sonofmagic/utils/tree/main/packages/weapp-ide-cli): 一个微信开发者工具命令行，快速方便的直接启动 ide 进行登录，开发，预览，上传代码等等功能。

### weapp-pandacss

[weapp-pandacss](https://github.com/sonofmagic/weapp-pandacss) `CSS-in-JS` 编译时框架的小程序适配器
