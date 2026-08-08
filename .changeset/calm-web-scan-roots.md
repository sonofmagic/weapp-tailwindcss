---
"weapp-tailwindcss": patch
---

修复 Vite Web generator 在 monorepo 中通过 transform 和 HMR 扫描第三方依赖的问题，并保留显式 source 引入外部依赖的能力。
