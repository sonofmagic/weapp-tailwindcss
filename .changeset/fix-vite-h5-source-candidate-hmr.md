---
"weapp-tailwindcss": patch
---

修复 Vite H5 开发模式下仅修改 Vue 脚本中的 Tailwind 任意值类名时，样式模块未稳定参与 HMR，导致新颜色类名 CSS 未生成到页面的问题。
