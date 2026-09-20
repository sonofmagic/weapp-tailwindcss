---
status: partial
issue: https://github.com/sonofmagic/weapp-tailwindcss/pull/1228
baseline: d3a7df78b83a96ea53319dbd9d0274faad762dc6
regressions:
  - packages/engine/test/v4.module-cache.test.ts
  - packages/engine/test/module-requests.test.ts
  - packages/tailwindcss-config/test/reload.test.ts
  - packages/weapp-style-injector/test/index.test.ts
  - packages/weapp-tailwindcss/test/context/handlers.test.ts
  - packages/weapp-tailwindcss/test/tailwindcss/v4/rpx-theme-warning.test.ts
  - packages/weapp-tailwindcss/test/vitest/vite.test.ts
  - packages/weapp-tailwindcss/test/ci/verify-packed-packages.test.ts
---

# 架构重构后的 CI 修复

## 症状

PR Gate 的三个单测 shard 与 Release Gate 失败。测试仍 mock PostCSS 根入口、断言旧发布包数量或遗漏新增 types 子路径。Vite 的第二次构建快照仍预期空 CSS，与稳定缓存必须保留样式的行为冲突。

性能门禁同时报告 Mpx 插件耗时增加 85.40%，Taro Webpack 构建和 HMR 内存超限，uni-app Vite 插件耗时增加 8.53%。首次本地三次构建、三次 HMR 对照也复现 Mpx 插件 487ms 到 882ms，不能归因为远端偶发波动。

## 根因与纠正

修正测试使用的能力入口及发布清单。Vite 用同一输入连续构建，直接断言两次 CSS 非空、包含预期样式且完全相同，再更新旧空快照。

此前为修复配置变更关闭全部 Jiti 缓存，并将所有绝对模块请求转成相对请求。Tailwind 对相对请求执行 cache-busting 和依赖遍历，多次编译、扫描及 design system 加载重复付出成本。现保留 Jiti 按源码哈希缓存的转换结果，执行结果仍不缓存。

仅恢复转换缓存后，Linux CI 的 Mpx 冷构建插件仍从 1272ms 增至 1763ms。进一步检查发现强制转译 CommonJS 仍会引入转换器冷启动，而且禁用 Jiti moduleCache 不能清除原生 require 的间接依赖缓存。最终改为读取前清理配置及本地辅助模块图，CommonJS 原生加载，ESM/TS 由 Jiti 按语法决定转换。Jiti 包装父节点可能只被原生辅助模块的 parent 引用，清理时补充该关系；不清空已安装第三方依赖。

引擎以稳定绝对路径标识本地 config/plugin，在异步调用上下文内复用最多 128 个模块，按本地依赖文件内容计算指纹。首次 CommonJS 加载复用已加载的 require 依赖图；ESM、TS 及变更后的模块通过 Tailwind 原有加载器处理。每次复用仍向编译器报告依赖，显式会话失效清空对应加载状态。原有全局加载 hook 被保留，引擎外请求不受接管。

回归覆盖 CJS、MJS、TS、配置的间接依赖，以及保持文件长度和 mtime 不变的内容更新。ESM 的原生缓存协议通过构建后的 CJS 引擎验证，避免 Vitest 模块执行器代替真实 Node 加载器。

新提交在 Linux/Windows 的默认工具类回归中暴露无 package.json 目录的边界：Node findPackageJSON 返回模块文件本身，不能直接按 JSON 读取。只在返回路径确为 package.json 时判断 type，其他情况交给原生模块加载和 CommonJS 依赖图判定。增加无清单目录的 JS 配置重载回归；同一主包失败用例修复前失败、修复后通过。

## 验证

本轮使用 Node 25.6.1、pnpm 12.4.1，在独立 worktree 执行，正常 Vitest 运行均设置 CI=1 和 --update=none。

