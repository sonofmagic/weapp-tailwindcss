---
"weapp-tailwindcss": minor
---

移除 v4 时代“先生成浏览器 CSS 再后处理”的关闭生成器链路，`generator: false` 现在按默认生成模式处理，Vite、Webpack、Gulp 与 PostCSS 入口统一由 weapp-tailwindcss 接管 Tailwind CSS 样式生成。
