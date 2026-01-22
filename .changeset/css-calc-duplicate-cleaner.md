---
"@weapp-tailwindcss/postcss": patch
---

修复 `cssCalc` 预计算时可能输出重复声明的问题，新增仅在启用 `cssCalc` 时生效的去重清理。
