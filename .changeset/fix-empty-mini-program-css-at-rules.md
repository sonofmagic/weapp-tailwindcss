---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复小程序 CSS 产物中仅含注释或已被清空的 `@media` 块未被移除的问题，避免微信开发者工具在 WXSS 编译时报 `unexpected token }`。同时同步 watch-HMR 的 Taro React v4 H5 脚本断言和 issue33 性能预算覆盖逻辑。
