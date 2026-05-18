---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v3 生成器在 uni-app Vite 热更新中重复清理 Tailwind require cache 导致 wxss 生成缓存失效、增量编译明显变慢的问题。现在 v3 生成器会复用运行时 patch 初始化结果，并在每次生成前主动重置 Tailwind v3 plugin 上下文，避免旧 class 泄漏。
