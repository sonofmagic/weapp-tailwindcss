---
"weapp-tailwindcss": minor
---

默认开启 Tailwind CSS v4 生成模式的 `@import "weapp-tailwindcss"` 兜底识别，并新增 `generator.importFallback` 配置用于显式关闭。该能力用于框架无法完成 `@import "tailwindcss"` 转写时，仍让两种入口产出保持一致。
