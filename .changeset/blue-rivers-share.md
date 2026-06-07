---
"weapp-tailwindcss": patch
---

修复 Vite 构建中同名分包样式源可能匹配错误的问题，并避免 Tailwind CSS v3 在隔离分包样式生成时复用增量缓存导致样式串包。
