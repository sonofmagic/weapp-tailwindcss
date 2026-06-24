---
"weapp-tailwindcss": patch
---

修复 Taro Webpack 入口同时引入多个 CSS 时，已由 loader 生成的主样式被再次生成并导致自定义样式重复，同时保留兄弟 CSS import 的用户样式。
