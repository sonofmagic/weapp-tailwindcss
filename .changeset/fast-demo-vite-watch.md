---
"weapp-tailwindcss": patch
---

优化 Vite 构建器在 demo 热更新场景下的源候选缓存与 CSS 生成刷新逻辑，避免增量编译反复丢失源码候选或执行不必要的全量任务。

同时调整 Taro Vite 与 weapp-vite demo 的 watch 验证脚本，默认使用真实原生 watch 增量流程，避免测试脚本重启构建进程或额外执行全量构建导致热更新时间被放大。
