---
"weapp-tailwindcss": patch
---

修复 Webpack web target 下已生成的 Tailwind CSS v4 产物会丢失官方 layer 声明的问题，并增加 core、Vite、Webpack、Gulp 与官方 PostCSS/Vite 产物一致性的回归测试。
