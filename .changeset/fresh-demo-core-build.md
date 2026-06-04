---
"weapp-tailwindcss": patch
---

修复 monorepo demo 直接启动时可能复用过期 `dist` 的问题：所有依赖 `weapp-tailwindcss` 的 demo 在 `dev`/`build` 前会按需检查核心包构建产物，源码更新后自动刷新本地 `dist`，避免热更新性能优化没有被实际 demo 加载。
