---
"weapp-tailwindcss": patch
---

优化 Generic Vite Web 生产构建：当 Tailwind CSS 已在 Vite transform 阶段生成时，跳过面向小程序增量处理的完整 bundle snapshot，避免读取和散列无关的大型 JS chunk。小程序、uni-app、uni-app x、Taro、weapp-vite、watch 与 HMR 构建继续使用原有流水线。
