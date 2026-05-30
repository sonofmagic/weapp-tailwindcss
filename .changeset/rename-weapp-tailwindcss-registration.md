---
"weapp-tailwindcss": major
---

统一构建器插件的公开注册名为 `WeappTailwindcss`，移除 Webpack 与 Vite 入口中的旧 `Unified*` 导出别名；同时补齐 `target: 'web'` 场景下 Tailwind CSS v4 website 模式的 CSS 生成与源码扫描行为，避免文档站接入时依赖官方 Tailwind 生成插件。
