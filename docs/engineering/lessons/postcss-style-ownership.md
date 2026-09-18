---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1216
baseline: 821f4dd4bea8c8b9426248ed56d5bb2717a6c821
regressions:
  - packages/postcss/test/tailwind-v4-user-css.test.ts
  - packages/postcss/test/style-transform-ownership.test.ts
  - packages/postcss/test/processed-css-transforms.test.ts
  - packages/postcss/test/webpack-css-transforms.test.ts
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
| 主包 | 平台与选项判断、bundle 遍历、产物写回、模块及文件身份、SFC 提取、运行时 classSet 策略 |

主包保留原导入路径的 facade。reference/import 由主包提供路径解析回调，PostCSS 包只处理声明；构建插件仍通过 bundle/loader 等原有 API 返回结果。没有新增产物阶段源码读取或输出目录写入。

性能调整限定在可以证明输出等价的路径：

- apply 源码的选择器与规则性质在一次解析中得到；scoped apply 过滤复用输出 Root。
- 同一规则的作用域签名前缀按本次调用缓存，避免每个选择器重复计算声明体；不建立跨 HMR 的可变 AST 缓存。
- Vite 覆盖索引对每条规则只构造一次声明键；清理尾部 trace 注释复用 Root，保留原触发条件。
- Harmony 对生成规则建立只读索引，只在实际替换时克隆声明。500 个未命中规则的用例确认没有预先克隆；多次应用保持独立结果。
- loader 的 theme 厂商 keyframes 清理与既有 PostCSS 实现共用 Root 入口。
- Webpack preflight 复用选择器判断和已见属性集合，移除生成 layer 清理中完全相同的重复分支。

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

微基准基线为上述 SHA 中主包的 `generator-css/scoped-rules.ts`。提取旧实现到临时目录，仅将 PostCSS import 重定向到与新实现相同的运行时；已核对其余源码完全一致。使用 `pnpm exec tsx` 执行比较，先断言新旧输出相等，再各预热 20 次，交替执行 30 组采样，每组 10 次：

| 输入 | 旧实现中位耗时 | 新实现中位耗时 |
| --- | --- | --- |
| 15,840 字节，500 个选择器，每规则 30 条声明，scoped/unscoped 对照 | 16.30 ms | 7.02 ms |

热点耗时约降低 57%。此前同配置样本为 16.65 ms / 7.11 ms。该结果只证明此输入上的热点改善，不代表真实框架构建/HMR 或峰值内存已改善。持久 benchmark 入口为 `pnpm --filter @weapp-tailwindcss/postcss exec vitest bench test/tailwind-v4-user-css.bench.ts --run`。

## 适用边界

已迁移模块的架构测试约束主包不重新引入 AST 转换；它不是全仓迁移完成的证明。剩余审计包含：

- CSS source trace 的选择器提取与注释插入。
- Vite 入口指纹、source resolver 的 apply/reference 处理、运行时扫描中的 CSS 提取。
- 样式输出判断与 CSS 合法性检查中解析/平台职责的边界。
- 对所有字符串变换的审计，避免仅凭 parse/walk 搜索结果判定完成。
- 既有 PostCSS 模块与本次迁入函数的重复实现及导出面整理。
- 同配置的真实框架构建/HMR、峰值内存与对应 static 基线验证；全面全端验收必须先过当前会话环境预检。

本阶段没有执行真机或全端验收，也没有等待远端 CI。剩余工作未完成前，目标保持进行中。

## 规则评估

不新增 AGENTS 规则。已有 CSS 所有权与 bundler 生命周期规则足够；扩大架构回归覆盖已迁移模块，以代码约束落实边界。尚未迁移的旧实现继续列为待办，不通过放宽规则将其视为完成。
