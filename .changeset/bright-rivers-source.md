---
"weapp-tailwindcss": patch
---

修复 Vite 与 weapp-vite 项目同时配置多个 Tailwind CSS v4 `@source` 扫描根时，monorepo 外部包候选被本地样式目录错误过滤的问题。
