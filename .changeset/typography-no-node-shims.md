---
"@weapp-tailwindcss/typography": patch
---

修复构建产物依赖 Node.js `url` 模块导致浏览器端编译失败的问题，去除 tsup 注入的 Node shim，保证包在 Vite 等 Web 环境下可正常使用。
