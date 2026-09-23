---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/issues/1214
baseline: f13230380e8474011ac752d578440b4d1d15caf9
regressions:
  - packages/postcss/test/calc-static-context.test.ts
  - packages/weapp-tailwindcss/test/tailwindcss/v4-calc-context.test.ts
  - packages/weapp-tailwindcss/test/tailwindcss/v4-engine-calc-cache.test.ts
  - e2e/issue-1214-rpx-calc.test.ts
  - e2e/issue-1214-rpx-calc-watch.test.ts
  - e2e/issue-1214-author-css-watch.test.ts
  - e2e/issue-1214-ide.test.ts
  - packages/postcss/test/calc-plugin-lifecycle.test.ts
  - packages/weapp-tailwindcss/test/bundlers/vite-web-css-calc-units.integration.test.ts
  - e2e/demo-workflow-quality.test.ts
---

# Issue #1214：静态变量必须保留作用域和输出上下文

## 症状

#1234 合并后，单来源固定主题能够输出静态 `rpx`，但仍不能认定问题全面闭环。以本记录基线运行真实生成器：

- `:root { --spacing: 1rpx } .compact { --spacing: 2rpx }` 使普通 `.w-32` 也生成 `64rpx`，条件规则有同样问题。
- 两来源分别使用 `1rpx` 和 `2rpx` 时，eager/deferred 的同一工具类分别得到 `32rpx`、`64rpx`；哪个常量正确取决于最终 CSS 的作用域，不能仅依据单来源结果判断。
- 同一生成器的显式 Map 从 `1rpx` 改为 `2rpx`、正则白名单换成其他变量后，仍命中旧 CSS。
- 新增 `[--spacing:2rpx]` 候选后，仅追加新规则，旧 `w-32` 仍被冻结为 `32rpx`。

基线真实 uni-app 微信生产构建的局部覆盖和媒体条件覆盖也失败；固定、默认关闭等七项构建通过。这说明既有通过用例没有证明动态主题安全。

## 根因与纠正

旧收集器忽略选择器、条件和层叠，把所有声明压成最后写入优先的 Map。生成结果合并继续丢弃来源，而缓存把 Map 和 RegExp 都序列化成 `{}`。此外，`cssCalc` 隐式开启 preset-env 的全局变量展开，末端清理器又可能删除合法的运行时声明，绕过 calc 白名单。

纠正方式：

- 通用安全分析归 PostCSS 所有，使用有效主题和原始声明判断静态变量；局部覆盖、条件、来源冲突、未知值及依赖链不被强制替换。
- 保留原始上下文，区分显式值与推导声明。合并同一输出时重新判断完整级联，不能简单地各来源先算完再拼接；独立输出不共享上下文。
- 完整和增量生成采用同一规则；新增候选改变变量安全性时重算旧规则，配置变化进入全部相关缓存签名。
- Vite 先保留表达式，在最终 CSS 产物图中按入口、静态导入和 CSS 导入计算共享作用域，之后再执行单位转换。watch 只对实际复用的资产对象恢复原始表达式，不把新产物中的同值常量误认为缓存。原生 App 的嵌入样式保留即时处理。
- 作者 PostCSS 插件先完成全部 visitor，再分析 calc 上下文；单独 `.tw-root`、`:host` 和大小写不同的 `@property` 不得绕过安全判断。
- 移除 `cssCalc` 隐式开启的全局变量展开及启发式原声明删除；保持用户显式 preset-env 配置和 `preserve: true` 的独立语义。
- 可选 `--quality` 把质量检查和本地 demo 多端测试放在同一个真实预检会话内，缺证或失败即停止。
- 真实 watch 进一步发现普通作者 CSS 没有进入小程序任务缓存签名，删除覆盖后仍输出旧声明；现在缓存包含本轮完整 bundle 原文，普通兼容处理结果也不能登记为生成来源。导入关系变化由实际模块图驱动。

## 验证

定向命令均使用 `CI=1`；正常验证使用 `--update=none`。本次 static 基线来自真实 uni-app 构建，更新仅限 #1214 用例，更新后再执行不更新验证。局部、条件及独立作者 CSS 的基线保留 `calc(var(--spacing)*N)`；未解析的别名继续保留 `--spacing: var(--runtime-spacing)`，不提前将工具类改成内部依赖名。

