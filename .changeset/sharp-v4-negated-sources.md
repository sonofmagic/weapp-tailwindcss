---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 显式 `source(none)` 入口仅包含 `@source not ...` 时，Vite source scan 误退化为全仓扫描的问题，避免生成范围超出入口声明。
