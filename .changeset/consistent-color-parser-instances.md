---
"@weapp-tailwindcss/postcss": patch
---

将颜色解析器及其 AST 依赖一起打包，避免独立安装出现多份 parser 实例时丢失主题颜色和透明度工具类。
