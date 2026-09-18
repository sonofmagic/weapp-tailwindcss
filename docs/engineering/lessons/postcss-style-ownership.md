---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1216
baseline: 821f4dd4bea8c8b9426248ed56d5bb2717a6c821
regressions:
  - packages/postcss/test/tailwind-directive-injection.test.ts
  - packages/postcss/test/native-compiler.test.ts
  - packages/postcss/test/tailwind-v4-user-css.test.ts
  - packages/postcss/test/style-transform-ownership.test.ts
  - packages/postcss/test/processed-css-transforms.test.ts
  - packages/postcss/test/webpack-css-transforms.test.ts
  - packages/postcss/test/css-source-trace.test.ts
  - packages/postcss/test/source-candidates.test.ts
  - packages/postcss/test/tailwind-source-analysis.test.ts
  - packages/postcss/test/rewrite-imports.test.ts
  - packages/postcss/test/css-entry-source.test.ts
  - packages/postcss/test/rpx-candidate-compat.test.ts
  - packages/weapp-tailwindcss/test/bundlers/css-entry-analysis.unit.test.ts
  - packages/weapp-tailwindcss/test/bundlers/tailwind-v4-source-analysis.unit.test.ts
  - packages/weapp-tailwindcss/test/ci/architecture-contract.test.ts
  - packages/weapp-tailwindcss/test/bundlers/generator-css.unit.test.ts
  - packages/weapp-tailwindcss/test/bundlers/vite-processed-css-assets.unit.test.ts
  - packages/weapp-tailwindcss/test/bundlers/webpack.v5.unit.test.ts
  - packages/weapp-tailwindcss/test/uni-app-x/style-reference-paths.test.ts
---

# 样式转换归属迁移与解析复用

## 症状

主包已经不再直接依赖 CSS parser，但仍通过 PostCSS re-export 实现样式转换。共享生成流程、Vite 产物处理、Webpack 兼容和 Harmony apply 混合了构建图编排与 CSS AST 操作，造成重复处理和边界难以检查。

本次重构从 rpx warning PR 的完成提交分出独立分支，不扩大原 PR 的交付承诺。这里记录阶段证据；全仓样式归属审计、真实构建/HMR 性能验证尚未完成。

## 根因与纠正

转换依赖来自 PostCSS 包，不等于转换实现归属已经收敛。迁移按数据边界拆分：

| 位置 | 负责内容 |
| --- | --- |
| PostCSS `compat/tailwindcss-v4/user-css/` | 作者层、生成标记、作用域去重、框架样式组合、指令处理 |
| PostCSS `compat/processed-css/` | import 清理与恢复、空 at-rule 清理、作者样式合并 |
| PostCSS `compat/scoped-css/` | 声明覆盖索引、scoped/preflight 判断与规则删除 |
| PostCSS `compat/webpack-css/` | 保持现有 Webpack 链路语义的 CSS 兼容策略，不依赖 Webpack API |
| PostCSS `compat/uni-app-x/` | Harmony apply 替换和 reference 声明改写 |
| PostCSS `source-scan/` | CSS 候选提取、inline 展开与入口指纹；配置文件名通过调用方回调取得 |
| PostCSS `syntax/` 与 `utils/css-source-trace.ts` | import 请求改写、CSS 合法性判断、源码追踪注释 |
| 主包 | 平台与选项判断、bundle 遍历、产物写回、模块及文件身份、SFC 提取、运行时 classSet 策略 |
| PostCSS `/native` | CSS 到原生样式规则转换，不处理 manifest ID 或运行时 |
| PostCSS `/experimental/lightningcss` | 实验 AST/选择器转换，不加载 LightningCSS 引擎，不从稳定入口导出 |
| injector | 配置、源文件过滤、WXML 依赖追踪；纯指令插入调用 PostCSS |

主包保留原导入路径的 facade。reference/import 由主包提供路径解析回调，PostCSS 包只处理声明；构建插件仍通过 bundle/loader 等原有 API 返回结果。没有新增产物阶段源码读取或输出目录写入。

性能调整限定在可以证明输出等价的路径：

