---
"weapp-tailwindcss": patch
---

修复 Vite 构建与热更新中 Tailwind CSS 输出文件关系推断问题。样式输出后缀改为优先来自构建产物图和真实 bundle 文件名，不再依赖微信小程序 `.wxss` 兜底、平台后缀映射表或 `app`/`main`/`app-origin` 这类固定主样式文件名语义；同时补充分包、JS/TS/JSX/Vue 来源与 Taro/uni-app 非微信小程序构建回归。
