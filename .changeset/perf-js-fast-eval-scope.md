---
"weapp-tailwindcss": patch
---

perf(js): 按需作用域与缓存优化，加速 JS 处理；修复 noScope 下 eval/require 遍历报错

- 分析遍历默认启用 `noScope`，仅在配置了 `ignoreCallExpressionIdentifiers` 时才构建作用域
- `eval` 处理：优先使用 `path.traverse`，若因缺少 `scope/parentPath` 报错则降级到参数级手工遍历，兼容测试桩与仅 AST 形态
- `require` 收集：在 `noScope` 下放宽 `hasBinding` 判定，确保可正确采集 `require('...')` 字面量
- `MagicString`：当没有任何 token 时跳过实例化与写入，减少不必要开销
- 解析缓存：支持 `parserOptions.cacheKey` 并在默认项中注入；AST LRU 提升至 1024
- 稳健性：`NodePathWalker`、`taggedTemplateIgnore` 访问 `.scope` 统一做空值保护

fix(types/tests): 修复类型告警与单测不匹配

- 扩展 `ParserOptions` 以支持 `cacheKey`
- `TailwindcssPatcherLike` 去除对私有 `cacheStore` 的类型依赖
- 调整部分测试桩签名与 `Node` 类型引用；`webpack.v5`、`evalTransforms`、`module-replacements` 等用例通过

