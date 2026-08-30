---
"weapp-tailwindcss": patch
---

优化 Generic Web 非 watch 生产构建：跳过不需要的小程序 source-candidates 状态维护，减少重复扫描与构建生命周期开销。
