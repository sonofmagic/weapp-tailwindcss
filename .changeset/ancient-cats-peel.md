---
"@weapp-tailwindcss/engine": patch
"@weapp-tailwindcss/postcss": patch
"@weapp-tailwindcss/cli": patch
"weapp-tailwindcss": patch
---

迁入仅支持 Tailwind CSS 4 的 @weapp-tailwindcss/engine，保留候选提取、扫描和生成会话能力，替换主包、PostCSS 与 CLI 的旧 engine 依赖，并明确生成与平台兼容转换的边界。
