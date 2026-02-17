---
"weapp-tailwindcss": patch
---

修复 JS 转译误伤问题，并将 JS 候选匹配策略收敛为 classNameSet 精确命中。

- JS 仅转译来自 `tailwindcss-patch` 的 `classNameSet` 命中项，不再对普通字符串做启发式 fallback 转译
- `App.vue:4`、`index.ts:120:3`、日志/堆栈/业务文本等非 class 字符串不再被误转义
- 补充回归测试，覆盖 `staleClassNameFallback=true/false` 下仍保持 classNameSet-only 行为
