---
"weapp-tailwindcss": patch
---

修复 Tailwind v4 generator 模式下用户样式被统一追加到生成 CSS 末尾的问题，保留 Vite/uni-app 合并后的原始 CSS source order。
