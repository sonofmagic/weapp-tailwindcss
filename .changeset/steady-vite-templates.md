---
"weapp-tailwindcss": patch
---

修复 Vite 构建中源 WXML 覆盖已转换 bundle 模板的问题，保留其他插件注入的模板结构，同时维持 Tailwind class 的正常生成与转义。
