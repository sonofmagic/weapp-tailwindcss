---
"weapp-tailwindcss": major
---

移除 Webpack4、PostCSS7、Tailwind CSS v2 兼容链路，不再导出 `weapp-tailwindcss/webpack4`，并删除旧包名 `weapp-tailwindcss-webpack-plugin` 的 CLI 别名。

`pluginName` 现在使用 `weapp-tailwindcss`。如果项目仍依赖 Webpack4、`@tailwindcss/postcss7-compat` 或 Tailwind CSS v2，请继续停留在旧版本。
