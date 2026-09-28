---
status: verified
issue: https://github.com/sonofmagic/weapp-tailwindcss/commit/49eb14473c573cc2923ce2a2b4153ff0a136b9c3
baseline: 49eb14473c573cc2923ce2a2b4153ff0a136b9c3
regressions:
  - packages/postcss/test/cache-identity.test.ts
  - packages/postcss/test/cache-capacity.test.ts
  - packages-runtime/runtime/test/aggregator-cache.test.ts
  - packages/engine/test/v4.cache-capacity.test.ts
  - packages/weapp-tailwindcss/test/tailwindcss/css-entries-capacity.test.ts
  - packages/weapp-tailwindcss/test/bundlers/vite-state-ownership.test.ts
  - packages/weapp-tailwindcss/test/bundlers/vite-source-watch-registration.unit.test.ts
  - packages/weapp-tailwindcss/test/ci/client-boundaries.test.ts
  - benchmark/performance/test/watch-lifecycle.test.mjs
---

# 缓存身份、构建生命周期与渐进架构优化

## 症状

审查 main 时复现了 CSS 短哈希碰撞、同名插件闭包混用、自定义运行时映射被跳过和 FIFO 冒充 LRU。新增真实 watch 场景进一步发现，候选和配置更新虽然触发了构建，但生成会话或 CSS 入口仍可能保留旧状态。

PostCSS 的 `.x{z-index:19842}` 与 `.x{z-index:127198}` 短哈希相同；不同作者变量保护成相同占位内容也会串用结果。同名 `Once` 闭包从 red 改成 blue 后仍输出 red。运行时关闭 escape、配置 `@ → AT` 的 unescape map 后，`AT` 未还原为 `@`。

## 根因与纠正

- 缓存索引不等于输入身份。PostCSS 命中时核对完整原始输入及配置；函数用弱引用身份区分。用户插件可能依赖外部状态，因此不缓存最终结果。Root 输入还携带来源位置，不按纯字符串缓存复用。
- fast path 只能跳过已证明无贡献的转换。默认转换器登记内部探针，自定义转换器完整执行。运行时缓存命中更新顺序，维持 256 条上限和实例隔离。
- design system/模块、CSS 入口、PostCSS 配置与处理器的长期缓存增加容量边界；同次管线初始化复用配置签名。保留无 watcher 调用的依赖内容校验，不用时间戳猜测代替正确性。
- Vite 按来源发现、候选刷新、CSS 资产、生成队列和组装划分状态。主组装模块从 494 行降为 264 行；退出时排空队列并释放状态，watch 中间轮次保留增量数据。来源 revision 变化时重新 transform 实际 CSS 消费入口，dispatcher 转发缓存模块、模块解析和关闭钩子。
- Webpack 必须在 loader 执行前通知依赖失效，资产阶段复用本轮变更记录。生成器返回的配置/插件依赖进入运行时判断；资产缓存同时识别原始 CSS 和 loader 生成结果，不能只依赖 JS chunk hash、入口文本或类名集合。
- 保持 source-scan、engine、postcss 与运行时各包独立，公开 API、包名和导入路径兼容。架构门禁新增客户端值依赖检查，区分 UI/主题的构建入口与运行时入口。

## 验证

环境：2026-09-28，macOS / Apple M4 Max，Node 24.18.0，pnpm 12.6.0，Tailwind CSS 4.3.3。独立工作树基于上述 baseline；真实 watch 测量提交为 `3761d59c144848d34257c1d9841f3744a4e7d18f`，测量时工作树干净。交付前已重放到最新 main `1484a54a917647228e6ecb1526578eb79b2f1a69`；上游仅更新 cssCalc 文档，已用 git diff 确认生产源码、测试、基准脚本及锁文件与测量版本一致。

### 通过

- PostCSS 新增 5 个真实管线回归，修改前全部失败，修改后通过；包含碰撞、闭包替换、外部状态和动态变量。相关配置/处理器回归通过。
- runtime 的映射、包装顺序、淘汰、失败恢复与隔离回归通过；cn、merge、cva、variants 的定向消费测试分别通过 7、29、8、20 条。
- engine 的容量、依赖刷新、生成会话与 node adapter 定向测试通过 18 条；CSS 入口淘汰回归通过。
- Vite 生命周期、dispatcher、CSS-only、uni-app x 等定向回归通过；Webpack v5 单元回归通过 168 条。
- 主包、PostCSS、engine、runtime 等受影响产物构建通过；类型检查与 runtime tsd 通过；主包 core/vite/vite-web/webpack 的 ESM/CJS 导入通过。
- `pnpm architecture:check` 通过：34 个包、1310 个源码文件。`pnpm agents:check`、`git diff --check` 和修改源码的 ESLint 检查通过。
- 新增 benchmark Vite/Webpack 产物基线位于 `benchmark/performance/test/fixtures/watch/`，使用 `pnpm --filter benchmark-performance watch:baseline` 生成；普通测试连续三轮验证最终 CSS 与基线一致，未修改现有 demo 或 IDE 快照。

### 性能证据

