---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

将 CSS 运行时签名归属 PostCSS，保留字符串空格、注释样文本及选择器关系，避免主题变量等有效修改被误判为排版变化而漏掉 HMR 缓存失效。
