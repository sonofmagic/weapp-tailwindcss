---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 包解析路径：当项目传入自定义 `tailwindcss.resolve.paths` 时，保留这些路径并追加默认查找路径，同时默认路径会包含 pnpm workspace 根目录的 `node_modules`，避免模板项目无法解析根依赖中的 `@tailwindcss/postcss`。