- 原失败的 context、rpx warning、packed manifest 定向组 36 项通过；injector 导出组 89 项通过。
- Vite 构建组 4 项通过，2 项已有条件跳过。真实 Webpack/Rspack/Gulp 及主包/PostCSS 来源生成契约通过。
- engine 定向包测试 173 项通过；补充模块格式与扩展名省略后的缓存和路径组 13 项通过；配置包 11 项通过。受影响 engine/config 构建、engine 类型检查及修改生产文件 ESLint 通过。测试文件按仓库配置不参与 ESLint。
- Mpx、Taro Webpack、uni-app Vite、weapp-vite 四个 static 目标运行 -u 重建 44 份快照，无版本库差异；随后相同目标以 --update=none 复验，19 项通过。
- 正式性能复验使用 perf:guard、基线 5e96fdc16ffe5a9c872ebb243e47372c2f2b09ed、三个原失败目标、build-runs=3、hmr-runs=3。Mpx 插件中位数 511ms 到 600ms，样本差异未满足阻断置信条件；Taro 插件稳态 P95 717ms 到 783ms，另有 Taro/uni-app HMR 内存四项超限，门禁未通过。
- 对相同构建产物执行 current 到 baseline 的反向顺序 HMR 定向复测：内存超限未再现，Taro 插件稳态 P95 774ms 到 878ms，继续定位，不能将整体性能门禁记为通过。原始报告保存在忽略目录 .tmp/architecture-ci-performance-fixed。
- pnpm architecture:check：34 个包、1280 个生产源码文件通过；pnpm agents:check、pnpm release status 和 git diff --check 通过。
- 使用 Node 22.19 复验全部 engine 测试，178 项通过；主包 v4-engine.test.ts 的 62 项通过。engine 构建、typecheck、源码 ESLint 及架构和规则检查再次通过。
- 与 CI 相同主版本的 Node 22 下，Taro 三次 HMR 的稳态插件 P95 为基线 898ms、当前 888ms，未再现 Node 25 的耗时超限；该次 RSS 仍超限，需结合远端独立复测判断，不记为整体通过。
- 配置加载器本地依赖图修复前，CJS/ESM/TS 的间接依赖更新用例失败；修复后配置包 15 项通过。主包 v4 engine、主包/PostCSS 共享来源与真实构建器共享来源共 97 项通过；配置包构建和源码 ESLint 通过；架构检查覆盖 1281 个源码文件。
- 原生配置加载修复后，Node 22.19 的正式 perf:guard 对照通过：三个目标各三次构建、三次 HMR，沿用原阈值与统计规则，零阻断项。插件冷构建中位数 Mpx 596ms 到 548ms、Taro Webpack 4340ms 到 4330ms、uni-app Vite 1097ms 到 1127ms；总构建时间仍有波动，未宣称每个原始样本都更快。报告位于 .tmp/architecture-ci-performance-native。
- 后续 CI 新增失败的 Taro Vite 使用同一隔离产物补做三次构建、三次 HMR，并用原 evaluatePerformanceGuard 评估通过；插件构建中位数 3047ms 到 2991ms，稳态 HMR P95 1755ms 到 1669ms。

上述批次有重叠，不累加为全仓测试数量。新提交远端门禁状态另行记录。

## 适用边界

缓存属于生成引擎的模块加载，不共享候选集合或 CSS 会话结果；会话释放仍独立进行。使用 Tailwind Node 的加载 hook 与依赖缓存协议，升级 Tailwind 时需要复验这些测试。未放宽性能阈值、跳过失败用例或改回官方样式生成插件。

本地全端预检仍受微信 AppID、HBuilderX 实例和设备环境阻塞，未执行全面设备与 IDE 验收。PR 保持 Draft；定向 static 不替代设备验证。

## 规则评估

不新增 AGENTS 规则。现有先复现、补回归、静态基线复验、性能有限复测及按当前 PR head 追踪 CI 的规则已覆盖本次问题，补充持久测试与证据即可。
