---
"weapp-tailwindcss": patch
---

调整 Vite 插件的 Tailwind CSS 生成时机，让生成后的 CSS 进入 Vite 原生 CSS/PostCSS 管道，默认尊重用户的 `postcss.config` 与 `css.postcss` 插件配置。
