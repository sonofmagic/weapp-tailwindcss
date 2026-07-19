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

Gulp 的 Tailwind v4 CSS 生成改为进入统一 v4 generation core，使 Vinyl CSS scope 也由 `CompilationSession` 持有候选、classSet、依赖和 revision。`createPlugins()` 新增 `watchChange(file, event)` 供 Gulp watcher 提交 update/delete 事件；命中的 generation dependency 会失效 session，并通过 scope dependency revision 穿透 CSS cache。删除事件还会清理 runtime source、自动发现的 CSS source 和对应 process cache，避免 watch 中继续使用已删除文件的状态。

shadow 编译模式新增结构化 CSS 语义差异报告，按 JSONPath 定位 fragment、selector、声明顺序、scope、候选集合、依赖和 source entry 差异，并限制单次报告数量。内部生成入口可通过 `onCompilerShadowReport` 接收每次比较结果，诊断数据只包含可序列化快照，不再暴露 PostCSS AST。

新增 bundler-neutral 的 shadow report session，按构建轮次和显式 output scope 聚合并隔离克隆最新比较结果，同一 source 的主包、分包或 scoped 输出不会互相覆盖；session 同时限制保留数量并汇总匹配、失败、截断和丢弃计数。Vite `generateBundle`、Webpack `processAssets` 与 Gulp `watchChange` 会在各自真实生命周期开始新轮次；异步生成只允许向启动时对应的 revision 提交报告，避免旧构建污染新结果。Gulp 插件额外提供显式轮次开始与快照读取方法，便于自定义流任务建立切流门禁。

shadow report session 新增显式完成与封存语义，Vite CSS finalizer 和 Webpack `processAssets` 会在本轮所有 CSS 生成结束后自动完成，Gulp 插件提供 `completeCompilerShadowRun()` 供流任务声明结束。临时环境变量 `WEAPP_TAILWINDCSS_COMPILER_SHADOW_GATE=report|error` 可通过 `[weapp-tailwindcss:compiler-shadow]` 单行 JSON 输出门禁汇总，或在出现语义差异、截断报告、报告丢弃时中止构建；默认 `off` 不改变现有行为。

新增统一 compiler owner 生命周期释放：Vite `closeBundle`、Webpack `watchClose`/`shutdown` 和 Gulp `dispose()` 会清理 CompilationSession、Tailwind generation engine、待消费 ChangeSet 与 shadow report。scope pool 会等待仍在执行的生成任务结束后再释放 session，避免 watch 关闭时出现旧生成结果写回已释放状态；同一 owner 的并发关闭会复用同一个释放任务，防止后触发的 hook 越过仍在运行的编译。

compiler owner 进入释放窗口后会统一拒绝创建新的 CompilationSession、generation pool、ChangeSet coordinator 与 shadow report session，待释放完成后才允许同一 owner 开启下一轮构建，避免关闭期间出现新旧状态交叉持有。

新增 canonical compilation scope snapshot builder，CompilationSessionPool 与 bundler contract 共用 source graph、candidate source 和输出 asset 的构造规则；Vite、Webpack、Gulp 的相同初始与增量输入现在会统一校验 runtime snapshot 和 CompilationResult 等价性。

Gulp 的 Vinyl 内容写回改为通过 AssetEmissionPlan executor 执行，并新增三端写回契约，确保 Vite bundle、Webpack compilation 和 Gulp stream 对更新、新建、删除操作得到等价产物。

RuntimeCompilationSnapshot 新增显式 removedFiles：核心层不再把快照中缺席的文件猜测为删除；Webpack port 可依据完整 compilation asset 集合判断消失的输出，Vite partial snapshot 与 Gulp watcher 则消费 bundler 明确上报的删除。显式删除会清理 runtime candidate、source hash、linked dependency 和 CompilationSession candidate source，即使同一轮设置了 hasOmittedKnownFiles 也不会继续保留已删除文件状态。

Vite production port 新增基于 Rollup facade、asset originalFileNames 与已缓存 CSS source/output 元数据的产物归属表。`watchChange` 删除事件会按真实归属向每个 generateBundle session 提交一次性 removedFiles；增量 bundle 中仅仅缺席的无关产物仍会保留，当前轮仍实际输出或由多个 source 共同拥有的产物不会被误删，并覆盖 `.acss`、`.ttss` 等非微信样式后缀。

缺少 Rollup originalFileNames 的模板 asset 会复用 source-candidate transform store 的精确 source 命中登记产物归属；仅依赖文件后缀的兼容匹配不会获得删除 ownership，避免模糊路径关联导致错误清理模板候选。

