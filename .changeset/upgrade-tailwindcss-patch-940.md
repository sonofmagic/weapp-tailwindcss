---
"weapp-tailwindcss": patch
---

升级 `tailwindcss-patch` 到 `9.4.0`。

`tailwindcss-patch@9.4.0` 发布包的源码中已经包含 `splitCandidateTokens`，但当前 `dist` 入口尚未导出该 API，因此 `weapp-tailwindcss` 暂时继续通过 `@weapp-tailwindcss/shared` 的兼容门面消费同语义实现，避免运行时导入不存在的导出。
