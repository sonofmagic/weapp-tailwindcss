---
"weapp-tailwindcss": patch
---

修复 webpack web target 下 Tailwind CSS v4 入口被路径匹配后没有继续扫描显式 `@source` 的问题，避免 `sr-only`、`rounded-full` 等只出现在源码中的工具类漏生成。
