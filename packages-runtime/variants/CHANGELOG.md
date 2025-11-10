# @weapp-tailwindcss/variants

## 0.1.1

### Patch Changes

- [`7c7b732`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7c7b732c511f47a089e73ecfd7ace091532e170f) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: update package.json meta exports

- Updated dependencies [[`0a0c780`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0a0c7803d0ec9e1c67f555d12c074a6d3f33b1ac), [`7c7b732`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7c7b732c511f47a089e73ecfd7ace091532e170f), [`e6c9192`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e6c9192cad6925cf4b42c029b9846d2f842351b0)]:
  - @weapp-tailwindcss/merge@2.1.1
  - @weapp-tailwindcss/runtime@0.1.1

## 0.1.0

### Minor Changes

- [`50e85e3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/50e85e3b8b4f31d07d20a7d258ab9e2212c4ac31) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构 `@weapp-tailwindcss/merge` 体系：把核心运行时代码提取到 `@weapp-tailwindcss/runtime`，并将 cva、variants、v3 runtime 拆分成独立包，同时将 `weappTwIgnore`/`clsx` 等公共能力统一由 runtime 对外导出，避免子包之间重复依赖。

### Patch Changes

- Updated dependencies [[`50e85e3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/50e85e3b8b4f31d07d20a7d258ab9e2212c4ac31)]:
  - @weapp-tailwindcss/runtime@0.1.0
  - @weapp-tailwindcss/merge@2.1.0
