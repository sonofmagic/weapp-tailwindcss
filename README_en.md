<p align="center">
  <a href="https://tw.icebreaker.top">
    <img src="./assets/logo.png" alt="weapp-tailwindcss logo" width="128">
  </a>
</p>

<h1 align="center">weapp-tailwindcss</h1>

<p align="center">
  <strong>Bring Tailwind CSS to mini programs and multi-platform apps.</strong>
</p>

<p align="center">
  <a href="./README.md">简体中文</a> | English
</p>

<p align="center">
  <a href="https://github.com/sonofmagic/weapp-tailwindcss/stargazers"><img src="https://badgen.net/github/stars/sonofmagic/weapp-tailwindcss" alt="GitHub stars"></a>
  <a href="https://www.npmjs.com/package/weapp-tailwindcss"><img src="https://badgen.net/npm/dm/weapp-tailwindcss" alt="npm downloads"></a>
  <a href="https://www.npmjs.com/package/weapp-tailwindcss"><img src="https://badgen.net/npm/license/weapp-tailwindcss" alt="license"></a>
  <a href="https://github.com/sonofmagic/weapp-tailwindcss/actions/workflows/ci.yml"><img src="https://github.com/sonofmagic/weapp-tailwindcss/actions/workflows/ci.yml/badge.svg?branch=main" alt="CI"></a>
  <a href="https://codecov.io/gh/sonofmagic/weapp-tailwindcss"><img src="https://codecov.io/gh/sonofmagic/weapp-tailwindcss/branch/main/graph/badge.svg?token=zn05qXYznt" alt="codecov"></a>
  <a href="https://deepwiki.com/sonofmagic/weapp-tailwindcss"><img src="https://deepwiki.com/badge.svg" alt="Ask DeepWiki"></a>
</p>

## What It Is

`weapp-tailwindcss` adapts Tailwind CSS for mini program ecosystems. It transforms Tailwind-generated selectors, utility classes, and selected CSS capabilities into forms that mini programs and multi-platform frameworks can consume more reliably.

It is designed for:

- Using Tailwind CSS in WeChat, Alipay, Douyin, and other mini program environments.
- Sharing atomic CSS conventions across `uni-app` / `uni-app x`, Taro, Mpx, native mini programs, weapp-vite, and related stacks.
- Handling mini program class escaping, selector compatibility, rpx arbitrary values, CSS fallbacks, and H5/Web output differences in Tailwind CSS v3/v4 projects.
- Building multi-platform apps that target mini programs, H5/Web, and App WebViews.

## Current Support

| Area              | Support                                                                                    |
| ----------------- | ------------------------------------------------------------------------------------------ |
| Tailwind CSS      | Tailwind CSS v3 and v4                                                                     |
| Build tools       | Vite, Webpack 5, Rspack, Rollup, Rolldown, Gulp, and Node API                              |
| Frameworks        | uni-app / uni-app x, Taro, Mpx, native mini programs, weapp-vite, and related integrations |
| Output targets    | Mini programs, H5/Web, App WebView, and related platform differences                       |
| Runtime ecosystem | merge, variants, cva, runtime, typography, theme-transition, ui, and related packages      |
| Node.js           | Node.js `^20.19.0` or `>=22.12.0`                                                          |

## Documentation

- [Official website](https://tw.icebreaker.top)
- [Quick start](https://tw.icebreaker.top/docs/quick-start/install)
- [Tailwind CSS v4 setup](https://tw.icebreaker.top/docs/quick-start/v4)
- [Framework integration](https://tw.icebreaker.top/docs/quick-start/frameworks/uni-app-vite)
- [uni-app x guide](https://tw.icebreaker.top/docs/uni-app-x)
- [Multi-platform guide](https://tw.icebreaker.top/docs/multi-platform)
- [Configuration reference](https://tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions)
- [FAQ](https://tw.icebreaker.top/docs/issues)
- [Mirror documentation](https://ice-tw.netlify.app/)

## Core Packages

| Package                           | Purpose                                                            |
| --------------------------------- | ------------------------------------------------------------------ |
| `weapp-tailwindcss`               | Core transform and bundler integration entry                       |
| `@weapp-tailwindcss/postcss`      | CSS AST processing, selector compatibility, and platform fallbacks |
| `@weapp-tailwindcss/postcss-calc` | Safe reduction for `calc()` expressions                            |
| `@weapp-tailwindcss/reset`        | Reset stylesheet assets for mini program frameworks                |
| `tailwindcss-config`              | Tailwind CSS config loading                                        |
| `tailwindcss-injector`            | Tailwind directive injection and WXML dependency tracking          |
| `weapp-style-injector`            | Style entry injection for mini program build artifacts             |

## Runtime And UI Ecosystem

| Package                          | Purpose                                                                       |
| -------------------------------- | ----------------------------------------------------------------------------- |
| `@weapp-tailwindcss/runtime`     | Shared runtime layer for escape/unescape, caching, and rpx transforms         |
| `@weapp-tailwindcss/merge`       | Mini program runtime wrapper for Tailwind Merge v3                            |
| `@weapp-tailwindcss/merge-v3`    | Mini program runtime wrapper for Tailwind Merge v2, targeting Tailwind CSS v3 |
| `@weapp-tailwindcss/variants`    | Mini program runtime wrapper for tailwind-variants                            |
| `@weapp-tailwindcss/variants-v3` | Variants wrapper for the Tailwind CSS v3 ecosystem                            |
| `@weapp-tailwindcss/cva`         | Mini program runtime wrapper for class-variance-authority                     |
| `@weapp-tailwindcss/typography`  | Mini program adapted version of Tailwind Typography                           |
| `theme-transition`               | Theme transition runtime and Tailwind plugin                                  |
| `@weapp-tailwindcss/ui`          | Atomic UI runtime layer for mini programs                                     |

Each package now uses Chinese as its default `README.md` and provides an English `README.en.md`.

## AI Skill

If you want AI to integrate `weapp-tailwindcss` in an application project using current best practices, install the official Skill:

```bash
npx skills add sonofmagic/skills --skill weapp-tailwindcss
```

It is useful for:

- Setting up `uni-app` / `uni-app x`, Taro, or native mini program projects.
- Choosing the right Tailwind CSS v3/v4 configuration path.
- Troubleshooting missing classes, rpx arbitrary values, JS string classes, and `space-x/space-y` behavior.
- Producing integration steps with validation and rollback guidance.

Read more in the [Skill documentation](https://tw.icebreaker.top/docs/ai/basics/skill).

## Contributing

Issues and pull requests are welcome:

- Report reproducible problems.
- Improve framework examples or documentation.
- Improve transforms, compatibility behavior, runtime packages, or test coverage.

Before contributing, read the repository `AGENTS.md` and the closest `AGENTS.md` under the target directory.

## License

[MIT](./LICENSE)

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=sonofmagic/weapp-tailwindcss&type=Date)](https://star-history.com/#sonofmagic/weapp-tailwindcss&Date)
