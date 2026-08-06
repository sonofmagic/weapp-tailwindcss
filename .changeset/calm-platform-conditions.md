---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

小程序样式现在默认移除无效的 `:active` 选择器，同时保留 Tailwind candidate 与模板类名转换，并允许通过 `cssOptions.cssRemoveActivePseudoClass: false` 显式恢复。H5 与 App 的 Web 构建行为保持不变。
