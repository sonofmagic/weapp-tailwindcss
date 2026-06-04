---
"weapp-tailwindcss": patch
---

修复 Webpack 产物中可能残留 Tailwind CSS v4 源指令的问题，避免页面级样式里的 `@reference` 等指令直出到小程序 WXSS 后触发开发者工具编译错误。
