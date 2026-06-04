---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS 包解析路径：当项目传入自定义 `tailwindcss.resolve.paths` 时，保留这些路径并追加默认查找路径，同时默认路径会包含 pnpm workspace 根目录的 `node_modules`。

调整 Tailwind CSS v4 默认入口策略：`weapp-tailwindcss` 默认只依赖并解析 `tailwindcss` 包入口，不再为 v4 自动优先使用 `@tailwindcss/postcss`。
