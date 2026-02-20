# Repository Guidelines (Root Short Version)

## 适用范围与优先级
- 本文件是仓库级“短版总则”。
- 规则优先级：就近目录 `AGENTS.md` > 上级目录 `AGENTS.md` > 本文件。
- 开始改动前，先确认目标目录是否有更近一级 `AGENTS.md`。
- 执行任何任务前必须先做“最近规则检查”：从当前目录向上查找最近的 `AGENTS.md` 并先读取，再开始修改或执行命令。

## 全局硬规则
- 统一使用 `pnpm`，禁止切换 npm/yarn；Node 版本 `>=20.19.0`。
- 代码默认 TypeScript + ESM，缩进 2 空格。
- 文件超过约 300 行优先按目录拆分（如 `feature/a.ts`），避免 `feature.a.ts`。
- 测试默认 Vitest；修复缺陷或改行为必须补回归测试。
- 提交信息遵循 Conventional Commits。
- 所有新增或修改的 Changeset 内容必须使用中文。
- JSDoc 注释必须使用中文；新增行内注释默认中文（术语可保留英文）。

## 仓库常用命令
- `pnpm install`
- `pnpm build`
- `pnpm build:apps`
- `pnpm build:pkgs`
- `pnpm build:docs`
- `pnpm test`
- `pnpm test:core`
- `pnpm test:plugins`
- `pnpm e2e`
- `pnpm run:watch`

## 目录规则路由
- `packages/*`：`packages/AGENTS.md`
- `packages-runtime/*`：`packages-runtime/AGENTS.md`
- `apps/*`：`apps/AGENTS.md`
- `demo/*`：`demo/AGENTS.md`
- `website/*`：`website/AGENTS.md`
- `e2e/*`：`e2e/AGENTS.md`
- `scripts/*`：`scripts/AGENTS.md`

## 关键约束索引
- `packages/weapp-tailwindcss` 的 JS 转译必须遵循 `classNameSet` 精确命中原则，禁止启发式兜底转译。
- 运行时封装（`packages-runtime/*`）改动需重点关注 escape/unescape、merge 兼容和缓存边界。

## 新增 AGENTS 触发条件
- 目录具备独立发布或独立 `build/test` 流程。
- 存在高风险链路（转译、编译、代码生成、批量写文件）。
- 目录职责明显不同于父目录通用规则。

## 子目录 AGENTS 最小模板
- `适用范围`
- `核心职责`
- `变更原则`
- `测试要求`
- `推荐验证命令`
- `提交前检查`

## 补充
- 首次克隆后执行 `pnpm prepare` 初始化 Husky。
- 文档站发布前需配置 `website/.env.local` 并执行 `pnpm build:docs`。
