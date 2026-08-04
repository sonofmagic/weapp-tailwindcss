---
"weapp-tailwindcss": patch
---

修复 weapp-vite HMR sidecar 虚拟查询被当作物理 CSS 文件路径传入 Tailwind 生成管线后触发 `ENOENT` 的问题。
