---
"weapp-tailwindcss": patch
---

默认关闭 Babel AST 解析缓存，避免大型项目中以完整源码作为 key、AST 作为 value 长时间驻留导致内存占用过高；仍可通过 `babelParserOptions.cache: true` 显式开启。
