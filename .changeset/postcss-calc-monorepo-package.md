---
"@weapp-tailwindcss/postcss": patch
"@weapp-tailwindcss/postcss-calc": patch
---

将 `@weapp-tailwindcss/postcss-calc` 从 submodule 迁入 `packages` 作为独立 monorepo 子包，并让 `@weapp-tailwindcss/postcss` 通过 workspace 直接消费，统一安装、测试和发布链路。
