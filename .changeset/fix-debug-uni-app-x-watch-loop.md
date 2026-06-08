---
"@weapp-tailwindcss/debug-uni-app-x": patch
---

修复调试产物目录被 Vite dev server 监听后反复触发热更新的问题，避免 uni-app x H5 调试时出现页面空白或 HMR 循环。
