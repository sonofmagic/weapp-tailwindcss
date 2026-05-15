---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/scripts": patch
---

优化 Vite Tailwind v3 watch 热更新路径：uni-app e2e watch 默认读取 dev 输出，避免冷构建样本污染 HMR；非主 CSS 在无 Tailwind 根指令时不再随全局候选集失效，并复用 Tailwind v3 generator engine，降低重复热更新处理耗时。
