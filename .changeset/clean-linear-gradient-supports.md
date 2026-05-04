---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

移除 Tailwind CSS v4 `bg-linear-to-*` 生成的 lab 渐变 `@supports` 检测块，避免小程序端保留无效的 `linear-gradient(in lab, red, red)` 兼容分支。

保留基础 `--tw-gradient-position` 与 `background-image: linear-gradient(var(--tw-gradient-stops))` 产物，并补充 `bg-linear-to-r` 单测与 Taro Vite v4 端到端回归。
