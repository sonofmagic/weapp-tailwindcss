---
"@weapp-tailwindcss/postcss": patch
---

修复 Tailwind CSS v4.3 生成的 `var(--tw-*,)` 空 fallback 在微信开发者工具中解析异常的问题，确保 `rotate-y-90` 等 transform 工具类输出为小程序可识别的 `var(--tw-*, )`。
