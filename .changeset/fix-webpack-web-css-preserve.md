---
"weapp-tailwindcss": patch
---

修复 Webpack Web 目标下最终 CSS 产物被重新处理后覆盖的问题，避免 Docusaurus、Infima 或业务 SCSS 样式在生产构建中丢失。
