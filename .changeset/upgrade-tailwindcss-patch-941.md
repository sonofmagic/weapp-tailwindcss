---
"weapp-tailwindcss": patch
---

升级 `tailwindcss-patch` 到 `9.4.1`。

`tailwindcss-patch@9.4.1` 的发布入口已经导出 `splitCandidateTokens`，`weapp-tailwindcss` 的 JS、Vite 产物和 uni-app x 局部样式候选 token 分割逻辑改为直接消费该 API，避免继续维护重复兼容实现。
