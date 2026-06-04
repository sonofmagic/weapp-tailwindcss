---
"weapp-tailwindcss": major
---

新增 Tailwind CSS v4 生成器公共入口，并提供 PostCSS 插件入口，支持按 `weapp`、`web` 与 `tailwind` 目标生成平台产物。

Vite 插件支持通过 `generator` 选项启用 Tailwind CSS v4 直接生成链路，`force` 模式会把生成器产物作为主 CSS 真源；PostCSS 插件支持收集本地 `@source` 指向的小程序模板源码，生成更贴近小程序运行环境的 CSS。同步迁移 Tailwind CSS v4 的 Vite 示例到标准 `@import "tailwindcss"` 入口。

新增独立 v5 生成器 demo 与使用示例文档，覆盖 uni-app Vue Vite、Taro Vite 与 Mpx，并保留原有 v4 demo 用法用于历史链路回归。
