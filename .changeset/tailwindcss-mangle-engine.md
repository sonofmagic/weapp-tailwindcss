---
"weapp-tailwindcss": patch
---

将 `weapp-tailwindcss` 内部的 Tailwind 运行时接入切换为 `@tailwindcss-mangle/engine`，不再依赖 `tailwindcss-patch` 修改 Tailwind 包本身；同时补齐 Tailwind CSS v3/v4 的源码候选扫描、Vite/Webpack 运行时类集合刷新与相关回归覆盖。
