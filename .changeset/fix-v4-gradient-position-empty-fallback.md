---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复 Tailwind CSS v4 渐变位置变量在小程序中的空 fallback 兼容问题。`--tw-gradient-from-position`、`--tw-gradient-via-position` 与 `--tw-gradient-to-position` 会统一输出为带逗号和空格的空 fallback，避免 `var(--tw-gradient-*-position,)` 或缺少 fallback 时导致渐变在微信小程序运行时渲染异常；显式 fallback 仍保持原样。
