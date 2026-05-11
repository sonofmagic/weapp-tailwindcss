---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/test-helper": patch
---

修复全新安装后 Tailwind CSS v3 未自动准备运行时补丁导致的 `rpx` 任意值误判、生成模式 classSet 为空，以及 Vite/JS 任意值类名未转译问题。
