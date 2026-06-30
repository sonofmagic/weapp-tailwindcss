---
"weapp-style-injector": major
---

发布 `weapp-style-injector` 1.0.0，收口分包样式注入配置为 `rules`：可以用对象映射、tuple 或 `from`/`to` 对象直接描述“哪个样式入口会注入到哪些产物中”。

这是破坏性变更：移除 `styleEntries`、`subPackages.imports`、预设插件 `subpackageImports` 等过长或偏内部的公开配置入口。
