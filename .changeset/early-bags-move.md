---
'@weapp-tailwindcss/postcss': patch
'weapp-tailwindcss': patch
---

修复 Taro Vite Tailwind CSS v4 构建时最终样式产物仍残留 `:not(#\#)` / `:not(#n)` 的问题。

同时为 Taro demo 的构建守卫增加对 `@tarojs/plugin-doctor` 原生检查的安全绕过，避免当前环境下其 Rust 模块 panic 导致 demo 无法完成真实构建验证。
