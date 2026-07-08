---
"weapp-tailwindcss": patch
---

修复 Vite H5 dev 热更新新增 Tailwind 候选时只生成增量候选 CSS，导致已有 Iconify 任意值图标样式在 CSS HMR 后丢失的问题。
