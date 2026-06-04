---
"weapp-tailwindcss": minor
---

增强 v5 生成器的 Tailwind CSS v4 source 发现能力：PostCSS 插件默认按 CSS 入口目录扫描源码并支持 `@source not` 排除，Vite 生成器路径透传 `tailwindcss.v4.sources` 配置。

升级 `tailwindcss-patch` 到 `9.2.0`，Tailwind CSS v4 生成器默认扫描编译后的 `@source` 条目，确保 `classSet` 能收集配置文件命中的候选类名。
