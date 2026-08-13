---
"weapp-tailwindcss": patch
---

修复 uni-app x 组件局部样式中的 Tailwind v4 后缀重要修饰符导致 Android、iOS App 的 SCSS 编译失败，并确保局部样式内的相对 `@reference` 按原始 `.uvue` 模块位置解析。
