---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 source 扫描回归，避免 PostCSS 和 Vite 生成链路误丢 `@source` 命中的文件，并过滤小程序不支持的 slash variant 候选。
