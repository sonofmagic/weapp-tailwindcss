# Package Guidelines (`packages/experimental`)

## 适用范围

- 本文件适用于 `packages/experimental`。
- 该包用于实验性实现与对比验证（如 `esbuild`、`lightningcss`），不承诺稳定 API。

## 核心职责

- `src/index.ts`：实验入口与最小验证逻辑。
- `test/*.test.ts`：对比不同实现/工具链输出，依赖 fixture 与 snapshot。

## 变更原则

- 实验代码与生产代码边界必须清晰，禁止将未验证实验逻辑直接外溢到稳定包。
- 变更实验目标（例如 target 浏览器版本）时，需在提交说明中标注实验假设与预期影响。
- 快照变更应可解释：工具升级、参数调整或语义修复，不接受无原因批量刷新。

## 测试要求

- 修改实验逻辑时，至少运行对应对比测试并确认快照差异可解释。
- 新增实验项时，需提供最小 fixture，避免只靠内联样例导致回归难追踪。

## 推荐验证命令

- `pnpm --filter @weapp-tailwindcss/experimental test`
- `pnpm --filter @weapp-tailwindcss/experimental build`
