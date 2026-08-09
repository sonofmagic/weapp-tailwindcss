---
"weapp-tailwindcss": patch
---

优化 Generic Vite Web 生产构建的 CSS 收尾流程，复用 transform 阶段已登记的 CSS 产物身份，减少重复遍历和重复兼容处理，并补充分项性能计时。