```bash
pnpm --filter weapp-tailwindcss exec vitest run test/tailwindcss/v4-calc-context.test.ts test/tailwindcss/v4-engine-calc-cache.test.ts test/tailwindcss/v4-engine-css-calc.test.ts test/tailwindcss/v4-style-context.test.ts --update=none
pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/issue-1214-rpx-calc.test.ts e2e/issue-1214-rpx-calc-watch.test.ts --update=none
pnpm exec vitest run -c e2e/vitest.e2e.config.ts e2e/demo-workflow-quality.test.ts e2e/preflight-gate.test.ts --update=none
```

真实构建使用本工作树的 `weapp-tailwindcss` 产物：uni-app `3.0.0-5020620260917001`（Compiler 5.26 vue3）、Tailwind CSS 4.3.3、Vite 5.2.8、Vue 3.5.43、Node 24.18.0、pnpm 12.5.1。固定 `1/2/3/8rpx` 与小数、负值通过。watch 覆盖同一服务中初始输出、主题修改、类名删除与重新添加；另一同进程用例覆盖作者 CSS 未导入、加入导入、移除覆盖、恢复覆盖、删除导入、重建导入、再次移除覆盖七阶段，生成基线后不更新复验通过。逐声明排除旧值，不同产物中的同值重复不当成陈旧样式。

全面验收入口为 `pnpm e2e:demo:workflow:local --quality --preflight-report <本轮-report.json>`，`e2e:ide:full` 显式包含 #1214 尺寸探针。初次 browser discovery 的 `Codex auth token is unavailable` 已恢复，后续完成真实 computer use 六步操作。预检另发现 HBuilderX 中文未启动提示被误判为 host，已补回归修复；Alpha CLI 与活动稳定版实例不匹配后，重新固定稳定版 5.26。Pura、Pixel_5、iPhone 17 Pro 的脚本探针和真实 computer use 在新一轮预检全部通过。

首次全面工作流的 `pnpm build` 为 68/68 任务成功、0 缓存命中。根脚本沿用跳过交互式 Taro/uni 构建的设置；这个汇总不能代替对应 demo 的实际构建或设备验收。随后工作流把内存报告写进未忽略目录，门禁正确识别为源码变化并阻断后续阶段。报告已迁入 `e2e/.artifacts/demo-e2e-memory/`，新增真实临时 Git 仓库回归，证明反复写报告不改变源码身份，而修改源码仍会被检测；41 项报告、矩阵与门禁回归通过。修复后需重新预检和执行完整工作流，不复用该轮报告。合成门禁回归不能充当设备证据，定向通过也不代表全面通过。

根构建还暴露 Gulp 启动脚本引用已不存在的 `tsx/dist/loader.cjs`，随后尝试一系列未安装的替代加载器。现在通过 Node 的公开 `--import tsx` 入口启动 Gulp，starter 微信/抖音构建、demo 抖音构建通过；`E2E_PROJECT_FILTER=gulp-tailwindcss-v4 pnpm e2e:static:u` 重新生成 14 份 static 产物，与受管基线无差异，随后不更新复验通过。Lynx 兼容性 catalog 的不支持选择器仍按现有文档记录，不把 encoder 丢弃的规则视为运行时支持。

## 适用边界

静态分析不能预测未来 JavaScript、内联样式或外部运行时注入的变量覆盖。`cssCalc` 仍默认关闭，只应选择构建期固定变量；普通 `var()` 不会因为该配置被全局展开。显式开启其他变量替换插件的行为需另行验证。

本次修复库侧的静态化与缓存链路，不修改微信的 `rpx` 换算算法。新的 DevTools 尺寸、截图和 gap 间距探针，以及微信 Android/iOS 真机和 Skyline 均未完成；旧 DevTools 证据只保留在 [原问题文档](../../../website/docs/issues/spacing-rpx.md)，不作为本轮通过证据。

## 规则评估

沿用 PostCSS 解析所有权、构建图来源关系和本地预检门禁，不新增 AGENTS 规则。多端手册补充共用门禁的质量检查入口，未降低任何环境或截图门槛。首次修复记录标为 superseded，保留当时结果并明确纠正过度结论。
