---
"weapp-tailwindcss": patch
---

Vite source candidates 收集改为复用 `tailwindcss-patch` 的源码候选提取 API，移除本地重复的字符串/`@apply` 提取逻辑，避免与 Tailwind scanner 语义分叉。
