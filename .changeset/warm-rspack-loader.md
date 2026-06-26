---
"weapp-tailwindcss": patch
---

新增 `weapp-tailwindcss/rspack` 导出入口，提供 Rspack 配置修补能力，用于在 Rsbuild/Rspack 中注入 Tailwind v4 CSS 生成 loader，并默认保留 Lightning CSS loader。
