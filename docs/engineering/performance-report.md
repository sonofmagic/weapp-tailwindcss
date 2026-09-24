# 全链路性能报告与门禁

仓库性能验证分成合成场景和真实工程场景两层。

合成场景位于 `benchmark/performance`，覆盖 Tailwind v4 PostCSS 主样式、伪元素与嵌套 at-rule、处理器缓存命中、核心 source scan/显式 candidates/增量 cold-hit-append、WXSS/WXML/JS 大输入、Bundler 构建、连续 HMR class churn、runtime cold/steady/cache hit/cache miss、内存和输出稳定性。每个复杂度场景至少使用三个规模点，使用 median、P95、峰值 RSS、RSS 增量、输出字节数和 SHA-256 输出哈希进行判断。

真实工程场景沿用 `benchmark/version-compare`，比较 base/current 的 demo 构建、插件阶段、真实 watch HMR、峰值/稳态 RSS 和连续 class 增删稳定性。

## 命令

- `pnpm perf:report`：生成合成报告到 `.tmp/performance-report`。
- `pnpm perf:report -- --include-stress`：额外运行 10k 规则压力场景；该场景默认不进入 PR 快速门禁。
- `pnpm perf:synthetic:guard`：执行合成预算和复杂度门禁。
- `pnpm perf:guard`：执行现有真实 demo 对照门禁。
- `pnpm perf:baseline:update`：在明确确认后更新合成预算。
- `pnpm perf:profile`：针对 PostCSS 场景生成 Node CPU profile。

默认报告不会写入仓库中的 benchmark 数据文件。CI 将 JSON、Markdown、失败重放参数和诊断 profile 上传为 artifact；仓库只保存场景、预算和已知债务。

## 当前已知性能债务

Issue #1238（[Tailwind v4 主样式重复扫描 CSS AST](https://github.com/sonofmagic/weapp-tailwindcss/issues/1238)）登记为非阻断债务。`postcss-v4-main-*` 场景会报告复杂度指数；修复后应移除 `benchmark/performance/known-debts.json` 条目，并将新的线性预算写入 `budgets.json`。

PR 中新产生的预算违规、输出不稳定、样本不足和已知债务继续恶化会阻断；跨平台 nightly/manual 任务只用于比较 Linux、macOS 和 Windows 的趋势。
