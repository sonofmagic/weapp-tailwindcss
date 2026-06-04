---
"weapp-tailwindcss": patch
---

补充记录 Webpack watch 模式下默认忽略输出目录的修复，确保 Taro Webpack 项目不会因为插件改写 `dist` 产物而反复触发重新编译。
