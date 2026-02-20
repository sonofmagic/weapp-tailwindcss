# Workspace Guidelines (`packages/*`)

## 适用范围

- 本文件适用于 `packages/*` 下所有包。
- 若具体包存在更近一级 `AGENTS.md`，以更近一级规则为准。

## 通用原则

- 这些包大多是可发布库，变更时优先关注导出面稳定性与向后兼容。
- 新增导出需同步检查：
  - `package.json` 的 `exports`；
  - 构建产物类型声明；
  - README 中的公开用法（如有）。
- 默认保持“单一职责”包边界，不把上游业务逻辑混入基础工具包。

## 工程与测试

- 优先使用包内脚本验证：
  - `pnpm --filter <pkg-name> build`
  - `pnpm --filter <pkg-name> test`
- 涉及配置、生成、转译链路的包（如 config/injector/init）修改时，必须补回归测试或 fixture。

## 提交前检查

- 若为公开包，确认版本语义与变更范围匹配（破坏性改动需显式说明）。
- 若仅是占位包/模板包，避免引入没有消费方的复杂逻辑。
