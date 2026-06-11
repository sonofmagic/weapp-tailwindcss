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
- 本项目禁止使用 Prettier 做格式化；不要运行 `prettier`、`pnpm format` 或其它会调用 Prettier 的格式化命令。
- 提交信息遵循 Conventional Commits。
- 所有新增或修改的 Changeset 内容必须使用中文。
- JSDoc 注释必须使用中文；新增行内注释默认中文（术语可保留英文）。
- Tailwind CSS v3/v4 的样式生成统一由 `weapp-tailwindcss` 接管；禁止通过 `tailwindcss@3` PostCSS 插件、`@tailwindcss/postcss` 或 `@tailwindcss/vite` 生成样式。
- 构建插件禁止用 `fs` 直接写入或改写构建输出目录；输出变更必须通过对应 bundler 的插件 API、bundle asset、`emitFile`、loader result 或 stream/file 对象完成，确保产物仍在同一个构建图里。
- 修复构建器问题时必须从 bundler 的生命周期、模块图、产物图与 loader/plugin API 出发；禁止通过硬编码 `src`、`pages` 等项目布局推导源码路径，也禁止在 `generateBundle` 等后置阶段为了弥补状态缺失临时读取源码文件。需要源码内容时，应在 `load`、`transform`、`watchChange`、`handleHotUpdate` 等生命周期缓存，或使用 `ModuleInfo`、chunk metadata、loader result、source map、source-candidates 等构建图数据；确需文件系统扫描的入口发现逻辑必须集中在扫描层，并有回归测试覆盖。
- `submodules/tailwindcss-mangle/` 只允许作为本地源码参考目录，不得加入 `pnpm-workspace.yaml`、`pnpm-lock.yaml`、CI/CD checkout、发布流程或仓库 submodule 追踪；`weapp-tailwindcss` 必须消费 npm 发布版 `tailwindcss-patch`。

## 多 Codex / 多代理协作
- 同一个物理 checkout 只允许一个 Codex/代理执行写入型任务；多个 Codex 并发处理不同任务时，必须先为每个任务创建独立 `git worktree`。
- 推荐目录形态：在仓库同级目录创建工作树，例如 `../weapp-tailwindcss-codex/<task-slug>`；不要把并发工作树放进当前仓库目录内部。
- 每个并发任务使用独立分支名，例如 `codex/<task-slug>`；开始前先执行 `git status --short --branch`，确认当前工作树没有其他代理遗留改动。
- 在任何编辑、格式化、测试自动修复、`git add`、`git commit`、`git rebase` 或 `git push` 前，都要重新检查 `git status --short`；如果出现自己没有产生的改动，必须停止并说明冲突来源，不得覆盖、删除或顺手纳入提交。
- 禁止在共享 checkout 中用 `git restore`、`git checkout -- <file>`、批量格式化、代码生成或清理命令处理自己不拥有的文件；确需清理时，先确认文件归属。
- 提交前只暂存当前任务拥有的文件；除非用户明确要求“提交所有代码”，否则禁止用 `git add -A` 混入其他代理或用户的改动。

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
- `packages/weapp-tailwindcss` 的 bundler 适配不得依赖硬编码目录或后置 `fs.readFile` 兜底来还原源码关系；源码关系必须来自构建图、插件生命周期缓存或明确的扫描层。
- demo、Web/H5、watch 与 e2e 场景都必须遵守 Tailwind CSS 由 `weapp-tailwindcss` 生成的约束，不能为修复样式或 HMR 问题注册官方 Tailwind 生成插件。
- 运行时封装（`packages-runtime/*`）改动需重点关注 escape/unescape、merge 兼容和缓存边界。
- Release 工作流发布 npm 必须使用 trusted publishing/OIDC：发布 job 使用 Node 24 以满足 npm CLI 的 OIDC 支持要求，保留 `permissions.id-token: write` 与 provenance，禁止在发布步骤注入 `NPM_TOKEN` 或 `NODE_AUTH_TOKEN`。

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
