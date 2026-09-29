---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1254
baseline: ad6e09cbc95bb6094d63ce2d616733cbf0e85cd0
regressions:
  - benchmark/performance/demo/test/evidence.test.mjs
  - benchmark/performance/demo/test/style-evidence.test.mjs
  - benchmark/performance/demo/test/process.test.mjs
  - benchmark/performance/demo/test/prepare-process.test.mjs
  - benchmark/performance/demo/test/prepare-environment.test.mjs
  - benchmark/performance/demo/test/css-values.test.mjs
  - benchmark/performance/demo/test/authored.test.mjs
  - benchmark/performance/demo/test/runtime-dependency.test.mjs
  - benchmark/performance/demo/test/install-consumers.test.mjs
  - benchmark/performance/demo/test/browser-state.test.mjs
  - benchmark/version-compare/test/pr-baseline.test.mjs
  - benchmark/performance/demo/test/watch-lifetime.test.mjs
  - benchmark/performance/demo/test/process-group.test.mjs
  - benchmark/performance/demo/test/precompile-script.test.mjs
  - benchmark/performance/demo/test/component-ready.test.mjs
---

# 发布版性能对照的隔离与失败证据

## 症状

构建命令成功不代表静态组与接入组等价。首轮 React Vite Web 对照遇到计算颜色不同；SFC 处理曾把嵌套模板和构建缓存当成源码。云端长安装任务中断后，日志已包含多轮测量，但报告仍停留在零样本的初始状态。

## 根因与纠正

- 独立消费项目不能照搬 workspace peer 快照，否则无关框架的可选 peer 会进入安装成本。固定共有直接依赖后独立解析，保存每组完整锁文件；发布包必须在消费目录内真实解析，校验版本及 integrity。
- 静态 CSS 必须使用被测发布版的 Web 兼容转换；仅使用生成器 CSS 会遗漏接入链路的转换。修正后重新生成全部操作状态，再执行计时验证。
- SFC 使用真实解析器定位模板、脚本和样式边界。静态扫描排除捕获构建生成的缓存，不能将缓存重放到其他对照组。
- Gulp 的真实捕获构建发现 `.cost/module.cjs` 被识别为包名；相对导入必须使用 `./.cost/module.cjs`。补充 POSIX、Windows 盘符和跨根目录回归，不能仅按字符串是否以点号开头判断。
- SCSS 中的 `@reference`／`@apply` 需要先通过消费项目的 Sass，再交给被测发布版生成器；静态输出仍需通过框架预处理器的语法验证。
- 保存到页面就绪必须同时核对本轮 marker、实际消费类名和计算样式；HMR 握手与文档重载单独记录。修改计划在计时前准备，实际原子保存仍计时。
- 每个样本在计时结束后保存报告，使用原子替换防止中断留下截断 JSON。合并明确标记中断；语义不稳定或版本错误的行显示 N/A，不进入开销排名。
- npm 解析失败或计划丢失时仍生成预期清单与失败报告，不重新解析 latest 冒充同一次实验。
- Windows 云端分片在删除消费项目时遇到已加载的 `lightningcss.node` 文件锁。准备阶段改为独立 Node 进程，序列化源码状态后等待进程退出，再进行安装与构建测量；`dispose()` 无法替代原生模块卸载，增加删除重试也不能修复进程边界。
- Taro CLI 动态设置 `TARO_ENV=h5`，缺少这个平台环境的预生成会采用不同的 `rpx` 兼容处理。捕获器仅保存平台变量白名单，静态生成在独立进程中重放并恢复；不复制 CI 凭据与外部模块搜索路径。
- 产物比较先统一确切相同的 RGB/十六进制颜色与数值序列化，再比较规则；原始语义快照仍保留。不得裁剪色域、四舍五入透明度或放宽页面计算尺寸校验。
- `style-injector-mpx` 的 Babel 配置使用默认 transform-runtime，需要直接声明 `@babel/runtime`。原仓库从其他项目间接获得该包，独立安装暴露了缺失；三组共用这个框架依赖，不计为接入专属成本。
- Webpack 样式注入器读取原始内容并输出资产，没有按 `.scss`／`.less` 扩展名运行预处理器。静态准备必须遵守实际适配器行为，不能凭扩展名增加 Sass/Less 依赖；Vite 启用预处理的分支仍执行真实编译。
- Mpx 作用域只给出样式 sidecar 时，静态组必须在已发现且归属唯一的页面组件中显式导入它。单独修改没有消费方的 CSS 文件不能代替原插件的产物注入；连接源码之后重新生成每个操作状态并验证连续更新。
- Taro `plugin-html@4.2.1` 的 `patchMappingElements` 在构建中改写已安装的 `runtime.js`，通过硬链接使准备 store 的对应内容失效。Linux 云端完成三组各 7 轮安装后，额外的离线恢复报 `ERR_PNPM_NO_OFFLINE_TARBALL`，继而让构建找不到 Taro。安装实验改为复制源码、manifest 与锁文件到独立目录，不复制 `node_modules`，不再删除和恢复用于构建的依赖；安装失败也不能污染后续阶段。
- Taro Vite 首次依赖预构建触发文档重载时，浏览器观察器不能继续等待旧文档的请求。成功的新主文档响应替换请求集合和 HMR 握手身份，失败导航及 hash/history 导航不重置；新文档请求、错误和握手仍必须逐项验证，超时原因记录实际请求 URL。
- PR Benchmark 运行 `36548103093` 的事件基准是 `887e16289`，实际 checkout 却是把 PR head 合入 `80b39395f` 的临时 merge。uni-app 的 RSS 回归经一次复测确认，但比较中包含其他 PR 的生产变化。基准改为经过 head 身份和祖先关系校验的实际 merge 第一父提交；直接 checkout head 时才使用事件基准。门槛不变，不能把错误比较对象导致的失败当成已排除的性能回归，仍需重新验收。
- Windows 增量安装的实际样本约 335–395 ms，逐次启动 PowerShell/WMI 查询会在任务退出后才返回，RSS 成为 null。Windows 改为在计时前初始化常驻采样器，通过系统进程快照按父子关系采集目标进程树；50 ms 采样间隔仍是峰值估计，不包含采样器自身。POSIX 继续使用 `ps`。每个系统在正式测量前执行短进程内存与超时清理回归；准备采样器的时间不计入安装或 dev 启动时间。
- 三组 watcher 同时驻留仍会产生后台监听与内存干扰，不能视作独立串行。Mpx 在这种模式下多次漏掉复位 marker，而单组连续 25 轮没有复现。诊断确认重新监听已完成，后续写入却没有对应的原生事件；尚不据此给 Node 或 Mpx 下最终根因结论。测量改为每组整批完成并关闭 watcher 后再启动下一组，每批仍保持同一进程和完整预热／采样；按分片轮换组次序，反向复测反转整批次序。真实语义与 marker 校验保持不变，串行生命周期有独立回归。

