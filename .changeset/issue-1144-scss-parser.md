---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

修复 uni-app x important utility 预处理误用 CSS parser 的问题：使用真正的 SCSS 解析和序列化 API，避免样式中的行内注释使转换静默失效，导致 Web 连续热更新出现 Sass 语法错误。补充真实属性透传、连续保存、样式块增删与刷新回归。Refs #1144。
