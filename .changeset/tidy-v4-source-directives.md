---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 入口样式的 `@source inline(...)`、`@source not inline(...)` 与 `@import "tailwindcss" source(none)` 识别，提升多入口/分包样式生成时的源文件匹配稳定性。