- macOS 云端短进程超时清理出现 `kill EPERM`。进程退出与再次发送组信号之间存在竞态；只有独立进程快照确认目标组没有存活成员时才忽略该错误。仍有成员、快照失败或无法解析均保留原始权限错误，不扩大信号范围或提权。历史失败缺少当时的进程快照，不能断言其根因已被证明，仍需当前提交的 macOS 云端回归确认。

- `6ef92ef` 的 Linux Taro 小程序分片安装全部通过，但静态组 CSS 为安全类名、TSX 仍为原类名。发布版 `5.5.11` 的 `transformJavaScript` 默认不启用 TSX，并将解析错误连同原文返回；准备工具只取 `.code`，丢失了失败信号。现在按文件扩展名或 SFC script 的 `lang` 传入解析选项，并强制检查返回错误。快照仍精确约束类名，不对集合外字符串兜底转换。
- 同轮支付宝原生组在 Taro `modifyBuildAssets` 中崩溃：平台插件写入新 `.browserslistrc` 时，Vite runner 直接读取不存在的 bundle 成员。最初怀疑空样式，读取实际调用链后排除；生产接入已提供专用兼容资产，但禁用整组插件也将它移除了。两种基线通过 bundler `emitFile` 保留这个普通框架资产，记录 `baselineCompatibility`，不加载生成器、不处理样式。真实 Rollup 生命周期回归验证资产在后续改写之前可用。

- Windows runner 的首个进程测试在 10 秒总期限内超时，后续四项通过。采样器本来允许 60 秒冷准备，测试却把它与 100 ms 的被测超时一起限制为 10 秒；失败日志未区分具体阶段，不能单凭该日志断言目标进程清理挂起。回归改为等待准备结束后，从 `session.startedAt` 独立断言超时及清理不超过 5 秒，外层期限容纳已有的准备上限。被测 timeout、性能预算和正式采样次数均不变。

## 验证

