---
'@weapp-tailwindcss/postcss': patch
weapp-tailwindcss: patch
---

修复 uni-app x 使用 Tailwind CSS v4 时作者 CSS 主题变量的 fallback 被错误静态化的问题，让仅使用 `@apply` 的样式入口在唯一 Tailwind 配置可确定时继承该配置，并移除 uvue 产物中无法静态求值的 `calc()` 声明。
