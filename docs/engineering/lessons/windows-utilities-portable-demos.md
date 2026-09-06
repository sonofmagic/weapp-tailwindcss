---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/issues/1159
baseline: e8da4351f9580910945e2a2e66a375f7a87e8e0d
regressions:
  - packages/weapp-tailwindcss/test/tailwindcss/v4-import-paths.test.ts
  - packages/weapp-tailwindcss/test/bundlers/css-imports.test.ts
  - packages/weapp-tailwindcss/test/bundlers/runtime-classset-loader.test.ts
  - packages/weapp-tailwindcss/test/bundlers/vite-css-output-imports.test.ts
  - packages/weapp-style-injector/test/index.test.ts
  - scripts/ci/demo-matrix/matrix.test.mjs
  - packages/weapp-tailwindcss/test/bundlers/vite-plugin.template-delete-watch.test.ts
  - packages/weapp-tailwindcss/test/bundlers/vite-serve-mini-target.integration.test.ts
  - packages/weapp-tailwindcss/test/tailwindcss/source-scan-path-identity.test.ts
  - scripts/ci/demo-matrix/browser.test.mjs
  - packages/weapp-tailwindcss/test/bundlers/webpack-discarded-css.integration.test.ts
  - packages/weapp-tailwindcss/test/bundlers/webpack-watch-output.test.ts
  - scripts/ci/demo-matrix/output.test.mjs
---

# Windows 标准 utility 缺失与 demo 跨系统验收

## 症状

用户在 Windows、weapp-tailwindcss 5.5.0/5.5.1 默认配置下发现标准 utility 与 `--spacing` 消失，任意值和透明色仍存在。恢复相同模板、pnpm 11.25.0 与冻结锁文件仍复现。扩展其他 demo 后，又观察到百度小程序样式重放失败、独立生成样式未被入口引用、Web CSS 加载与更新失败，以及 RN CLI 返回成功但只有空模块的 bundle。

## 根因与纠正

最初缺陷在 weapp-tailwindcss 本地 v4 engine：CSS import 序列化转义了 Windows 反斜杠，扫描器在未解码 CSS 字符串时判断入口，关闭默认扫描。Webpack 特殊候选补充解释了任意值和透明色为何仍生成。修复使用 CSS tokenizer，并只在写 CSS 的边界转换路径。没有证据表明该缺陷属于上游 tailwindcss-mangle/engine，因此没有为此创建上游修复 PR。

扩展验收将源码候选、CSS 与 JS loader 输出、模块来源、bundle 文件身份和页面消费逐层关联。Webpack 不再把 css-loader 或 extraction 生成的 JS 注册为 CSS；Rspack 保留静态 loader 的生成选项；Vite 根据产物身份保留框架重命名和重放关系，并从入口 chunk 的 modules 关联独立样式，检测重复引用和循环；uni 样式注入缓存按构建轮次刷新。

RN 的“非空 bundle”判断不充分，9 KB 的 Metro 启动代码也会通过。默认 Metro 配置覆盖 Taro transformer 后，入口占位文件没有生成应用。修正合并顺序后还发现空 blockList 被 Metro 编译为匹配所有文件的正则，共享空入口的转换缓存还会跨 demo 复用其他项目的页面清单。修复配置顺序、空过滤器与项目缓存身份，并按现有 catalog 补齐分包 RN demo 缺失的运行时依赖后，验收要求实际应用注册和原生页面探针进入同一 bundle。此前仅凭非空产物得到的 RN 成功结论作废，不作为交付证据。

样式注入 Taro demo 的子包路由修正为实际文件位置，补齐 Web HTML 启动模板。没有用手写 spacing、safelist 或官方 Tailwind 插件掩盖生成问题。

扩展 CI 暴露了 main 中删除模板测试的假通过：重建将 `app.css` 的旧规则移到 `app.wxss`，原测试仅检查前者。保留真实产物后缀后，测试揭示 watch 首轮结束过早释放源码归属、源码键与产物键混用，以及符号链接目录下文件删除前后的 realpath 身份变化。现在产物候选同时保存输出键和源码归属，显式删除只清除对应产物；watch 关系存活到 watcher 关闭；不存在的路径沿现存父目录解析。运行时集合也在移除旧候选前剔除上轮来源，避免把删除的候选重新当作基线。回归同时检查全部样式产物与模板实际类名，覆盖默认扫描和显式 source、axml 和 qxml。

Generic Vite 的小程序目标在 serve 时没有 generateBundle 收尾，不能推迟 CSS 适配；新增任意值的 JS 也必须使用当前模块经生成器验证的集合。真实服务回归确认首编译和新增后的 CSS/JS 一致，并保留业务字符串不被转译的断言。quickapp 的 qxml 补入模板、扫描和候选识别。SSR 探针等待首屏依赖请求结束后才修改源码，避免依赖预构建尚未完成时就把传输连接成功当作可更新状态。

浏览器启动验收把导航和探针等待放在同一重试循环，会每隔五秒重启尚未完成初始化的页面；带 hash 的重复导航还可能返回空响应。现在成功导航后只轮询探针与网络就绪，用延迟六秒初始化的真实 Vite 页面验证不会再次导航。失败时同时保存 DOM、浏览器事件和截图，后续 Windows 运行继续验证这一改动对实际 Taro demo 的效果。

