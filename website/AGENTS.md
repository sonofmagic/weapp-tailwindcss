# Workspace Guidelines (`website/*`)

## 适用范围

- 本文件适用于 `website/*`（文档站与相关脚本、测试）。
- 该目录以 Docusaurus + React + Playwright 为主，优先保证文档可构建与路由稳定。

## 通用原则

- 文档内容变更应与 API/行为变更保持一致，避免“代码已变更但文档未更新”。
- 修改 Docusaurus 配置或插件时，优先小步验证，避免一次性大改导致构建回归。
- 对 `website/scripts/*` 的改动应保持可重复执行和幂等，避免污染仓库状态。

## 常用命令

- 本地开发：`pnpm --filter @weapp-tailwindcss/website dev`
- 构建验证：`pnpm --filter @weapp-tailwindcss/website build`
- 类型检查：`pnpm --filter @weapp-tailwindcss/website typecheck`
- 站点 E2E：`pnpm --filter @weapp-tailwindcss/website e2e`

## 提交前检查

- 至少执行一次文档构建或关键页面本地验证。
- 若涉及路由、导航或 API 文档生成逻辑，需在说明中标注影响范围。
