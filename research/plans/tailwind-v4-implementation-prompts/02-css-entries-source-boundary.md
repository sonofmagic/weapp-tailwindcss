# Prompt 02: 强化 cssEntries 与 Tailwind v4 source 边界

## 目标

把 `cssEntries`、`tailwindcss.v4.cssEntries`、`@source` 视为 Tailwind v4 生成上下文的核心输入，减少入口缺失或解析不一致导致的类名不同步。

## 可执行提示词

```markdown
你在 `weapp-tailwindcss` 仓库中工作。请审计 Tailwind CSS v4 的 CSS 入口和 source 解析链路，目标是确保 `cssEntries` / `tailwindcss.v4.cssEntries` / `@source` 的语义与 Tailwind v4 官方 `parseCss -> sources/root -> build(candidates)` 模型一致。

约束：

- 先读取根目录 `AGENTS.md`、`packages/AGENTS.md`、`packages/weapp-tailwindcss/AGENTS.md`。
- 不得通过硬编码 `src`、`pages`、`app.wxss`、`main.css` 等路径或文件名来推导入口语义。
- 需要源码内容时，优先使用构建图、loader/transform 阶段缓存或 source-candidates 扫描层。
- 不得引入 `@tailwindcss/vite`、`@tailwindcss/postcss` 作为兜底生成链路。

重点阅读：

- `packages/weapp-tailwindcss/src/tailwindcss/v4/config.ts`
- `packages/weapp-tailwindcss/src/tailwindcss/v4/css-sources.ts`
- `packages/weapp-tailwindcss/src/tailwindcss/v4-engine/source.ts`
- `packages/weapp-tailwindcss/src/bundlers/shared/generator-css/source-resolver.ts`
- `packages/weapp-tailwindcss/src/bundlers/vite/source-scan.ts`
- `packages/weapp-tailwindcss/src/bundlers/vite/source-candidates/scan-root.ts`

请输出并实施：

1. 当前入口 CSS 发现和归一化规则清单。
2. 明确哪些场景必须要求用户配置 `cssEntries`，哪些场景可以从构建图安全发现。
3. 检查 `@source not`、`@source inline(...)`、`source(none)`、多入口 CSS 的行为是否一致。
4. 若有不一致，修复入口/source 归一化逻辑。
5. 增加最小回归测试，覆盖多 cssEntries、显式 `@source`、仅 negated source、缺失 cssEntries warning。
6. 运行对应测试并记录命令。
```

## 验收标准

- Tailwind v4 入口缺失时有明确 warning 或错误，不静默生成不完整集合。
- 多入口 CSS 不混淆 source base。
- `@source` 显式配置不会被默认扫描规则覆盖。
- 测试覆盖缺失入口和多入口场景。

