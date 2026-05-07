---
"weapp-tailwindcss": patch
---

修正 Tailwind CSS v3 项目的默认生成模式行为：`auto` 会和 Tailwind CSS v4 一样由 weapp-tailwindcss 接管 Tailwind 样式生成，并移除重复的官方 Tailwind PostCSS 链路。
