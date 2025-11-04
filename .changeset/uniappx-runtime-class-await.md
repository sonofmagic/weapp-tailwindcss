---
"weapp-tailwindcss": patch
---

确保 uni-app x 在 Vite 流程中等待运行时类名集合准备完成，修复频繁修改 `text-[#e73909]` 等类名时偶发的转译缺失问题。

允许在 uni-app x / HBuilderX 预设外层直接配置 `customAttributes`，无需再通过 `rawOptions` 透传。
