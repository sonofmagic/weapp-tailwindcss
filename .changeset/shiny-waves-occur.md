---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复 uni-app x H5 渐变与阴影：Web 生成样式保持独立转换链，局部 @apply 与 scoped 清理保留所需运行时变量初始化及注册，保留动态 fallback 和工具类组合。Refs #1210。
