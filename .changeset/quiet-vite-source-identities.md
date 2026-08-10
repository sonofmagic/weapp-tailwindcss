---
"weapp-tailwindcss": patch
---

修复 Vite transform 与 HMR 未复用 Tailwind Scanner 实际文件范围的问题，避免被 `.gitignore` 排除的模块重新进入 source candidates。
