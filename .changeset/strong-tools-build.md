---
'weapp-tailwindcss': minor
'@weapp-tailwindcss/cli': minor
---

新增独立的 `@weapp-tailwindcss/cli` 包：默认提供与 Tailwind CSS CLI 对齐的 Web 构建、监听、优化、source map 与 `canonicalize` 能力，并支持通过 `--target weapp` 显式生成小程序兼容 CSS。CLI 命令不再由 `weapp-tailwindcss` 核心包发布。

该包此前已经存在 `3.x` 和 `4.0.0-alpha.x` 的旧版原生小程序 Gulp CLI。本次使用 `5.x` 版本线发布新的 Tailwind CSS CLI 兼容实现，避免覆盖旧版本语义或让 npm `latest` 回退到 `0.x`。
