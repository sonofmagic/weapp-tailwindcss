---
"weapp-tailwindcss": patch
---

优化 Vite 适配器的启动与增量构建性能（保持功能一致性）：

- 运行时类集刷新改为按签名与配置变化触发，不再在每次 `generateBundle` 强制刷新。
- `generateBundle` 支持基于 dirty entries 与 linked entries 的增量处理，减少全量遍历开销。
- JS 转换新增轻量 precheck，无相关特征时跳过 Babel 解析与遍历。
- 新增 Vite 性能基准与汇总脚本，支持 optimized/legacy 对照复现。
