---
"@weapp-tailwindcss/postcss": patch
---

将 Tailwind 候选提取与源码扫描依赖从 `tailwindcss-patch` 收敛到 `@tailwindcss-mangle/engine`，减少 PostCSS 包的额外 patch/CLI 依赖。
