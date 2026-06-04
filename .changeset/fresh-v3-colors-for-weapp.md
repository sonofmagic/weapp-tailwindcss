---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 小程序生成模式默认颜色与 v3 不一致的问题，Tailwind CSS v3 兼容模式下恢复 v3 默认色板，并避免输出小程序不支持的 `oklch` 默认颜色。
