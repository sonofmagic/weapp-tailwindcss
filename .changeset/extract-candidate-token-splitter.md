---
"@weapp-tailwindcss/shared": minor
"weapp-tailwindcss": patch
---

新增 `splitCandidateTokens` 候选 token 分割入口，并保留 `splitCode` 作为兼容别名。

`weapp-tailwindcss` 内部的 JS、WXML 动态表达式与 uni-app x 局部样式候选分割改为使用更明确的 `splitCandidateTokens`，继续保持 `classNameSet` 精确命中原则，避免普通字符串被误转义。
