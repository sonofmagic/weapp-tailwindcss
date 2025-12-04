# tailwind-variant-v3

## 0.1.0

### Minor Changes

- [`940982a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/940982a80d88e850f82cb42d174bb5893e0f3938) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 拆分 `tv` 运行时为多个模块，重写变体求值与 slot 缓存流程，补齐 Vitest/Vitest bench 场景的类型声明，并新增基准测试记录，方便后续重构对比性能。

### Patch Changes

- [`b82b7a3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b82b7a3ff6da80921cf157aaca41f02b62ddc856) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 将 tailwind-variant-v3 运行时和测试全面迁移到 TypeScript，补齐声明与工具类型，修复 Vitest 匹配器与 createTV 配置的类型兼容问题，确保 tsc/lint/test 全部通过。
