---
"@weapp-tailwindcss/postcss": patch
---

修复 `:where(...)` 内嵌 `:is(...)` 或多分支 `:where(...)` 时小程序产物仍可能保留复杂伪类的问题，补充 Tailwind v4 preflight、space/divide、group/peer、child 与主题 class 选择器的单测和微信开发者工具 IDE 视觉回归。
