---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 入口中包含块状 `@plugin` 等生成指令时，小程序 CSS 生成阶段可能把原始指令片段透传到 wxss 转译链路并触发 `Unclosed block` 的问题。
