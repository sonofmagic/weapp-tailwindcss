---
'weapp-tailwindcss': patch
---

将 uni-app-x 的 Vue compiler 依赖改为按需加载并从主运行时打包中外置，减少构建 warning 与普通 Vite 入口体积。
