# weapp-tailwindcss

> 简体中文 | [English](./README.en.md)

这个包是把 Tailwind CSS 带到小程序生态的核心入口，负责类名转译、CSS 兼容、框架构建适配和 Tailwind v4 支持。

## 官网

更多接入方式、配置说明和框架示例见 [weapp-tailwindcss 官方文档](https://tw.icebreaker.top)。

Tailwind CSS 4 项目中，入口 CSS 需要同时满足两点：在项目里被实际引入，并通过 `cssEntries` 显式传给插件用于稳定识别。`cssEntries` 应使用项目根目录解析出的绝对路径；它不是替代 import 的开关。

## 运行环境

从 `weapp-tailwindcss@5.2.0` 开始，需要 Node.js `>=22.12.0`。该版本默认支持从 CommonJS 加载 ESM。

通过 HBuilderX 使用 `uni-app` 或 `uni-app x` 时，还需要 HBuilderX `>=5.11`。旧版 HBuilderX 的内置 Node 可能无法加载当前依赖中的 ESM 模块。
