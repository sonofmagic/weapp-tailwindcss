---
"weapp-tailwindcss": patch
---

默认继续开启 Babel AST 解析缓存，但改为使用源码 hash 生成缓存 key，并新增 `babelParserOptions.cacheMaxEntries` 与 `babelParserOptions.cacheMaxSourceLength` 限制缓存条数和可缓存源码大小，避免大型项目中完整源码 key 与大 AST 长时间驻留导致内存占用过高；仍可通过 `babelParserOptions.cache: false` 显式关闭。
