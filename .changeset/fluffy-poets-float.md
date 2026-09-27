---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复微信 Tailwind CSS 4 固定 rpx 主题在默认配置下的 calc 尺寸偏差：新增自动模式，按完整产物作用域预计算并保留覆盖与缓存边界；动态主题可通过 cssOptions.cssCalc: false 退出。