Windows 诊断运行 `36567931950` 的静态组已有本轮 marker、普通 CSS 与空请求队列，但缺少 `taro-view-core { display: block }`，接入组则已加载该样式。Taro `4.2.1` 的 Stencil 自定义元素在首轮渲染阶段挂载组件样式；仅检查 `document.complete` 与请求完成，会提前采到 `inline/auto` 布局。页面观察器对旧适配器等待 `componentOnReady()`；现代适配器没有该 API，必须核验元素已注册、组件声明的 CSS 已挂载在文档或 shadow root。初版只处理旧适配器，在后续入口审查中纠正，并用真实现代组件复现。检查不猜测应有的 `display`，单次等待有界，失败仍阻断。不能只检查 `hydrated` 类名，因为页面更新可以重新设置 class。每个 watcher 单独保存最后的完整样式与布局快照，避免后续进程覆盖证据。

组件就绪回归覆盖异步渲染、未注册、拒绝、超时清理、现代适配器与 shadow root；`CI=1 pnpm test:perf:demo` 共 57 项通过。使用真实 Chromium 与发布的 `@tarojs/components@4.2.1` 做两种适配器的隔离实验：旧适配器阻住懒加载模块，现代适配器阻住首轮渲染任务；均实测到 `inline`，释放后变成 `block`。现代组件明确没有 `componentOnReady()`，渲染前就绪检查失败、样式挂载后通过；不支持组件告警的 Taro 事件入口在最小实验中未启用。此实验不替代完整页面或云端验收，也不能单凭它断言此前作者 CSS 宽度异常已解决。

定向回归入口为 `pnpm test:perf:demo`，复用清单和产物检查的兼容回归为 `pnpm test:demo:matrix`。React Vite Web 在上述 baseline 提交已完成正常采样数的三组构建、启动和连续热更新，重新生成静态输入后语义验证通过。原始报告保留在本次任务的 `.tmp/demo-cost/formal-vite-committed`；本机结果不视为云端全矩阵验收，也不冻结预算。

Mpx 样式注入 demo 补齐依赖后，执行 `node scripts/ci/demo-matrix/run.mjs style-injector-mpx:wx --build-only --update` 重新生成 static 基线，内容未变化；再用相同命令去掉 `--update` 验证通过。该验证是定向产物验收，不包含 IDE／设备运行。

Mpx 正常采样数的本地运行在 `53b98f7e0` 上完成三组各 7 轮冷构建、热构建和启动验证；连续 HMR 在 16 轮之后的原生组发生漏更新并超时，原始样本和失败前源码／产物已保留，不能宣称 HMR 全量通过。

串行 watcher 的 Mpx 定向诊断完成三组、每类 2 轮预热和 20 轮连续更新，marker 与静态／接入样式等价检查通过；该诊断仅采样 1 轮启动，不能替代正式全阶段报告。进程组清理与串行生命周期加入持久回归，`CI=1 pnpm test:perf:demo` 共 51 项通过。

在 `6ef92ef` 上重新执行 `pnpm perf:demo:report --only style-injector-mpx:wx --phases build,hmr`，三组冷／热构建与启动各 7 轮、每类更新 20 轮全部通过，报告完整性错误为 0，并通过 `perf:demo:guard`。此前同提交的一批数据受本机合盖休眠污染，保留为失败报告；正常批次单独归档，不覆盖旧样本。Taro H5 本地定向准备因 npm 发布依赖下载超过 15 分钟失败，未进入计时阶段；不据此判断构建回归。

源码准备修复新增真实 Babel 语法和 Rollup 资产生命周期回归，`CI=1 pnpm test:perf:demo` 共 54 项通过。使用独立消费项目中已安装的发布版 `5.5.11` 复现默认 TSX 解析错误，修复后 `h-[64rpx]` 转为 `h-_b64rpx_B`，集合外 `unknown-[8px]` 保持不变。完整云端静态输入仍须在修复提交重新生成并逐状态验收。

## 适用边界

当前 React Vite Web 有正常采样数的定向实测证据；Gulp 的三组构建、启动与全部更新操作通过缩减采样诊断，另有 7 轮离线安装数据。完整 CLI 云端矩阵仍在验收，其他构建器及 style-injector 必须通过真实结果确认。IDE 和设备验收独立于云端 CLI；本记录不证明这些环境通过。尚未据此修改生产实现，也不能把单一 Vite 目标的模块加载 profile 外推为全仓根因。

## 规则评估

不新增 AGENTS 规则。现有发布依赖隔离、真实语义验证、失败证据和显式预算更新要求已经覆盖这些问题，优先通过持久回归落实。
