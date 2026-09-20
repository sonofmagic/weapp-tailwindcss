---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss
baseline: 5e96fdc16ffe5a9c872ebb243e47372c2f2b09ed
regressions:
  - packages/source-scan/test/contract.test.ts
  - packages/engine/test/source-scan-contract.test.ts
  - packages/postcss/test/source-scan-contract.test.ts
  - packages/weapp-tailwindcss/test/tailwindcss/source-generation-contract.test.ts
  - packages/weapp-tailwindcss/test/ci/architecture-graph.test.ts
  - packages/weapp-tailwindcss/test/ci/architecture-package.test.ts
  - packages/weapp-tailwindcss/test/tailwindcss/engine-dispose.test.ts
  - packages/engine/test/v4.engine.test.ts
  - packages/cli/test/scan-watch.test.ts
  - packages/tailwindcss-config/test/reload.test.ts
---

# 来源扫描与架构边界重构

## 症状

核心经 bundlers/shared 消费入口发现和扫描缓存；PostCSS 聚合入口混合纯转换与插件编排。JS 模块图与 Babel 入口互相引用，PostCSS finalize、v4、theme-source 与 mini-program-css 聚合路径形成值循环。

多个入口分别维护 glob 与文件匹配，Windows 路径、绝对 glob、qxml 和配置变更出现差异。CLI 为获得扫描范围先编译，再调用生成器重复编译。旧引擎包装没有传递会话释放能力。

## 根因与纠正

新增 source-scan，仅维护路径身份、来源描述与策略；Oxide 枚举和候选提取留在 engine，CSS 指令解析留在 PostCSS，配置加载留在 tailwindcss-config。主包 project-sources 拥有入口发现与扫描缓存，旧内部路径保持兼容重导出。

PostCSS 提供 syntax、transform、plugin 子路径，原根入口保留。核心改用纯能力子路径；JS 源码分析下沉并注入 eval handler；PostCSS 内部改用叶子模块消除循环。

CLI 与 PostCSS 通过编译会话扫描，输出文件在扫描前排除。候选转换在验证前执行；删除候选时重建编译状态。配置每次加载独立 Jiti 并禁用缓存，CJS 强制转换，避免复用 native require 的旧对象。Tailwind 的绝对 config/plugin 请求转为相对请求，使用其依赖跟踪与失效协议；跨盘符路径保留绝对形式。

新增用例曾明确失败：POSIX glob 转义被误认为 Windows 分隔符，src 外桥接模块绕过架构检查，source-scan 可类型引用 engine，旧引擎缺少 dispose。修复后同一批用例通过。共享来源生成用例同时暴露并修复配置 content 更新和绝对 glob 排除差异。

## 验证

环境：Node 25.6.1、pnpm 12.4.1、Tailwind 4.3.3、Vitest 5.0.0、tsdown 0.23.0 / Rolldown 1.2.7。全部命令在独立 codex/architecture-responsibility worktree 执行。

通过：

