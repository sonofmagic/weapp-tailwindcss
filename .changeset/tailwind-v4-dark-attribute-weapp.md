---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复小程序样式转换中错误保留 `[data-theme=dark]` / `[data-mode="dark"]` 这类属性选择器的问题。web 目标继续保留 Tailwind CSS v4 data attribute dark variant，小程序目标会移除依赖属性选择器的无效规则，避免生成小程序不支持的选择器或让 dark 样式无条件生效。
