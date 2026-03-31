---
'weapp-tailwindcss': patch
---

修复 `weapp-vite dev` 启动时 `weapp-tailwindcss` 运行时 Tailwind CSS 日志重复输出的问题。

现在同一进程内针对相同 Tailwind CSS 目标与版本的运行时日志会自动去重，仅输出一次，同时保留 CLI 场景的目标路径日志不变。
