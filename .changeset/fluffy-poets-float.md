---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

修复微信 Tailwind CSS 4 固定 rpx 主题在默认配置下的 calc 尺寸偏差：新增自动模式，按完整产物作用域预计算并保留覆盖与缓存边界；动态主题可通过 cssOptions.cssCalc: false 退出。

修复 uni-app 小程序 watch 删除或清空整个 SFC 样式块后旧样式产物残留的问题：通过 CSS 输出插件已提交的资产归属补齐空资产写入，保留构建失败、多输出与其他生产者的边界。