- apply 源码的选择器与规则性质在一次解析中得到；scoped apply 过滤复用输出 Root。
- 同一规则的作用域签名前缀按本次调用缓存，避免每个选择器重复计算声明体；不建立跨 HMR 的可变 AST 缓存。
- Vite 覆盖索引对每条规则只构造一次声明键；清理尾部 trace 注释复用 Root，保留原触发条件。
- Harmony 对生成规则建立只读索引，只在实际替换时克隆声明。500 个未命中规则的用例确认没有预先克隆；多次应用保持独立结果。
- loader 的 theme 厂商 keyframes 清理与既有 PostCSS 实现共用 Root 入口。
- Webpack preflight 复用选择器判断和已见属性集合，移除生成 layer 清理中完全相同的重复分支。
- 运行时 apply 候选从两次解析缩减为一次，保留原有上下文判断、候选顺序与 important 处理；生成器仍沿用原来的 token 拆分语义。
- Vite 每次入口选择缓存本次源码分析，显式指令与指纹共享 Root，原始输出只解析一次。缓存不跨调用，源码更新后的入口选择有独立回归。
- 删除主包重复的 inline-source 展开、config/source 参数解析和 config 指令组装；复用已有 PostCSS 实现。source-scan 的文件、glob、符号链接规则仍留在主包，没有用较旧的 PostCSS 扫描副本覆盖它们。
- import 改写统一接收解析回调，主包保留包位置和文件路径计算。替换字符串使用函数，确保文件名中的美元符号不会被当成 replacement 模板展开。
- 入口扫描的依赖签名和缓存 miss 解析共用一次 CSS 分析。先只读 config 请求，实际需要扫描时才计算 source/inline 信息，避免缓存命中与 config-only 查询额外展开候选。配置文件变化仍参与缓存键，没有跨 HMR 保存 AST。
- Vite/Webpack 的 config 请求改写共用回调入口；rpx 长度候选兼容、选择器恢复、生成标记片段替换和行尾空白清理由 PostCSS 实现。主包保留目标 classSet 的生成策略和模块身份匹配。

迁移时发现两个不能直接合并的边界：空白 CSS 与纯注释 CSS 的返回语义不同；trace 注释清理带有既有文本触发条件。均保留原行为。此次不顺带重写历史 fallback 正则或扩大启发式匹配。

## 验证

迁移前运行对应定向回归，迁移后扩大到共享生成、Vite、Webpack、Harmony 和 v4 引擎：

- `CI=1 pnpm --filter @weapp-tailwindcss/postcss test --update=none`：84 文件，824 通过，3 个既有用例跳过。
- `CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/bundlers/shared/generator-css test/bundlers/generator-css.unit.test.ts test/bundlers/generator-css-class-selectors.unit.test.ts test/bundlers/framework-css-composition.unit.test.ts test/bundlers/rpx-theme-warning.integration.test.ts test/bundlers/vite-processed-css-assets.unit.test.ts test/bundlers/uni-app-x-web-runtime-cleanup.test.ts test/bundlers/vite-css-output-imports.test.ts test/bundlers/runtime-classset-loader.test.ts test/bundlers/webpack.v5.unit.test.ts test/uni-app-x/style-asset.test.ts test/uni-app-x/style-reference-paths.test.ts test/uni-app-x/harmony-scss-comments.test.ts test/tailwindcss/v4-source-options.test.ts test/tailwindcss/v4-engine.test.ts test/ci/architecture-contract.test.ts --update=none`：25 文件，659 通过。
- `pnpm --filter @weapp-tailwindcss/postcss build` 和 `pnpm --filter weapp-tailwindcss build`：JS 与声明构建通过，保留既有 mixed exports 警告。
- 新增内存输入回归，没有修改 demo、IDE 复现页或 static fixture；没有更新输出快照。
- 新 benchmark 初次使用旧版顶层 `bench` 导出失败，已按当前 Vitest 5 的 test context `bench(...).run()` 修正。
- 持久 benchmark 入口修正后 2 项通过；`pnpm agents:check` 为 0 errors，`pnpm release status` 确认两包中文 patch intent，`git diff --check` 通过。
- 最后的 Webpack 简化再次运行 loader/资产回归：186 通过，PostCSS 定向用例 4 通过，PostCSS 构建通过。

后续源码分析迁移的验证：

