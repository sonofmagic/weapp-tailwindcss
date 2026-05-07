---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v4 生成模式下 `--animate-*` 主题变量对应的 `@keyframes` 在小程序 CSS 裁剪阶段被误删的问题，并补充 `@theme` 命名空间、`inline`、`static`、自定义主题重置和主题变量引用的回归覆盖。
