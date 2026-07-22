---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复小程序最终样式产物在条件编译、缓存复用与嵌套规则清理后残留空 `@media`、`@supports` 等块级 at-rule，避免 WXSS 编译报错，同时保留开发态增量构建所需的条件规则占位容器。