Vite source/output ownership 现在按 source update revision 原子替换：同一源码重新产出新 hash 文件时，旧 output 会作为显式删除提交且历史关系不会持续增长；稳定文件名仍由当前 bundle 过滤，不会产生误删。连续 100 次更新后 relation 与 pending queue 保持恒定。

新增真实 Vite watch 回归，覆盖没有 originalFileNames 的支付宝模板 asset：源码删除后下一轮构建不再保留该模板候选生成的安全类名，验证 watchChange、source-candidate 精确归属和 removedFiles 已贯通实际构建生命周期。

Vite remembered CSS refresh 不再在 generateBundle/replay 阶段通过 readFile 补取源码。普通样式更新消费 source-candidate transform cache，扫描规则排除的样式由 watchChange 生命周期显式写入 CSS memory；缓存缺失时跳过 replay 刷新并保留已有状态。remembered replay 直接消费生命周期缓存的 source snapshot，产物写回统一通过 `AssetEmissionPlan` 执行。

Vite generateBundle port 不再向内部 runtime 透传 remembered source refresh 能力；普通 CSS asset 与缺失 asset replay 统一只消费 load、transform、watchChange 和 handleHotUpdate 已提交的 source snapshot，后置阶段不能重新解析源码状态。

移除 `GenerateBundleContext`、CSS memory 和内部 runtime 中仅供后置阶段使用的 `refreshRememberedCssSource` 兼容契约；remembered source 更新现在只保留按 source file 提交的生命周期 API。

将 Vite 普通 CSS asset 的 remembered source 匹配、scope 过滤、SFC snapshot 优先级和显式 root source 选择提取为独立 source plan，压缩 runtime 只负责提交构建图上下文并消费结构化结果。

Vite source plan 进一步接管 temporary CSS asset 的首次 fallback，并显式返回最终 output、非主 chunk 标记、temporary 命中状态和 configured source owner；runtime 不再重复修改 source 选择状态。

Vite CSS source plan 继续统一 scoped configured source、构建图与生命周期缓存推断、多入口 temporary source 以及匿名 CSS asset fallback，并显式区分 remembered source basedir 与 bundler source root。generateBundle runtime 只消费最终 source/output plan，不再维护嵌套来源选择分支。

Vite temporary CSS source 队列改由独立 planner 合并 runtime-linked、remembered、显式配置和分包 scope 来源，并保持原有 ownership 优先级与去重规则；generateBundle 不再自行拼接四组临时来源。

Vite root import shell 的识别、唯一生成目标推断和跨轮次复用改由纯 planner 返回结构化结果；generateBundle 只负责把明确的 target 写入 owner Map，不再在 CSS entry handler 内遍历配置来源和已处理产物猜测根样式归属。

Vite CSS asset 的初始 output、root shell 复用、`originalFileNames` configured entry 匹配和 matched source resolver 统一由 `CssAssetOutputPlan` 计算；后续 source composition 共享同一个输出归属结果，避免 handler 内重复改写 output identity。

Vite CSS source composition 改由独立 planner 合并 remembered fragments、选择 generator source、计算用户 layer、configured entry、root injection 与 handler options，并以结构化副作用意图返回 root shell target 和 configured source owner；generateBundle 不再直接维护这组嵌套状态。

Vite CSS asset identity 改为优先依据 Rollup `originalFileNames`、真实 generator placeholder source 和生命周期 processed source 生成结构化 kind；generateBundle 不再直接搜索 placeholder 文本，旧 marker 识别仅保留在 port 兼容 resolver。

Vite CSS transform 的 processed asset 复用、generator runtime 跟踪、last result replay 与缓存签名改由纯 decision/cache planner 统一计算；generateBundle 不再内联维护候选变化、stale CSS、runtime-linked source 和 cache key 的交叉判断。

Vite 的 Tailwind generation、Web passthrough、mini-program import shell 与普通 style handler 改由结构化 CSS transform task 执行并返回 kind、classSet、dependencies 和 CSS；generateBundle 只消费结果登记候选、依赖与产物，不再内联四条转换分支。

Vite CSS transform result 的依赖监听、classSet 合并、source diff、普通 CSS 记录与 pipeline injection 统一由 application 边界执行；transform task 不再直接修改 runtime 或 bundler port 状态。

Vite CSS process cache、shared transform cache、last result 与 remembered source 写回统一由 cache task/application 负责；generateBundle 不再直接调用 `processCachedTask` 或维护缓存命中分支。
