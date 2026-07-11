---
"weapp-tailwindcss": patch
---

统一 Vite、Webpack 与 Gulp 构建态的 Tailwind CSS 生成时机，使生成结果继续经过框架原有的 PostCSS 流程，并避免最终产物阶段重复生成同一份样式。
