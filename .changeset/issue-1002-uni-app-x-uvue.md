---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 uni-app x 的 UVUE Tailwind CSS v4 兼容处理：内联字号、颜色与间距主题变量，移除不受支持的 `tw-root` 和 `@property` 根载体，将 `rounded-full` 的无限圆角降级为有效数值，并化简 UVUE 无法解析的静态 `calc()` 表达式，使 `text-xs`、`text-sm`、`text-base`、`text-xl`、`text-white`、`rounded-full` 及 scoped `@apply` 在 Android、iOS 和小程序产物中正常生效。同时串行化 Vite watch 增量构建与上一轮编译器资源释放，避免快速重建时报“Compiler owner 正在释放”。
