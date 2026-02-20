---
name: weapp-tailwindcss
description: 为 weapp-tailwindcss 单仓库任务提供约束优先的执行流程，覆盖包定位、构建测试命令、JS 转译高风险规则与提交流程。
---

# weapp-tailwindcss Skill

适用于在 `weapp-tailwindcss` 单仓库中执行开发、修复、文档同步与发布前验证任务。

## 何时使用

- 用户明确提到 `weapp-tailwindcss` 仓库
- 需要在 `packages/*`、`packages-runtime/*`、`website/*`、`e2e/*` 中修改代码
- 需要给出或执行本仓库标准命令（`pnpm build/test/e2e`）
- 需要处理高风险链路（转译、编译、代码生成、批量改动）

## 工作规则

1. 先做最近规则检查

- 修改前先读取目标目录最近的 `AGENTS.md`
- 规则优先级：就近目录 > 上级目录 > 根目录

2. 使用仓库标准工具链

- 统一使用 `pnpm`
- Node 版本要求：`>=20.19.0`
- 默认技术栈：TypeScript + ESM，2 空格缩进

3. 高风险约束（必须遵守）

- 在 `packages/weapp-tailwindcss` 的 JS 转译链路中，仅允许 `classNameSet` 精确命中
- 禁止对普通字符串做启发式兜底转译（禁止“猜测 class”）
- 若误伤风险升高，优先改进 class 集合获取与刷新时机，不放宽候选匹配规则

4. 变更与验证策略

- 小步修改，优先局部验证
- 改行为或修复缺陷时补回归测试
- 文件超过约 300 行时优先按目录拆分

## 常用命令

```bash
pnpm install
pnpm build
pnpm build:apps
pnpm build:pkgs
pnpm test
pnpm test:core
pnpm test:plugins
pnpm e2e
pnpm --filter @weapp-tailwindcss/website build
```

## 提交规范

- 提交信息遵循 Conventional Commits
- Changeset 内容必须使用中文
- JSDoc 注释必须使用中文；新增行内注释默认中文（必要术语可保留英文）
