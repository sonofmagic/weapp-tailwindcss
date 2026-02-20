# Package Guidelines (`packages-runtime/tailwind-variant-v3`)

## 适用范围

- 本文件适用于 `packages-runtime/tailwind-variant-v3`。
- 该包是 Tailwind v3 生态下的变体运行时实现，依赖 `tailwind-merge` 2.x 兼容适配器。

## 核心职责

- `src/tv.ts`：`tv/createTV` 主实现（variants、slots、compound、responsive、缓存）。
- `src/merge.ts`：`cn/cnBase` 与 merge adapter 加载、merge config 更新、类名拼接。
- `src/index.ts`：对外 API 组装与 runtime 工厂 `create`。

## 变更原则

- 保持 v3 兼容定位，不引入仅适用于 Tailwind v4 的语义变更。
- `twMergeAdapter` 仍是关键扩展点：修改 adapter 解析顺序或默认行为前，需评估兼容风险。
- `tv` 的 metadata（如 `variantKeys`、`slots`、`compoundVariants`）为对外能力，不应随意删除。
- 缓存与 config 合并策略应保持可预测，避免跨用例状态污染。

## 测试要求

- 修改 `tv.ts` 时，至少覆盖：
  - slots 与 variant 组合；
  - compoundVariants/compoundSlots；
  - responsiveVariants 场景。
- 修改 `merge.ts` 时，至少覆盖：
  - `twMerge` 开关；
  - adapter 缺失与 adapter 注入；
  - `twMergeConfig` 更新后的行为变化。

## 推荐验证命令

- `pnpm --filter tailwind-variant-v3 test`
- `pnpm --filter tailwind-variant-v3 tsd`
- `pnpm --filter tailwind-variant-v3 bench`
- 定向回归：
  - `pnpm --filter tailwind-variant-v3 vitest run test/tv.test.ts`
  - `pnpm --filter tailwind-variant-v3 vitest run test/createTV.test.ts`
