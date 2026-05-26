# Workspace Guidelines (`demo/*`)

## 适用范围
- 本文件适用于 `demo/*` 下所有演示与集成样例。
- `demo/*` 重点在“覆盖框架差异 + 回归验证”，不是公共 API 定义层。

## 通用原则
- 修改 demo 时优先维持演示可用性，不引入与示例目标无关的重构。
- 尽量保留各框架默认目录结构与构建脚本，避免因统一风格破坏框架约定。
- 若为回归问题新增 demo 变更，应在说明中标注对应问题场景与验证步骤。
- Tailwind CSS v3/v4 demo 的样式必须由 `weapp-tailwindcss` 生成；不要注册 `tailwindcss@3` PostCSS 插件、`@tailwindcss/postcss` 或 `@tailwindcss/vite` 来生成样式。
- Taro、uni-app 等 Web/H5 demo 遇到样式或 HMR 问题时，也应修正 `weapp-tailwindcss` 的生成链路，不能用官方 Tailwind 生成插件兜底。

## 构建与调试
- 按 demo 自身脚本执行（例如 `taro build --type weapp`、`uni -p mp-weixin`、`weapp-vite build`、`gulp`）。
- 对小程序 demo，涉及 `open`/上传脚本时注意路径与工具版本差异，不强制在 CI 场景执行。

## 测试与维护
- demo 的价值在于稳定复现；改动后至少保证一个关键路径可运行（`dev` 或 `build`）。
- 若调整了 demo 的依赖/脚本，建议同步更新对应 README 或注释，避免后续失效。
