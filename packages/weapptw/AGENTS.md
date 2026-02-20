# Package Guidelines (`packages/weapptw`)

## 适用范围

- 本文件适用于 `packages/weapptw`。
- 当前该包为轻量占位包（`private: true`），主要用于包名预留与内部实验。

## 变更原则

- 未明确发布计划前，避免引入会被外部依赖的稳定 API。
- 若将其转为正式包，需先完善 README、测试覆盖与导出契约，再调整 `private`/发布配置。
- 保持实现最小化，避免与 `weapp-tw`、`weapp-tailwindcss` 出现职责重叠且无文档说明。

## 推荐验证命令

- `pnpm --filter weapptw test`
- `pnpm --filter weapptw build`
