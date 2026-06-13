---
"weapp-tailwindcss": patch
---

修复 Vite/Rolldown 产物回放 CSS 时直接向 `bundle` 新增资源导致 HMR 报错的问题，改为优先通过 `emitFile` 发射资源，兼容 Vite 8、Rolldown 与 Rollup。
