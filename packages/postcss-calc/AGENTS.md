# Package Guidelines (`packages/postcss-calc`)

## 适用范围

- 本文件适用于 `packages/postcss-calc`。
- 本包是从 `submodules/postcss-calc` 迁入的可发布 monorepo 子包。

## 核心职责

- 提供 `@weapp-tailwindcss/postcss-calc` 的 PostCSS calc 归约能力。
- 保持 CommonJS 源码入口与现有类型声明兼容，避免影响 `@weapp-tailwindcss/postcss` 的消费方式。

## 变更原则

- 优先保持上游 `postcss-calc` 行为兼容，针对小程序或 weapp-tailwindcss 的差异必须补测试。
- `src/parser.js` 由 `parser.jison` 生成，不手写维护；它是运行时入口依赖，修改 `parser.jison` 后必须重新生成并提交。
- 不新增独立 lockfile；依赖统一由仓库根 `pnpm-lock.yaml` 管理。

## 测试要求

- 修改解析、归约、单位转换或字符串输出逻辑时，必须跑包内测试。
- 修改发布入口、类型或依赖时，必须验证 `@weapp-tailwindcss/postcss` 能正常测试或构建。

## 推荐验证命令

- `pnpm --filter @weapp-tailwindcss/postcss-calc build`
- `pnpm --filter @weapp-tailwindcss/postcss-calc test`
- `pnpm --filter @weapp-tailwindcss/postcss test`

## 提交前检查

- 确认 `parser.jison` 变化时同步更新 `src/parser.js`。
- 确认没有重新引入 `submodules/postcss-calc` gitlink 或独立 `pnpm-lock.yaml`。
