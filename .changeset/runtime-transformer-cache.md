---
"@weapp-tailwindcss/runtime": patch
---

修复自定义映射和自定义转换器被默认 fast path 跳过的问题，保持反转义、准备、合并、恢复和转义顺序；缓存命中更新 LRU 顺序，继续保持 256 条上限与实例隔离。