Linux 干净安装发现上游 UTS 原生包将 libc 标记为 `gnu`，pnpm 11 按 `glibc` 筛选而跳过该可选依赖。仓库 pnpm readPackage 钩子仅纠正此包的错误元数据，锁文件记录 glibc 与钩子校验值，不改变包版本或完整性。uni-app x 的诊断包同时加入 CI 构建入口，避免本机已有 dist 掩盖干净构建缺失。Windows 的 Taro Harmony hybrid 基线发现 demo 的 designWidth 路径正则只匹配双反斜杠，导致同一页面使用不同设计尺寸；改用 path API 比较目录身份。

Release Gate 的 Docusaurus SSR 构建还暴露了无 PostCSS loader 的 SCSS 链路：生成 loader 被放到 Sass 编译之前，CSS parser 遇到 `//` 注释报错。插入位置现在优先使用 PostCSS/css-loader 的 CSS 消费边界，否则使用 Sass/Less/Stylus 的输出边界。真实 Webpack 回归必须加载已构建插件，因为直接导入源码时相邻 loader 产物不存在，可能未注入 loader 而假通过。回归同时覆盖 CSS 正常输出与 SSR 丢弃输出，修复前已复现同一解析错误，修复后 170 项 Webpack 回归及 Docusaurus 英文生产构建通过。

## 验证

扩展矩阵提交 `59e552e01` 的 Windows 分包 Taro H5 在初始样式通过后停于替换轮次，浏览器报 HMR `apply() is only allowed in ready status (state: prepare)`，日志持续重复编译。只读匹配实验发现输出目录忽略规则存在另一处边界错误：Watchpack 将待检查的 Windows 路径转为正斜杠，但插件把原始反斜杠路径传作 glob，因此输出文件匹配结果为 false；POSIX 路径含 `[]` 也被误解释。真实 Watchpack 回归在修复前有五项失败，修复后按字面目录包含关系排除产物，同时保留用户忽略规则、盘符大小写和 UNC 语义。此问题与最初 CSS import 缺陷不同，均属于本仓库路径边界。最终 Windows H5 连续更新证据仍须由后续提交验收确认，不能仅凭本地匹配测试宣布修复成功。

原始修复提交 `de58576bada6a50976883c173fec61c0a21dd911` 的 [Windows Node 22/24 与 Ubuntu 专项](https://github.com/sonofmagic/weapp-tailwindcss/actions/runs/34023069668) 已通过；Windows 先复现发布版 5.5.1 缺失，再验证修复包恢复全部规则。该运行不代表扩展矩阵通过。

扩展前同步 main `4f914160e40df93900469f91a0c5ab1235c22b8d`，保留用户工作区。本地执行 `pnpm build:ci`，Vite/Rspack/loader/import 定向回归 279 项通过，样式注入 89 项通过。全部目标使用 [统一运行器](../../../scripts/ci/demo-matrix/README.md) 生成生产语义基线并验收正常 dev、替换、新增、删除、Web 刷新；原生与 WebView 按声明边界验收。当前文档保持 partial，待本次提交的三系统 CI 证据完成后更新。

扩展 CI 失败后的定向复验：六个 Vite/plugin/source 套件 255 项通过，源码候选 32 项通过，默认/显式扫描与 axml/qxml 删除模板 4 项通过，矩阵及真实浏览器等待 9 项通过。`pnpm build:ci`、`pnpm lint`、`pnpm agents:check` 和冻结安装通过。Taro React 两种构建器的对应基线已限定项目重新生成，无语义差异；随后正常模式复验微信、Harmony hybrid、React/Vue Vite 小程序与分包 Taro H5 全部通过，没有使用更新参数。

core smoke 的旧样式注入断言已按当前源码同步：检查 SCSS/Less 的实际颜色与 Taro 的页面路由，Mpx/uni 和 Taro 相关目标分别定向复验通过。Vite 增量单测的空 CSS mock 改为有效声明，避免正常 CSS 优化删除空规则导致假失败，29 项回归通过。

## 适用边界

提交 `7a6f922e5` 的 Windows 分包 Taro H5 完整轮次通过，但后续 `4e2ae96ab` 再次出现替换后重复编译，不能据一次通过认定 HMR 问题解决。Watchpack 字面路径错误有独立失败回归，仍保留该修复；新增 watchRun 依赖变更诊断与 Windows 连续三轮定向工作流，继续定位剩余触发源。该定向流程只用于诊断，不能替代全量 PR Gate。

`7a6f922e5` 的 macOS issue-1144 uni-app x 生产基线只有一个差异：探针规则均为相同内联值，但 CSS 额外保留了未引用的 `--spacing: .25rem`。原比较器收集全部主题变量，将与探针无关的声明当成语义差异。修正后只在探针引用 `var(--spacing)` 时记录并强制要求定义；内联规则继续逐项检查存在性、属性值和间距倍数。回归先复现旧比较器误报，再同时证明缺失变量、缺失 utility 和错误内联倍数仍失败。完整产物保留原始声明，语义基线不再依赖优化器是否清理未使用的主题元数据。

28 个 demo 登记 107 个 CLI 组合。Node 24 全量覆盖 Windows/macOS/Linux，Node 22 覆盖关键集成。保持 RN/native disabled 边界；构建证据不能替代设备、原生桥接和 HBuilderX IDE。uni-app-x-vapor 没有可移植 CLI，仅列出限制，不伪造通过。

## 规则评估

不新增 AGENTS 规则。现有路径边界、构建图、真实消费和连续更新要求已覆盖本问题，新增可执行门禁保证清单完整、阶段执行与提交身份，防止日志退出码或旧产物再次形成错误结论。
