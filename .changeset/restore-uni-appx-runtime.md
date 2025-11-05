---
"weapp-tailwindcss": patch
---

修复 uni-app x 在 watch/hmr 场景下强制刷新 runtime class set 时仍沿用旧 Tailwind patcher 的问题，确保热更新能立即拾取新增的任意类名。
