---
'@weapp-tailwindcss/postcss': patch
'weapp-tailwindcss': patch
---

修复 taro weapp 场景下 `app-origin.wxss` 仍可能残留 `:not(#n)` 占位选择器的问题，并补充 `#834` 的回归测试，确保最终输出不再包含 `@layer`、`:not(#\\#)` 与 `:not(#n)`。
