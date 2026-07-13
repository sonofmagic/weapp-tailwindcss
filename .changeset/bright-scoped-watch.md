---
"weapp-tailwindcss": patch
---

修复 Vite build watch 中 scoped Vue 组件样式在小程序选择器转义前被框架写入输出目录的问题，确保 uni-app 与 uni-app x 开发构建写入框架 CSS 缓存前已完成 Tailwind class 转换。同时将 Vue style request 元数据与 PostCSS 真实文件路径分离，避免 Windows 把带 Vite query 的模块 id 当作输出路径；开发者工具不再编译到包含反斜杠转义的临时样式，生产构建与 H5 样式生成行为保持不变。
