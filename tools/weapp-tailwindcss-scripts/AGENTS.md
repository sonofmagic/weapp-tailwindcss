# Package Guidelines (`@weapp-tailwindcss/scripts`)

## 适用范围

- 本文件仅适用于 `tools/weapp-tailwindcss-scripts`。

## 核心职责

- 本项目承载 `weapp-tailwindcss` 核心包的内部开发脚本、基准脚本和 watch-HMR 回归工具。
- 本项目必须保持私有，不发布到 npm。

## 变更原则

- 可以读取或写入 `packages/weapp-tailwindcss` 的构建产物，但不要承载核心运行时代码。
- 脚本路径应从仓库根或 `packages/weapp-tailwindcss` 包根解析，避免依赖调用者当前目录。
- 公开包安装生命周期需要的脚本不得迁入本项目。

## 测试要求

- 修改 watch-HMR 工具时，运行相关 `watch-hmr` 单测或 `pnpm --filter weapp-tailwindcss test:watch-hmr`。
- 修改构建/生成脚本时，至少运行对应脚本的最小验证。

## 推荐验证命令

- `pnpm --filter @weapp-tailwindcss/scripts test:watch-hmr -- --case <case> --skip-build`
- `pnpm --filter weapp-tailwindcss exec vitest run test/watch-hmr-regression.unit.test.ts`
- `pnpm --filter weapp-tailwindcss build:css`

## 提交前检查

- `package.json` 必须包含 `"private": true`。
- 不要新增 `publishConfig`。

