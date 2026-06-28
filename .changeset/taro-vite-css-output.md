---
"weapp-tailwindcss": patch
---

修复 Taro Vite 小程序构建中同名或匿名 CSS 产物乱序时，页面普通 CSS 与 Tailwind v4 生成 CSS 可能被写入错误分包样式文件的问题。
