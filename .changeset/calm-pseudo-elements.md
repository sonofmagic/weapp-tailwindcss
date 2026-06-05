---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复小程序端生成样式中的 `:before` / `:after` 输出会被规范化为单冒号，以及 Tailwind preflight 中 `--tw-content: ''` 被错误合并到 `view,text,::after,::before` 基础选择器的问题，确保伪元素内容初始化只作用于 `::before` / `::after`，并补充分包入口样式快照覆盖。
