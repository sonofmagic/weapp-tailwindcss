---
"weapp-tailwindcss": patch
---

fix: 修复在 tailwindcss@4 中由于 @layer 导致选择器优先级升高,高于就近编写的样式的问题

更改 `weapp-tailwindcss/index.css` 的默认行为，以后小程序默认引入 `weapp-tailwindcss` 就不会产生 `@layer` ，假如开发者在小程序中使用 `@layer` 会导致当前文件的样式层级整体提升 `(n,0,0)`

添加 `weapp-tailwindcss/with-layer.css` 用来和 `tailwindcss@4` 保持一致