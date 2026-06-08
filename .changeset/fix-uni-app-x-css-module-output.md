---
"weapp-tailwindcss": patch
---

修复 uni-app x App 端构建中，Vite/uni 已转换为 CSS module JS 导出的样式模块再次进入样式处理链路，导致 Android/iOS 产物被二次 PostCSS 处理的问题。
