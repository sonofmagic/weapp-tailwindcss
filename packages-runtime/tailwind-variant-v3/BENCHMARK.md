# tailwind-variant-v3 基准测试（参考基线）

> 命令：`pnpm --filter tailwind-variant-v3 bench`
>
> 环境：Node v22.20.0、Vitest v4.0.15（bench 模式）

- tv base render：9,298,799 ops/s，平均 100 µs（样本 4,649,400）
- tv variants render：5,446,251 ops/s，平均 200 µs（样本 2,723,126）
- tv slots render：290,134 ops/s，平均 3,500 µs（样本 145,067）
- cn tailwind merge：2,920,146 ops/s，平均 300 µs（样本 1,460,073）

以上结果为当前实现（TypeScript 迁移后）的 baseline，可在后续重构或优化时重新运行同样的命令进行对比，关注 `ops/sec` 与平均耗时的变化幅度。
