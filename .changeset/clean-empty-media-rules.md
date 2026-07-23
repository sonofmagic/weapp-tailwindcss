---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复小程序样式在非主样式块、缓存产物与嵌套条件规则中残留空 `@media`、`@supports` 等块级 at-rule，避免生成的 WXSS 因空媒体查询触发编译错误。
