# weapp-tailwindcss

> [English](./README.md) | 简体中文

把 Tailwind CSS 的原子化开发体验带到全端。`weapp-tailwindcss` 是面向 Web、小程序与原生跨端运行时的核心编译器和构建集成层。

## 核心能力

- 通过统一编译边界生成 Tailwind CSS v4 样式。
- 提供 Vite、Webpack、Rspack、Gulp、PostCSS 与 Node.js 接入入口。
- 基于 Tailwind 已生成候选集合精确转换 class，避免误伤业务字符串。
- 处理微信、支付宝、抖音、QQ 等小程序样式环境的 CSS 兼容差异。
- 为 React Native、Expo、ReactLynx 与 Rspeedy 集成提供共享生成基础。

## 选择接入方式

| 目标 | 推荐入口 |
| --- | --- |
| Web / H5 | `weapp-tailwindcss/vite`、Webpack/Rspack 集成或 `@weapp-tailwindcss/cli` |
| uni-app / uni-app x | 按框架构建链选择 Vite 或 Webpack 集成 |
| Taro / Mpx / 原生小程序 | Vite、Webpack、Rspack 或 Gulp 集成 |
| React Native / Expo | `@weapp-tailwindcss/react-native` |
| ReactLynx / Rspeedy | `@weapp-tailwindcss/lynx` |

从[安装指南](https://tw.icebreaker.top/zh-cn/docs/quick-start/install)开始，或在[中文官网](https://tw.icebreaker.top/zh-cn/)按框架选择接入方式。

## Tailwind CSS 4 入口

CSS 入口必须被应用构建图实际引入。需要稳定识别入口时，通过 `cssEntries` 配置从项目根目录解析出的绝对路径，但不要把它当成 CSS import 的替代品。

```css
@import "tailwindcss";
@source "./src";
```

Tailwind 样式生成统一由 `weapp-tailwindcss` 接管，同一构建中不要再叠加 `@tailwindcss/vite` 或 `@tailwindcss/postcss` 作为第二套生成器。

## CLI

独立 CLI 需要与本包和 Tailwind CSS 一起安装：

```bash
pnpm add -D @weapp-tailwindcss/cli weapp-tailwindcss tailwindcss
pnpm exec weapp-tw -i src/input.css -o dist/output.css --watch
```

CLI 默认生成 Web CSS。`--target weapp` 只进行小程序 CSS 兼容转换；完整 WXML、JavaScript 与 WXSS 项目仍需使用构建器集成。watch 默认使用 `@parcel/watcher` 原生事件，也可以通过 `--poll` 显式切换轮询。

source map、stdin/stdout、watch 与 `canonicalize` 的完整用法见 [CLI 指南](https://tw.icebreaker.top/zh-cn/docs/tools/weapp-tw-cli)。

## 运行环境

- 当前版本需要 Node.js `^22.18.0 || >=24.11.0`。
- 通过 HBuilderX 使用 uni-app 或 uni-app x 时需要 HBuilderX `>=5.11`。

## 社区与支持

- [官方文档](https://tw.icebreaker.top)
- [GitHub Issues](https://github.com/sonofmagic/weapp-tailwindcss/issues)
- [技术交流群](https://tw.icebreaker.top/zh-cn/docs/community/group)

## License

[MIT](../../LICENSE)
