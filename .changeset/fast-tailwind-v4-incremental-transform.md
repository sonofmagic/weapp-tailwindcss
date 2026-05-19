---
"weapp-tailwindcss": patch
---

优化 Tailwind CSS v4 增量生成：新增候选类时仅转换新增 CSS 片段并追加到缓存结果，避免每次热更新都重新转换完整生成 CSS。
