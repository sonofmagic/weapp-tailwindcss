---
"weapp-tailwindcss": patch
---

修正 Vite 入口在 Tailwind CSS v3 项目中的默认生成模式行为：`auto` 不再接管或移除旧的 Tailwind PostCSS 链路，只有显式使用 `force` 时才尝试直出生成。
