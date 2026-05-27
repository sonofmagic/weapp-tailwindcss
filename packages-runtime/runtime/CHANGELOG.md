# @weapp-tailwindcss/runtime

## 0.1.6-next.0

### Patch Changes

- 🐛 **升级 ESM 化依赖后，将公开包的 Node.js 安装版本约束统一到 `^20.19.0 || >=22.12.0`，避免不支持稳定 ESM/CJS 混合加载的 Node.js 版本安装使用。** [`01a0cb2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/01a0cb2f40b59e7989622f22635d0df832b439a1) by @sonofmagic

## 0.1.5

### Patch Changes

- 🐛 **chore: 升级到 "@weapp-core/escape": "~7.0.0"** [`4bbda03`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bbda03bc7f924bc7ef75291d27316309c827c58) by @sonofmagic

## 0.1.4

### Patch Changes

- 🐛 **允许 `escape`/`unescape` 传入 `true`/`false` 布尔值，并保持默认转换行为一致。** [`ff1a74b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ff1a74b0e70de0ef723e1164b75af6e452f9cb02) by @sonofmagic

## 0.1.3

### Patch Changes

- [`3ed3aa8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3ed3aa817a68dae544baf434316399cc78c15b99) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: upgrade "@weapp-core/escape": "~6.0.1"

- [`43f062b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/43f062b3d65a2c0b4c4b127d33d3a9cbd1180e9a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复缓存淘汰逻辑的类型问题，减少 escape/unescape 的多余处理，带来更平滑的性能提升。

## 0.1.2

### Patch Changes

- [`db0d5b9`](https://github.com/sonofmagic/weapp-tailwindcss/commit/db0d5b9ae3dc1af7cb293142b8da0cf5d6b2b657) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 提取并统一 rpx 任意值的长度处理逻辑，修复 `text|border|bg|outline|ring-[…rpx]` 被当作颜色合并的问题，并补充对应的运行时与快照单测。

## 0.1.1

### Patch Changes

- [`7c7b732`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7c7b732c511f47a089e73ecfd7ace091532e170f) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: update package.json meta exports

## 0.1.0

### Minor Changes

- [`50e85e3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/50e85e3b8b4f31d07d20a7d258ab9e2212c4ac31) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构 `@weapp-tailwindcss/merge` 体系：把核心运行时代码提取到 `@weapp-tailwindcss/runtime`，并将 cva、variants、v3 runtime 拆分成独立包，同时将 `weappTwIgnore`/`clsx` 等公共能力统一由 runtime 对外导出，避免子包之间重复依赖。
