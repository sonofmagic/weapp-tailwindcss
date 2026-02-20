# Package Guidelines (`packages/minify-preserve`)

## 适用范围

- 本文件适用于 `packages/minify-preserve`。
- 该包是“压缩保留函数名”示例与回归测试集合，不是生产运行时库。

## 核心职责

- `README.md`：说明 esbuild/terser/swc/babel 下的 `keepNames/keep_fnames` 配置要点。
- `test/bundler-config.test.ts`：验证不同压缩链路下的函数名保留行为。

## 变更原则

- 示例配置必须可直接迁移到真实项目，避免使用与主流工具链不一致的写法。
- 修改测试时需保持跨工具对照（至少覆盖 esbuild、webpack terser、swc、babel）。
- 快照更新需附带原因说明（工具升级、压缩策略变化等），防止误把回归当升级。

## 推荐验证命令

- `pnpm --filter @weapp-tailwindcss/minify-preserve test`
