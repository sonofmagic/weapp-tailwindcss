---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复 Tailwind CSS v4 生成模式下 colors 透明度变量在小程序样式兼容阶段被静态降级为不透明色的问题，并补充颜色工具类、`@theme` 自定义颜色与禁用默认颜色的回归覆盖。
