---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

统一 uni-app x 的样式属性名、数值单位与行高类型转换到 PostCSS，删除主包重复实现，减少重复属性名处理并保持 CSS 与 UTS 输出一致。
