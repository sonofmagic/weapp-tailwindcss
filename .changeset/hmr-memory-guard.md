---
"weapp-tailwindcss": patch
---

修复 Vite HMR 局部增量构建中缓存 hash 记录持续累积的问题，限制全局 compiler context 缓存的长期驻留规模，并为 watch/HMR 与 CI 流程补充内存报告和内存守卫，便于提前发现内存异常。
