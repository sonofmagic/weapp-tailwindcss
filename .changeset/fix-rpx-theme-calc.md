---
'@weapp-tailwindcss/postcss': patch
weapp-tailwindcss: patch
---

修复 Tailwind CSS v4 小程序延后构建中配置的 CSS 变量未参与 `cssCalc` 静态计算的问题，固定的 `rpx` 主题尺寸会在作用域改写前折叠为最终 `rpx` 值。
