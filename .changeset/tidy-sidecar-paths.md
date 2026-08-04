---
"weapp-tailwindcss": patch
---

修复 Tailwind v4 通用生成器仍可能把带 query 或 hash 的 bundler module id 当作物理文件路径读取的问题，确保 weapp-vite sidecar 等虚拟样式请求在进入文件系统解析前统一还原为源码路径。
