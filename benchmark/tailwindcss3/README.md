# tailwindcss3 性能对比

聚焦 tailwindcss v3 生态下的 upstream 运行时性能，涵盖 merge / variants 封装。

## 运行

```bash
pnpm --filter benchmark-tailwindcss3 install
pnpm --filter benchmark-tailwindcss3 bench
```

基准测试通过 Vitest bench 执行（配置见 `vitest.config.mts`，任务定义在 `bench.bench.ts`），运行后会在当前目录生成 `bench-report.json` 供导出分析。

需要的依赖：

- `tailwind-merge@2.x`、`tailwind-variants@0.x`
