---
"weapp-tailwindcss": patch
---

修复 Vite/Rolldown 产物回放 CSS 时直接写入 bundle 的兼容问题，改为优先通过 emitFile 发射资源，避免 Rolldown 忽略回放样式。
