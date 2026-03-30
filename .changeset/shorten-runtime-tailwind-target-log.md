---
'weapp-tailwindcss': patch
---

精简运行时 Tailwind CSS 绑定日志，避免输出冗长的依赖绝对路径。

现在运行时会输出 `Weapp-tailwindcss 使用 Tailwind CSS (vX.Y.Z)`，同时保留 CLI `weapp-tw patch` 场景的详细目标路径日志，便于排查补丁绑定目标。
