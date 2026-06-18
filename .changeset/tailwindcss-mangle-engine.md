---
"weapp-tailwindcss": minor
---

将 `weapp-tailwindcss` 内部的 Tailwind 运行时接入切换为 `@tailwindcss-mangle/engine`，不再依赖 `tailwindcss-patch` 修改 Tailwind 包本身，并移除旧的 `twPatcher`、`createTailwindcssPatcher` 等 patcher 兼容命名，统一使用 Tailwind 运行时对象；同时新增 Tailwind CSS v3/v4 与 Web/H5、小程序、uni-app x Android/iOS/Harmony 的运行时分支路由，并将 Web/H5、小程序、原生 App 与 Tailwind 原样输出拆到独立分支文件，让不同版本和平台走独立判断入口，降低 App 端调整影响 H5 或小程序输出的风险；补齐 Tailwind CSS v3/v4 的源码候选扫描、Vite/Webpack 运行时类集合刷新与相关回归覆盖，并修复运行时候选污染时 WXML/JS 条件表达式里的普通业务字符串被误转义的问题。
