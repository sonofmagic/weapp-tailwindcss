# Workspace Guidelines (`examples/*`)

## 适用范围
- 本文件适用于 `examples/*` 下的独立示例工程。

## 核心职责
- 示例用于展示某个能力的最小可运行链路。
- 示例应尽量减少框架噪声，避免和 `demo/*` 的集成回归职责混淆。

## 变更原则
- 优先使用仓库已有依赖、catalog 和 TypeScript + ESM 约定。
- 示例的构建脚本必须能在对应目录内独立运行。
- Tailwind CSS 样式生成相关示例不得注册官方 Tailwind PostCSS/Vite 生成插件作为兜底。

## 测试要求
- 新增或修改示例时，应补充示例包内的 Vitest 测试或能覆盖关键路径的构建验证。

## 推荐验证命令
- `pnpm --filter <example-package-name> build`
- `pnpm --filter <example-package-name> test`

## 提交前检查
- 提交前执行 `git status --short`，确认只包含当前示例相关文件。
