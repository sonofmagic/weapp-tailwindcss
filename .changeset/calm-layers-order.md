---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

由 weapp-tailwindcss 统一消费小程序与 Web Compact 产物中的 `@layer`，按照声明顺序重排样式块后移除 layer 语法，并阻止 postcss-preset-env 生成 `:not(#)` 权重占位选择器。现代 Web 产物继续保留原生 cascade layers。
