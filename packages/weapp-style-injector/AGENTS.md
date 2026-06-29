# Package Guidelines (`packages/weapp-style-injector`)

## 适用范围

- 本文件适用于 `packages/weapp-style-injector`。
- 该包是 `@weapp-tailwindcss/style-injector-core` 的兼容外壳，继续提供原有 Vite/Webpack 与框架预设入口。

## 目录与职责

- `src/index.ts`：根入口兼容导出。
- `src/vite.ts`、`src/webpack.ts`：Vite/Webpack 入口兼容导出。
- `src/vite/*`、`src/webpack/*`：框架预设入口兼容导出。
- 实际注入、分包解析与 bundler 适配实现位于 `packages/style-injector-core`。

## 变更原则

- 保持现有 `package.json` exports 不变，避免破坏独立包用户导入路径。
- 该包源码只保留公开入口外壳；不要把 core 实现重新复制回来。
- 行为修改应优先在 `packages/style-injector-core` 完成，并通过本包测试验证兼容性。

## 高风险改动提醒

- 修改 `packages/style-injector-core/src/uni-app.ts` 的 `pages.json` 解析或注释剥离逻辑时，需覆盖异常 JSON 场景。
- 修改 `packages/style-injector-core/src/taro.ts` 的 `vm` 解析流程时，需验证 TS/JS/JSON 三种 `app.config` 输入。
- 修改 core 注入逻辑时，需验证 raw `@import` 与路径字符串两类输入。

## 推荐验证命令

- `pnpm --filter weapp-style-injector test`
- `pnpm --filter weapp-style-injector build`
- `pnpm --filter @weapp-tailwindcss/style-injector-core build`
- 定向回归：
  - `pnpm --filter weapp-style-injector vitest run test/index.test.ts`

## 提交前检查

- 确认 `src/index.ts` 导出面与 `package.json` `exports` 对齐。
- 若新增预设选项，同步补充类型导出与至少一条 fixture 回归用例。
