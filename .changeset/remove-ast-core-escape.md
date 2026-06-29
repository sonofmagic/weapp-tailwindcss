---
"weapp-tailwindcss": patch
---

移除 `@ast-core/escape` 直接依赖，改为在 `weapp-tailwindcss` 内部维护 JS 字符串字面量转义逻辑，减少发布包运行时依赖与 webpack 缓存依赖解析噪声。
