---
"weapp-tailwindcss": patch
---

修正 runtime loader 的插入顺序，使 `runtimeCssImportRewriteLoader` 总是在 `postcss-loader` 之前执行，而 `runtimeClassSetLoader` 在其之后执行；同时新增调试日志和文档，方便排查 loader 链。
