---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 生成模式下 bundler 和 PostCSS 入口未启用官方 source detection 的问题，支持自动扫描、`@source`、`source(...)` / `source(none)`、`@source not`、`inline()` 与 brace expansion 等规则，同时保持 Tailwind CSS v3 生成链路不变。
