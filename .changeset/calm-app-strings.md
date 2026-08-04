---
"weapp-tailwindcss": patch
---

修复 uni-app App 构建中业务字符串被误当作 Tailwind 类名转译的问题，App 端 JavaScript 现在只转译已由生成 CSS 选择器确认的类名。
