---
"@weapp-tailwindcss/init": patch
---

调整初始化生成的 PostCSS 配置：生成模式下不再注册 `tailwindcss` PostCSS 插件，只保留 `autoprefixer` 等后处理插件。
