---
"weapp-tailwindcss": patch
---

优化 Tailwind v3/v4 增量生成缓存的内存占用：隔离 CSS 源可复用增量缓存，同时超出候选数或 CSS 字节上限的大型生成结果不再进入长期缓存，避免 HMR 中保留无效的大型 Tailwind context。
