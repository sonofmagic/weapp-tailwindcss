---
"weapp-style-injector": patch
---

修复 uni-app Vite 预设在 `generateBundle` 中直接写入 bundle 资产的问题，改为通过 `emitFile` 生成分包样式入口，以兼容 Vite 8/Rolldown。
