# Package Guidelines (`packages/tailwindcss-core-plugins-extractor`)

## 适用范围

- 本文件适用于 `packages/tailwindcss-core-plugins-extractor`。
- 该包属于“脚本生成 + 发布产物”模式，核心是稳定提取 Tailwind Core Plugins 数据。

## 目录与职责

- `scripts/main.js`：生成入口，负责刷新 `src/corePlugins/*`、`src/theme/screens.ts`、`src/index.ts`。
- `scripts/extract.js`：提取逻辑核心（`getUtilities`、规范化）。
- `src/corePlugins/`：生成产物目录。
- `src/index.ts`：由脚本生成的统一导出入口。

## 生成规则（硬约束）

- `src/corePlugins/*` 与 `src/index.ts` 视为“生成文件”，默认不手工编辑。
- 若需要调整提取行为，优先修改 `scripts/extract.js` 或 `scripts/main.js`，再执行生成脚本。
- 涉及 Tailwind 版本变更时，必须整体重生成，不做局部手工修补。

## 开发要求

- 修改脚本后，必须检查导出稳定性（导出项是否完整、顺序是否可预期）。
- 保持输出结构可序列化且稳定，避免引入与运行时环境相关的非确定性字段。
- 不在该包引入与提取目标无关的业务逻辑，保持“纯提取工具包”定位。

## 推荐验证命令

- `pnpm --filter tailwindcss-core-plugins-extractor extract`
- `pnpm --filter tailwindcss-core-plugins-extractor build`
- 验证输出是否更新：`git diff -- packages/tailwindcss-core-plugins-extractor/src`

## 提交前检查

- 若 `scripts/**` 变更但 `src/corePlugins/**` 无变更，需确认是否遗漏重生成。
- 若输出文件变化过大，提交说明中应明确 Tailwind 版本或提取策略变动原因。