- `CI=1 pnpm --filter @weapp-tailwindcss/postcss test --update=none`：88 文件，849 通过、3 个既有跳过。最后补充 config 与 CSS 合法性入口后，`test/tailwind-source-analysis.test.ts` 的 12 项通过。
- `CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/bundlers/css-source-trace.unit.test.ts test/bundlers/generator-css-candidates.unit.test.ts test/tailwindcss/runtime-factory.unit.test.ts test/tailwindcss/v4/runtime-factory.test.ts test/tailwindcss/v4/runtime-factory.integration.test.ts test/ci/architecture-contract.test.ts test/bundlers/tailwind-v4-source-analysis.unit.test.ts test/bundlers/vite-helpers.unit.test.ts test/bundlers/shared/generator-css test/uni-app-x/style-asset.test.ts test/uni-app-x/harmony-scss-comments.test.ts test/bundlers/css-imports.test.ts test/tailwindcss/v4-source-options.test.ts test/tailwindcss/v4-source-package-resolution.test.ts test/tailwindcss/v4-engine.test.ts test/tailwindcss/source-scan.unit.test.ts test/tailwindcss/source-scan-path-identity.test.ts --update=none`：26 文件，319 通过。
- 最后复用 config/source 参数后，`CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/tailwindcss/source-scan.unit.test.ts test/tailwindcss/source-scan-path-identity.test.ts test/bundlers/vite-source-scan-css-entries.test.ts test/bundlers/vite-css-output-imports.test.ts test/bundlers/generator-css.unit.test.ts test/ci/architecture-contract.test.ts --update=none`：6 文件，203 通过。
- 新用例直接覆盖非法 CSS、无上下文候选、1000 条 apply 的完整扫描、注释幂等、Windows/POSIX 请求、插件选项指纹变化及 HMR 调用间不复用旧分析；没有修改 static fixture。
- 两包 JS 与类型构建再次通过，迁移源码 ESLint 通过；`pnpm agents:check` 检查 48 个规则、41 份文档、309 个命令入口，0 errors，`git diff --check` 通过。

入口扫描缓存与剩余字符串变换：

- 新增 `test/bundlers/css-entry-analysis.unit.test.ts` 先在迁移前失败：首次入口扫描实际解析 2 次，预期 1 次。迁移后通过，并验证同源码缓存命中、配置内容变化后的新结果。
- `CI=1 pnpm --filter @weapp-tailwindcss/postcss test --update=none`：90 文件，858 通过、3 个既有跳过。最后补充模块片段和行尾空白清理后，`test/rpx-candidate-compat.test.ts` 的 5 项通过。
- `CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/bundlers/css-entry-analysis.unit.test.ts test/bundlers/vite-source-scan-css-entries.test.ts test/bundlers/vite-source-scan.unit.test.ts test/tailwindcss/source-scan.unit.test.ts test/tailwindcss/source-scan-path-identity.test.ts test/ci/architecture-contract.test.ts test/bundlers/css-imports.test.ts test/bundlers/vite-helpers.unit.test.ts test/bundlers/generator-css.unit.test.ts test/tailwindcss/v4-engine.test.ts --update=none`：10 文件，316 通过。
- `CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/bundlers/webpack.v5.unit.test.ts test/ci/architecture-contract.test.ts --update=none`：2 文件，173 通过。
- `CI=1 pnpm --filter weapp-tailwindcss exec vitest run test/bundlers/vite-plugin.bundle.unit.test.ts --update=none`：1 文件，210 通过。两包构建和声明检查通过。

微基准基线为上述 SHA 中主包的 `generator-css/scoped-rules.ts`。提取旧实现到临时目录，仅将 PostCSS import 重定向到与新实现相同的运行时；已核对其余源码完全一致。使用 `pnpm exec tsx` 执行比较，先断言新旧输出相等，再各预热 20 次，交替执行 30 组采样，每组 10 次：

| 输入 | 旧实现中位耗时 | 新实现中位耗时 |
| --- | --- | --- |
| 15,840 字节，500 个选择器，每规则 30 条声明，scoped/unscoped 对照 | 16.30 ms | 7.02 ms |

热点耗时约降低 57%。此前同配置样本为 16.65 ms / 7.11 ms。该结果只证明此输入上的热点改善，不代表真实框架构建/HMR 或峰值内存已改善。持久 benchmark 入口为 `pnpm --filter @weapp-tailwindcss/postcss exec vitest bench test/tailwind-v4-user-css.bench.ts --run`。

## 适用边界

进一步审计了主包剩余的 parse/walk，保留以下编排操作：

