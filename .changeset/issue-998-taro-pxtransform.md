---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 后置生成样式绕过框架 PostCSS 管线的问题，确保 Vite、Webpack 等构建链能复用完整插件配置处理 CSS 变量与生成规则。
