# Package Guidelines (`packages/logger`)

## 适用范围

- 本文件适用于 `packages/logger`。
- 该包是跨仓库共享日志入口，追求稳定、轻量、零惊喜。

## 核心职责

- `src/index.ts` 仅负责导出统一 `logger`（`consola`）与颜色工具 `pc`（`picocolors`）。
- 不在本包内承载业务日志策略或复杂格式化逻辑。

## 变更原则

- 导出面保持稳定，避免随意改名或替换导出对象形态。
- 变更日志默认级别、样式、输出策略前，先评估对依赖包调试体验的影响。
- 避免引入额外运行时依赖，保持该包“最小依赖、最小体积”特性。

## 测试要求

- 若修改导出或 logger 实例创建方式，补充最小行为测试（导出可用性、类型可用性）。
- 该包测试目前较薄；涉及行为变更时请补更具体断言，而不是仅保留占位测试。

## 推荐验证命令

- `pnpm --filter @weapp-tailwindcss/logger test`
- `pnpm --filter @weapp-tailwindcss/logger build`
