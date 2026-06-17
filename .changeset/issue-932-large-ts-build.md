---
"weapp-tailwindcss": patch
---

修复 Vite 构建中 Tailwind v4 `@source not` 排除大型 TS 文件后，仍然会进入 JS 转译解析导致构建明显变慢的问题。
