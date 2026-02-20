# Package Guidelines (`packages/postcss`)

## 适用范围

- 本文件适用于 `packages/postcss`。
- 本包聚焦 CSS AST 级处理，不承担 JS/模板层的启发式纠错职责。

## 包内结构约定

- `src/plugins/`：插件实现与 pipeline 组装。
- `src/compat/`：版本兼容与降级逻辑。
- `src/selectorParser/`：选择器解析相关能力。
- `src/utils/`：纯工具函数，保持无副作用、可单测。

## 变更原则

- 优先基于 PostCSS AST 做变换，避免对原始字符串做全局替换。
- 调整插件顺序时，必须在测试中覆盖“顺序相关回归”（例如 pre/post 阶段行为）。
- 与平台相关（`uni-app`、`uni-app-x`、`mp`）的行为修改，必须补对应平台用例。
- 若修改默认配置或兼容策略，需同步更新快照与说明，避免隐式行为漂移。

## 推荐验证命令

- `pnpm --filter @weapp-tailwindcss/postcss test`
- `pnpm --filter @weapp-tailwindcss/postcss vitest run -u`（仅在确认预期变更时）
- 针对单模块：`pnpm --filter @weapp-tailwindcss/postcss vitest run test/<case>.test.ts`

## 测试补充要求

- 新增 bug fix 时，优先添加最小输入/输出断言，不仅依赖 snapshot。
- 涉及性能路径（如 calc、selector parser）时，至少补一个边界 case，防止复杂选择器退化。
