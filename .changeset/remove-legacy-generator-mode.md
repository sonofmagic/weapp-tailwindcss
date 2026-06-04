---
"weapp-tailwindcss": major
---

移除 v4 时代“先生成浏览器 CSS 再后处理”的关闭生成器链路，同时删除 `generator` 布尔写法、`mode`、默认 `target`、PostCSS 顶层 `target`、`staleClassNameFallback`、`rewriteCssImports` 与旧 Vite 插件命名。Vite、Webpack、Gulp 与 PostCSS 入口统一由 weapp-tailwindcss 接管 Tailwind CSS 样式生成，默认直接输出小程序 CSS。
