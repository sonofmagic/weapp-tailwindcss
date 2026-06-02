---
'weapp-tailwindcss': patch
---

修复 `babelParserOptions` 默认开启缓存时的内存膨胀问题：解析缓存键改为哈希后缀，不再直接拼接源码；同时增加缓存条数和源码长度上限，避免大项目把 AST 缓存撑爆。
