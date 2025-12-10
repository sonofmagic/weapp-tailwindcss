---
'@weapp-tailwindcss/runtime': patch
'@weapp-tailwindcss/cva': patch
'@weapp-tailwindcss/variants': patch
'@weapp-tailwindcss/variants-v3': patch
---

修复缓存淘汰逻辑的类型问题，减少 escape/unescape 的多余处理，带来更平滑的性能提升。
