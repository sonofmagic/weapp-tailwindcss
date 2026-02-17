---
"weapp-tailwindcss": patch
---

修复 JS stale fallback 在日志/堆栈 source-location 字面量上的误判转义。

- 对 `App.vue:4`、`index.ts:120:3`、`Foo.jsx:8` 等 source-location token 增加硬排除
- 增加 source location、URL、文件路径的默认 fallback 排除规则
- 新增可配置项 `fallbackExcludePatterns` 与 `fallbackCandidateFilter`
- 补充 stale fallback true/false 的回归测试，并确保 Tailwind 候选类仍可正常转义
