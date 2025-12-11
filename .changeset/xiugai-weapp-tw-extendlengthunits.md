---
'weapp-tailwindcss': patch
---

默认在 CLI 与运行时补丁中启用 extendLengthUnits（含 rpx），让 postinstall 阶段即可补齐长度单位补丁并避免二次补丁日志。
