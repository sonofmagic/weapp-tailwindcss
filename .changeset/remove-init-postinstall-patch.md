---
"@weapp-tailwindcss/init": patch
"weapp-tailwindcss": patch
---

移除初始化流程和核心包安装生命周期中的 `weapp-tw patch` 自动入口。当前生成模式会在构建运行时接管 Tailwind CSS 补丁与类名收集，新项目不再需要把补丁命令写入 `postinstall`；旧 CSS 后处理链路仍可手动执行 `weapp-tw patch` 或 `weapp-tw status` 排查状态。

执行 `weapp-tw patch` 时会提示 `weapp-tailwindcss@5` 生成模式不再需要该指令，也不需要配置 `postinstall` 这个 npm hook，避免新项目继续复制旧链路配置。
