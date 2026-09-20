---
"@weapp-tailwindcss/source-scan": patch
"@weapp-tailwindcss/engine": patch
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
"@weapp-tailwindcss/cli": patch
"weapp-style-injector": patch
"tailwindcss-config": patch
---

统一来源扫描基础设施与共享语义契约，修复 Windows glob、qxml、绝对来源排除及配置更新缓存；拆分 PostCSS 子路径和核心扫描职责，解除值依赖循环与核心对构建器的反向引用，CLI 与 PostCSS 复用生成会话扫描并释放资源。

进一步将通用生成编排与候选状态迁入核心，兼容扫描入口统一使用 AST 来源描述与显式扫描策略。Webpack、Rspack、Gulp 共用真实生成与增量扫描契约，修复 Gulp 禁用自动扫描后的候选泄漏、watch 候选失效，以及 Webpack/Rspack 新增来源文件未触发 CSS 重建的问题。

生成引擎按内容指纹复用本地配置及插件模块，避免重复遍历和执行未变更依赖；配置或间接依赖更新及显式会话失效仍触发刷新。配置加载器保留 Jiti 转换缓存，同时关闭执行结果缓存，兼顾更新正确性与构建性能。
