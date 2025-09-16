---
"@weapp-tailwindcss/postcss": minor
"tailwindcss-injector": patch
"@weapp-tailwindcss/debug-uni-app-x": patch
"@weapp-tailwindcss/init": patch
---

<br/>

## Features

feat(postcss): 添加 `postcss-value-parser` 作为依赖，添加新的 `postcss` 插件 `postcss-remove-include-custom-properties`

feat(weapp-tailwindcss): 计算模式增强，允许只限定某些特殊的 `custom-properties` 被计算，这样只在遇到不兼容的情况下，才需要开启这个配置

比如 cssCalc: 设置为 `['--spacing']`, 那么就会把 `tailwindcss` 中的 `--spacing` 值进行计算，其他值则不进行计算

## Chore

chore(deps): upgrade