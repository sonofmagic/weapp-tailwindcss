# weapp-tailwindcss

> 简体中文 | [English](./README.en.md)

这个包是把 Tailwind CSS 带到小程序生态的核心入口，负责类名转译、CSS 兼容、框架构建适配和 Tailwind v4 支持。

## 官网

更多接入方式、配置说明和框架示例见 [weapp-tailwindcss 官方文档](https://tw.icebreaker.top)。

Tailwind CSS 4 项目中，入口 CSS 需要同时满足两点：在项目里被实际引入，并通过 `cssEntries` 显式传给插件用于稳定识别。`cssEntries` 不是替代 import 的开关。
