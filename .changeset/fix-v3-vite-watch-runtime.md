---
"weapp-tailwindcss": patch
---

修复 Tailwind CSS v3 在 Vite watch 热更新中因源码类名变化反复触发完整 runtime extract 导致 HMR 变慢的问题。v3 首轮仍保留完整 runtime 基线，后续 watch 轮次按文件增量更新源码候选类，避免已删除源码类继续污染 CSS，同时保留 safelist 等非源码基线类。
