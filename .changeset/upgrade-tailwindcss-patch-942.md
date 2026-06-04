---
"weapp-tailwindcss": patch
---

升级 `tailwindcss-patch` 到 `9.4.2`，并改为统一消费 npm 发布版本，避免主仓库安装和 CI 依赖 `tailwindcss-mangle` submodule 的 workspace 链接。
