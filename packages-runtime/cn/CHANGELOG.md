# @weapp-tailwindcss/cn

## 0.1.1

### Patch Changes

- 新增基于 npm `cn` 引擎的面向小程序类名组合工具，兼容条件类名、Tailwind 冲突合并与 `rpx` 任意值，作为 `@weapp-tailwindcss/merge` 的后续替代入口。

- 导出 `wrapRuntimeAggregator`，让 `@weapp-tailwindcss/cn` 复用有界 LRU 与按需 unescape/escape，并接入与 merge 相同的 rpx 长度归一化，使 `text-red` 与 `text-[80rpx]` 等颜色 + 长度类可以共存。

- Updated dependencies:
  - @weapp-tailwindcss/runtime@0.1.9
