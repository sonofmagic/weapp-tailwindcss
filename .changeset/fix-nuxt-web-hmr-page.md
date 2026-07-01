---
"weapp-tailwindcss": patch
---

修复 Nuxt Web Vite demo 中页面入口没有实际渲染 `app/pages/index.vue`，导致开发态修改页面上的 Tailwind 类名（如 `bg-white` 改为 `bg-[red]`）看不到效果的问题；同时在 Web source HMR 时刷新 Tailwind source candidates，收窄 Nuxt 页面宏 full reload 判断，避免普通 Web source HMR 被误判为需要整页刷新，并补充 `demo/web` 真实浏览器 HMR 回归覆盖。
