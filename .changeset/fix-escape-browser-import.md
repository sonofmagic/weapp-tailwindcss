---
weapp-tailwindcss: patch
---

修复 `weapp-tailwindcss/escape` 在浏览器（含 Vite）环境中因 Node 专属 shims 注入 `fileURLToPath` 导致的构建报错，确保 weappTwIgnore 等运行时 API 可直接在前端打包器里使用；同时补充导出 `unescape`，方便运行时手动还原被 escape 过的类名。
