---
"weapp-tailwindcss": patch
---

修复 Web target 下 Vite Vue SFC 作为 Tailwind source candidate 更新时，插件返回 CSS HMR 模块覆盖 Vue SFC 自身 HMR 结果的问题。
