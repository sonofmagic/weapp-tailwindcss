---
"weapp-tailwindcss": patch
---

修复 Vite 构建中 Tailwind CSS v4 显式 `cssEntries` 的分包样式映射，避免普通分包样式漏生成或被注入主包样式产物。
