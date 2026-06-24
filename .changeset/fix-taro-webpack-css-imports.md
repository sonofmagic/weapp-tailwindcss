---
"weapp-tailwindcss": patch
---

修复 Taro Webpack 入口同时引入多个 CSS 时，已由 loader 生成的主样式被再次生成并导致自定义样式重复的问题；同时保留 webpack/css-loader 已处理的静态资源 URL，避免背景图等相对资源路径在合并 CSS 时退回为未打包的裸路径。
