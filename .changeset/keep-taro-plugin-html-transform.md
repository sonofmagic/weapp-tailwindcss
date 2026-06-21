---
"weapp-tailwindcss": patch
---

Vite 集成不再默认替换 Taro 注入的 `postcss-html-transform`，保留 `@tarojs/plugin-html` 自身的样式转换行为。
