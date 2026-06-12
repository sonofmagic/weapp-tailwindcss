---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

将 `weapp-tailwindcss` 中生成型 PostCSS 插件、PostCSS 辅助扫描逻辑和 `css-macro/postcss` 转换入口迁入 `@weapp-tailwindcss/postcss`，主包保留兼容转发入口，方便后续统一维护 PostCSS 能力边界。
