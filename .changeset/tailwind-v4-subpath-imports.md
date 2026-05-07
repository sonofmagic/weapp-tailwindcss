---
"weapp-tailwindcss": patch
---

完善 Tailwind CSS v4 生成模式对 `package.json#imports` subpath imports 的支持：`@import "#..."` 会触发默认生成模式，`@config "#..."` 会保留给 Tailwind v4 按官方规则解析，并新增 `@import`、`@reference`、`@plugin`、`@config` 的真实生成回归测试。
