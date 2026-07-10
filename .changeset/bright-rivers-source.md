---
"weapp-tailwindcss": patch
---

修复 Vite 与 weapp-vite 项目配置多个 Tailwind CSS v4 `@source` 扫描根时的候选作用域合并问题，确保 monorepo 外部包、`@source not`、`@config` content 排除规则以及主包/分包样式隔离同时生效；同时恢复 Vite dev HMR 的增量 CSS 回放，在保留完整当前候选集的同时继续保留默认不删除的旧 CSS。
