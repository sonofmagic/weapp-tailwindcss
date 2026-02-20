# Package Guidelines (`packages-runtime/variants-v3`)

## 适用范围

- 本文件适用于 `packages-runtime/variants-v3`。
- 该包是基于 `tailwind-variant-v3` + `merge-v3` 的小程序增强封装。

## 核心职责

- `src/index.ts`：包装 `tv/createTV/cn/cnBase`，在 v3 生态下增加 escape 与 merge 集成。
- 通过 `disableTailwindMerge` 关闭上游内部 merge，再由本包统一接管 merge 与 escape 输出。

## 变更原则

- 保持与 `tailwind-variant-v3` API 兼容，不引入破坏性参数差异。
- `cn` 仍应返回延迟执行函数，保持与 variants 系列包一致的调用模型。
- 修改 `mergeConfigs`/`disableTailwindMerge` 时，需验证配置合并顺序与覆盖优先级。
- 任何 merge 行为变化都要关注 `merge-v3` 版本兼容与 adapter 交互。

## 测试要求

- 修改 `src/index.ts` 时，至少覆盖：
  - 默认 escape/merge 行为；
  - 关闭 merge 分支；
  - `tv` 与 `cn` 的一致性。

## 推荐验证命令

- `pnpm --filter @weapp-tailwindcss/variants-v3 test`
- `pnpm --filter @weapp-tailwindcss/variants-v3 tsd`
- 定向回归：
  - `pnpm --filter @weapp-tailwindcss/variants-v3 vitest run test/variants.test.ts`
