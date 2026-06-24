---
"weapp-tailwindcss": patch
---

修复 Webpack web target 使用 Tailwind CSS v4 cssEntries 重新生成样式时，最终 CSS asset 中的 Docusaurus 主题样式和用户自定义样式被丢弃的问题。
