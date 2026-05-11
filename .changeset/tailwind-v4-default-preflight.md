---
"weapp-tailwindcss": patch
---

按 Tailwind CSS 主版本解析默认 `cssPreflight`，v4 运行时改用 `margin: 0`、`padding: 0` 和 `border: 0 solid`，避免继续注入 v3 的拆分边框默认值。
