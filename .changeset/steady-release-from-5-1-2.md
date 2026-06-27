---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
"theme-transition": patch
---

本次发布整理了从 `5.1.2` 之后的主要变更：修复 Tailwind v4 多 `cssEntries` 场景下的主样式误匹配与分包样式映射问题，补齐 Taro webpack5/Vite、Rspack、H5/web 兼容与平台环境支持，并同步修复主题过渡的首帧闪烁问题。
