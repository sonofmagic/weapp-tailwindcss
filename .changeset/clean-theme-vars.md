---
"weapp-tailwindcss": patch
---

修复 Vite/Tailwind CSS v4 生成链路中误删 `page` 自定义 CSS 变量的问题。用户在 `App.vue` 等全局样式里声明 `--color-*`、`--font-*` 等变量时，不再因为命中 Tailwind v4 theme namespace 而被当作生成变量清理。
