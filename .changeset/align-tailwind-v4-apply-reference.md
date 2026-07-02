---
"weapp-tailwindcss": patch
---

修复 Tailwind v4 运行时候选收集对裸 `@apply` 的误判，要求 scoped/CSS module 场景通过 `@reference` 或 utilities 上下文显式声明依赖。
