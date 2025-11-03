---
"weapp-tailwindcss": patch
---

- 抽取 `tailwind` patch 与并发任务的公共工具，统一在各打包插件中复用，降低重复代码并简化后续维护。