| 入口 | 保留原因 |
| --- | --- |
| `compiler/artifact.ts` | 将输入转换为带来源、顺序和 scope 的 fragment，并克隆 artifact；不执行 CSS 兼容转换 |
| `tailwindcss/source-scan.ts` | 从 Root 读取 source 后调用文件/glob 解析；CSS 参数解析已共用 PostCSS |
| `v4-engine/source.ts` | 读取本地 import 图、配置文件身份与缓存，主题分析调用 PostCSS |
| `generator/css-compat.ts` | 按 import 解析已安装 theme 文件；主题插入和转换调用 PostCSS |
| `generator/scan-sources.ts` | 读取 source 指令并解析项目根与候选扫描范围 |
| `generator-css/source-files.ts` | SFC 与本地样式依赖扫描，文件身份和解析策略留在扫描层 |
| `configured-css-entry-observer.ts` | 记录模块/import 是否进入 Vite 构建图，管理诊断生命周期 |
| `root-style-output.ts`、`entry-style-graph.ts` | 读取产物 import 边、检测环，并通过 bundle asset 组装引用 |
| `generator-css/pipeline.ts` | 每次调用创建共享 Root，串联 PostCSS 转换与 Tailwind 生成 |
| Webpack `memory-trace.ts` | 只读观测是否包含 preflight，服务内存诊断 |
| uni-app x `vite.ts` | 对已变换文本生成 sourcemap，没有额外 CSS 处理插件 |

非 AST 搜索还检查了 source-resolver、uni-app x 和 v4 source 相关字符串处理。剩余操作用于模块 query/路径、SFC/模板类名、alias 对应的 apply 输入组装、产物引用和 fallback theme 数据。它们不拥有 CSS parser 或样式兼容变换。CLI 调用 LightningCSS 的优化/map API 属于外部编译器编排，没有自定义 AST visitor；实验入口同样保留引擎加载，visitor 实现已迁移。独立 `postcss-calc` 是 PostCSS 依赖的计算器，不反向依赖主包；不能机械搬回造成循环依赖。

私有 `test-helper` 使用官方编译器建立测试对照，theme-transition 的 scripts 只生成测试/开发资产；这些不是生产 CSS 管线，本轮没有把测试对照改成调用被测转换。它们仍有测试辅助用的注释删除或声明拼装，因此不能把本轮描述为“仓库内任何 CSS 操作均只剩一个目录”。

PostCSS 内部已共用 apply 选择器分析和 specificity placeholder 归一化。generator 的精确筛选与 v4 的后缀筛选、注释处理保持不同。根入口兼容导出集中到 compat barrel，构建前后 328 个运行时导出完全一致；native 与实验子入口保持隔离。

本轮额外验证：injector 迁移前后 29 项均通过，LightningCSS 对照 20 项均通过且快照未更新；新增指令锚点、顺序和幂等回归 3 项通过，架构回归 7 项通过。两包 JS/声明构建通过；injector 的声明构建曾输出非致命 emit 提示，最终声明文件存在。PostCSS 扩大回归首次因新测试重复转义 specificity placeholder 失败（867 通过、1 失败、3 跳过）；修正测试输入后该文件 5 项通过。没有放宽实现或更新快照。

最终 PostCSS 回归为 92 文件、868 通过、3 个既有跳过；主包 generator、rpx warning、v4 engine 与架构定向回归为 14 文件、338 通过。PostCSS JS/声明构建和 ESLint 通过。规则检查为 48 个规则、41 份文档、310 个命令入口、0 errors，repoctl 已识别五个直接受影响公开包的中文 patch intent。

React Native 的 CSS 到样式对象转换已迁入独立 `/native` 子入口。Native 包继续持有 manifest ID、Babel/Metro 和运行时接口。迁移前后 `CI=1 pnpm --filter @weapp-tailwindcss/react-native test --update=none` 均为 5 文件、36 通过；`CI=1 pnpm --filter @weapp-tailwindcss/postcss exec vitest run test/native-compiler.test.ts --update=none` 为 4 通过，覆盖精确类名、important/顺序、告警和调用间独立性。两包构建及类型生成通过；架构回归为 6 通过，新增浏览器 bundle 依赖闭包检查，确认 runtime 仅包含自身代码、无编译依赖。

已迁移模块的架构测试约束主包不重新引入 AST 转换；它不是全仓迁移完成的证明。剩余审计包含：

- 保留在主包的 parse/walk 需要逐项确认属于读取 import、依赖图或 artifact 编排；仅搜索数量减少不能证明边界正确。
- 对所有字符串变换的审计，避免仅凭 parse/walk 搜索结果判定完成。
- 既有 PostCSS 模块与本次迁入函数的重复实现及导出面整理。
- 同配置的真实框架构建/HMR、峰值内存与对应 static 基线验证；全面全端验收必须先过当前会话环境预检。

本阶段没有执行真机或全端验收，也没有等待远端 CI。剩余工作未完成前，目标保持进行中。

## 规则评估

不新增 AGENTS 规则。已有 CSS 所有权与 bundler 生命周期规则足够；扩大架构回归覆盖已迁移模块，以代码约束落实边界。尚未迁移的旧实现继续列为待办，不通过放宽规则将其视为完成。
