---
"weapp-tailwindcss": patch
---

为 watch-HMR 回归增加 weapp-tailwindcss 插件自身处理耗时采集与 500ms 预算校验，区分构建器端到端热更新时间和插件内部处理时间，便于持续优化开发体验。
