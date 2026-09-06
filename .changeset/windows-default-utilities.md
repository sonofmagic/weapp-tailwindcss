---
"weapp-tailwindcss": patch
---

修复 Windows 下 CSS import 转义路径导致默认源码扫描失效、标准 utility 与 spacing 变量缺失的问题。统一入口路径解析、CSS 请求序列化和主题文件定位，并增加 Taro Webpack 开发与生产产物的 Windows 回归验收。Refs #1159。
