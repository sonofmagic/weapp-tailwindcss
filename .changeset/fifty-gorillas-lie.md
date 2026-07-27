---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 `uni-app x` 在 `uniAppXCssTarget: 'uvue'` 下误删 `uvue` 组件 `<style scoped>` 作者样式的问题。现在会保留 scoped 组件样式，同时继续清理 `uvue` 不兼容声明和 scoped 请求里的 Tailwind 注入噪音。
