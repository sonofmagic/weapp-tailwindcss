---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

小程序样式现在默认移除无效的 `:active` 选择器，同时保留 Tailwind candidate 与模板类名转换，并允许通过 `cssOptions.cssRemoveActivePseudoClass: false` 显式恢复。Tailwind CSS v4 的任意 `@custom-variant` 都支持条件注释放在变体内部或包住整个变体的跨平台写法。H5 与 App 的 Web 构建行为保持不变。
