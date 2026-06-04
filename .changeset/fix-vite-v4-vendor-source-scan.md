---
"weapp-tailwindcss": patch
---

修复 Vite + Tailwind CSS v4 生成时把 vendor 依赖 chunk 中的运行时配置字符串误提取为候选类的问题，并对齐裸 Tailwind v4 CSS 入口的默认 source 扫描范围。
