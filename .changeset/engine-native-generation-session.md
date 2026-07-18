---
"@weapp-tailwindcss/postcss": patch
"weapp-tailwindcss": patch
---

升级 `@tailwindcss-mangle/engine` 到 0.2.0 与 Tailwind CSS 4.3.3，并将 Tailwind v4 生成链路迁移到原生 generation session 与结构化 CSS artifact。graph 编译模式现通过按 scope 隔离的 `CompilationSession` 统一管理候选类、验证后的 classSet、依赖关系、编译 revision 与删除保留策略，并丢弃并发构建产生的过期 classSet 和 CSS 结果。Vite 与 Webpack 生成链路统一使用 `raw`、`framework-processed`、`adapted` CSS 阶段，framework PostCSS replay 通过 AST `PlatformAdapter` 执行，同时修复组合 CSS 时移动节点导致 fragment artifact 被意外清空的问题，并兼容新版条件变体生成的嵌套 `&` 包装。

进一步将 runtime snapshot、增量 hash、依赖影响和 process plan 下沉到 bundler-neutral compiler 契约。Vite 仅保留 Rollup asset 与模块元数据，Webpack 和 Gulp 不再导入 Vite `bundle-state` 或伪造 Rollup asset；三个 port 现在通过同一快照结构向 runtime classSet 会话提交源码与变更集合。

将 source candidate collector、扫描入口解析、扫描签名、CSS source entry 发现与静态配置读取迁入 bundler shared 扫描层。Webpack、Gulp、共享 CSS 生成器和 Tailwind runtime 不再依赖 Vite source scan 实现；原有 Vite 内部入口保留为兼容 facade，以维持现有插件生命周期与测试 mock 契约。

将增量 runtime classSet manager、runtime entry 过滤、safe class 还原和 candidate signature 迁入 bundler shared。Webpack 与 Gulp 不再依赖 Vite runtime 实现，Vite 旧入口继续提供原有 `createBundleRuntimeClassSetManager` 与 signature API facade，保持 classSet 精确命中和既有测试注入方式兼容。

扩展 `AssetEmissionPlan` 以记录 bundler-neutral 的 asset write/delete 操作，并将 Vite production CSS 的覆盖、创建、迁移、import shell、源 asset 删除、最终小程序 CSS 清理、WebView 兼容转换、独立 CSS finalizer 与 uni-app x asset 后处理写回统一改为先生成 emission plan，再通过 Rollup bundle/`emitFile` port 执行。Harmony 主样式注入改为依据构建器提供的 main chunk matcher 选择真实产物，不再硬编码 `main.css`；uni-app x 在 bundle key 无法定位样式与 placeholder 产物时回退使用真实 `fileName`；compiler 只描述产物意图，不持有或修改 Rollup asset。

Gulp 增量 runtime 刷新改为复用 compiler 的 runtime compilation build state，不再在 adapter 内维护第二份源码 hash；源码缓存淘汰会同步清理 runtime hash、候选和依赖状态，使 Vite、Webpack、Gulp 使用同一套 raw/semantic 变化判定。

Webpack watch 移除独立的首次扫描标记和 HTML/JS 原文 hash 汇总，改由 compiler build state 的 iteration、reset 与 semantic signature 统一驱动全量扫描和 CSS 缓存失效，避免无关格式变化触发重复生成。

`AssetEmissionPlan` 支持 bundler-neutral 的泛型 source payload，Webpack 的 asset 覆盖、创建、删除和 linked JS 模块写回统一通过 emission plan executor 调用 compilation API；缓存命中的 Webpack Source 对象保持原样，不会为写回计划被强制序列化。

为旧 generator pipeline 建立显式 execution/output context 契约，移除生成执行与三个 CSS finalizer 的 `context: any`，使后续 source metadata 迁移能够由 TypeScript 校验输入、生成结果和兼容处理状态。

generator source metadata 改由模块私有 Symbol 保存，并统一通过结构化访问器读取；metadata 在 source clone 时继续保留，但不再暴露 `__weappTailwindcssMeta` 字符串字段或进入序列化结果。

generator pipeline 在进入生成与 compilation session 前将来源转换为显式 `{ source, metadata }` record，并从传给 Tailwind engine 的 source 中剥离内部 metadata，使 source identity、scope、preflight 与 candidate 隔离不再依赖生成器输入对象上的隐藏状态。

source resolver 的公开内部契约统一返回 source record，candidate validation 与 CSS generation 共用同一结构化来源边界，调用方不再自行读取或转换 attached metadata。

CompilationSession scope source 支持显式依赖记录，SourceGraph 为 Tailwind CSS/config 依赖建立 `depends-on` 边并在依赖集合变化时失效对应 scope；编译结果同时暴露 clone 后的 graph edges，便于 bundler contract 与 shadow 差异校验。

默认编译模式由 legacy 切换为 graph，使 Tailwind v4 生成默认使用 CompilationSession、结构化 artifact 与 AST adapter；仍可通过 `WEAPP_TAILWINDCSS_COMPILER=legacy` 紧急回退，或使用 `shadow` 继续比较新旧管线的 CSS 语义。

Tailwind generation artifact 在生成后发现的 CSS、插件与配置依赖现在会按 source 提交到同一个 CompilationSession revision，并原子更新 SourceGraph；过期并发生成结果不能覆盖当前 revision 的 dependency edges。

Webpack watch 现在把 `modifiedFiles` 与 `removedFiles` 转换为 compiler dependency ChangeSet，并依据 SourceGraph 精确判断受影响的 CSS scope；命中的 scope 通过稳定递增的 dependency revision 穿透 CSS cache，并使 Tailwind generation session 失效后重新生成，generation artifact 依赖也会注册到 Webpack `fileDependencies`。

新增 bundler-neutral 的 `CompilationChangeCoordinator`，统一持有待消费的 dependency ChangeSet、scope dependency revision 与 generation session 失效状态。Webpack 改为复用该协调器；Vite 的 `watchChange` 与 `handleHotUpdate` 也会把依赖变化提交到同一契约，同一轮重复事件只递增一次 scope revision。graph 与 shadow 生成入口按 scope 原子消费 ChangeSet，依赖变化时会放弃旧 `previousCss` 与 `previousClassSet` 增量追加状态，避免 generation session 重建后把完整 CSS 重复追加到旧产物。
