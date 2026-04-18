# @weapp-tailwindcss/merge-v3

## 0.2.0-next.0

### Minor Changes

- ✨ **新增 `/slim` 和 `/lite` 子路径入口，优化小程序场景下 tailwind-merge 的包体积。** [`acc3907`](https://github.com/sonofmagic/weapp-tailwindcss/commit/acc390788e8e70cca66ce3e3c5911e0336b18fc2) by @sonofmagic
  - `/slim`：内置精简版冲突分组配置，覆盖小程序常用的布局、Flexbox、Grid、间距、尺寸、排版、背景、边框、效果、变换等类别，开箱即用，体积约 20-23KB。
  - `/lite`：不包含任何默认配置，仅导出 `createTailwindMerge`、`twJoin`、`mergeConfigs` 等工厂函数，用户自行提供配置，体积最小（<1KB + tailwind-merge 核心算法）。
  - 现有默认入口（`.`）行为完全不变，向后兼容。

## 0.1.6

### Patch Changes

- 🐛 **chore(deps): bump tailwind-merge 2.6.0 -> 2.6.1** [`8643f23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8643f232c6aa2d229bc12d77b39656094a4176d9) by @sonofmagic

## 0.1.6-alpha.0

### Patch Changes

- 🐛 **chore(deps): bump tailwind-merge 2.6.0 -> 2.6.1** [`8643f23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8643f232c6aa2d229bc12d77b39656094a4176d9) by @sonofmagic

## 0.1.5

### Patch Changes

- 🐛 **chore: 升级到 "@weapp-core/escape": "~7.0.0"** [`4bbda03`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bbda03bc7f924bc7ef75291d27316309c827c58) by @sonofmagic
- 📦 **Dependencies** [`4bbda03`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bbda03bc7f924bc7ef75291d27316309c827c58)
  → `@weapp-tailwindcss/runtime@0.1.5`

## 0.1.4

### Patch Changes

- 📦 **Dependencies** [`ff1a74b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ff1a74b0e70de0ef723e1164b75af6e452f9cb02)
  → `@weapp-tailwindcss/runtime@0.1.4`

## 0.1.3

### Patch Changes

- Updated dependencies [[`3ed3aa8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3ed3aa817a68dae544baf434316399cc78c15b99), [`43f062b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/43f062b3d65a2c0b4c4b127d33d3a9cbd1180e9a)]:
  - @weapp-tailwindcss/runtime@0.1.3

## 0.1.2

### Patch Changes

- [`db0d5b9`](https://github.com/sonofmagic/weapp-tailwindcss/commit/db0d5b9ae3dc1af7cb293142b8da0cf5d6b2b657) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 提取并统一 rpx 任意值的长度处理逻辑，修复 `text|border|bg|outline|ring-[…rpx]` 被当作颜色合并的问题，并补充对应的运行时与快照单测。

- Updated dependencies [[`db0d5b9`](https://github.com/sonofmagic/weapp-tailwindcss/commit/db0d5b9ae3dc1af7cb293142b8da0cf5d6b2b657)]:
  - @weapp-tailwindcss/runtime@0.1.2

## 0.1.1

### Patch Changes

- [`7c7b732`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7c7b732c511f47a089e73ecfd7ace091532e170f) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: update package.json meta exports

- Updated dependencies [[`7c7b732`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7c7b732c511f47a089e73ecfd7ace091532e170f)]:
  - @weapp-tailwindcss/runtime@0.1.1

## 0.1.0

### Minor Changes

- [`50e85e3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/50e85e3b8b4f31d07d20a7d258ab9e2212c4ac31) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构 `@weapp-tailwindcss/merge` 体系：把核心运行时代码提取到 `@weapp-tailwindcss/runtime`，并将 cva、variants、v3 runtime 拆分成独立包，同时将 `weappTwIgnore`/`clsx` 等公共能力统一由 runtime 对外导出，避免子包之间重复依赖。

### Patch Changes

- Updated dependencies [[`50e85e3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/50e85e3b8b4f31d07d20a7d258ab9e2212c4ac31)]:
  - @weapp-tailwindcss/runtime@0.1.0
