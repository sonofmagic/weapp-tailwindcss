---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/init": patch
"@weapp-tailwindcss/postcss": patch
"@weapp-tailwindcss/reset": patch
"tailwindcss-injector": patch
"@weapp-tailwindcss/runtime": patch
"@weapp-tailwindcss/merge": patch
"@weapp-tailwindcss/typography": patch
---

升级 ESM 化依赖后，将公开包的 Node.js 安装版本约束统一到 `^20.19.0 || >=22.12.0`，避免不支持稳定 ESM/CJS 混合加载的 Node.js 版本安装使用。
