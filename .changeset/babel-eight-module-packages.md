---
"weapp-tailwindcss": major
"@weapp-tailwindcss/debug-uni-app-x": patch
"@weapp-tailwindcss/init": patch
"@weapp-tailwindcss/logger": patch
"@weapp-tailwindcss/postcss": patch
"@weapp-tailwindcss/reset": patch
"@weapp-tailwindcss/shared": patch
"@weapp-tailwindcss/typography": patch
"tailwindcss-config": patch
"theme-transition": patch
"weapp-style-injector": patch
---

升级核心 Babel 工具链到 Babel 8，并将 Node.js 最低版本提升到 `^22.18.0 || >=24.11.0`。相关包默认采用 ESM 语义，继续同时发布 ESM 与 CommonJS 入口；ESM 产物使用 `.js`，CommonJS 产物使用 `.cjs`，原有公开包名与子路径保持不变。同时收紧 tsdown 的依赖外置策略，避免 ESM 无条件内联可直接消费的依赖，并保证 CommonJS 不会同步加载 ESM-only 依赖。
