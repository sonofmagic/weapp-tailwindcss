---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 生成模式下小程序产物可能缺失默认 preflight reset 的问题，避免 `divide-double`、`divide-dotted` 等分割线样式在未清零边框宽度时渲染出额外边框。
