---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 uni-app x 的 UVUE Tailwind CSS v4 兼容处理：内联字号、颜色与间距主题变量，移除不受支持的 `tw-root` 和 `@property` 根载体，将 `rounded-full` 的无限圆角降级为有效数值，并化简 UVUE 无法解析的静态 `calc()` 表达式，使 `text-xs`、`text-sm`、`text-base`、`text-xl`、`text-white`、`rounded-full` 及 scoped `@apply` 在 Android、iOS 和小程序产物中正常生效。同时让 Vite watch 编译会话在增量构建之间保持有效，并在 watcher 真正关闭时释放，避免快速重建时报编译器资源已释放。
