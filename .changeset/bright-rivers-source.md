---
"weapp-tailwindcss": patch
---

修复 Vite 与 weapp-vite 项目配置多个 Tailwind CSS v4 `@source` 扫描根时的候选作用域合并问题，确保 monorepo 外部包、`@source not`、`@config` content 排除规则以及主包/分包样式隔离同时生效。
