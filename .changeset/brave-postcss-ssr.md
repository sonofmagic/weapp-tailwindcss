---
"@weapp-tailwindcss/postcss": patch
"tailwindcss-config": patch
---

修复 `@weapp-tailwindcss/postcss` 产物在 Vite/Vitest SSR 中可能被错误重写并触发 `Unexpected token ':'` 的问题，同时修正 `tailwindcss-config` 的源码导入扩展名，提升发布产物与测试链路稳定性。
