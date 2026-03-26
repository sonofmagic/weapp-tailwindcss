---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复 `uni-app x / uvue` 下 `@tailwind base` 的默认兼容行为，并同步稳定相关测试：

- 将 `uni-app x` 的 base 兼容后处理收敛到 `@weapp-tailwindcss/postcss`，不再由 `weapp-tailwindcss` 额外持有私有样式后处理
- 在 `uni-app x` 模式下移除对 `view`、`text`、`*`、`::before`、`::after`、`:before`、`:after`、`::backdrop` 等全局 carrier selector 的依赖
- 将 utility 运行所需的 `--tw-*` 默认变量按需下沉到具体 class selector，保证保留 `@tailwind base` 时仍可正常编译和运行
- 更新 `uni-app x`、bundler、tailwindcss 全量大用例的回归断言与超时设置，避免在完整测试中因旧预期或默认超时导致误报失败
