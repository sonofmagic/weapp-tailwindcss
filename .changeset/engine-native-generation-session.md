---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

升级 `@tailwindcss-mangle/engine` 到 0.2.0 与 Tailwind CSS 4.3.3，并将 Tailwind v4 生成链路迁移到原生 generation session 与结构化 CSS artifact。graph 编译模式现通过按 scope 隔离的 `CompilationSession` 统一管理候选类、验证后的 classSet、依赖关系、编译 revision 与删除保留策略，并丢弃并发构建产生的过期 classSet 和 CSS 结果。Vite 与 Webpack 生成链路统一使用 `raw`、`framework-processed`、`adapted` CSS 阶段，framework PostCSS replay 通过 AST `PlatformAdapter` 执行，同时修复组合 CSS 时移动节点导致 fragment artifact 被意外清空的问题，并兼容新版条件变体生成的嵌套 `&` 包装。

进一步将 runtime snapshot、增量 hash、依赖影响和 process plan 下沉到 bundler-neutral compiler 契约。Vite 仅保留 Rollup asset 与模块元数据，Webpack 和 Gulp 不再导入 Vite `bundle-state` 或伪造 Rollup asset；三个 port 现在通过同一快照结构向 runtime classSet 会话提交源码与变更集合。

将 source candidate collector、扫描入口解析、扫描签名、CSS source entry 发现与静态配置读取迁入 bundler shared 扫描层。Webpack、Gulp、共享 CSS 生成器和 Tailwind runtime 不再依赖 Vite source scan 实现；原有 Vite 内部入口保留为兼容 facade，以维持现有插件生命周期与测试 mock 契约。
