---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 小程序产物移除 `@property` 后可能丢失 `--tw-border-style` 默认值的问题，避免只有 `border` 工具类时小程序端无法得到和 Web 端一致的默认实线边框；同时按需补齐实际使用到的 v4 运行时默认变量，并合并等价的小程序元素作用域规则，避免输出重复 selector。
