---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v3 在 Vite 增量构建中只使用 source scan 候选集时遗漏当前 bundle 新增类名的问题，避免 WXML 已转义但 WXSS 未生成对应样式。
