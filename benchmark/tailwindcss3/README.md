# tailwindcss3 性能对比

聚焦 tailwindcss v3 生态下的运行时性能，涵盖 upstream 与小程序增强版的 merge / variants 封装。

## 运行

```bash
pnpm --filter benchmark-tailwindcss3 install
pnpm --filter benchmark-tailwindcss3 bench
```

基准测试通过 Vitest bench 执行（配置见 `vitest.config.mts`，任务定义在 `bench.bench.ts`），运行后会在当前目录生成 `bench-report.json` 供导出分析。

需要的依赖：

- `tailwind-merge@2.x`、`tailwind-variants@0.x`
- Workspace 内的 `@weapp-tailwindcss/merge-v3`、`tailwind-variant-v3`、`@weapp-tailwindcss/variants-v3`
