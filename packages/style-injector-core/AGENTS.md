# Package Guidelines (`packages/style-injector-core`)

## 适用范围

- 本文件适用于 `packages/style-injector-core`。
- 该包是 `weapp-style-injector` 与 `weapp-tailwindcss` 内置 styleInjector 的共享实现层。

## 核心职责

- 提供样式入口注入核心、Vite/Webpack 适配层，以及 uni-app、Taro、Mpx 预设。
- 保持与 `weapp-style-injector` 原公开行为一致，由上层包决定是否重新导出。

## 变更原则

- 注入行为必须保持幂等：默认 `dedupe: true` 时，不重复插入等价 `@import`。
- `include/exclude` 匹配只处理样式 asset，不扩大到 JS/模板资源。
- Vite/Webpack 产物修改必须通过 bundler 插件 API 完成，不直接写构建输出目录。
- 新增或修改预设选项时，同步更新消费包类型与回归测试。

## 测试要求

- 行为测试优先放在 `weapp-style-injector` 兼容外壳和 `weapp-tailwindcss` 集成测试中。
- 修改核心匹配、去重、分包解析或 bundler hook 时必须跑相关消费包测试。

## 推荐验证命令

- `pnpm --filter @weapp-tailwindcss/style-injector-core build`
- `pnpm --filter weapp-style-injector test`
- `pnpm --filter weapp-style-injector build`
- `pnpm --filter weapp-tailwindcss exec vitest run test/style-injector.unit.test.ts test/bundlers/style-injector-integration.unit.test.ts test/bundlers/webpack-style-injector-integration.unit.test.ts`

## 提交前检查

- 确认 `package.json` exports 与源码入口、构建产物类型声明一致。
- 确认 `weapp-style-injector` 仍只暴露原有应用侧入口。
