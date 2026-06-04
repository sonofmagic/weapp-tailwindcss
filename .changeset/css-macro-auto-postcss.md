---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

内置 `css-macro` 的 PostCSS 转换感应逻辑：当 Tailwind CSS v3 配置中注册 `weapp-tailwindcss/css-macro`，或 Tailwind CSS v4 入口 CSS 中声明 `@plugin "weapp-tailwindcss/css-macro"` 时，会自动启用条件编译注释转换，不再要求常规集成手动注册 `weapp-tailwindcss/css-macro/postcss`。

同时在生成 CSS 裁剪阶段保留由 `css-macro` 产生的 `#ifdef` / `#ifndef` / `#endif` 注释，并同步更新文档与 demo 配置。
