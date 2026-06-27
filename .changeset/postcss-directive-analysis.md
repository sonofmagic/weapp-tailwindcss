---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

新增 Tailwind CSS 指令 AST 分析工具，并让生成 CSS 入口复用该分析能力，减少重复解析 CSS 字符串的开销。
