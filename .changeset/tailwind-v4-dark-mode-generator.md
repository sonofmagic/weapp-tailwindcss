---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复 Tailwind CSS v4 生成模式下 data attribute 版 `@custom-variant dark` 在小程序选择器兜底清理阶段丢失属性选择器的问题，并补充默认媒体查询、`.dark` 自定义选择器和 `[data-theme=dark]` 自定义选择器的回归覆盖。
