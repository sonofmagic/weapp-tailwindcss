---
status: verified
issue: https://github.com/sonofmagic/weapp-tailwindcss/issues/1194
baseline: 7df3fd58a84d9cb6011a4a98bf7366ad9783c986
regressions:
  - packages/postcss/test/calc.test.ts
  - packages/postcss-calc/test/index.test.ts
  - packages/postcss/test/pluginHelpers.test.ts
  - packages/postcss/test/calc-context.test.ts
  - packages/weapp-tailwindcss/test/tailwindcss/v4-style-context.test.ts
  - scripts/ci/demo-matrix/version-contract.test.mjs
---

# Issue #1194：跨 CSS 资产预计算自定义属性

## 症状

Tailwind CSS v4 会把主题变量和 utility CSS 分阶段生成。`cssCalc: ['--spacing']` 在单个 PostCSS 输入中可以生效，但在 Vite/uni-app 构建中，处理 utility CSS 时可能看不到变量声明，最终产物仍保留 `calc(var(--spacing) * 2)`。

## 根因与纠正

PostCSS 的 `postcss-preset-env` 只能解析当前 AST 中可见的自定义属性。Tailwind v4 生成器已经收集了 CSS 自定义属性值，但非增量生成路径没有把这份映射传给 calc 处理器；同时 calc 变量替换使用正则，无法安全处理 fallback、嵌套函数和变量链。

## 修复约束

- `cssCalc` 数组或正则是允许静态化的变量集合，不得硬编码 `--spacing`。
- 变量映射必须来自 Tailwind 生成结果或构建图数据，不能通过固定目录、文件名或后置读取源码获得。
- 使用 value AST 解析 `var()`，递归解析变量链；fallback 可作为解析失败时的候选值。
- 检测循环引用，无法安全静态化时保留原始运行时表达式。
- 对象形式的 `cssCalc.includeCustomProperties` 必须与数组形式保持同等透传，不能在附带变量映射时被丢弃。
- 保留变量声明和 CSS 级联顺序，未匹配变量不得被静态化。

## 验证

1. 先用真实 `cssEntries` 运行 uni-app + Vite + Tailwind v4 构建，检查最终 CSS 资产，而不是只调用单个 PostCSS handler。
2. 用最小 CSS 单测覆盖 `var(--foo)`、`var(--foo, fallback)`、变量链、循环引用和正则匹配。
3. 同时验证增量和非增量 Tailwind v4 生成路径，确认自定义属性映射一致。
4. 运行 `pnpm --filter @weapp-tailwindcss/postcss-calc test`、`pnpm --filter @weapp-tailwindcss/postcss test` 及相关 bundler/e2e static 基线。
5. 修改公开包时，changeset 必须覆盖每个实际变更的包，并用中文描述用户可见行为。

## CI 版本契约与性能复查

- 根 `package.json#packageManager` 是 CI 的 pnpm 版本来源，模板同步与报告 gate 复用 `scripts/ci/version-contract.mjs`。完整性后缀不参与 CLI 版本比较。
- 依赖断言使用 fixture manifest 的 semver 范围；精确版本自然要求完全一致。候选包版本使用当前 workspace manifest，发布版由冻结 lockfile 保持复现条件。
- 切换发布版与候选包后，不能用同一个 Node 进程的 `require()` 缓存报告已安装版本。本地曾读到旧版 `5.5.1`，实际候选 tarball 为 `5.5.4`；现在直接读取安装目录元数据，并用切换符号链接的测试覆盖。
- 数组与正则入口曾只透传匹配规则而遗漏变量值；`calc-context.test.ts` 修复前 2 项失败，修复后两种配置入口都得到 `6rpx`，未匹配变量保留。
- 完整生成不需要 calc 变量时不得为此额外创建 PostCSS AST；增量路径已有颜色兼容变量消费者，不能直接删除其上下文。
- `pnpm test:demo:matrix` 覆盖版本解析、临时升级 manifest、报告版本一致性与安装切换；定向 ESLint、`pnpm agents:check` 以及 PostCSS 两个包测试均需要在推送前运行。
- 远端 Benchmark 曾报告 Taro Webpack RSS 增加约 8%–10%；按配置跳过额外解析后，仍须在新提交上运行真实 Benchmark 确认，不能降低阈值替代修复。

## 适用边界

本流程适用于 Tailwind v4 主题变量、跨 CSS 资产生成和 `cssCalc` 配置；无法确认变量作用域时不做静态替换。

## 规则评估

本次复盘确认变量映射必须来自构建图，变量匹配必须由用户配置控制，且单资产测试不能替代真实 bundler 构建验证。
