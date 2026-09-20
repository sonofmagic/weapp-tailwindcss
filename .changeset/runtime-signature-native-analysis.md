---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
---

复用现有 Oxc 解析器分析 JS 候选文本签名，保留原生模块不可用时的 Babel 回退；对构建图已排除出候选扫描的 JS 使用源码哈希保守失效，减少独立分包运行时的重复 AST 解析，同时保留类名精确转译与关联模块失效。

为 JS 快路径增加有容量上限的字面量位置缓存，类集合变化时复用解析事实并重新精确匹配，避免 watch 反复构建完整 AST。保留 ESM 模块图和特殊语法的 Babel 回退，并让无模块图依赖的 CommonJS 产物使用原生解析器。合并小程序 preflight 与 theme 时预筛单一选择器，减少大型工具类样式表的 selector AST 分配。
