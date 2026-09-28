---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复嵌套 CSS 规则去重后遗留空 at-rule 祖先，避免 Vite watch 重复注入 Tailwind 外壳导致恢复相同源码时产物不一致。
