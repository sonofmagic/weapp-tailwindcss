---
"@weapp-tailwindcss/init": major
"@weapp-tailwindcss/logger": major
"@weapp-tailwindcss/mangle": major
"@weapp-tailwindcss/merge": major
"@weapp-tailwindcss/postcss": major
"@weapp-tailwindcss/shared": major
"weapp-tailwindcss": major
---



## Feature

增加 `@weapp-tailwindcss/merge` 支持，这是 `weapp-tailwindcss` 版本的 `tailwindcss-merge` 和 `cva` 方法

## Breaking Changes

1. 去除 `weapp-tailwindcss/postcss` (可直接安装使用 `@weapp-tailwindcss/postcss`)
2. 增加 `weapp-tailwindcss/escape` 来取代 `weapp-tailwindcss/replace`
3. 项目 monorepo 区分包