---
'tailwind-variant-v3': minor
---

拆分 `tv` 运行时为多个模块，重写变体求值与 slot 缓存流程，补齐 Vitest/Vitest bench 场景的类型声明，并新增基准测试记录，方便后续重构对比性能。
