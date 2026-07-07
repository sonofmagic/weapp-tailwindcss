---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 CSS macro 入口在初次 source scan 后无法复用增量生成缓存的问题，避免后续新增 candidate 时退回全量生成。
