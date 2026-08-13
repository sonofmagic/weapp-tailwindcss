# weapp-tailwindcss

> 简体中文 | [English](./README.en.md)

这个包是把 Tailwind CSS 带到小程序生态的核心入口，负责类名转译、CSS 兼容、框架构建适配和 Tailwind v4 支持。

## 官网

更多接入方式、配置说明和框架示例见 [weapp-tailwindcss 官方文档](https://tw.icebreaker.top)。

## CLI

CLI 已作为 `@weapp-tailwindcss/cli` 独立发布，需要与本包和 Tailwind CSS 一起安装：

```bash
pnpm add -D @weapp-tailwindcss/cli weapp-tailwindcss tailwindcss
```

`weapp-tw` 默认提供与 Tailwind CSS CLI 对齐的 Web CSS 构建、watch、source map 与 `canonicalize` 能力。需要 CSS-only 的小程序兼容输出时可显式传入 `--target weapp`；完整 WXML/JS/WXSS 项目仍应使用构建器插件。详见 [CLI 使用指南](https://tw.icebreaker.top/docs/tools/weapp-tw-cli)。

独立 CLI 直接复用本包的 Tailwind v4 generator、design system 与 source graph，不依赖或调用 `@tailwindcss/cli`。watch 使用跨平台轮询，因此也不依赖 `@parcel/watcher`。

Tailwind CSS 4 项目中，入口 CSS 需要同时满足两点：在项目里被实际引入，并通过 `cssEntries` 显式传给插件用于稳定识别。`cssEntries` 应使用项目根目录解析出的绝对路径；它不是替代 import 的开关。

## 运行环境

从 `weapp-tailwindcss@5.2.0` 开始，需要 Node.js `>=22.12.0`。该版本默认支持从 CommonJS 加载 ESM。

通过 HBuilderX 使用 `uni-app` 或 `uni-app x` 时，还需要 HBuilderX `>=5.11`。旧版 HBuilderX 的内置 Node 可能无法加载当前依赖中的 ESM 模块。
