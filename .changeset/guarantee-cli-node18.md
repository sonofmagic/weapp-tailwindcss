---
"weapp-tailwindcss": patch
---

重构 CLI 结构并改用惰性加载方式获取 `@tailwindcss-mangle/config`，修复 ESLint/TS 报错，保证在 Node.js 18 下同样可用。
