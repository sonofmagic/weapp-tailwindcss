# Prompt 03: 对齐 designSystem 增量生成策略

## 目标

继续强化 Tailwind v4 增量生成缓存，让 `weapp-tailwindcss` 尽量复用 designSystem 的 candidate 编译能力，避免不必要全量生成，同时保证缓存失效正确。

## 可执行提示词

```markdown
你在 `weapp-tailwindcss` 仓库中工作。请审计 `packages/weapp-tailwindcss/src/tailwindcss/v4-engine/generator.ts` 的增量生成逻辑，目标是对齐 Tailwind v4 官方 `designSystem.candidatesToCss()` / `build(candidates)` 的语义，并确认缓存失效条件覆盖 source CSS、依赖、target、style options、rpx 归一化、custom properties。

约束：

- 先读取根目录 `AGENTS.md`、`packages/AGENTS.md`、`packages/weapp-tailwindcss/AGENTS.md`。
- 不得用文件名或输出路径片段判断主样式、分包或入口。
- 小程序转换必须在 Tailwind v4 candidate 生成之后进行。
- 修复行为变更必须补回归测试或基准测试。

重点阅读：

- `packages/weapp-tailwindcss/src/tailwindcss/v4-engine/generator.ts`
- `packages/weapp-tailwindcss/src/tailwindcss/v4-engine/design-system.ts`
- `packages/weapp-tailwindcss/src/tailwindcss/v4-engine/generator/rpx-candidates.ts`
- `packages/weapp-tailwindcss/src/tailwindcss/v4-engine/miniprogram.ts`
- `packages/weapp-tailwindcss/test/integration/tailwindcss-v4-hmr.test.ts`

请输出并实施：

1. 画出当前增量缓存 key、entry 内容、失效条件。
2. 检查 missing candidates 走 `candidatesToCss()` 时是否完整复用 `customPropertyValues`、rpx restore、target transform。
3. 检查 candidate 移除、依赖变更、CSS token 变更、多 target 切换时是否会正确全量重建。
4. 若发现缓存污染或失效不足，做最小修复。
5. 增加测试覆盖：新增 candidate、删除 candidate、主题变量变化、rpx 任意值、target 切换。
6. 运行对应测试并记录命令。
```

## 验收标准

- 增量生成与全量生成在同一输入下输出一致。
- 缓存不会跨 target、style options、source CSS 误复用。
- 新增和删除 candidate 都有正确行为。
- HMR 相关测试能覆盖关键路径。

