<p align="center">
  <a href="https://tw.icebreaker.top">
    <img src="./assets/logo.png" alt="weapp-tailwindcss logo" width="128">
  </a>
</p>

<h1 align="center">weapp-tailwindcss</h1>

<p align="center">
  <strong>把 Tailwind CSS 带到小程序与多端开发中。</strong>
</p>

<p align="center">
  简体中文 | <a href="./README_en.md">English</a>
</p>

<p align="center">
  <a href="https://github.com/sonofmagic/weapp-tailwindcss/stargazers"><img src="https://badgen.net/github/stars/sonofmagic/weapp-tailwindcss" alt="GitHub stars"></a>
  <a href="https://www.npmjs.com/package/weapp-tailwindcss"><img src="https://badgen.net/npm/dm/weapp-tailwindcss" alt="npm downloads"></a>
  <a href="https://www.npmjs.com/package/weapp-tailwindcss"><img src="https://badgen.net/npm/license/weapp-tailwindcss" alt="license"></a>
  <a href="https://github.com/sonofmagic/weapp-tailwindcss/actions/workflows/ci.yml"><img src="https://github.com/sonofmagic/weapp-tailwindcss/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
  <a href="https://codecov.io/gh/sonofmagic/weapp-tailwindcss"><img src="https://codecov.io/gh/sonofmagic/weapp-tailwindcss/branch/main/graph/badge.svg?token=zn05qXYznt" alt="codecov"></a>
  <a href="https://deepwiki.com/sonofmagic/weapp-tailwindcss"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
</p>

## 项目定位

`weapp-tailwindcss` 是面向小程序生态的 Tailwind CSS 适配方案。它负责把 Tailwind CSS 生成的选择器、工具类和部分 CSS 能力转换成小程序与多端框架更容易消费的形式。

它适合这些场景：

- 在微信小程序、支付宝小程序、抖音小程序等小程序环境中使用 Tailwind CSS。
- 在 `uni-app` / `uni-app x`、Taro、Mpx、原生小程序、weapp-vite 等框架里复用同一套原子化样式写法。
- 在 Tailwind CSS v3/v4 项目中处理小程序 class 转义、选择器兼容、rpx 任意值、CSS 降级和 H5/Web 输出差异。
- 在多端项目中同时覆盖小程序、H5/Web 与 App WebView 等目标。

## 当前支持

| 能力         | 说明                                                                          |
| ------------ | ----------------------------------------------------------------------------- |
| Tailwind CSS | 支持 Tailwind CSS v3 与 v4                                                    |
| 构建工具     | 支持 Vite、Webpack 5、Rspack、Rollup、Rolldown、Gulp 与 Node API              |
| 框架         | 支持 uni-app / uni-app x、Taro、Mpx、原生小程序、weapp-vite 等接入方式        |
| 多端输出     | 覆盖小程序、H5/Web 与 App WebView 等平台差异                                  |
| 运行时生态   | 提供 merge、variants、cva、runtime、typography、theme-transition、ui 等配套包 |
| Node.js      | 需要 Node.js `^20.19.0` 或 `>=22.12.0`                                        |

## 官方文档

- [官网首页](https://tw.icebreaker.top)
- [快速开始](https://tw.icebreaker.top/docs/quick-start/install)
- [Tailwind CSS v4 接入](https://tw.icebreaker.top/docs/quick-start/v4)
- [框架接入指南](https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite)
- [uni-app x 专题](https://tw.icebreaker.top/docs/uni-app-x)
- [多端配置口径](https://tw.icebreaker.top/docs/multi-platform)
- [配置项参考](https://tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions)
- [常见问题](https://tw.icebreaker.top/docs/issues)
- [备用文档地址](https://ice-tw.netlify.app/)

## 核心包

| 包                                | 用途                               |
| --------------------------------- | ---------------------------------- |
| `weapp-tailwindcss`               | 核心转译与构建器适配入口           |
| `@weapp-tailwindcss/postcss`      | CSS AST 处理、选择器兼容与平台降级 |
| `@weapp-tailwindcss/postcss-calc` | `calc()` 表达式安全归约            |
| `@weapp-tailwindcss/reset`        | 小程序多框架 reset 样式资源        |
| `tailwindcss-config`              | Tailwind CSS 配置加载              |
| `tailwindcss-injector`            | Tailwind 指令注入与 WXML 依赖追踪  |
| `weapp-style-injector`            | 小程序构建产物样式入口注入         |

## 运行时与组件生态

| 包                               | 用途                                                       |
| -------------------------------- | ---------------------------------------------------------- |
| `@weapp-tailwindcss/runtime`     | escape/unescape、缓存、rpx 转换等运行时基础能力            |
| `@weapp-tailwindcss/merge`       | Tailwind Merge v3 的小程序运行时封装                       |
| `@weapp-tailwindcss/merge-v3`    | Tailwind Merge v2 的小程序运行时封装，面向 Tailwind CSS v3 |
| `@weapp-tailwindcss/variants`    | tailwind-variants 的小程序运行时封装                       |
| `@weapp-tailwindcss/variants-v3` | Tailwind CSS v3 生态的 variants 封装                       |
| `@weapp-tailwindcss/cva`         | class-variance-authority 的小程序运行时封装                |
| `@weapp-tailwindcss/typography`  | Tailwind Typography 的小程序适配版本                       |
| `theme-transition`               | 主题切换运行时与 Tailwind 插件                             |
| `@weapp-tailwindcss/ui`          | 面向小程序的原子化 UI 运行时层                             |

所有包的默认 `README.md` 都使用中文，并提供对应的 `README.en.md` 英文版本。

## AI Skill

如果希望 AI 在业务项目中按当前最佳实践接入 `weapp-tailwindcss`，可以安装官方 Skill：

```bash
npx skills add sonofmagic/skills --skill weapp-tailwindcss
```

它适合处理这些任务：

- 新项目接入 `uni-app` / `uni-app x`、Taro 或原生小程序。
- 判断 Tailwind CSS v3/v4 的配置差异。
- 排查 class 不生效、rpx 任意值、JS 字符串 class、`space-x/space-y` 等问题。
- 生成可验证、可回滚的接入步骤。

更多说明见 [Skill 文档](https://tw.icebreaker.top/docs/ai/basics/skill)。

## 贡献

欢迎通过 issue 或 pull request 参与改进：

- 报告可复现的问题。
- 补充框架接入示例或文档。
- 改进转译、兼容、运行时或测试覆盖。

提交前请先阅读仓库内的 `AGENTS.md` 与目标目录下的就近规则。

## License

[MIT](./LICENSE)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=sonofmagic/weapp-tailwindcss&type=Date)](https://star-history.com/#sonofmagic/weapp-tailwindcss&Date)
