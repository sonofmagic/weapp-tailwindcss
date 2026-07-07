# Prompt 05: 固化 Tailwind 生成后的小程序适配边界

## 目标

明确并测试 Tailwind v4 生成与小程序适配的顺序：Tailwind 负责 candidate 到 CSS，`weapp-tailwindcss` 负责 selector escape、rpx 恢复、不支持语法过滤、WXML/JS 同步转译。

## 可执行提示词

```markdown
你在 `weapp-tailwindcss` 仓库中工作。请审计 Tailwind v4 CSS 生成后的小程序适配链路，目标是确保所有小程序特有转换都发生在 Tailwind v4 candidate 生成之后，并且 classSet/rawCandidates 与最终 selector 转义保持同步。

约束：

- 先读取根目录 `AGENTS.md`、`packages/AGENTS.md`、`packages/weapp-tailwindcss/AGENTS.md`。
- 不得替代 Tailwind v4 官方生成逻辑。
- Tailwind CSS v4 样式生成仍由 `weapp-tailwindcss` 链路接管，不接入官方 Vite/PostCSS 生成插件作为兜底。
- JS 转译必须继续遵守 `classNameSet` 精确命中。

重点阅读：

- `packages/weapp-tailwindcss/src/tailwindcss/v4-engine/generator.ts`
- `packages/weapp-tailwindcss/src/tailwindcss/v4-engine/miniprogram.ts`
- `packages/weapp-tailwindcss/src/tailwindcss/v4-engine/generator/rpx-candidates.ts`
- `packages/weapp-tailwindcss/src/shared/classname-transform.ts`
- `packages/weapp-tailwindcss/src/wxml/**`

请输出并实施：

1. 梳理 `rawCandidates`、`classSet`、`rawCss`、`css` 四类数据的含义和转换顺序。
2. 检查 rpx 归一化和 restore 是否覆盖 CSS selector 与 classSet。
3. 检查小程序 target 过滤是否只过滤不支持的 candidates，不误删 web target。
4. 增加测试覆盖 `text-[22rpx]`、`bg-[color:...]`、variant、escaped selector、JS/WXML 同步转译。
5. 运行对应测试并记录命令。
```

## 验收标准

- `rawCss` 和 `css` 的差异只来自小程序适配。
- `classSet` 与最终可用于 JS/WXML 转译的 selector 保持一致。
- rpx 任意值、颜色任意值、variant 都有覆盖。
- web target 不被小程序过滤逻辑污染。

