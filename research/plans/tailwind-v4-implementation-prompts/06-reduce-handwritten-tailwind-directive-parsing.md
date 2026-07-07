# Prompt 06: 减少手写 Tailwind v4 指令解析

## 目标

审计仓库中对 `@source`、`@theme`、`@config`、`@plugin`、`@utility`、`@custom-variant` 等 Tailwind v4 指令的手写解析，尽量改为复用 Tailwind/engine 的解析结果或集中到一个可测试扫描层。

## 可执行提示词

```markdown
你在 `weapp-tailwindcss` 仓库中工作。请审计 Tailwind v4 指令解析代码，目标是减少散落的 regex/string 解析，优先复用 `@tailwindcss-mangle/engine`、Tailwind v4 resolved source、designSystem 或已有 source resolver 的结构化结果。

约束：

- 先读取根目录 `AGENTS.md`、`packages/AGENTS.md`、`packages/weapp-tailwindcss/AGENTS.md`。
- 不得为了补状态在 `generateBundle`、`closeBundle` 等后置阶段临时读取源码。
- 若必须保留文件系统扫描，读取逻辑必须集中在扫描层，并补回归测试。
- 不得破坏 `@source inline(...)`、`@source not ...`、`source(none)`、`@import "tailwindcss" reference` 等 v4 语义。

重点阅读：

- `packages/weapp-tailwindcss/src/bundlers/vite/generate-bundle/tailwind-v4-css-source.ts`
- `packages/weapp-tailwindcss/src/bundlers/shared/generator-css/user-css.ts`
- `packages/weapp-tailwindcss/src/bundlers/shared/generator-css/source-resolver.ts`
- `packages/weapp-tailwindcss/src/bundlers/vite/generate-bundle/css-config-directives.ts`
- `packages/weapp-tailwindcss/src/tailwindcss/v4-engine/source.ts`

请输出并实施：

1. 列出所有手写解析 Tailwind v4 指令的位置和用途。
2. 判断每个位置是否可以由 engine/resolved source/designSystem 替代。
3. 对可替代项做最小迁移；暂不能替代的集中封装并补测试。
4. 增加复杂 CSS 指令回归：嵌套 import、quoted source、negated source、inline source、plugin/custom variant/utility 指纹。
5. 运行对应测试并记录命令。
```

## 验收标准

- Tailwind v4 指令解析入口更集中。
- 正则解析不再散落在多个 bundler 后置阶段。
- 复杂 `@source` 和 custom directive 场景有回归测试。
- 行为与 Tailwind v4 官方 CSS 指令语义保持一致。

