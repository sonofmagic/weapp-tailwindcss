---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

在 Webpack 将 Tailwind CSS v4 交给下游 PostCSS 前归一化无限圆角，避免旧版 postcss-calc 词法警告，并保留正常单位转换与 Web 输出。Refs #1166。
