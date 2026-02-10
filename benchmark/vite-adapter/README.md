# Vite Adapter Perf Benchmark

该目录用于复现实测 `weapp-tailwindcss` Vite 适配器在以下维度的性能：

- dev 启动 ready 时间
- 热更新增量代理（在 warm cache 下，单文件改动后的下一次增量 `build`）
- 冷构建时间
- dev 模式真实热更新（单文件改动触发下一次 watch 增量）

## 基准模式

脚本会对比两组模式：

- `optimized`（默认）：启用本次优化实现（runtime 签名失效、dirty 子集、JS precheck）
- `legacy`（基线模拟）：通过环境变量启用旧行为
  - `WEAPP_TW_VITE_FORCE_RUNTIME_REFRESH=1`
  - `WEAPP_TW_VITE_DISABLE_DIRTY=1`
  - `WEAPP_TW_VITE_DISABLE_JS_PRECHECK=1`

## 运行命令

### 1) 构建代理热更新（稳定可复现）

在仓库根目录执行：

```bash
pnpm --filter weapp-tailwindcss bench:vite-perf \
  --cwd templates/uni-app-vite-vue3-tailwind-vscode-template \
  --script dev:mp-weixin \
  --project-file src/pages/index/index.vue \
  --runs 5 \
  --warmup 1 \
  --output benchmark/vite-adapter/vite-adapter-perf-report.json
```

### 2) dev 真实热更新（watch）

```bash
pnpm --filter weapp-tailwindcss bench:vite-dev-hmr \
  --cwd demo/uni-app-vue3-vite \
  --script dev \
  --project-file src/pages/index/index.vue \
  --runs 5 \
  --warmup 1 \
  --output benchmark/vite-adapter/vite-dev-hmr-report.json
```

### 3) dev 真实热更新 + 大型项目模拟（注入 150 页）

```bash
pnpm --filter weapp-tailwindcss bench:vite-dev-hmr \
  --cwd demo/uni-app-vue3-vite \
  --script dev \
  --project-file src/pages/index/index.vue \
  --inject-pages 150 \
  --runs 5 \
  --warmup 1 \
  --output benchmark/vite-adapter/vite-dev-hmr-big150-report.json
```

> 注：`--inject-pages` 会临时写入 `pages.json` 与注入页面目录，脚本结束后自动回滚。

生成统计表：

```bash
pnpm --filter weapp-tailwindcss bench:vite-perf:summary \
  --input benchmark/vite-adapter/vite-adapter-perf-report.json \
  --output benchmark/vite-adapter/vite-adapter-perf-summary.md
```

## 输出文件

- `benchmark/vite-adapter/vite-adapter-perf-report.json`：完整原始样本 + 统计结果
- `benchmark/vite-adapter/vite-adapter-perf-summary.md`：可直接贴进 PR 的对比表
- `benchmark/vite-adapter/vite-dev-hmr-report.json`：dev 真实热更新样本

## 注意事项

- 请确保测试机器无重负载，并固定 Node/pnpm 版本。
- 建议在同一机器连续跑两次，比较方差是否稳定。
- 若需只跑优化版本，可传入 `--mode optimized`。
- 若本机文件监听在沙箱内不稳定，优先使用“增量 build 代理热更新”脚本。
- 若本机 watch 事件不敏感，可附加 `--force-polling 1`。