所有正式采样使用 2 次预热、7 次测量，串行执行，不修改现有性能预算。PostCSS 12 个场景的输出哈希与原始基线一致，运行时 36 个场景的输出稳定且通过门禁。

| PostCSS 场景 | 基线 median（ms） | 修改后 median（ms） | 修改后 p95（ms） |
| --- | ---: | ---: | ---: |
| main / 5000 规则 | 187.52 | 182.20 | 204.01 |
| content / 5000 规则 | 200.31 | 185.73 | 214.95 |
| structured / 5000 规则 | 282.95 | 249.88 | 261.40 |
| cache-hit / 5000 规则 | 1.71 | 1.70 | 1.73 |

这是单机配对样本，不据此宣称所有项目具有相同提速比例。

真实 watch 的每个样本在同一 watcher 中依次增加候选、删除作者样式、变更配置，再逐项恢复；耗时为整轮六次修改的总和。显式关闭 `preserveDeletedCss`，严格验证删除和恢复。

| 构建器 | 来源片段数 | 整轮 median（ms） | 整轮 p95（ms） | 进程 RSS 高水位（MiB） | 测量轮次 GC 后堆范围（MiB） |
| --- | ---: | ---: | ---: | ---: | ---: |
| vite | 10 | 599.02 | 614.90 | 328.67 | 59.26–62.74 |
| vite | 50 | 595.71 | 599.40 | 373.70 | 60.04–62.64 |
| vite | 100 | 594.07 | 613.59 | 378.23 | 62.97–64.53 |
| webpack | 10 | 854.83 | 915.80 | 512.86 | 88.73–90.29 |
| webpack | 50 | 869.48 | 906.96 | 556.30 | 95.06–96.56 |
| webpack | 100 | 897.05 | 973.45 | 558.89 | 101.04–101.47 |

六组恢复产物均只有一个输出哈希。RSS 为该报告进程的累计高水位；九轮生命周期样本及缓存容量测试不能代替数小时压力测试。原始 main 在 Vite 候选删除及 Webpack 配置变化步骤失败，因此不拿失败基线计算真实 watch 提速比。

复现入口：

```sh
pnpm --filter benchmark-performance report -- --suite postcss --runs 7 --warmups 2
pnpm --filter benchmark-performance report -- --suite runtime --runs 7 --warmups 2
pnpm --filter benchmark-performance watch:report -- --runs 7 --warmups 2
pnpm --filter benchmark-performance test -- --update=none
pnpm --filter weapp-tailwindcss exec vitest run test/bundlers/webpack.v5.unit.test.ts test/bundlers/vite-source-watch-registration.unit.test.ts test/bundlers/vite-state-ownership.test.ts --update=none
```

原始证据保存在本轮工作树的忽略目录：`.tmp/watch-delivery.json`、`.tmp/watch-static.json`、`.tmp/webpack-baseline-failure.log`、`.tmp/watch-baseline-realpath.log`，以及 `benchmark/performance/.tmp/architecture-postcss-final/`、`benchmark/performance/.tmp/architecture-runtime-corrected/`。文档中的表保留了可随代码审查的摘要。

### 测量纠正

最初热点场景同时放大字符串长度和循环次数，造成基准自身的平方工作量；已固定热点输入长度，仅扩大冷请求数量。cn 冷启动也改为创建真实 cn 引擎，避免误测 merge。

临时目录曾同时使用 macOS 的 `/var` 与 `/private/var` 身份，引发空 layer 包装差异；采用已有真实编译契约的 realpath 根目录后消除。跨入口生成竞态的假设未得到证据支持，实验性串行化已撤回。Webpack 在 `afterProcessAssets` 采集本轮资产，避免读取已经变成 SizeOnlySource 的历史对象；等待监听重新就绪后才写下一份输入。没有放宽预算、隐藏失败或归一化 CSS 来绕过哈希比较。

## 适用边界

### PR #1251 CI 修复

首轮 Release Gate（run `36364376024`，head `e90e824`）在 Nuxt SSR 构建中复现 `CSS generation queue has been disposed`：Nuxt 连续使用同一插件配置，客户端 closeBundle 后原先闭包中的队列已经释放。插件工厂现在以 resolved config 分配独立状态，并按环境上下文路由钩子，保留每个实例的正常释放。新增主入口/Web 入口连续 client → SSR → client 的真实 Vite 回归及多环境交错钩子测试；定向 Nuxt build 在修复前失败、修复后通过。

另外更新旧指纹测试：函数签名的契约是同一函数稳定、不同闭包可区分，不再断言函数名或未转义的内部字符串编码。相关 58 条 PostCSS 定向测试通过。

本轮通过的是定向单测、真实解析器/编译器、程序化 watcher、构建与类型证据。未启动全仓/全端验收，未运行微信 IDE、HBuilderX、iOS/Android/Harmony 或浏览器 UI 验收；因此不声称这些环境通过。全面测试仍须先执行本轮多端预检。未等待远端 CI，也未发布 npm。

## 规则评估

不新增或放宽 AGENTS 规则。现有缓存隔离、构建图、生命周期和性能证据规则足够，通过持久回归、客户端依赖门禁及职责文档落实。
