---
"@weapp-tailwindcss/postcss": patch
---

## Fix

fix: 使用 rounded-full 单位时出现 infinity 问题，只在 taro 默认转化 rpx 情况下出现

https://github.com/sonofmagic/weapp-tailwindcss/issues/695

参考链接:

https://github.com/tailwindlabs/tailwindcss/blob/77b3cb5318840925d8a75a11cc90552a93507ddc/packages/tailwindcss/src/utilities.ts#L2128