# @weapp-tailwindcss/variants-v3

## 0.0.7

### Patch Changes

- 🐛 **chore: 升级到 "@weapp-core/escape": "~7.0.0"** [`4bbda03`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bbda03bc7f924bc7ef75291d27316309c827c58) by @sonofmagic
- 📦 **Dependencies** [`4bbda03`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bbda03bc7f924bc7ef75291d27316309c827c58)
  → `tailwind-variant-v3@0.1.4`, `@weapp-tailwindcss/merge-v3@0.1.5`, `@weapp-tailwindcss/runtime@0.1.5`

## 0.0.6

### Patch Changes

- 🐛 **修复类型声明与 VariantProps 导出，并为相关运行时包补充 tsd 类型测试。** [`edb9d7a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/edb9d7ae31d5e0ea36647e9738639a830e54679f) by @sonofmagic
- 📦 **Dependencies** [`edb9d7a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/edb9d7ae31d5e0ea36647e9738639a830e54679f)
  → `tailwind-variant-v3@0.1.3`

## 0.0.5

### Patch Changes

- 📦 **Dependencies** [`ff1a74b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ff1a74b0e70de0ef723e1164b75af6e452f9cb02)
  → `@weapp-tailwindcss/runtime@0.1.4`, `@weapp-tailwindcss/merge-v3@0.1.4`

## 0.0.4

### Patch Changes

- 🐛 **修复运行时配置合并的类型问题，避免 `twMergeConfig` 被推断为 `undefined`，并兼容严格的属性访问规则。** [`4d8fc39`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4d8fc39cdff6f2b6057a93d1f75897d8032e6098) by @sonofmagic

## 0.0.3

### Patch Changes

- 📦 **Dependencies** [`8cec196`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8cec196a1c65ec66d1108ce818f54c87674aa1a3)
  → `tailwind-variant-v3@0.1.2`

## 0.0.2

### Patch Changes

- [`43f062b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/43f062b3d65a2c0b4c4b127d33d3a9cbd1180e9a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复缓存淘汰逻辑的类型问题，减少 escape/unescape 的多余处理，带来更平滑的性能提升。

- Updated dependencies [[`3ed3aa8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3ed3aa817a68dae544baf434316399cc78c15b99), [`43f062b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/43f062b3d65a2c0b4c4b127d33d3a9cbd1180e9a)]:
  - @weapp-tailwindcss/runtime@0.1.3
  - @weapp-tailwindcss/merge-v3@0.1.3

## 0.0.1

### Patch Changes

- [`b15fb90`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b15fb9089928d9df172164b5a36f323b3f2cd9ab) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 基于 `@weapp-tailwindcss/merge-v3` 与 `tailwind-variant-v3` 组合出小程序友好的 variants 运行时，提供 escape/unescape、合并配置与工厂方法。

- Updated dependencies [[`04c2529`](https://github.com/sonofmagic/weapp-tailwindcss/commit/04c2529d4e80325c808967adc40b3a030d01fbc7)]:
  - tailwind-variant-v3@0.1.1
