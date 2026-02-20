# Package Guidelines (`packages/weapp-style-injector`)

## 适用范围

- 本文件适用于 `packages/weapp-style-injector`。
- 该包同时提供 Vite/Webpack 与 uni-app/taro 预设，属于“多入口 + 构建产物后处理”模块。

## 目录与职责

- `src/core.ts`：注入核心（匹配、去重、`@import` 生成）。
- `src/vite.ts`、`src/webpack.ts`：bundler 适配层。
- `src/uni-app.ts`、`src/taro.ts`：分包样式入口解析与按文件注入规则。
- `src/vite/*`、`src/webpack/*`：框架预设封装（合并 resolver、默认路径探测）。

## 变更原则

- 注入行为必须保持幂等：默认 `dedupe: true` 时，不重复插入等价 `@import`。
- `include/exclude` 匹配只在样式资产层生效，不扩大到 JS/非样式资源。
- 分包入口解析要“显式来源优先”（配置 > 自动探测），避免隐式猜测覆盖用户配置。
- 处理 bundler 钩子时，保持版本兼容：
  - Vite：`generateBundle` 仅处理 `asset`。
  - Webpack：优先 `processAssets`，保留 `<5` 的 `optimizeAssets` 兜底。

## 高风险改动提醒

- 修改 `src/uni-app.ts` 的 `pages.json` 解析或注释剥离逻辑时，需覆盖异常 JSON 场景。
- 修改 `src/taro.ts` 的 `vm` 解析流程时，需验证 TS/JS/JSON 三种 `app.config` 输入。
- 修改 `createImportStatement`/`hasImportStatement` 时，需验证 raw `@import` 与路径字符串两类输入。

## 推荐验证命令

- `pnpm --filter weapp-style-injector test`
- `pnpm --filter weapp-style-injector build`
- 定向回归：
  - `pnpm --filter weapp-style-injector vitest run test/index.test.ts`

## 提交前检查

- 确认 `src/index.ts` 导出面与 `package.json` `exports` 对齐。
- 若新增预设选项，同步补充类型导出与至少一条 fixture 回归用例。
