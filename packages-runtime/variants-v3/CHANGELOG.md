# @weapp-tailwindcss/variants-v3

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