- 七个受影响包的 build：source-scan、engine、postcss、tailwindcss-config、weapp-style-injector、weapp-tailwindcss、cli；执行 pnpm 的上述包过滤后 run build，包含 ESM、CJS 与声明产物。
- 根 `pnpm typecheck`，source-scan 与 engine 的包级 typecheck；真实 webpack-sources 对核心结构类型的兼容测试通过。
- `pnpm architecture:check`：34 个包、1209 个生产源码与声明文件，无值循环、生产包循环或核心反向依赖。
- 主包架构、发布入口、扫描、生成与缓存类型定向组 140 项通过；ESM/CJS 导出与产物依赖声明的 11 项包含在该组中。
- 引擎生成、会话与 style-generator 38 项通过；引擎扫描与模块路径定向组 40 项通过。
- source-scan 16 项通过；后续主包共享扫描与检查器 43 项、PostCSS 定向组 33 项、CLI 共享生成与 watch 6 项、构建器来源与 HMR 定向组 40 项通过。各批次有重叠，不累计为全仓测试数量。
- JS、compiler、generator 定向回归此前 532 项通过、2 项条件跳过；包导入配置路径的失败修复后，v4-engine 与缓存类型组 63 项通过。配置重载回归覆盖 CJS、MJS、TS。
- `CI=1 E2E_SKIP_OPEN_AUTOMATOR=1 pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/weapp-vite-tailwindcss-v4.test.ts -u`：5 项通过，重建 7 份 static 快照，与版本库基线无差异。相同命令改为 `--update=none` 后 5 项通过；包含分包隔离与非类名字符串保护。该环境变量只关闭此定向 static 流程的 IDE 自动打开，不代表设备验收。
- `CI=1 E2E_WEB_VITE_HMR_CASE='web react vite Tailwind v4' pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/web-vite-demo-hmr.test.ts --update=none`：2 项通过，同一服务中新增 108ms、替换 214ms、删除 214ms、回滚 3ms，使用真实浏览器检查。
- 修改文件 ESLint、`git diff --check`、`pnpm agents:check` 与 README 质量检查通过。

失败与已有债务：

- PostCSS 显式关闭 noCheck 的额外严格检查仍有 80 项错误。以基线源码和相同依赖对比，前后错误集合相同，无新增；包原配置使用 noCheck，不能将构建声明成功解释为该额外检查通过。
- Rolldown 1.2.7 在新增 syntax 与其他入口共同生成 CJS 时 panic。syntax 的 CJS 单独构建后 ESM/CJS 导入与构建通过，未禁用 treeshaking，未新增依赖 patch。升级 Rolldown 时可复查是否能合并构建。

阻塞：

`CI=1 pnpm e2e:preflight prepare` 返回非零，run ID 为 9660e4d9-a6aa-49ac-a89b-23efd52a9a16。原始 JSON、Markdown 和各探针日志保存在 e2e/.artifacts/preflight 下该 run ID 的目录。base 与 Web 探针通过，其余状态如下：

- 微信已尝试打开本轮临时探针，返回 APPID_ERROR（不存在此 AppID），自动化连接失败，未获得 IDE 截图。
- HBuilderX 返回 cli-instance-mismatch，CLI 报未检测到已打开实例。
- iOS 存在多个目标且未指定设备 ID；Android 无在线目标。
- Harmony 的 hdc 和默认 SDK 位置均返回 ENOENT。
- 设备探针失败后未进入当前会话 computer-use 验证；verify 与全面验收未运行。

恢复需要有效微信 AppID、就绪的 HBuilderX 实例、明确的 iOS/Android/Harmony 设备以及可执行的 hdc，再重新 prepare 并完成当前会话的 computer-use 证据。PR 保持 Draft。本轮预检失败后未继续产品测试；此前定向结果只证明对应范围。

## 适用边界

各历史 matcher 的空列表与纯排除列表约定保留，通过显式策略区分。等价策略复用同一套文件集合、类名与增量断言，不要求不同目标平台的 CSS 文本相同。

架构检查覆盖 packages 与 packages-runtime 生产源码、声明和包依赖；动态 import/require 仅处理静态可求值路径。路径常量按词法作用域解析；类型边参与分层检查但不参与值循环检查。本地源码范围外的引用报错，不能静默跳过。

跨盘符 config/plugin 保留绝对请求，未以 macOS 的模拟路径断言宣称 Windows 原生全链路通过。全端设备、IDE 和平台运行时验证必须单独记录。

## 规则评估

更新包级 AGENTS 说明职责、共享扫描契约与依赖方向，并为 source-scan 建立就近规则和索引。新增架构检查器及 PR 检查，优先用自动失败约束边界；没有放宽根规则或设备预检门禁。PR CI 构建范围补入 CLI，确保发布入口测试不依赖其他 shard 的构建副作用。
