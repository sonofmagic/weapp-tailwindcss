---
"weapp-tailwindcss": patch
---

增强多平台热更新回归覆盖，补齐 `uni-app`、`uni-app-vue3-vite`、`mpx` 的 comment-carrier 场景，并新增汇总断言校验 same-class 稳定性、comment-carrier 命中数量与热更新时间指标。

修复 `uni-app-vue3-vite` 在 comment-carrier 场景下 marker 无法进入运行时输出导致 watch-hmr 卡住的问题，同时将关键 HMR 用例接入 `E2E Watch` 工作流，确保 PR 与夜间任务都能持续校验多平台热更新链路。
