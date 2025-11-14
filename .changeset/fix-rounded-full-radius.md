---
"@weapp-tailwindcss/postcss": patch
---

fix(postcss): 针对 rounded-full 等圆角类在部分构建链路下被计算成超大值（如 `3.40282e38px`）的问题，统一在后处理阶段将 `border-*-radius` 的不合理巨大像素值（含 `calc(infinity * 1px|rpx)` 与科学计数法）钳制为 `9999px`，以符合小程序规范。该修复覆盖 Tailwind v4 与 taro pxtransform 组合下的异常场景。

https://github.com/sonofmagic/weapp-tailwindcss/issues/698