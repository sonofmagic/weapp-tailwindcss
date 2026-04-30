---
"weapp-tailwindcss": patch
---

调整 `postinstall` 补丁脚本：安装阶段遇到运行时模块缺失时不再中断 `pnpm install`，并保留 `cli:patch` 作为严格校验入口。

同时将包内测试脚本改为使用 `pnpm run cli:patch`，避免继续通过 `npm run postinstall` 复用安装生命周期。
