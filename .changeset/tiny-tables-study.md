---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

为微信小程序的 Tailwind v4 rpx 主题变量增加每构建会话一次的建议性警告，区分运行时 calc 与静态输出；将相关生成样式转换及变量收集统一到 PostCSS 包，保持 CSS 和类名集合语义不变。
