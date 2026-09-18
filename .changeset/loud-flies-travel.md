---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

将共享生成流程、Vite 产物清理、Webpack 兼容和 Harmony apply 的样式变换归入 PostCSS 包，保留主包编排接口，减少重复解析、声明签名计算和未命中规则克隆。
