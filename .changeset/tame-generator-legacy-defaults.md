---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 小程序生成模式默认值与 v3 不一致的问题，默认注入 v3 兼容默认值，并允许通过 `generator.legacyDefaults: false` 关闭。
