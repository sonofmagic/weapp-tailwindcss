---
"weapp-tailwindcss": patch
---

CLI 与运行时新增中文提示的 Tailwind CSS 目标日志：`weapp-tw patch` 可通过 `--record-target` 生成 `.tw-patch/tailwindcss-target.json`，运行时若检测到补丁目标与实际加载不一致会给出中文告警，方便定位多包场景下的 patch 对齐问题。
