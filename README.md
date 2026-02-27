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
[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/sonofmagic/weapp-tailwindcss)

> [!NOTE]
> 降低开发维护成本，提升开发效率的 `小程序` `tailwindcss` 全方面解决方案
>
> `weapp-tailwindcss@4.2.x` 现已支持 `uni-app x` 同时构建 `Web`,`小程序`,`安卓`,`IOS`,`鸿蒙`，详见 [**uni-app x 专题**](https://tw.icebreaker.top/docs/uni-app-x)

\[[文档地址](https://tw.icebreaker.top)\] \| \[[备用文档地址](https://ice-tw.netlify.app/)\] \| \[[加入技术交流群](https://tw.icebreaker.top/docs/community/group)\]

- [特性](#特性)
- [版本对应](#版本对应)
- [环境要求](#环境要求)
- [AI Skill (For Users)](#ai-skill-for-users)
- [安装与使用方式](#安装与使用方式)
- [生态和解决方案](#生态和解决方案)
- [常见问题](#常见问题)
- [各个框架的模板](#各个框架的模板)
- [旧版本迁移指南](#旧版本迁移指南)
- [配置项参考](#配置项参考)
- [Contribute](#contribute)
- [热更新 e2e 回归](#热更新-e2e-回归)
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

> 如果你还在使用 `tailwindcss@2` 版本，那你应该使用从 `weapp-tailwindcss/webpack4` 导出的本插件的 `postcss7` `webpack4` 版本。`weapp-tailwindcss@4` 需要 `nodejs` 版本 `^20.19.0 || >=22.12.0`，建议安装 `nodejs` 的 `LTS` 版本，详见 [nodejs/release](https://github.com/nodejs/release)

## 环境要求

- Node.js `^20.19.0` 或 `>=22.12.0`（建议 LTS）

## AI Skill (For Users)

如果你希望 AI 在你的业务项目中，按 `weapp-tailwindcss` 的最佳实践快速完成“小程序 + 多端”接入，可以先安装官方 Skill：

```bash
npx skills add sonofmagic/skills --skill weapp-tailwindcss
```

安装后可用于：

- 快速生成 `uni-app` / `taro` / `uni-app x` 接入配置
- 输出可复制的安装命令、配置文件与验证步骤
- 处理 `rpx` 任意值、`JS` 字符串 class 不生效等常见问题

Skill 的执行流程（简版）：

1. 先分流任务类型：新接入、迁移、排障、写法规范
2. 先补齐最小上下文：框架、构建器、目标端、Tailwind 版本、是否 `pnpm@10+`
3. 再给出可落地方案，并强制包含回滚路径

Skill 输出默认包含：

- 结论（框架 + Tailwind 版本 + 目标端）
- 修改文件清单
- 可复制配置与命令（默认 `pnpm`）
- 验证步骤与预期结果
- 回滚方案

推荐同时阅读：

- [Skill（技能系统）](https://tw.icebreaker.top/docs/ai/basics/skill)
- [Tailwind 写法最佳实践（Skill 引用）](./skills/weapp-tailwindcss/references/tailwind-writing-best-practices.md)

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

### 热更新 e2e 回归

仓库现在提供独立于构建产物快照链路的 watch 回归链路，用于验证各 demo 在真实热更新场景下的生效性与耗时：

- 全量运行：`pnpm e2e:watch`
- 单项运行：`pnpm e2e:watch:taro` / `pnpm e2e:watch:uni` / `pnpm e2e:watch:mpx` / `pnpm e2e:watch:rax` / `pnpm e2e:watch:mina` / `pnpm e2e:watch:weapp-vite`
- 包含预构建链路：`pnpm e2e:watch:full`

该链路会注入复杂 Tailwind 类组合（任意值、小数、`calc()`、伪元素变体等），并统计 `hot update` 与 `rollback` 延迟，帮助持续优化日常开发性能。

## License

[MIT](./LICENSE)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=sonofmagic/weapp-tailwindcss&type=Date)](https://star-history.com/#sonofmagic/weapp-tailwindcss&Date)

## Related projects

### weapp-vite

[weapp-vite](https://vite.icebreaker.top/): 把现代化的开发模式带入小程序开发!
