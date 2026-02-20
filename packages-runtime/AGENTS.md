# Runtime Packages Guidelines (`packages-runtime/*`)

## 适用范围

- 本文件适用于 `packages-runtime/*` 下所有子包。
- 若某个子包存在更近一级 `AGENTS.md`，以更近一级规则为准（例如 `packages-runtime/ui`、`packages-runtime/runtime`）。

## 目录定位

- 该目录包含运行时增强包：`runtime`、`merge`、`merge-v3`、`cva`、`variants`、`variants-v3`、`tailwind-variant-v3`、`typography`、`theme-transition`、`ui`。
- 共性目标：在不破坏上游库语义的前提下，增加小程序 escape/unescape、平台兼容和 DX 封装。

## 通用开发原则

- 优先保持“上游 API 兼容”，避免无必要的参数签名变更。
- 运行时封装默认应最小侵入：先聚焦转换器、包装器、导出层，不把业务逻辑混入基础运行时。
- 涉及缓存逻辑时保持可预测性（有限大小、命中条件明确、无跨实例污染）。
- 新增导出前检查与 `package.json` `exports`、类型声明产物的一致性。

## 测试与验证

- 变更 runtime 核心行为（escape/unescape、merge/cn/tv/cva 包装逻辑）时，必须补回归测试。
- 涉及字符串转换的改动，优先使用输入/输出断言，不仅依赖快照。
- 推荐按包执行：
  - `pnpm --filter @weapp-tailwindcss/runtime test`
  - `pnpm --filter @weapp-tailwindcss/merge test`
  - `pnpm --filter @weapp-tailwindcss/variants test`
  - `pnpm --filter @weapp-tailwindcss/cva test`

## 提交前检查

- 确认导出 API 与 README 示例保持一致。
- 若升级上游依赖（如 `tailwind-merge`、`tailwind-variants`），提交说明中注明兼容策略与验证范围。
