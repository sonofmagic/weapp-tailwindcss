# tailwind-variant-v3

## 0.1.4

### Patch Changes

- 🐛 **chore: 升级到 "@weapp-core/escape": "~7.0.0"** [`4bbda03`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bbda03bc7f924bc7ef75291d27316309c827c58) by @sonofmagic

## 0.1.3

### Patch Changes

- 🐛 **修复类型声明与 VariantProps 导出，并为相关运行时包补充 tsd 类型测试。** [`edb9d7a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/edb9d7ae31d5e0ea36647e9738639a830e54679f) by @sonofmagic

## 0.1.2

### Patch Changes

- 🐛 **Fix twMerge adapter resolution for browser-safe builds and keep default merge behavior when overriding config.** [`8cec196`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8cec196a1c65ec66d1108ce818f54c87674aa1a3) by @sonofmagic

## 0.1.1

### Patch Changes

- [`04c2529`](https://github.com/sonofmagic/weapp-tailwindcss/commit/04c2529d4e80325c808967adc40b3a030d01fbc7) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 将 `tailwind-merge` 降为可选 peer，仅默认探测 2.x；可通过 `twMergeAdapter` 显式注入替换实现。

## 0.1.0

### Minor Changes

- [`940982a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/940982a80d88e850f82cb42d174bb5893e0f3938) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 拆分 `tv` 运行时为多个模块，重写变体求值与 slot 缓存流程，补齐 Vitest/Vitest bench 场景的类型声明，并新增基准测试记录，方便后续重构对比性能。

### Patch Changes

- [`b82b7a3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b82b7a3ff6da80921cf157aaca41f02b62ddc856) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 将 tailwind-variant-v3 运行时和测试全面迁移到 TypeScript，补齐声明与工具类型，修复 Vitest 匹配器与 createTV 配置的类型兼容问题，确保 tsc/lint/test 全部通过。
