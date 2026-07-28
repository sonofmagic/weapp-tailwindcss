---
'@weapp-tailwindcss/postcss': patch
'weapp-tailwindcss': patch
---

修复 uni-app x scoped 作者样式被原生 Tailwind 兼容过滤误删的问题，并让 H5/Web 作者样式继续交由 SFC 预处理链处理；同时在原生 App 的 `.uvue` 类集合扩大时失效 Tailwind CSS 模块并触发自动重载，使新增字体、颜色、间距和任意值类无需手动重新运行到设备即可生效。
