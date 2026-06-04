---
"weapp-tailwindcss": major
---

移除 `tailwindcssPatcherOptions` 中早期的 `patch`、`tailwind`、`features`、`output` 兼容配置形态，仅保留 `tailwindcss-patch` 当前的 `TailwindCssPatchOptions` 配置结构。

同时删除未接入主转译链路的实验性 SWC/OXC JS handler 入口，避免继续维护无消费方的 POC 代码。
