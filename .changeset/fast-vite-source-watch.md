---
"weapp-tailwindcss": patch
---

优化 Vite、webpack、gulp 开发构建下的热更新路径：复用已有候选集合与 runtime class set，仅在 source 配置或运行时相关内容变化时重新扫描。
