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
> `weapp-tailwindcss@4.2.x` 现已支持 `uni-app x` 同时构建 `Web`,`小程序`,`安卓`,`IOS`,`鸿蒙`，详见 [**uni-app x 专题**](https://tw.icebreaker.top/docs/uni-app-x)

\[[文档地址](https://tw.icebreaker.top)\] \| \[[备用文档地址](https://ice-tw.netlify.app/)\] \| \[[加入技术交流群](https://tw.icebreaker.top/docs/community/group)\]

- [特性](#特性)
- [版本对应](#版本对应)
- [安装与使用方式](#安装与使用方式)
- [生态和解决方案](#生态和解决方案)
- [常见问题](#常见问题)
- [各个框架的模板](#各个框架的模板)
- [旧版本迁移指南](#旧版本迁移指南)
- [配置项参考](#配置项参考)
- [Contribute](#contribute)
- [License](#license)
- [Star History](#star-history)
- [Related projects](#related-projects)
  - [weapp-vite](#weapp-vite)

## 特性

| 不仅仅是`webpack`                                   | 主流框架与原生开发支持                          |
| --------------------------------------------------- | ----------------------------------------------- |
| ![wepback+vite+gulp](./assets/weapp-tw-plugins.png) | ![frameworks](./assets/weapp-tw-frameworks.png) |

核心插件支持 `webpack`/`vite`/`rspack`/`rollup`/`rolldown`/`gulp` 为基底的框架类小程序开发，涵盖了市面上几乎所有的主流的开发框架。

也支持直接从各个开发者工具中，直接创建的原生小程序应用。

这些插件能够自动识别并精确处理所有 `tailwindcss` 的工具类来适配小程序环境。

## 版本对应

目前，`weapp-tailwindcss` 的 `4.x` 版本

- 支持最新版本的 `tailwindcss v4` 和 `v3` 还有 `v2 jit` 版本。
- 支持 `webpack5`，`webpack4`, `vite` 和 `gulp` 这些打包工具，也支持纯 `Nodejs` API 的方式，集成到你自己的构建工具中。

> 如果你还在使用 `tailwindcss@2` 版本，那你应该使用从 `weapp-tailwindcss/webpack4` 导出的本插件的 `postcss7` `webpack4` 版本。另外请确保你的 `nodejs` 版本 `>=16.6.0`。目前低于 `16` 的长期维护版本(`偶数版本`) 都已经结束了生命周期，建议安装 `nodejs` 的 `LTS` 版本，详见 [nodejs/release](https://github.com/nodejs/release)

## [安装与使用方式](https://tw.icebreaker.top/docs/quick-start/install)

## [生态和解决方案](https://tw.icebreaker.top/docs/community/templates)

## [常见问题](https://tw.icebreaker.top/docs/issues/)

## [各个框架的模板](https://tw.icebreaker.top/docs/community/templates)

## [旧版本迁移指南](https://tw.icebreaker.top/docs/migrations/v2)

## [配置项参考](https://tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions)

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
