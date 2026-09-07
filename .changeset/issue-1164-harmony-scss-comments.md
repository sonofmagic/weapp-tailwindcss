---
"weapp-tailwindcss": patch
---

修复 uni-app x Harmony VDOM 中 scoped SCSS 行注释导致背景、尺寸和圆角失效的问题。统一原始样式的 SCSS 解析，正确收集与展开局部 utility，并保留注释后的引用路径及作者样式。Web 端为空白或纯注释的 scoped 块生成独立局部样式载体，避免框架移除空块后丢失样式。Refs #1164。
