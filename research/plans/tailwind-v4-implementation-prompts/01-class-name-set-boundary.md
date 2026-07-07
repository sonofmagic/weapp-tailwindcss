# Prompt 01: 收紧 classNameSet 生成与消费边界

## 目标

审计并收紧 `weapp-tailwindcss` 中 `classNameSet` 的来源、缓存和消费链路，确保 JS/WXML 转译只处理 Tailwind v4 生成链路确认过的类名。

## 可执行提示词

```markdown
你在 `weapp-tailwindcss` 仓库中工作。请审计 `packages/weapp-tailwindcss` 的 `classNameSet` / `runtimeSet` / `transformRuntimeSet` 生成与消费链路，目标是进一步对齐 Tailwind CSS v4 的 `build(candidates)` 模型：只有 Tailwind designSystem 或 runtime 生成链路确认有效的 candidate，才能进入 JS/WXML 转译集合。

约束：

- 先读取根目录 `AGENTS.md`、`packages/AGENTS.md`、`packages/weapp-tailwindcss/AGENTS.md`。
- 不得放宽 JS 字符串启发式转译；必须遵守 `classNameSet` 精确命中原则。
- 不得把普通字符串按形态猜成 Tailwind class。
- 若发现 fallback 逻辑需要调整，优先改进集合来源、刷新时机和验证方式，而不是扩大 fallback。
- 修改 `src/js/**`、`src/wxml/**`、`src/context/**` 时必须补回归测试。

重点阅读：

- `packages/weapp-tailwindcss/src/shared/classname-transform.ts`
- `packages/weapp-tailwindcss/src/js/handlers.ts`
- `packages/weapp-tailwindcss/src/js/literal-transform.ts`
- `packages/weapp-tailwindcss/src/bundlers/vite/runtime-class-set.ts`
- `packages/weapp-tailwindcss/src/bundlers/vite/incremental-runtime-class-set.ts`
- webpack/gulp 中传入 `classNameSet` 的对应链路

请输出并实施：

1. 当前 `classNameSet` 数据流图：来源、过滤、缓存、传入 JS/WXML 的位置。
2. 识别是否存在任何未经过 Tailwind v4 designSystem/runtime 确认的类名进入转译集合。
3. 若存在风险，做最小修复。
4. 增加回归测试，覆盖“像 class 但未生成”的普通字符串不被转译。
5. 运行对应测试并记录命令。
```

## 验收标准

- JS/WXML 转译仍只命中确认过的 raw 或 escaped class。
- 空 `classNameSet` 不会导致普通字符串大面积转译。
- 任意值 fallback 只在已有受控条件下触发。
- 有针对性的单测或集成测试覆盖误伤风险。

