---
'weapp-tailwindcss': patch
---

增强 `weapp-tw patch` 在 pnpm monorepo 下的体验：按子包 hash 隔离缓存记录，检测不一致时自动重打补丁并刷新元数据；支持 `--workspace` 扫描工作区逐包补丁，默认读取 `pnpm-lock.yaml`/workspaces；新增 `--cwd` 优先级、记录中包含补丁版本与路径信息，避免跨包污染与告警。***
