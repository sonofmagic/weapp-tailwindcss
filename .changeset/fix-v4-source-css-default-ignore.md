---
"weapp-tailwindcss": patch
---

对齐 Tailwind CSS v4 官方 source detection 语义：Vite 生成模式的自动源码扫描默认忽略 CSS 与预处理器文件，只有显式 `@source` 注册时才会扫描这些样式文件，避免自动候选收集把样式入口误当作内容源。
