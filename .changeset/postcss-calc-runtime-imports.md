---
'@weapp-tailwindcss/postcss-calc': patch
---

修复 workspace 开发态直接加载 TypeScript 源码时的相对导入解析问题，并明确 ESM/CJS 运行时入口，避免 Vite demo 构建失败。
