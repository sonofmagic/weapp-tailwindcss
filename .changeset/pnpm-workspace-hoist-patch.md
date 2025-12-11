---
"weapp-tailwindcss": patch
---

优化 `weapp-tw patch` 默认 cwd 选择逻辑，workspace 下优先定位到实际安装 tailwindcss 的包或根目录，避免 pnpm hoist 时 postinstall 误选路径导致补丁遗漏。
