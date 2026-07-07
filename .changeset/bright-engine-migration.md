---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

升级 `@tailwindcss-mangle/engine` 到 0.1.3，并适配 Tailwind v4 生成结果中 source metadata 的返回行为变化。

`weapp-tailwindcss` 现在会在自身的 v4 扫描层回填已解析的 `@source` 扫描规则，避免依赖底层 engine 继续透传 compiled sources；同时修正 Vite 已处理 CSS replay 到小程序根样式资产时的显式目标 fallback 边界。
