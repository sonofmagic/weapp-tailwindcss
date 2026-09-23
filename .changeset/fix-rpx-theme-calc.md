---
'@weapp-tailwindcss/postcss': patch
weapp-tailwindcss: patch
---

修复 Tailwind CSS v4 小程序延后构建中配置的 CSS 变量未参与 `cssCalc` 静态计算的问题。固定且可解析的 `rpx` 主题尺寸会根据完整变量上下文折叠为最终 `rpx` 值；Vite 构建在最终 CSS 产物阶段确定共同作用域，完成静态计算后再转换单位。
