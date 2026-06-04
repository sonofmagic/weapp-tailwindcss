---
"weapp-tailwindcss": patch
---

修复 `weapp-tailwindcss/vite` 插件返回类型绑定单一 Vite 版本导致的类型不兼容问题，兼容 demo 或下游项目使用不同 Vite 版本的 `defineConfig` 场景。
