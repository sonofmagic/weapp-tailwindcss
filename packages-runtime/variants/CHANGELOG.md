# @weapp-tailwindcss/variants

## 0.1.7

### Patch Changes

- 🐛 **chore: 升级到 "@weapp-core/escape": "~7.0.0"** [`4bbda03`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bbda03bc7f924bc7ef75291d27316309c827c58) by @sonofmagic
- 📦 **Dependencies** [`4bbda03`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bbda03bc7f924bc7ef75291d27316309c827c58)
  → `@weapp-tailwindcss/runtime@0.1.5`, `@weapp-tailwindcss/merge@2.1.5`

## 0.1.6

### Patch Changes

- 🐛 **修复类型声明与 VariantProps 导出，并为相关运行时包补充 tsd 类型测试。** [`edb9d7a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/edb9d7ae31d5e0ea36647e9738639a830e54679f) by @sonofmagic

## 0.1.5

### Patch Changes

- 📦 **Dependencies** [`ff1a74b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ff1a74b0e70de0ef723e1164b75af6e452f9cb02)
  → `@weapp-tailwindcss/runtime@0.1.4`, `@weapp-tailwindcss/merge@2.1.4`

## 0.1.4

### Patch Changes

- [`43f062b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/43f062b3d65a2c0b4c4b127d33d3a9cbd1180e9a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复缓存淘汰逻辑的类型问题，减少 escape/unescape 的多余处理，带来更平滑的性能提升。

- Updated dependencies [[`3ed3aa8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3ed3aa817a68dae544baf434316399cc78c15b99), [`43f062b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/43f062b3d65a2c0b4c4b127d33d3a9cbd1180e9a)]:
  - @weapp-tailwindcss/runtime@0.1.3
  - @weapp-tailwindcss/merge@2.1.3

## 0.1.3

### Patch Changes

- [`c9baaa5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c9baaa595f7f902243f4001c29a94340adb70f1a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 tailwind-variants 升级后内部 chunk 入口失效的问题，改用官方导出的 tv/createTV/cx，并确保 cn/cnBase 继续执行小程序转义与合并逻辑。

## 0.1.2

### Patch Changes

- [`db0d5b9`](https://github.com/sonofmagic/weapp-tailwindcss/commit/db0d5b9ae3dc1af7cb293142b8da0cf5d6b2b657) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 提取并统一 rpx 任意值的长度处理逻辑，修复 `text|border|bg|outline|ring-[…rpx]` 被当作颜色合并的问题，并补充对应的运行时与快照单测。

- Updated dependencies [[`db0d5b9`](https://github.com/sonofmagic/weapp-tailwindcss/commit/db0d5b9ae3dc1af7cb293142b8da0cf5d6b2b657)]:
  - @weapp-tailwindcss/runtime@0.1.2
  - @weapp-tailwindcss/merge@2.1.2

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
