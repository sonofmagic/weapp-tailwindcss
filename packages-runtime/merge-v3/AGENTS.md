# Package Guidelines (`packages-runtime/merge-v3`)

## 适用范围

- 本文件适用于 `packages-runtime/merge-v3`。
- 该包是 Tailwind v3 生态的 merge 运行时封装（基于 `tailwind-merge` 2.x）。

## 核心职责

- 对外导出 `twMerge`、`twJoin`、`extendTailwindMerge`、`createTailwindMerge` 与工厂 `create`。
- 复用 `@weapp-tailwindcss/runtime` 的 escape/unescape 与 rpx 长度转换策略。
- 暴露 `tailwindMergeVersion`（当前应为 `2`）用于生态兼容识别。

## 变更原则

- 保持 v3 定位，不引入仅面向 `tailwind-merge` v3 的行为。
- `create` 默认链路（含 rpx transform）属于核心语义，改动需非常谨慎。
- 修改导出面时需评估 `variants-v3` 与外部消费方影响。

## 测试要求

- 修改 runtime 工厂或 transform 行为时，至少覆盖：
  - 基础合并行为；
  - 工厂选项透传；
  - 快照回归。

## 推荐验证命令

- `pnpm --filter @weapp-tailwindcss/merge-v3 test`
- `pnpm --filter @weapp-tailwindcss/merge-v3 tsd`
- 定向回归：
  - `pnpm --filter @weapp-tailwindcss/merge-v3 vitest run test/runtime.test.ts`
  - `pnpm --filter @weapp-tailwindcss/merge-v3 vitest run test/factory-options.test.ts`
