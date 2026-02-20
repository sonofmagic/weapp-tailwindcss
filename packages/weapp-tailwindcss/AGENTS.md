# Package Guidelines (`packages/weapp-tailwindcss`)

## 适用范围

- 本文件仅适用于 `packages/weapp-tailwindcss`。
- 若与仓库根 `AGENTS.md` 冲突，以“更严格且更近一级”的规则为准。

## 包定位与目录

- 该包是核心转译与多构建器适配入口，涵盖 `vite/webpack/gulp`、`wxml`、`js`、`postcss` 协作链路。
- 关键目录：
  - `src/bundlers/`：各构建工具集成层。
  - `src/wxml/`：模板类名处理链路。
  - `src/js/`：JS AST 与模块图相关转译。
  - `src/context/`：上下文、缓存与配置汇总。
  - `test/`：单测、集成、回归、性能相关用例。

## JS 转译硬性规则

- JS 相关转译必须遵循 `classNameSet` 精确命中原则：仅转译来自 `tailwindcss-patch` 的类名集合。
- 禁止在 JS 转译链路中对普通字符串执行启发式兜底转译（例如基于 token 形态猜测 class）。
- 若需降低误伤风险，优先改进类名集合获取与刷新时机，不通过放宽候选匹配规则实现。

## 开发与变更要求

- 修改 `src/js/**`、`src/wxml/**`、`src/context/**` 时，必须补对应回归测试。
- 涉及 bundler 行为差异时，优先在 `test/bundlers/**` 增加最小复现用例。
- 不要在单个 handler 内同时引入解析、匹配、替换三类职责；优先拆分为可测试小模块。

## 推荐验证命令

- `pnpm --filter weapp-tailwindcss test`
- `pnpm --filter weapp-tailwindcss test:dev`
- 针对单文件回归：`pnpm --filter weapp-tailwindcss vitest run test/js/<case>.test.ts`

## 提交前检查

- 至少运行与改动面对应的子集测试（JS/WXML/Bundlers）。
- 若输出快照或 fixtures 变化，提交中需包含变更原因说明。
