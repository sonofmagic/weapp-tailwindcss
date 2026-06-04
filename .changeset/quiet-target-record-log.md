---
"weapp-tailwindcss": patch
---

精简 `weapp-tw patch` 兼容链路：该命令在 v5 中改为无需执行的兼容提示，移除目标记录、workspace 批量 patch、运行时 `twPatcher.patch()` 初始化调用与手动 patch 状态检查相关逻辑，由构建运行时直接接管 Tailwind CSS 处理。
