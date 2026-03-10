# weapp-tailwindcss

## 4.10.4

### Patch Changes

- 🐛 **修复 Vite 集成在 dts 构建阶段替换 postcss 插件时触发的类型递归比较问题，避免 TS2321 与 TS2345 导致构建失败。** [`c8860fa`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c8860fa202e202833f2c503fd7ea53af824a76fe) by @sonofmagic
  - 同时升级部分依赖与工作区 catalog 版本（包括 postcss、fs-extra、storybook 等），并同步更新锁文件以保持依赖解析一致性。

- 🐛 **性能优化：针对 CSS 选择器转换、JS 处理器、WXML 模板处理等热路径进行多项缓存与计算优化。** [`49e50d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/49e50d8bde7327d47e9ba649537092ea57bcdf16) by @sonofmagic
  - JS 处理器：复用 `resolveClassNameTransformWithResult` 返回的 `escapedValue` 避免重复 escape 计算；引入 `getReplacement` 缓存消除重复 `replaceWxml` 调用；移除 `escapeStringRegexp` + `new RegExp` 正则编译开销
  - `createJsHandler`：预构建默认 `defaults` 对象，无覆盖选项时跳过 `defuOverrideArray` 合并
  - WXML 模板：`templateReplacer` 支持复用模块级 tokenizer 实例；`createTemplateHandler` 预构建 attribute matcher 并传递给 `customTemplateHandler`
  - PostCSS fallback 选择器解析：为 `transform` 函数添加 selector 级别缓存，避免重复解析相同选择器
  - `splitCode`：为默认和 allowDoubleQuotes 两种模式分别添加结果缓存，预编译分割正则
- 📦 **Dependencies** [`c8860fa`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c8860fa202e202833f2c503fd7ea53af824a76fe)
  → `@weapp-tailwindcss/postcss@2.1.6`, `@weapp-tailwindcss/shared@1.1.3`

## 4.10.3

### Patch Changes

- 🐛 **修复 Vite 开发增量构建中，clean JS 产物未回填缓存导致 `<script>` 任意值类名（如 `bg-[#000]`、`px-[432.43px]`）偶发失效的问题。** [`cdd45d0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/cdd45d06b1e47d89f46a635d8d5c20c5787caccd) by @sonofmagic
  - 同时补充 issue #33 回归测试，复用 watch-hmr 体系覆盖 script/template 任意值在 add/modify/delete 三阶段的增量行为，并增加调试日志用于定位 dirty 文件、token 命中与缓存跳过决策。
  - 增强 watch-hmr 回归鲁棒性（CRLF/LF 写回一致性、短暂 ENOENT 重试、Windows 进程树退出）并在 e2e-watch 工作流加入 issue33 专项三平台矩阵与失败 artifacts（json/snapshots/failures）。

## 4.10.2

### Patch Changes

- 🐛 **修复 TailwindCSS v4 场景下动态 class 任意值（如 `gap-[20px]`）在 JS 产物中未稳定转译的问题：** [`7be1209`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7be12097d012f2eef09a76c1740ff9dc44eab8a7) by @sonofmagic
  - 增加对 `classNameSet` 转义等价类名的命中能力；
  - 在严格 class 语义上下文中提供受控的 arbitrary value fallback（仅在 v4 + runtimeSet 异常时自动启用）；
  - 统一在不同 bundler 与 cwd 组合下透传 Tailwind 主版本与运行时集合，提升构建稳定性。

## 4.10.1

### Patch Changes

- 🐛 **修复 JS 转译误伤问题，并将 JS 候选匹配策略收敛为 classNameSet 精确命中。** [`13fcf19`](https://github.com/sonofmagic/weapp-tailwindcss/commit/13fcf19ef2dd30516825651c61dcb9f65f69e751) by @sonofmagic
  - JS 仅转译来自 `tailwindcss-patch` 的 `classNameSet` 命中项，不再对普通字符串做启发式 fallback 转译
  - `App.vue:4`、`index.ts:120:3`、日志/堆栈/业务文本等非 class 字符串不再被误转义
  - 补充回归测试，覆盖 `staleClassNameFallback=true/false` 下仍保持 classNameSet-only 行为

## 4.10.0

### Minor Changes

- ✨ **增强 `weapp-tailwindcss` 在复杂 Tailwind 语法与热更新回归场景下的稳定性与可观测性：** [`b2aa840`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b2aa84042aa34fcd01e8667619d5d378b008c046) by @sonofmagic
  - 扩展 watch HMR 回归到双轮次对比（`baseline-arbitrary` 与 `complex-corpus`），并在报告中输出分轮次指标与差异对比，便于长期性能追踪。
  - 强化跨框架 watch 路径下的复杂类名热更新验证，覆盖更多任意值、复杂变体与组合语法。
  - 补充复杂语法语料与端到端样式产物回归测试，提升对 Tailwind 复杂写法转译行为的覆盖度与回归保障。

### Patch Changes

- 🐛 **收敛 JS 转译策略为 classNameSet 精确命中，修复 source-location 文本误转义：**
  - JS 仅转译来自 `tailwindcss-patch` 的 `classNameSet` 命中项，不再对普通字符串做启发式 fallback 转译。
  - 修复 `at App.vue:4`、`index.ts:120:3`、`Foo.jsx:8` 等 source-location token 被误判为 class 并转义的问题。
  - 补充 JS handler 与 Vite bundle 回归测试，覆盖 `staleClassNameFallback=true/false` 下的 classNameSet-only 行为与正向类名转译能力。

- 🐛 **修复 Vite + uni-app 场景下的 HMR 类名漏转译问题，并增强 JS 转译鲁棒性：** [`be6f65d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/be6f65d4232621fedef617a00a2072bc02b89ec6) by @sonofmagic
  - 修复 `generateBundle` 阶段 runtime class set 失效策略：当 `html/js` 源码发生变化时强制刷新 runtimeSet，不再只依赖 `tailwind.config` 签名，避免新增 arbitrary value 在热更新后漏转义。
  - 为 Vite JS 处理链路补充 `staleClassNameFallback` 策略（`serve` 与 `build --watch` 默认开启），并新增 `UserDefinedOptions.staleClassNameFallback` 供用户显式配置。
  - 补充对应回归测试：覆盖“静态 class -> `:class` 常量字符串（包含新增 arbitrary value）”的热更新场景，并验证 `jsPreserveClass` 可避免业务字符串误转义。

- 🐛 **适配 `tailwindcss-patch@8.7.x` 的选项结构升级，并补齐向后兼容与稳定性修复：** [`fe5ac5e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/fe5ac5e400609878d2ce2e91aede134cde0e1823) by @sonofmagic
  - 将 patch 选项统一迁移到新版字段（如 `tailwindcss` / `apply` / `extract` / `projectRoot`），同时兼容旧字段输入，降低升级成本。
  - 修复 v4 patcher 选项合并与基路径覆盖逻辑，确保 `cssEntries` 与 `tailwindcss` 相关配置在新旧格式下行为一致。
  - 更新 CLI 默认 patch 选项映射，`extendLengthUnits` 等能力迁移到 `apply` 分组，避免新版 `tailwindcss-patch` 下配置失效。
  - 补齐相关类型定义与测试，避免在 DTS 构建和 patch 选项推导中出现类型漂移。

- 🐛 **Fix css-macro conditional comment generation for logical platform expressions.** [`84e3395`](https://github.com/sonofmagic/weapp-tailwindcss/commit/84e33954cbca5ce565301471469f75cf44fdb1dc) by @sonofmagic
  - Normalize `ifdef/ifndef` conditions like `H5||APP` and `H5_||_APP` to the uni-app style `H5 || APP`.
  - Keep escaped expressions (such as `H5\\_||\\_MP-WEIXIN`) as literals.
  - Ensure emitted conditional comments are always valid paired blocks (`#ifdef/#endif` and `#ifndef/#endif`) without nested `#ifndef` expansion.
  - Restore stable CSS output generation in uni-app scenarios using `ifdef-[...]` class macros.

- 🐛 **提升热更新链路的稳定性与性能，并补齐真实 watch 回归保障：** [`7824e01`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7824e010f8f7e4a7a9ae6eedd707ff4a329d991b) by @sonofmagic
  - 优化运行时类名转译策略，修复 stale runtimeSet 场景下新增任意值类与小数类（如 `text-[23.43px]`、`space-y-2.5`）在 JS/WXML/Vue 中的漏转译问题。
  - 提炼并复用类名候选判定逻辑，减少重复实现，降低后续维护成本。
  - 增强 demo 级 watch 回归脚本（taro + uni-app），覆盖新增类热更新、输出变更检测与恢复校验。
  - 为 watch 回归增加本地构建预热与日志降噪能力（可选 `--quiet-sass`），减少无效噪音并提升排查效率。
  - 优化相关缓存与增量处理路径，缩短常见热更新阶段插件处理耗时。

- 🐛 **修复 Vite + uni-app 在 HMR 增量阶段的样式回退问题，并增强 watch 热更新回归覆盖：** [`5dbec90`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5dbec90798221d9e941ecc44e2e7f00ecc2edc18) by @sonofmagic
  - 修复 `generateBundle` 的 CSS dirty 跳过逻辑：即使本轮 CSS 原文 hash 未变化，也会通过缓存回填已转译结果，避免 `app.wxss` 在 dev/watch 下回退到未转译内容并与同轮 JS/WXML class 改写失配。
  - 新增对应单元测试，覆盖“JS 变化但 CSS 原文不变”场景，确保缓存命中时仍应用 CSS 转译结果。
  - 增强 `e2e:watch` 的 same-class-literal HMR 校验：新增全局样式稳定性指标与断言，确保“源码变化但 class literal 不变”时仍能覆盖并检测样式稳定性。
  - 对 `mpx` 用例保留兼容策略：该场景仅放宽同字面量变更时的全局样式稳定断言，不影响其余项目的严格校验。

- 🐛 **扩展热更新 e2e 回归覆盖面并提升跨框架 watch 稳定性：** [`7261ffa`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7261ffa6b6d8a7c262020123cceef39c827bf9e4) by @sonofmagic
  - watch 回归用例从 `taro/uni-app` 扩展到 `taro/uni-app/mpx/rax/mina/weapp-vite`，默认运行全量 `all`。
  - 新增 `e2e:watch:mpx`、`e2e:watch:rax`、`e2e:watch:mina`、`e2e:watch:weapp-vite` 便捷命令。
  - 加强 watch 预热与编译成功判定，降低误判和超时波动。
  - 优化子进程退出与清理策略，避免 watch 任务残留影响后续回归。
  - 强化复杂 Tailwind 类组合（含任意值、小数、calc、伪元素等）在热更新路径下的转译验证。

- 🐛 **修复 Tailwind v4 `space-x-*` 在小程序端生成不兼容方向伪类导致的构建产物报错问题：** [`515aa47`](https://github.com/sonofmagic/weapp-tailwindcss/commit/515aa473159218d67ba8bc461ae7c95d573d3f80) by @sonofmagic
  - 在选择器转换阶段清理 `:-webkit-any(...)`、`:-moz-any(...)`、`:lang(...)` 相关分支，避免输出微信开发者工具不支持的选择器。
  - 对 `:not(...)` 包裹的方向条件保留主体选择器并移除条件；对纯方向分支选择器直接移除，避免产生无效 CSS。
  - 补充 `selectorParser` 回归测试，覆盖上述 RTL/language 伪类清理逻辑。

- 🐛 **扩展 watch 热更新回归矩阵与分项目报告能力，补齐重点 demo/apps 的可观测性：** [`a76b055`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a76b0557ae378cf149aa0df7ec213c9fd3eaeacc) by @sonofmagic
  - 将热更新用例按项目维度拆分执行，覆盖 apps 与 demos 的独立链路，报告按项目分别输出。
  - 新增并强制校验重点项目热更新报告覆盖：`demo/uni-app-vue3-vite`、`demo/uni-app-tailwindcss-v4`、`demo/taro-vite-tailwindcss-v4`、`demo/taro-app-vite`、`demo/taro-webpack-tailwindcss-v4`、`demo/taro-vue3-app`。
  - 在模板文件（wxml/vue/tsx 等）与 JS/TS 变更热更新验证之外，增加全局样式 `app.wxss` 转译类同步检查，确保新增类在全局产物可追踪。
  - 增强回归脚本稳定性与报告字段，补充按项目的热更新耗时与样式转译校验信息，便于横向对比与回归排查。

- 🐛 **优化 Vite 适配器的启动与增量构建性能（保持功能一致性）：** [`9fc32ff`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9fc32ff8d12430e7d8e207127e1130a16e13731d) by @sonofmagic
  - 运行时类集刷新改为按签名与配置变化触发，不再在每次 `generateBundle` 强制刷新。
  - `generateBundle` 支持基于 dirty entries 与 linked entries 的增量处理，减少全量遍历开销。
  - JS 转换新增轻量 precheck，无相关特征时跳过 Babel 解析与遍历。
  - 新增 Vite 性能基准与汇总脚本，支持 optimized/legacy 对照复现。

- 🐛 **新增一条专门面向热更新的 e2e 回归链路（构建产物快照链路之外），用于真实验证 taro/uni-app 在 watch 模式下的 HMR 生效性与耗时：** [`d350d81`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d350d817b006f7727ad8a3ed3950ca9c700a78b6) by @sonofmagic
  - 新增 `e2e:watch` 系列命令与独立 vitest 配置，支持按 `taro` / `uni` / `both` 运行。
  - 强化 `test:watch-hmr` 回归脚本：输出结构化报告（含 hot update / rollback 延迟）、支持性能预算断言与日志降噪。
  - 在回归中注入更复杂的 Tailwind 类名组合（含任意值、小数、`calc()`、`grid-cols-[...]`、`/` 透明度、伪元素变体等），确保新增类在 JS/WXML 场景的转译结果可验证。
  - 增加“类名避撞”策略，避免测试注入类与 demo 现有类冲突导致误判，提升回归稳定性与可重复性。
  - 默认 watch e2e 启用 `--skip-build` 聚焦热更新链路，另提供完整预构建模式命令用于全链路对照。

- 🐛 **修复 uni-app + Vite/HBuilderX 增量热更新中 template 转译退化导致 `wxml` 回退为未转义类名的问题：** [`76df4cf`](https://github.com/sonofmagic/weapp-tailwindcss/commit/76df4cfbc0ba1e8e2bcea7afd33a40060dae3580) by @sonofmagic
  - 调整 `generateBundle` 的 html 增量处理策略：非首轮也会将当前 bundle 内 html 资产纳入处理流程，确保每轮都能命中缓存并回填上次转译结果（`processCachedTask`）。
  - 避免仅 script 变更时出现 `wxml` 未转义而 `js/wxss` 已转义的链路不一致问题。
  - 补充 Vite bundle 回归测试，覆盖 script-only 连续变更与 `bg-[#0000]` 等 arbitrary value 场景，确保 `wxml/js/wxss` 增量输出始终一致。

- 🐛 **修复 webpack（Taro/uni）增量热更新下的类名转译一致性问题，并确保 JS 仅按最新 class set 精确匹配：** [`bac7fe4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bac7fe4831bb13ad4c663c0bf51ebf9832737850) by @sonofmagic
  - webpack 资产处理阶段每轮强制收集 runtime class set，避免 script-only 热更新时复用过期集合导致 `bg-[#xxxx]` 一类类名漏转译或截断。
  - webpack 模式下 `staleClassNameFallback` 回到默认关闭，保持 JS 转译“只命中 class set”的精确策略。
  - 增强 watch-hmr 回归：新增 `bg-[#hex]` 防截断断言（禁止出现 `bg- xxxx`），并纳入 `apps/taro-webpack-tailwindcss-v4` 的脚本热更新用例，确保 e2e:watch 覆盖该场景。
- 📦 **Dependencies** [`7824e01`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7824e010f8f7e4a7a9ae6eedd707ff4a329d991b)
  → `@weapp-tailwindcss/postcss@2.1.5`

## 4.10.0-beta.8

### Patch Changes

- 🐛 **修复 webpack（Taro/uni）增量热更新下的类名转译一致性问题，并确保 JS 仅按最新 class set 精确匹配：** [`bac7fe4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bac7fe4831bb13ad4c663c0bf51ebf9832737850) by @sonofmagic
  - webpack 资产处理阶段每轮强制收集 runtime class set，避免 script-only 热更新时复用过期集合导致 `bg-[#xxxx]` 一类类名漏转译或截断。
  - webpack 模式下 `staleClassNameFallback` 回到默认关闭，保持 JS 转译“只命中 class set”的精确策略。
  - 增强 watch-hmr 回归：新增 `bg-[#hex]` 防截断断言（禁止出现 `bg- xxxx`），并纳入 `apps/taro-webpack-tailwindcss-v4` 的脚本热更新用例，确保 e2e:watch 覆盖该场景。

## 4.10.0-beta.7

### Patch Changes

- 🐛 **修复 uni-app + Vite/HBuilderX 增量热更新中 template 转译退化导致 `wxml` 回退为未转义类名的问题：** [`76df4cf`](https://github.com/sonofmagic/weapp-tailwindcss/commit/76df4cfbc0ba1e8e2bcea7afd33a40060dae3580) by @sonofmagic
  - 调整 `generateBundle` 的 html 增量处理策略：非首轮也会将当前 bundle 内 html 资产纳入处理流程，确保每轮都能命中缓存并回填上次转译结果（`processCachedTask`）。
  - 避免仅 script 变更时出现 `wxml` 未转义而 `js/wxss` 已转义的链路不一致问题。
  - 补充 Vite bundle 回归测试，覆盖 script-only 连续变更与 `bg-[#0000]` 等 arbitrary value 场景，确保 `wxml/js/wxss` 增量输出始终一致。

## 4.10.0-beta.6

### Patch Changes

- 🐛 **修复 Vite + uni-app 在 HMR 增量阶段的样式回退问题，并增强 watch 热更新回归覆盖：** [`5dbec90`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5dbec90798221d9e941ecc44e2e7f00ecc2edc18) by @sonofmagic
  - 修复 `generateBundle` 的 CSS dirty 跳过逻辑：即使本轮 CSS 原文 hash 未变化，也会通过缓存回填已转译结果，避免 `app.wxss` 在 dev/watch 下回退到未转译内容并与同轮 JS/WXML class 改写失配。
  - 新增对应单元测试，覆盖“JS 变化但 CSS 原文不变”场景，确保缓存命中时仍应用 CSS 转译结果。
  - 增强 `e2e:watch` 的 same-class-literal HMR 校验：新增全局样式稳定性指标与断言，确保“源码变化但 class literal 不变”时仍能覆盖并检测样式稳定性。
  - 对 `mpx` 用例保留兼容策略：该场景仅放宽同字面量变更时的全局样式稳定断言，不影响其余项目的严格校验。

## 4.10.0-beta.5

### Patch Changes

- 🐛 **Fix css-macro conditional comment generation for logical platform expressions.** [`84e3395`](https://github.com/sonofmagic/weapp-tailwindcss/commit/84e33954cbca5ce565301471469f75cf44fdb1dc) by @sonofmagic
  - Normalize `ifdef/ifndef` conditions like `H5||APP` and `H5_||_APP` to the uni-app style `H5 || APP`.
  - Keep escaped expressions (such as `H5\\_||\\_MP-WEIXIN`) as literals.
  - Ensure emitted conditional comments are always valid paired blocks (`#ifdef/#endif` and `#ifndef/#endif`) without nested `#ifndef` expansion.
  - Restore stable CSS output generation in uni-app scenarios using `ifdef-[...]` class macros.

## 4.10.0-beta.4

### Patch Changes

- 🐛 **修复 Vite + uni-app 场景下的 HMR 类名漏转译问题，并增强 JS 转译鲁棒性：** [`be6f65d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/be6f65d4232621fedef617a00a2072bc02b89ec6) by @sonofmagic
  - 修复 `generateBundle` 阶段 runtime class set 失效策略：当 `html/js` 源码发生变化时强制刷新 runtimeSet，不再只依赖 `tailwind.config` 签名，避免新增 arbitrary value 在热更新后漏转义。
  - 为 Vite JS 处理链路补充 `staleClassNameFallback` 策略（`serve` 与 `build --watch` 默认开启），并新增 `UserDefinedOptions.staleClassNameFallback` 供用户显式配置。
  - 补充对应回归测试：覆盖“静态 class -> `:class` 常量字符串（包含新增 arbitrary value）”的热更新场景，并验证 `jsPreserveClass` 可避免业务字符串误转义。

## 4.10.0-beta.3

### Patch Changes

- 🐛 **适配 `tailwindcss-patch@8.7.x` 的选项结构升级，并补齐向后兼容与稳定性修复：** [`fe5ac5e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/fe5ac5e400609878d2ce2e91aede134cde0e1823) by @sonofmagic
  - 将 patch 选项统一迁移到新版字段（如 `tailwindcss` / `apply` / `extract` / `projectRoot`），同时兼容旧字段输入，降低升级成本。
  - 修复 v4 patcher 选项合并与基路径覆盖逻辑，确保 `cssEntries` 与 `tailwindcss` 相关配置在新旧格式下行为一致。
  - 更新 CLI 默认 patch 选项映射，`extendLengthUnits` 等能力迁移到 `apply` 分组，避免新版 `tailwindcss-patch` 下配置失效。
  - 补齐相关类型定义与测试，避免在 DTS 构建和 patch 选项推导中出现类型漂移。

## 4.10.0-beta.2

### Patch Changes

- 🐛 **扩展 watch 热更新回归矩阵与分项目报告能力，补齐重点 demo/apps 的可观测性：** [`a76b055`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a76b0557ae378cf149aa0df7ec213c9fd3eaeacc) by @sonofmagic
  - 将热更新用例按项目维度拆分执行，覆盖 apps 与 demos 的独立链路，报告按项目分别输出。
  - 新增并强制校验重点项目热更新报告覆盖：`demo/uni-app-vue3-vite`、`demo/uni-app-tailwindcss-v4`、`demo/taro-vite-tailwindcss-v4`、`demo/taro-app-vite`、`demo/taro-webpack-tailwindcss-v4`、`demo/taro-vue3-app`。
  - 在模板文件（wxml/vue/tsx 等）与 JS/TS 变更热更新验证之外，增加全局样式 `app.wxss` 转译类同步检查，确保新增类在全局产物可追踪。
  - 增强回归脚本稳定性与报告字段，补充按项目的热更新耗时与样式转译校验信息，便于横向对比与回归排查。

## 4.10.0-beta.1

### Minor Changes

- ✨ **增强 `weapp-tailwindcss` 在复杂 Tailwind 语法与热更新回归场景下的稳定性与可观测性：** [`b2aa840`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b2aa84042aa34fcd01e8667619d5d378b008c046) by @sonofmagic
  - 扩展 watch HMR 回归到双轮次对比（`baseline-arbitrary` 与 `complex-corpus`），并在报告中输出分轮次指标与差异对比，便于长期性能追踪。
  - 强化跨框架 watch 路径下的复杂类名热更新验证，覆盖更多任意值、复杂变体与组合语法。
  - 补充复杂语法语料与端到端样式产物回归测试，提升对 Tailwind 复杂写法转译行为的覆盖度与回归保障。

### Patch Changes

- 🐛 **提升热更新链路的稳定性与性能，并补齐真实 watch 回归保障：** [`7824e01`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7824e010f8f7e4a7a9ae6eedd707ff4a329d991b) by @sonofmagic
  - 优化运行时类名转译策略，修复 stale runtimeSet 场景下新增任意值类与小数类（如 `text-[23.43px]`、`space-y-2.5`）在 JS/WXML/Vue 中的漏转译问题。
  - 提炼并复用类名候选判定逻辑，减少重复实现，降低后续维护成本。
  - 增强 demo 级 watch 回归脚本（taro + uni-app），覆盖新增类热更新、输出变更检测与恢复校验。
  - 为 watch 回归增加本地构建预热与日志降噪能力（可选 `--quiet-sass`），减少无效噪音并提升排查效率。
  - 优化相关缓存与增量处理路径，缩短常见热更新阶段插件处理耗时。

- 🐛 **扩展热更新 e2e 回归覆盖面并提升跨框架 watch 稳定性：** [`7261ffa`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7261ffa6b6d8a7c262020123cceef39c827bf9e4) by @sonofmagic
  - watch 回归用例从 `taro/uni-app` 扩展到 `taro/uni-app/mpx/rax/mina/weapp-vite`，默认运行全量 `all`。
  - 新增 `e2e:watch:mpx`、`e2e:watch:rax`、`e2e:watch:mina`、`e2e:watch:weapp-vite` 便捷命令。
  - 加强 watch 预热与编译成功判定，降低误判和超时波动。
  - 优化子进程退出与清理策略，避免 watch 任务残留影响后续回归。
  - 强化复杂 Tailwind 类组合（含任意值、小数、calc、伪元素等）在热更新路径下的转译验证。

- 🐛 **修复 Tailwind v4 `space-x-*` 在小程序端生成不兼容方向伪类导致的构建产物报错问题：** [`515aa47`](https://github.com/sonofmagic/weapp-tailwindcss/commit/515aa473159218d67ba8bc461ae7c95d573d3f80) by @sonofmagic
  - 在选择器转换阶段清理 `:-webkit-any(...)`、`:-moz-any(...)`、`:lang(...)` 相关分支，避免输出微信开发者工具不支持的选择器。
  - 对 `:not(...)` 包裹的方向条件保留主体选择器并移除条件；对纯方向分支选择器直接移除，避免产生无效 CSS。
  - 补充 `selectorParser` 回归测试，覆盖上述 RTL/language 伪类清理逻辑。

- 🐛 **新增一条专门面向热更新的 e2e 回归链路（构建产物快照链路之外），用于真实验证 taro/uni-app 在 watch 模式下的 HMR 生效性与耗时：** [`d350d81`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d350d817b006f7727ad8a3ed3950ca9c700a78b6) by @sonofmagic
  - 新增 `e2e:watch` 系列命令与独立 vitest 配置，支持按 `taro` / `uni` / `both` 运行。
  - 强化 `test:watch-hmr` 回归脚本：输出结构化报告（含 hot update / rollback 延迟）、支持性能预算断言与日志降噪。
  - 在回归中注入更复杂的 Tailwind 类名组合（含任意值、小数、`calc()`、`grid-cols-[...]`、`/` 透明度、伪元素变体等），确保新增类在 JS/WXML 场景的转译结果可验证。
  - 增加“类名避撞”策略，避免测试注入类与 demo 现有类冲突导致误判，提升回归稳定性与可重复性。
  - 默认 watch e2e 启用 `--skip-build` 聚焦热更新链路，另提供完整预构建模式命令用于全链路对照。
- 📦 **Dependencies** [`7824e01`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7824e010f8f7e4a7a9ae6eedd707ff4a329d991b)
  → `@weapp-tailwindcss/postcss@2.1.5-beta.0`

## 4.9.9-beta.0

### Patch Changes

- 🐛 **优化 Vite 适配器的启动与增量构建性能（保持功能一致性）：** [`9fc32ff`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9fc32ff8d12430e7d8e207127e1130a16e13731d) by @sonofmagic
  - 运行时类集刷新改为按签名与配置变化触发，不再在每次 `generateBundle` 强制刷新。
  - `generateBundle` 支持基于 dirty entries 与 linked entries 的增量处理，减少全量遍历开销。
  - JS 转换新增轻量 precheck，无相关特征时跳过 Babel 解析与遍历。
  - 新增 Vite 性能基准与汇总脚本，支持 optimized/legacy 对照复现。

## 4.9.8

### Patch Changes

- 🐛 **新增 unitsToPx 配置，支持将多种长度单位转换为 px，并在 uni-app-x 预设中透出该选项。** [`d20c0b7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d20c0b7db503c0b8e022101908ff520dc00ed2df) by @sonofmagic

- 🐛 **chore: bump babel from 7.28.6 to 7.29.0** [`3d21a8c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3d21a8c849cabd2683a0e160be197c9970866b4e) by @sonofmagic
- 📦 **Dependencies** [`d20c0b7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d20c0b7db503c0b8e022101908ff520dc00ed2df)
  → `@weapp-tailwindcss/postcss@2.1.4`

## 4.9.8-alpha.0

### Patch Changes

- 🐛 **新增 unitsToPx 配置，支持将多种长度单位转换为 px，并在 uni-app-x 预设中透出该选项。** [`d20c0b7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d20c0b7db503c0b8e022101908ff520dc00ed2df) by @sonofmagic

- 🐛 **chore: bump babel from 7.28.6 to 7.29.0** [`3d21a8c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3d21a8c849cabd2683a0e160be197c9970866b4e) by @sonofmagic
- 📦 **Dependencies** [`d20c0b7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d20c0b7db503c0b8e022101908ff520dc00ed2df)
  → `@weapp-tailwindcss/postcss@2.1.4-alpha.0`

## 4.9.7

### Patch Changes

- 🐛 **添加 `wx-root-portal-content` 作为默认的 css var 根节点类名** [`a40a766`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a40a76679536a3c08177143081963e3e80d84eed) by @sonofmagic

## 4.9.6

### Patch Changes

- 🐛 **chore: 升级到 "@weapp-core/escape": "~7.0.0"** [`4bbda03`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bbda03bc7f924bc7ef75291d27316309c827c58) by @sonofmagic
- 📦 **Dependencies** [`4bbda03`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bbda03bc7f924bc7ef75291d27316309c827c58)
  → `@weapp-tailwindcss/postcss@2.1.3`

## 4.9.5

### Patch Changes

- 🐛 **修复导出的 UserDefinedOptions 类型合并，确保 matcher 回调参数能正确推断并提供智能提示。** [`2b7c018`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2b7c018c5131feb108bb227f71854ec62e4ec4d4) by @sonofmagic

- 🐛 **简化 UserDefinedOptions 类型结构，移除 typedoc 增强依赖并修复相关类型问题。** [`466e1a6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/466e1a6d3054938750559124e17bc11a577953a0) by @sonofmagic

## 4.9.4

### Patch Changes

- 📦 **Dependencies** [`becab46`](https://github.com/sonofmagic/weapp-tailwindcss/commit/becab46e7df4864feba2e708f67a3e3a08e341e0)
  → `@weapp-tailwindcss/postcss@2.1.2`

## 4.9.3

### Patch Changes

- 📦 **Dependencies** [`366027a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/366027a3a9831cbdcb609297c75596ade0f42ad5)
  → `@weapp-tailwindcss/postcss@2.1.1`, `@weapp-tailwindcss/shared@1.1.2`

## 4.9.2

### Patch Changes

- [`fb723b0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/fb723b038bd94866118a56b74cd8b35a0e0c85cd) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复配置 cssEntries 时默认强制覆盖 tailwind v4 base 导致 @config 解析到错误目录的问题，保持用户自定义 base 并让入口目录成为默认解析基准，避免运行时类名收集为空。

- [`94b2c71`](https://github.com/sonofmagic/weapp-tailwindcss/commit/94b2c719ce916a1001070bda1bce30b04454080d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 tailwindcss v4 在自动收集 cssEntries 时丢失基准目录的问题：从上下文创建 patcher 时附带工作区 base，保留用户显式设置的 v4 base，并在多 patcher 聚合时沿用首个 patcher 的配置。

- [`acdfd59`](https://github.com/sonofmagic/weapp-tailwindcss/commit/acdfd5928c02343c78a8f4cdc3889f5b067533ea) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 v4 patcher 在提供 cssEntries 時錯誤覆寫 base 導致 @config 解析失效，補充回歸確保 runtime class set 正確收集並轉義，並依賴升級至修復版 tailwindcss-patch@8.6.1。

## 4.9.2-alpha.2

### Patch Changes

- [`acdfd59`](https://github.com/sonofmagic/weapp-tailwindcss/commit/acdfd5928c02343c78a8f4cdc3889f5b067533ea) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 v4 patcher 在提供 cssEntries 時錯誤覆寫 base 導致 @config 解析失效，補充回歸確保 runtime class set 正確收集並轉義，並依賴升級至修復版 tailwindcss-patch@8.6.1。

## 4.9.2-alpha.1

### Patch Changes

- [`94b2c71`](https://github.com/sonofmagic/weapp-tailwindcss/commit/94b2c719ce916a1001070bda1bce30b04454080d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 tailwindcss v4 在自动收集 cssEntries 时丢失基准目录的问题：从上下文创建 patcher 时附带工作区 base，保留用户显式设置的 v4 base，并在多 patcher 聚合时沿用首个 patcher 的配置。

## 4.9.2-alpha.0

### Patch Changes

- [`fb723b0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/fb723b038bd94866118a56b74cd8b35a0e0c85cd) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复配置 cssEntries 时默认强制覆盖 tailwind v4 base 导致 @config 解析到错误目录的问题，保持用户自定义 base 并让入口目录成为默认解析基准，避免运行时类名收集为空。

## 4.9.1

### Patch Changes

- [`4961548`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4961548799c55bc3e07866e20354f69292d53345) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 仅在 iOS 编译场景跳过 uni-app-x 预处理样式的 pre 钩子，补充 UNI_UTS_PLATFORM 平台解析工具与相关测试。

## 4.9.0

### Minor Changes

- [`01c4f02`](https://github.com/sonofmagic/weapp-tailwindcss/commit/01c4f025272a6b6fbe4021a713dc838bb92fc625) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 默认 tailwindcss-patcher 的缓存策略从 文件缓存，变为内存缓存，可通过配置恢复

### Patch Changes

- [`914b61c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/914b61ca8995becda219d67ea98aa0ee6a2359a6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 升级 tailwindcss-patch 优化 windows 系统下发生的 ERROR Unable to persist Tailwind class cache EPERM: operation not permitted, lstat '\\?\E:\workspace\uni-app-x-hbuilderx\node_modules\.cache\tailwindcss-patch\class-cache.json' 错误报告

## 4.9.0-alpha.0

### Minor Changes

- [`01c4f02`](https://github.com/sonofmagic/weapp-tailwindcss/commit/01c4f025272a6b6fbe4021a713dc838bb92fc625) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 默认 tailwindcss-patcher 的缓存策略从 文件缓存，变为内存缓存，可通过配置恢复

### Patch Changes

- [`914b61c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/914b61ca8995becda219d67ea98aa0ee6a2359a6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 升级 tailwindcss-patch 优化 windows 系统下发生的 ERROR Unable to persist Tailwind class cache EPERM: operation not permitted, lstat '\\?\E:\workspace\uni-app-x-hbuilderx\node_modules\.cache\tailwindcss-patch\class-cache.json' 错误报告

## 4.8.15

### Patch Changes

- [`bb845b5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bb845b5ce3d01d19d04336c8fbf6fca47f6a3347) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 uni-app-x Vite 插件在 pre 钩子上解析 SCSS 导致 iOS 打包报错的问题，并补充 .uvue lang.scss 回归用例。

## 4.8.14

### Patch Changes

- [`cd3975d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/cd3975dfeefa5a1ba298b6724d2af681a26cd260) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 开启 css import 重写时，将 `@import "tailwindcss"` 映射到 `@import "weapp-tailwindcss/index.css"`。

- [`ade6fe0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ade6fe02b994f08f8d4c422485a982b4aaad34b8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 为 `disabled` 增加细粒度配置，支持仅关闭主流程或仅关闭 `@import "tailwindcss"` 重写，方便多端场景按需禁用。

## 4.8.13

### Patch Changes

- [`644bc7f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/644bc7f23c7f46c9bfe28d19757bc8d530e67669) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 拆分 presets 到独立文件并补充 uni-app/Taro/HBuilderX 预设，uni-app 在 H5/App 目标默认禁用转换，同时完善相关测试。

- Updated dependencies [[`19e9417`](https://github.com/sonofmagic/weapp-tailwindcss/commit/19e94172cd2b79b28b863a15e477136f269bbc3b)]:
  - @weapp-tailwindcss/postcss@2.1.0

## 4.8.12

### Patch Changes

- [`077cca6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/077cca6ac83008fa619700e870532bc7f28038f0) Thanks [@sonofmagic](https://github.com/sonofmagic)! - weapp-tw CLI 对齐 tailwindcss-patch，内置 `status` 子命令并同步使用指南，方便在子包或 CI 查看补丁应用情况。

- Updated dependencies [[`07a0d5b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/07a0d5b8b27ebd52b4f9363f004f80d17c3d1f2e), [`8bd4842`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8bd4842871a96dadb2b85139ffded7f61c99ca01), [`74ed4a3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/74ed4a324e528d67d5f4fc22d4cf704b0c246cb8)]:
  - @weapp-tailwindcss/postcss@2.0.8

## 4.8.11

### Patch Changes

- [`ccaa9bd`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ccaa9bde3965c2d7bc918da346bd7e2b674aed7c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 v4 补丁目标选择，只有显式使用 tailwindcss v4 时才会额外尝试为 @tailwindcss/postcss 打补丁，避免 v3 工程被误导到 v4 包后构建失败。

- [`65d5b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/65d5b129080331c43cc46979b28e732b87483e9e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 优化 `weapp-tw patch` 默认 cwd 选择逻辑，workspace 下优先定位到实际安装 tailwindcss 的包或根目录，避免 pnpm hoist 时 postinstall 误选路径导致补丁遗漏。

- [`66a2316`](https://github.com/sonofmagic/weapp-tailwindcss/commit/66a2316116e763069fce58f3afa9eee1981f11c9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 `weapp-tw patch` 默认工作目录解析，优先使用 WEAPP_TW_PATCH_CWD/INIT_CWD，避免 postinstall 未对真实子包打补丁导致运行时才补丁的问题。

- [`e7404e2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e7404e290e9cb3432f7b76cf58d463d055ab2fbe) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 默认在 CLI 与运行时补丁中启用 extendLengthUnits（含 rpx），让 postinstall 阶段即可补齐长度单位补丁并避免二次补丁日志。

## 4.8.10

### Patch Changes

- [`3ed3aa8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3ed3aa817a68dae544baf434316399cc78c15b99) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: upgrade "@weapp-core/escape": "~6.0.1"

- Updated dependencies [[`3ed3aa8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3ed3aa817a68dae544baf434316399cc78c15b99)]:
  - @weapp-tailwindcss/postcss@2.0.7

## 4.8.9

### Patch Changes

- [`ce046d2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ce046d24bb1c843eb4682667f5b2584c3b49bdb5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 移除 MPX 专属的 tailwindcss-patch 缓存目录配置，改回复用默认路径，保持与其它应用类型一致。

- Updated dependencies [[`ce046d2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ce046d24bb1c843eb4682667f5b2584c3b49bdb5)]:
  - @weapp-tailwindcss/postcss@2.0.6

## 4.8.8

### Patch Changes

- [`1379d4b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1379d4b997084ddd42dd9a8c381507f46d1912ef) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 拆分运行时 Loader，新增仅 TailwindCSS v4 会启用的 CSS import 重写 Loader，并将 classSet 采集逻辑放入独立 Loader，便于在正确的 loader 顺序中执行。

- [`8c89cb2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8c89cb28ac21694433e9fe31e9b5d54e650ba673) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修正 runtime loader 的插入顺序，使 `runtimeCssImportRewriteLoader` 总是在 `postcss-loader` 之前执行，而 `runtimeClassSetLoader` 在其之后执行；同时新增调试日志和文档，方便排查 loader 链。

- [`e84e6b5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e84e6b5c8f9134201cc58e2e01ea2db902a5620c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 统一 mpx 场景判断到共享 isMpx 辅助函数，并为 mpx 相关工具补充全覆盖单元测试（别名、resolve 重写与规则注入）。

- [`3a795ae`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3a795aeda3db4df12c666ba84783240db3a46ee1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 mpx 场景下的处理：
  - webpack runtime loader 锚点改为跟随 `@mpxjs/webpack-plugin/lib/style-compiler/index` 插入顺序。
  - rewrite css import 时 `@import "tailwindcss";` 改写为 `@import "weapp-tailwindcss/index.css";`。

- [`6e29641`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6e296415cb354e96dfc63846f46fcb5d52945067) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 改进 mpx 默认的 `mainCssChunkMatcher`，凡是落在 `styles/` 目录下的 CSS/WXSS 产物都会被视为主样式包。这样像 `dist/wx/styles/app364cd4a4.wxss` 这种带 hash 的入口也能自动注入 Tailwind v4 变量与预设，不必再额外配置 matcher。

- [`0935ee0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0935ee03de5dba28da6a4e3be1737423067c0978) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 优化 webpack 注入逻辑，确保 `weapp-tw-css-import-rewrite-loader` 在 Mpx 的 `@mpxjs/webpack-plugin/lib/style-compiler` 之前运行，避免重复注入导致的执行顺序混乱；同时在 Rax 场景下自动识别 `src/global.*` 作为 `cssEntries`，即使未显式配置 `appType` 也能正确收集 Tailwind 类，修复 demo `rax-app` 中 JS 类名无法转译的问题。

- Updated dependencies [[`c39cbfb`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c39cbfb1980befdaf3df250b2966794ddec01d1e)]:
  - @weapp-tailwindcss/postcss@2.0.5

## 4.8.7

### Patch Changes

- [`22b7af3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/22b7af321acfb58fba34a3e6dd935a5b8f23bd1f) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复运行时 loader 在某些构建链路中接管图片等二进制资源时会破坏文件内容的问题，确保仅在 postcss-loader 之后注入并跳过 Buffer 处理，避免 dist/assets/logo.png 等静态资产被损坏。

## 4.8.6

### Patch Changes

- [`9b5a820`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9b5a820b6c8b865c723b663f51c9558075488a48) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 统一 Vue 3 编译器依赖到 catalog，确保 weapp-tailwindcss 的构建环境与仓库其他包保持一致。

## 4.8.5

### Patch Changes

- [`4bfc52b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bfc52b147d39c52a42c5eaf10179f90a849ab49) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 增强 `weapp-tw patch` 在 pnpm monorepo 下的体验：按子包 hash 隔离缓存记录，检测不一致时自动重打补丁并刷新元数据；支持 `--workspace` 扫描工作区逐包补丁，默认读取 `pnpm-lock.yaml`/workspaces；新增 `--cwd` 优先级、记录中包含补丁版本与路径信息，避免跨包污染与告警。\*\*\*

- [`f5fa2ca`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f5fa2ca71127c51c6e684310346192ff4053aaf1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 在 tailwindcss@4 未配置 cssEntries 时输出显眼警告，提示使用包含 tailwindcss 引用的 CSS 绝对路径。

- [`b0300a4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b0300a4c4c150b929a2f066ed7a1bc7c7f93aee4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复当 `cssEntries` 指向子目录文件时强制重写 Tailwind v4 `base` 的问题，优先沿用工作区/用户指定根目录并在多包场景下智能分组；补充整合测试确保通过 `getCompilerContext` 仍能识别子目录样式并正确重写 `bg-[#00aa55]` 这类动态类名。

- [`2023d33`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2023d337102a413d8388ce4378528e9df62afe77) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 Vite 重写 `@import 'tailwindcss'` 的钩子顺序，确保 uni-app v4 构建时能提前改写为 `weapp-tailwindcss`。

## 4.8.5-alpha.0

### Patch Changes

- [`4bfc52b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bfc52b147d39c52a42c5eaf10179f90a849ab49) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 增强 `weapp-tw patch` 在 pnpm monorepo 下的体验：按子包 hash 隔离缓存记录，检测不一致时自动重打补丁并刷新元数据；支持 `--workspace` 扫描工作区逐包补丁，默认读取 `pnpm-lock.yaml`/workspaces；新增 `--cwd` 优先级、记录中包含补丁版本与路径信息，避免跨包污染与告警。\*\*\*

- [`f5fa2ca`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f5fa2ca71127c51c6e684310346192ff4053aaf1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 在 tailwindcss@4 未配置 cssEntries 时输出显眼警告，提示使用包含 tailwindcss 引用的 CSS 绝对路径。

- [`b0300a4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b0300a4c4c150b929a2f066ed7a1bc7c7f93aee4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复当 `cssEntries` 指向子目录文件时强制重写 Tailwind v4 `base` 的问题，优先沿用工作区/用户指定根目录并在多包场景下智能分组；补充整合测试确保通过 `getCompilerContext` 仍能识别子目录样式并正确重写 `bg-[#00aa55]` 这类动态类名。

- [`2023d33`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2023d337102a413d8388ce4378528e9df62afe77) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 Vite 重写 `@import 'tailwindcss'` 的钩子顺序，确保 uni-app v4 构建时能提前改写为 `weapp-tailwindcss`。

## 4.8.4

### Patch Changes

- [`68465d3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/68465d3b954ec2e658e9b139f50867a34460e853) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 对 CLI 接入 tailwindcss-patch 8.4 的挂载模型，统一错误处理并在补丁流程中支持清理缓存、记录目标版本，顺带同步类型与 ESLint 相关依赖到最新补丁。

- [`1788e26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1788e26153bafc865776d5a761c2e28dafff6918) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 splitCode 在压缩模板字符串中保留转义空白导致类名匹配遗漏的问题，保证 mp-alipay 等产物的类名替换正常工作。

- Updated dependencies [[`1788e26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1788e26153bafc865776d5a761c2e28dafff6918)]:
  - @weapp-tailwindcss/shared@1.1.1
  - @weapp-tailwindcss/postcss@2.0.4

## 4.8.3

### Patch Changes

- [`45aed93`](https://github.com/sonofmagic/weapp-tailwindcss/commit/45aed9338aae0181f873e7960b522a37b835af73) Thanks [@sonofmagic](https://github.com/sonofmagic)! - - 重构 tailwindcss 上下文，提炼出 workspace 工具模块，解决 `PNPM_PACKAGE_NAME` 场景下的 workspace 目录解析问题，并补充对应单测，确保 `rewriteCssImports` 能在过滤构建时正确生效。

- [`7a455f6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7a455f61a7f0bd8a08cf51fac00083a6daa99d12) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 webpack demos 在开启 `rewriteCssImports` 时未能把 `@import "tailwindcss"` 重写为 `weapp-tailwindcss` 的问题，确保运行时 loader 会在 PostCSS 之前插入并重写 CSS 导入。

## 4.8.2

### Patch Changes

- [`af1133d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/af1133df2377e729d8ca0980e854a4c0b81d3ef8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 完善默认 basedir 推断逻辑，让 monorepo 子包无需额外配置即可正确绑定 Tailwind，并恢复运行时类名集合。

- [`0872174`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0872174f3cbba12b69ace58e2192501e26ddd388) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 记录 weapp-tw patch 目标文件迁移到 node_modules 缓存并在损坏时给出修复提示，提升多包/hoist 下的 Tailwind 对齐体验。

## 4.8.1

### Patch Changes

- [`7da97f4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7da97f47623fb79e2a8b3bd612b618a8553460ad) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 提炼 Vite/webpack 共享的 `rewriteCssImports` 能力，只在 tailwindcss v4 且未关闭时生效：Vite 在 CSS transform 阶段重写 `@import 'tailwindcss'`，Webpack 则在模块解析阶段统一指向 `weapp-tailwindcss`，避免小程序产物残留 PC 预设或类型告警。

## 4.8.0

### Minor Changes

- [`445d0d5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/445d0d5353a1b98986bdf6c9064b1edfd7fab12c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - - 新增 `rewriteCssImports`（默认开启），在 webpack/vite 处理 CSS 导入时把 `@import 'tailwindcss'` 透明映射到 `weapp-tailwindcss`（JS/TS 不受影响），也允许按需关闭。
  - 提供 `vscode-entry` CLI 生成 VS Code 专用的根 CSS 文件，并在官网文档中补充完整说明。

### Patch Changes

- [`fe2c6e8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/fe2c6e85dd84bcdb0094ee56bad36c29ff84a315) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 Taro 构建重复实例化 UnifiedWebpackPluginV5 时会创建多份 Tailwind 运行时的问题：
  新增编译上下文缓存、复用 tailwindcss patcher，并保证相同配置只初始化一次以降低内存占用。

## 4.7.10-alpha.0

### Patch Changes

- [`fe2c6e8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/fe2c6e85dd84bcdb0094ee56bad36c29ff84a315) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 Taro 构建重复实例化 UnifiedWebpackPluginV5 时会创建多份 Tailwind 运行时的问题：
  新增编译上下文缓存、复用 tailwindcss patcher，并保证相同配置只初始化一次以降低内存占用。

## 4.7.9

### Patch Changes

- [`06b189e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/06b189ec59ac0b6022466ae3cefcf81b77917698) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复仅有单个 CSS entry 时 v4 base 错指项目根目录，确保按 entry 所在目录生成 patcher 以避免 @config 解析错位。

## 4.7.8

### Patch Changes

- [`09dbf75`](https://github.com/sonofmagic/weapp-tailwindcss/commit/09dbf75f5e503d1a1a53ee0f320cabb4f802bcf0) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat(cli): `weapp-tw patch` 默认不再清理 `tailwindcss-patch` 缓存目录，新增 `--clear-cache` 选项用于按需清理

  变更说明
  - 以前：执行 `weapp-tw patch` 会在补丁前主动删除 `tailwindcss-patch` 的缓存目录（通常位于 `node_modules/.cache/tailwindcss-patch`），以避免缓存导致的补丁失效或读取旧产物。
  - 现在：默认不清理缓存，更加保守、稳定，减少不必要的 IO 和潜在的 CI 侧效应；如需要强制刷新缓存，请显式传入 `--clear-cache`。

  如何迁移
  - 原有脚本不需要修改即可继续使用；仅当你希望“每次 patch 都强制清缓存”时，将脚本由：
    - `weapp-tw patch`
      替换为：
    - `weapp-tw patch --clear-cache`

  建议
  - 推荐只在遇到疑似缓存导致的“补丁未生效/版本不一致”问题时，手动或临时在 CI 中加上 `--clear-cache`，其余情况下维持默认行为即可。\*\*\*

- [`b252207`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b252207f6d7c9cabaebbaa75e1763bf1d2c65a67) Thanks [@sonofmagic](https://github.com/sonofmagic)! - perf(js): 按需作用域与缓存优化，加速 JS 处理；修复 noScope 下 eval/require 遍历报错
  - 分析遍历默认启用 `noScope`，仅在配置了 `ignoreCallExpressionIdentifiers` 时才构建作用域
  - `eval` 处理：优先使用 `path.traverse`，若因缺少 `scope/parentPath` 报错则降级到参数级手工遍历，兼容测试桩与仅 AST 形态
  - `require` 收集：在 `noScope` 下放宽 `hasBinding` 判定，确保可正确采集 `require('...')` 字面量
  - `MagicString`：当没有任何 token 时跳过实例化与写入，减少不必要开销
  - 解析缓存：支持 `parserOptions.cacheKey` 并在默认项中注入；AST LRU 提升至 1024
  - 稳健性：`NodePathWalker`、`taggedTemplateIgnore` 访问 `.scope` 统一做空值保护

  fix(types/tests): 修复类型告警与单测不匹配
  - 扩展 `ParserOptions` 以支持 `cacheKey`
  - `TailwindcssPatcherLike` 去除对私有 `cacheStore` 的类型依赖
  - 调整部分测试桩签名与 `Node` 类型引用；`webpack.v5`、`evalTransforms`、`module-replacements` 等用例通过

- Updated dependencies [[`abcb4b5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/abcb4b5db5bf42b0363b6b318570cffe2991eb72)]:
  - @weapp-tailwindcss/postcss@2.0.3

## 4.7.7

### Patch Changes

- [`a70e54b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a70e54bc540b63d204a71ef7369d32ec5f022a34) Thanks [@sonofmagic](https://github.com/sonofmagic)! - `weapp-tw patch` 在执行前会自动删除 `tailwindcss-patch` 的缓存目录（通常为 `node_modules/.cache/tailwindcss-patch`），避免残留缓存导致补丁失效或读取到旧版本产物。

- [`f9a1b1e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f9a1b1ebd719a076499b369c386ea46b4b46a86f) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 `weapp-tailwindcss/escape` 在浏览器（含 Vite）环境中因 Node 专属 shims 注入 `fileURLToPath` 导致的构建报错，确保 weappTwIgnore 等运行时 API 可直接在前端打包器里使用；同时补充导出 `unescape`，方便运行时手动还原被 escape 过的类名。

- [`a70e54b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a70e54bc540b63d204a71ef7369d32ec5f022a34) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 JS handler 在标记 weappTwIgnore 模板后仍会误转译后续相同字面量的问题，确保仅跳过被 weappTwIgnore 包裹的模板，其它位置仍按运行时类集正常转译。

- [`0ceeef7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0ceeef7b0daf8be9f91eb5818cd6c013a669cfcc) Thanks [@sonofmagic](https://github.com/sonofmagic)! - CLI 与运行时新增中文提示的 Tailwind CSS 目标日志：`weapp-tw patch` 可通过 `--record-target` 生成 `node_modules/.cache/weapp-tailwindcss/tailwindcss-target.json`（旧版本保留 `.tw-patch` 兼容），运行时若检测到补丁目标与实际加载不一致会给出中文告警，方便定位多包场景下的 patch 对齐问题。

## 4.7.6

### Patch Changes

- [`8cb5087`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8cb508736daa02f232a546a7c5909a62830c6c9a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复运行时类名集合包含内容扫描候选导致 JS 普通字符串被误转译的问题，并去掉仓库里对 tailwindcss-patch 的 catalog 固定，确保依赖行为与独立仓库一致。

## 4.7.5

### Patch Changes

- [`d69bb5a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d69bb5a6e18ddbd99ec3e62ee9a398fa8f8bf19a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: uni-app-x hmr 0

- [`897c5e6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/897c5e653ddd4b1dceae4466cebc9d954ebd9f1a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 uni-app x 在 watch/hmr 场景下强制刷新 runtime class set 时仍沿用旧 Tailwind patcher 的问题，确保热更新能立即拾取新增的任意类名。

- [`770661f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/770661f7b4fcf71331d558e6ce194ebc82f62fed) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 抽取并复用 Tailwind 运行时刷新逻辑，避免重复 patch 调用并修复热更新测试。

## 4.7.5-alpha.1

### Patch Changes

- [`897c5e6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/897c5e653ddd4b1dceae4466cebc9d954ebd9f1a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 uni-app x 在 watch/hmr 场景下强制刷新 runtime class set 时仍沿用旧 Tailwind patcher 的问题，确保热更新能立即拾取新增的任意类名。

- [`770661f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/770661f7b4fcf71331d558e6ce194ebc82f62fed) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 抽取并复用 Tailwind 运行时刷新逻辑，避免重复 patch 调用并修复热更新测试。

## 4.7.5-alpha.0

### Patch Changes

- [`d69bb5a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d69bb5a6e18ddbd99ec3e62ee9a398fa8f8bf19a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: uni-app-x hmr 0

## 4.7.4

### Patch Changes

- [`ce5b4e6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ce5b4e65d3e8aa6eae437cdf804686162a093ca3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 uni-app x 模板在处理空 `class` 或空 `:class` 属性时触发 MagicString “Cannot overwrite a zero-length range” 异常的问题。

  同时为 uni-app x 模板管线补齐 `customAttributes` 配置支持，可在 Vue 模板中自定义需要转译的属性规则，并兼容 `disabledDefaultTemplateHandler` 行为。

- [`040e6d6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/040e6d62dc7747b4cdf081ccf7e88c2a46248e51) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 确保 uni-app x 在 Vite 流程中等待运行时类名集合准备完成，修复频繁修改 `text-[#e73909]` 等类名时偶发的转译缺失问题。

  允许在 uni-app x / HBuilderX 预设外层直接配置 `customAttributes`，无需再通过 `rawOptions` 透传。

## 4.7.3

### Patch Changes

- [`905e4d6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/905e4d6def6d87763836309b9d85ab32487c618f) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复在 uni-app x 与其它 Vue 模板中，`:class` 使用对象、数组或三元表达式时，`border-[#ff0000] bg-blue-600/50` 这类带空格/特殊字符的类名无法被 weapp-tailwindcss 转译的问题。现在会自动在需要时以表达式模式解析并转义这些原子类。

- [`803fc79`](https://github.com/sonofmagic/weapp-tailwindcss/commit/803fc7979b5e42437ed701b9885afda02836677c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构 CLI 结构并改用惰性加载方式获取 `@tailwindcss-mangle/config`，修复 ESLint/TS 报错，保证在 Node.js 18 下同样可用。

- Updated dependencies [[`aaff7b8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/aaff7b819b6aed74c473d677aeefcedd0fbd81be), [`ad1ee06`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ad1ee0642dd3bd22fffb2bc448b8850341729443)]:
  - @weapp-tailwindcss/postcss@2.0.2

## 4.7.2

### Patch Changes

- [`79a7041`](https://github.com/sonofmagic/weapp-tailwindcss/commit/79a70412d6d3992b6e82ee79703f8db2e1f8d0c8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - - 抽取 `tailwind` patch 与并发任务的公共工具，统一在各打包插件中复用，降低重复代码并简化后续维护。
  - 强制刷新运行时类集，修复多次构建时的缓存偏差，并确保 Vite 并发链式处理能正确落盘联动产物。

- [`a35766d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a35766dec66b8d078c5795cfcc262e5a9b21e4f2) Thanks [@sonofmagic](https://github.com/sonofmagic)! - - 彻底移除 `jsAstTool` 相关配置、类型与测试，正式结束对 `ast-grep` 解析器的兼容。
  - 移除 `customRuleCallback` 配置与对应类型、默认值和测试，内置 PostCSS 处理逻辑不再暴露该扩展点。

- [`69a8201`](https://github.com/sonofmagic/weapp-tailwindcss/commit/69a820120fbefb14afce653a9a5b3007414453d1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 收紧 JS 标记模板的忽略范围：默认仅认得 `weappTwIgnore` 及其导入别名，普通 `String.raw` 别名会继续转译。顺便把 `eval`、模块替换等逻辑拆分到独立模块，后续维护更清晰。

- Updated dependencies [[`a35766d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a35766dec66b8d078c5795cfcc262e5a9b21e4f2)]:
  - @weapp-tailwindcss/postcss@2.0.1

## 4.7.1

### Patch Changes

- [`27d198e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/27d198eb48b0080076a480a6ab39d3cb93ae14a0) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 `tailwindcss-patch` 默认缓存目录，确保其写入包级 `node_modules/.cache/tailwindcss-patch`。

## 4.7.0

### Minor Changes

- [`c5a834c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c5a834c1d535b378371a94cb860f46d838979e32) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构 `@weapp-tailwindcss/merge` 的安装后脚本，自动识别 Tailwind CSS 版本、支持环境变量强制切换并提供安全的回退流程。同时将 `postinstall` 作为构建入口确保脚本始终打包输出。默认配置包移除对 `twMerge` 等辅助函数的自动忽略，交由用户按需配置。

### Patch Changes

- [`6d4c0f2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6d4c0f2b49ea6bf5d3c2507a3d9b9700ead81a89) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 对 core 相关用例的 WXML/JS 断言进行同步，适配升级后的 `@weapp-core/escape` 转义结果。

## 4.6.3

### Patch Changes

- [`c273d73`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c273d733c3aecc98ab600867e994fb48ef3e25d9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 去除 cssClac.includeCustomProperties 里面 --spacing 默认值，为了 tailwindcss@4 space-reverse 的场景

- Updated dependencies [[`dea2ecb`](https://github.com/sonofmagic/weapp-tailwindcss/commit/dea2ecba1a7232d10b60701664424dbde8a58141)]:
  - @weapp-tailwindcss/postcss@2.0.0

## 4.6.2

### Patch Changes

- [`9e08c57`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9e08c5718d707e06dbf25657fc20f7a8213ea7c8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 升级 tailwindcss-patch 允许 cjs 加载以兼容 hbuilderx

## 4.6.1

### Patch Changes

- Updated dependencies [[`cb7d4ed`](https://github.com/sonofmagic/weapp-tailwindcss/commit/cb7d4ed16826159bfaabbad1ae7571d94e9d5257)]:
  - @weapp-tailwindcss/postcss@1.3.4

## 4.6.0

### Minor Changes

- [`10fd23d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/10fd23de83adb895fc39907c9e159b2c62df56a6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 异步化 tailwind patcher 的类名集合获取方法，并统一通过 extract 收集最新 runtime 集合，提升多构建器在缓存命中场景下的准确性

### Patch Changes

- [`54669fe`](https://github.com/sonofmagic/weapp-tailwindcss/commit/54669fef15f964756cb428bd566926d7ef9226cd) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 适配 `tailwindcss-patch@8` 新接口，补充解析路径与包名配置，保障 PostCSS7 兼容项目与各构建器在升级后仍可正确加载补丁；默认从当前子项目的 `node_modules` 中解析 Tailwind 依赖，并同步移除示例工程里冗余的 `tailwindcssBasedir` 设置

## 4.5.2

### Patch Changes

- [`2d7cab5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2d7cab5f496325c69977a0b8aa04f33a593f31e6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - - 新增 `hbuilderx` 预设，默认补齐 `tailwindcss` 与 `tailwindcss-patch` 的 `basedir/cwd` 配置，简化 HBuilderX 场景下的使用。
  - 改进基础目录解析逻辑，优先读取 `UNI_INPUT_DIR` 等环境变量并回写 `tailwindcssBasedir`，避免 HBuilderX 修改 `process.cwd()` 导致的路径错误。

## 4.5.1

### Patch Changes

- [`a162bb9`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a162bb92f5bcb88307dbe6c3df0a6828159f6056) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复仅传入 `cssEntries` 时无法自动启用 Tailwind v4 补丁的问题，恢复与显式配置 `tailwindcss.v4.cssEntries` 的等价行为。

## 4.5.0

### Minor Changes

- [`1be5402`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1be5402e56f68cf024d0a3eee1a6fdfa827767c6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 新增跨文件 JS 模块图，沿着 import 与 re-export 链路收集并转译类名，实现一次处理整条依赖链，同时允许调用方通过新增的 handler 选项主动开启。`tailwindcss-config` 也改为复用共享工具以保持一致。当本地未安装 `tailwindcss` 时，将提示一次警告并使用空实现兜底，避免直接抛错。

### Patch Changes

- [`b63ced9`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b63ced990c5e3aa8a20e79057391a3928b7e976c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Tailwind 模式下默认为 `@weapp-tailwindcss/postcss-calc` 注入 `includeCustomProperties: ['--spacing']`，确保间距变量自动参与计算。\*\*\*

- [`2c67b1d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c67b1ded66992a3308baf0c37fd314bd582ca00) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 Gulp 打包流程在解析本地模块时漏掉目录形式的 `index.*` 文件，确保跨文件模块图能够正确跟进依赖，并补充对应单测验证行为。

- [`9291bad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9291bad1821c72f05e64b010ea3da94293a34d42) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 暴露用于 md5 哈希与拓展名裁剪的 Node 侧工具函数，并重构依赖这些能力的包以统一复用共享实现。

- Updated dependencies [[`9291bad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9291bad1821c72f05e64b010ea3da94293a34d42)]:
  - @weapp-tailwindcss/shared@1.1.0
  - @weapp-tailwindcss/mangle@1.0.6
  - @weapp-tailwindcss/postcss@1.3.3

## 4.5.0-alpha.1

### Patch Changes

- [`b63ced9`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b63ced990c5e3aa8a20e79057391a3928b7e976c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Tailwind 模式下默认为 `@weapp-tailwindcss/postcss-calc` 注入 `includeCustomProperties: ['--spacing']`，确保间距变量自动参与计算。\*\*\*

## 4.5.0-alpha.0

### Minor Changes

- [`1be5402`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1be5402e56f68cf024d0a3eee1a6fdfa827767c6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 新增跨文件 JS 模块图，沿着 import 与 re-export 链路收集并转译类名，实现一次处理整条依赖链，同时允许调用方通过新增的 handler 选项主动开启。`tailwindcss-config` 也改为复用共享工具以保持一致。当本地未安装 `tailwindcss` 时，将提示一次警告并使用空实现兜底，避免直接抛错。

### Patch Changes

- [`2c67b1d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c67b1ded66992a3308baf0c37fd314bd582ca00) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 Gulp 打包流程在解析本地模块时漏掉目录形式的 `index.*` 文件，确保跨文件模块图能够正确跟进依赖，并补充对应单测验证行为。

- [`9291bad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9291bad1821c72f05e64b010ea3da94293a34d42) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 暴露用于 md5 哈希与拓展名裁剪的 Node 侧工具函数，并重构依赖这些能力的包以统一复用共享实现。

- Updated dependencies [[`9291bad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9291bad1821c72f05e64b010ea3da94293a34d42)]:
  - @weapp-tailwindcss/shared@1.1.0-alpha.0
  - @weapp-tailwindcss/mangle@1.0.6-alpha.0
  - @weapp-tailwindcss/postcss@1.3.3-alpha.0

## 4.4.0

### Minor Changes

- [`ebb1059`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ebb1059ff7c13fec90003e6c018bd229ad3c1db8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构缓存子系统与各 bundler 辅助逻辑：统一在缓存层处理哈希与写入流程，简化 `process` API，同时补充针对新行为的测试覆盖。

- [`d56fca5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d56fca539d7c964b558f0434f069674bc832ed2a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构编译上下文模块，将日志、Tailwind 补丁、模板属性转换、处理器构建拆分为独立单元并补充 100% 覆盖率的单元测试，确保模块化结构更清晰且行为可验证。新增 Lightning CSS 版本的样式处理器，覆盖类名转义、选择器兼容、`:hover` 清理与子选择器替换等关键能力，并提供针对性单测。同步优化工具方法：为文件分组逻辑提供固定分组输出，替换已废弃的 `unescape` Unicode 解码实现，并补充对应的单元测试。

### Patch Changes

- [`8dca274`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8dca274fc94abb7a094a0089ddee9aa0ea9073ca) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 优化 uni-app-x 模板遍历与 class 处理逻辑，抽离更新函数并补充静态/动态 class 的单元测试保障。

- [`f288e4d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f288e4d2432014d69dda03d2806c29381b2b82a0) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 优化 `replaceHandleValue` 的热路径，跳过无效拆分、复用正则与转义缓存，并在混淆流程中避免重复处理；同时改进 Unicode 解码与名称匹配工具的性能并补充单测验证。更新 `css-macro` 插件以兼容 Tailwind CSS v3/v4，并在文档中补充使用示例与平台条件写法说明。

- [`ff74426`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ff744264e95a1d32f8bcc64de864292ddc8ff432) Thanks [@sonofmagic](https://github.com/sonofmagic)! - - refactor: js ast 的转译处理
  - perf: 缓存 JS 类名替换时的正则与转义结果，避免重复计算
  - perf: WXML Tokenizer 采用字符码判断空白并复用 token 缓存，降低解析开销
  - perf: 自定义属性匹配按标签分类预处理，避免在解析阶段重复遍历与覆写
  - perf: WXML 片段空白检测改为轻量遍历，减少 `trim` 带来的额外字符串分配
  - perf: 提炼空白检测工具，供 Tokenizer 与模板处理器共享，减少重复逻辑

- [`8b20e71`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b20e716da890c9709122f09810c9a9b51a705ae) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: remove @weapp-tailwindcss/init

- Updated dependencies [[`b766f00`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b766f007d65d3383530452c1860907fa3dcfb00e)]:
  - @weapp-tailwindcss/postcss@1.3.2

## 4.4.0-alpha.1

### Patch Changes

- [`f288e4d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f288e4d2432014d69dda03d2806c29381b2b82a0) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 优化 `replaceHandleValue` 的热路径，跳过无效拆分、复用正则与转义缓存，并在混淆流程中避免重复处理；同时改进 Unicode 解码与名称匹配工具的性能并补充单测验证。更新 `css-macro` 插件以兼容 Tailwind CSS v3/v4，并在文档中补充使用示例与平台条件写法说明。

## 4.4.0-alpha.0

### Minor Changes

- [`ebb1059`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ebb1059ff7c13fec90003e6c018bd229ad3c1db8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构缓存子系统与各 bundler 辅助逻辑：统一在缓存层处理哈希与写入流程，简化 `process` API，同时补充针对新行为的测试覆盖。

- [`d56fca5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d56fca539d7c964b558f0434f069674bc832ed2a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 重构编译上下文模块，将日志、Tailwind 补丁、模板属性转换、处理器构建拆分为独立单元并补充 100% 覆盖率的单元测试，确保模块化结构更清晰且行为可验证。新增 Lightning CSS 版本的样式处理器，覆盖类名转义、选择器兼容、`:hover` 清理与子选择器替换等关键能力，并提供针对性单测。同步优化工具方法：为文件分组逻辑提供固定分组输出，替换已废弃的 `unescape` Unicode 解码实现，并补充对应的单元测试。

### Patch Changes

- [`8dca274`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8dca274fc94abb7a094a0089ddee9aa0ea9073ca) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 优化 uni-app-x 模板遍历与 class 处理逻辑，抽离更新函数并补充静态/动态 class 的单元测试保障。

- [`ff74426`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ff744264e95a1d32f8bcc64de864292ddc8ff432) Thanks [@sonofmagic](https://github.com/sonofmagic)! - - refactor: js ast 的转译处理
  - perf: 缓存 JS 类名替换时的正则与转义结果，避免重复计算
  - perf: WXML Tokenizer 采用字符码判断空白并复用 token 缓存，降低解析开销
  - perf: 自定义属性匹配按标签分类预处理，避免在解析阶段重复遍历与覆写
  - perf: WXML 片段空白检测改为轻量遍历，减少 `trim` 带来的额外字符串分配
  - perf: 提炼空白检测工具，供 Tokenizer 与模板处理器共享，减少重复逻辑

- [`8b20e71`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b20e716da890c9709122f09810c9a9b51a705ae) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: remove @weapp-tailwindcss/init

- Updated dependencies [[`b766f00`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b766f007d65d3383530452c1860907fa3dcfb00e)]:
  - @weapp-tailwindcss/postcss@1.3.2-alpha.0

## 4.3.3

### Patch Changes

- [`a247218`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a24721839b36531bc047b86165ecec1938fe0814) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 升级 `tailwindcss-patch` 把 `@tailwindcss/node` 作为依赖，修复 [Bug]: Cannot find module '@tailwindcss/node'

- [`125d067`](https://github.com/sonofmagic/weapp-tailwindcss/commit/125d0678f701d5279cb1c86236420be9544ac53a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 优化 webpack 插件缓存 key 的计算方式

- Updated dependencies [[`d028fb3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d028fb33297cfac6f2f9c233510f84c7850a8ae9)]:
  - @weapp-tailwindcss/postcss@1.3.1

## 4.3.2

### Patch Changes

- Updated dependencies [[`4ffb90b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4ffb90bc754459d93929d2de3a843d46edc48f53)]:
  - @weapp-tailwindcss/postcss@1.3.0
  - @weapp-tailwindcss/init@1.0.7

## 4.3.1

### Patch Changes

- Updated dependencies [[`d9db976`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d9db9766f428147b01ba4e381549c54083f4fd5a)]:
  - @weapp-tailwindcss/postcss@1.2.2

## 4.3.0

### Minor Changes

- [`a56705e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a56705e28b9d8a9ad00d28a4b23450000d7920ac) Thanks [@sonofmagic](https://github.com/sonofmagic)! - <br/>

  # 计算模式

  feat: 在 `tailwindcss@4` 下默认启用 `计算模式`

  在 `tailwindcss@4` 下，默认启用计算模式。`tailwindcss@3` 默认不启用。

  此模式下会去预编译所有的 `css` 变量和 `calc` 计算表达式。

  这个模式可以解决很多手机机型 `calc` `rpx` 单位的兼容问题

  可通过传入 `cssCalc` 配置项 `false` 来关闭这个功能

  详见: https://tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions#csscalc

  ## 新增配置项

  feat: 添加 `px2rpx` 配置项， 用于控制是否将 `px` 单位转换为 `rpx` 单位， 默认为 `false`

  传入 `true` 则会将所有的 `px` 单位, `1:1` 转换为 `rpx` 单位

  假如需要更多的转化方式，可以传入一个 `object`, 配置项见 https://www.npmjs.com/package/postcss-pxtransform

  详见: https://tw.icebreaker.top/docs/api/interfaces/UserDefinedOptions#px2rpx

  ***

  feat: 添加 `logLevel` 配置项，用于控制日志输出级别， 默认为 `info`

### Patch Changes

- Updated dependencies [[`0d76388`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d763881fad85d20a926db89bc29ec9113cfc0b3), [`6e9cbc4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6e9cbc46cc954a02cb45542fbebf10d313fc16ea)]:
  - @weapp-tailwindcss/postcss@1.2.1
  - @weapp-tailwindcss/logger@1.1.0
  - @weapp-tailwindcss/init@1.0.6

## 4.3.0-alpha.0

### Minor Changes

- [`a56705e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a56705e28b9d8a9ad00d28a4b23450000d7920ac) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 在 tailwindcss@4 下默认启用计算模式

### Patch Changes

- Updated dependencies [[`0d76388`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d763881fad85d20a926db89bc29ec9113cfc0b3), [`6e9cbc4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6e9cbc46cc954a02cb45542fbebf10d313fc16ea)]:
  - @weapp-tailwindcss/postcss@1.2.1-alpha.0
  - @weapp-tailwindcss/logger@1.1.0-alpha.0
  - @weapp-tailwindcss/init@1.0.6-alpha.0

## 4.2.9

### Patch Changes

- [`59bdd20`](https://github.com/sonofmagic/weapp-tailwindcss/commit/59bdd205dcfc2d30a097c63d9451d08a3cfb1e73) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 默认开启 cssRemoveProperty, 因为 `@property` 会导致支付宝小程序直接挂掉

- Updated dependencies [[`59bdd20`](https://github.com/sonofmagic/weapp-tailwindcss/commit/59bdd205dcfc2d30a097c63d9451d08a3cfb1e73), [`ce1150c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ce1150cd87f22736e59f17e5d8a7b61a1354d4cd)]:
  - @weapp-tailwindcss/postcss@1.2.0

## 4.2.8

### Patch Changes

- Updated dependencies [[`7a33c9a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7a33c9afc8dfe1c32c76d0598e30753970a57146)]:
  - @weapp-tailwindcss/postcss@1.1.1

## 4.2.7

### Patch Changes

- [`88e4b4d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/88e4b4def9025f50d262df35b8163cbaa73f4b36) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 设置 `cssRemoveProperty` 默认为 `false`

  这是因为在部分小程序的真机，还有微信开发者工具中 `@property` 已经生效

- [`88a1d3d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/88a1d3d4b2ede7b62801fde85186afbbd620f7f4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 跳过不正确的 `sourcemap` 处理覆盖

## 4.2.6

### Patch Changes

- [`a8857e6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a8857e6e8cf196c273e5e56e5745e2de97cd308a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 依赖更新

- [`39e8e57`](https://github.com/sonofmagic/weapp-tailwindcss/commit/39e8e57cf8d54a0f1662b016a7cdb260326985f6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加 cssEntries 作为 tailwindcss@4 的入口 css 的位置

- [`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 对 postcss-html-transform 进行二次封装

- Updated dependencies [[`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3), [`a5d198f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a5d198ff0e8af52f218df98f3ce76a5dbfd8c691)]:
  - @weapp-tailwindcss/postcss@1.1.0
  - @weapp-tailwindcss/init@1.0.5

## 4.2.6-alpha.2

### Patch Changes

- Updated dependencies [[`a5d198f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a5d198ff0e8af52f218df98f3ce76a5dbfd8c691)]:
  - @weapp-tailwindcss/postcss@1.1.0-alpha.1

## 4.2.6-alpha.1

### Patch Changes

- [`a8857e6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a8857e6e8cf196c273e5e56e5745e2de97cd308a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 依赖更新

## 4.2.6-alpha.0

### Patch Changes

- [`39e8e57`](https://github.com/sonofmagic/weapp-tailwindcss/commit/39e8e57cf8d54a0f1662b016a7cdb260326985f6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加 cssEntries 作为 tailwindcss@4 的入口 css 的位置

- [`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 对 postcss-html-transform 进行二次封装

- Updated dependencies [[`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3)]:
  - @weapp-tailwindcss/postcss@1.0.22-alpha.0
  - @weapp-tailwindcss/init@1.0.5-alpha.0

## 4.2.5

### Patch Changes

- [`c7892d6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c7892d699d798abe27c63d1345423a5ac147cc76) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 优化 css 生成

- Updated dependencies [[`c7892d6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c7892d699d798abe27c63d1345423a5ac147cc76)]:
  - @weapp-tailwindcss/postcss@1.0.21
  - @weapp-tailwindcss/init@1.0.4

## 4.2.4

### Patch Changes

- Updated dependencies [[`6cae2c1`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6cae2c1471bfb7fdc182815ba95b566ad6f51dfa)]:
  - @weapp-tailwindcss/postcss@1.0.20

## 4.2.3

### Patch Changes

- [`f0d225e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f0d225e95eb3c8e0c97af4abf9c32b4abb57cd72) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 修复 uvue lang 设置为 uts 的解析问题

## 4.2.2

### Patch Changes

- [`e17ca06`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e17ca06eb46c5c877dc328ee3937705f8f86ab71) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持鸿蒙系统

- [`8e4f8ad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8e4f8ad3a5e7e5ba4fa4b0ef7d365e412d1d881e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css sourcemap

- [`57527cf`](https://github.com/sonofmagic/weapp-tailwindcss/commit/57527cfb93f997fc6de4a168a8dfca70f1c94d0c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 添加 UNI_PLATFORM harmony 的判断

- Updated dependencies [[`8e4f8ad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8e4f8ad3a5e7e5ba4fa4b0ef7d365e412d1d881e)]:
  - @weapp-tailwindcss/postcss@1.0.19

## 4.2.2-alpha.2

### Patch Changes

- [`8e4f8ad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8e4f8ad3a5e7e5ba4fa4b0ef7d365e412d1d881e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css sourcemap

- Updated dependencies [[`8e4f8ad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8e4f8ad3a5e7e5ba4fa4b0ef7d365e412d1d881e)]:
  - @weapp-tailwindcss/postcss@1.0.19-alpha.0

## 4.2.2-alpha.1

### Patch Changes

- [`57527cf`](https://github.com/sonofmagic/weapp-tailwindcss/commit/57527cfb93f997fc6de4a168a8dfca70f1c94d0c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 添加 UNI_PLATFORM harmony 的判断

## 4.2.2-alpha.0

### Patch Changes

- [`e17ca06`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e17ca06eb46c5c877dc328ee3937705f8f86ab71) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持鸿蒙系统

## 4.2.1

### Patch Changes

- [`d5c892c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d5c892c66046b81ae22b1e37b5d59f4a549d61c9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: uni-app x sourcemap

- [`05d9725`](https://github.com/sonofmagic/weapp-tailwindcss/commit/05d9725fa83496e72ce5386230a344ac30aa41fa) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: uni-app x ios build

- [`7927bf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7927bf25cfac2f8df90e91eaa2379ba45079499b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css always generate map for uni-app x

- [`1c81e7b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1c81e7b21747494c61bae264fe4da7a9c2344435) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: add uni-app x css sourcemap

- Updated dependencies [[`7927bf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7927bf25cfac2f8df90e91eaa2379ba45079499b)]:
  - @weapp-tailwindcss/postcss@1.0.18

## 4.2.1-alpha.3

### Patch Changes

- [`7927bf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7927bf25cfac2f8df90e91eaa2379ba45079499b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css always generate map for uni-app x

- Updated dependencies [[`7927bf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7927bf25cfac2f8df90e91eaa2379ba45079499b)]:
  - @weapp-tailwindcss/postcss@1.0.18-alpha.0

## 4.2.1-alpha.2

### Patch Changes

- [`1c81e7b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1c81e7b21747494c61bae264fe4da7a9c2344435) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: add uni-app x css sourcemap

## 4.2.1-alpha.1

### Patch Changes

- [`d5c892c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d5c892c66046b81ae22b1e37b5d59f4a549d61c9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: uni-app x sourcemap

## 4.2.1-alpha.0

### Patch Changes

- [`05d9725`](https://github.com/sonofmagic/weapp-tailwindcss/commit/05d9725fa83496e72ce5386230a344ac30aa41fa) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: uni-app x ios build

## 4.2.0

### Minor Changes

- [`c001984`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c001984ca82324f71353d8419f13e50c0e89f0e3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持 uni-app-x 构建 app 原生的方式

### Patch Changes

- [`77c0a47`](https://github.com/sonofmagic/weapp-tailwindcss/commit/77c0a4743c778ad6bf8a1d046c9966a3e016c1b6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade tailwindcss-patch

- [`3248d34`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3248d342d07372e0627e21dcdd528ad44d2b52be) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 支持 `index.uvue?type=page` 路径的兼容匹配

- [`0d8d68a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d8d68ad70b9c308ba5c3aa42db5d543246ee1c5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: pkg resolve issue

- Updated dependencies [[`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1)]:
  - @weapp-tailwindcss/init@1.0.3
  - @weapp-tailwindcss/logger@1.0.2
  - @weapp-tailwindcss/mangle@1.0.5
  - @weapp-tailwindcss/postcss@1.0.17
  - @weapp-tailwindcss/shared@1.0.3

## 4.2.0-alpha.4

### Patch Changes

- [`77c0a47`](https://github.com/sonofmagic/weapp-tailwindcss/commit/77c0a4743c778ad6bf8a1d046c9966a3e016c1b6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade tailwindcss-patch

## 4.2.0-alpha.3

### Patch Changes

- [`3248d34`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3248d342d07372e0627e21dcdd528ad44d2b52be) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 支持 `index.uvue?type=page` 路径的兼容匹配

## 4.2.0-alpha.2

### Patch Changes

- Updated dependencies [[`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1)]:
  - @weapp-tailwindcss/init@1.0.3-alpha.0
  - @weapp-tailwindcss/logger@1.0.2-alpha.0
  - @weapp-tailwindcss/mangle@1.0.5-alpha.0
  - @weapp-tailwindcss/postcss@1.0.17-alpha.0
  - @weapp-tailwindcss/shared@1.0.3-alpha.0

## 4.2.0-alpha.1

### Patch Changes

- [`0d8d68a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d8d68ad70b9c308ba5c3aa42db5d543246ee1c5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: pkg resolve issue

## 4.2.0-alpha.0

### Minor Changes

- [`c001984`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c001984ca82324f71353d8419f13e50c0e89f0e3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持 uni-app-x 构建 app 原生的方式

## 4.1.11

### Patch Changes

- Updated dependencies [[`f2c69d5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f2c69d5bd8e1dc3d39eced8ff62b75e0c4ef3591)]:
  - @weapp-tailwindcss/postcss@1.0.16

## 4.1.10

### Patch Changes

- [`2b0a754`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2b0a75493506d219d1b49474f3ce684d107fcbd1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: [#655](https://github.com/sonofmagic/weapp-tailwindcss/issues/655) 默认自动去除 `@layer` 在 `postcss-env-preset` 处理之前

- Updated dependencies [[`2b0a754`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2b0a75493506d219d1b49474f3ce684d107fcbd1)]:
  - @weapp-tailwindcss/postcss@1.0.15

## 4.1.9

### Patch Changes

- [`b090e69`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b090e699d279bfba680ecf208772500ea3689122) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 同步 uni-app 和 uni-app-vite 的配置

- Updated dependencies [[`bf7e53c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bf7e53cfcd69c49c5cd99f7bf21ad0999a31b1d6)]:
  - @weapp-tailwindcss/postcss@1.0.14

## 4.1.8

### Patch Changes

- [`5d89878`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5d89878854e1b707ed4afafffee096ec19976bae) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: default remove postcss-html-transform

- [`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add postcss-html-transform plugin

- [`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: injectAdditionalCssVarScope for tailwindcss@4

- Updated dependencies [[`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22), [`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df)]:
  - @weapp-tailwindcss/postcss@1.0.13

## 4.1.8-beta.2

### Patch Changes

- [`5d89878`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5d89878854e1b707ed4afafffee096ec19976bae) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: default remove postcss-html-transform

## 4.1.8-beta.1

### Patch Changes

- [`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add postcss-html-transform plugin

- Updated dependencies [[`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22)]:
  - @weapp-tailwindcss/postcss@1.0.13-beta.1

## 4.1.8-beta.0

### Patch Changes

- [`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: injectAdditionalCssVarScope for tailwindcss@4

- Updated dependencies [[`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df)]:
  - @weapp-tailwindcss/postcss@1.0.13-beta.0

## 4.1.7

### Patch Changes

- Updated dependencies [[`5d27de5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5d27de5a509da6984e77036da8a176e0570ba5c1)]:
  - @weapp-tailwindcss/postcss@1.0.12

## 4.1.6

### Patch Changes

- [`23d35ac`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23d35aceddb9924d60a7afc5459f518b2e356f30) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: taro vue3 的上下文获取

## 4.1.6-alpha.0

### Patch Changes

- [`23d35ac`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23d35aceddb9924d60a7afc5459f518b2e356f30) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: taro vue3 的上下文获取

## 4.1.5

### Patch Changes

- [`3cecfdc`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3cecfdccfcdfacd262fee571b0209e095b33838e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 移除带有 `@supports` `color-mix` 的 css 节点, 修复
  - [#632](https://github.com/sonofmagic/weapp-tailwindcss/issues/632)
  - [#631](https://github.com/sonofmagic/weapp-tailwindcss/issues/631)

  > 但是这种行为会导致使用透明度 + css 变量的时候，被回滚到固定的颜色值，因为微信小程序不支持 `color-mix`，同时 `tailwindcss` 依赖 `color-mix` + `css var` 来进行颜色变量的计算。

- Updated dependencies [[`3cecfdc`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3cecfdccfcdfacd262fee571b0209e095b33838e)]:
  - @weapp-tailwindcss/postcss@1.0.11

## 4.1.4

### Patch Changes

- [`10aebb1`](https://github.com/sonofmagic/weapp-tailwindcss/commit/10aebb1a5ed73bac76c1370e44ea93cd820ed60c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add minify css

- [`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support `tailwindcss@4.1.2`

- [`899226d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/899226d71c5fd022e0f374192766a5ed4e9fa5d4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: build resolved css

- [`865d8c2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/865d8c2a1bcb56765cf06d9a918c88e16051f17c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: minify exports css

- Updated dependencies [[`8b45542`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b4554295e9671fd740fa18a9f9a25a17613597b), [`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d), [`0d6564a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d6564aaaea588289dac5b1b784b1902105b297a), [`23c08c7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23c08c7d7ad276035ffa3ef78d0fb00e1c717ddf)]:
  - @weapp-tailwindcss/postcss@1.0.10

## 4.1.4-alpha.5

### Patch Changes

- [`865d8c2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/865d8c2a1bcb56765cf06d9a918c88e16051f17c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: minify exports css

## 4.1.4-alpha.4

### Patch Changes

- Updated dependencies [[`8b45542`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b4554295e9671fd740fa18a9f9a25a17613597b)]:
  - @weapp-tailwindcss/postcss@1.0.10-alpha.3

## 4.1.4-alpha.3

### Patch Changes

- [`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support `tailwindcss@4.1.2`

- Updated dependencies [[`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d)]:
  - @weapp-tailwindcss/postcss@1.0.10-alpha.2

## 4.1.4-alpha.2

### Patch Changes

- Updated dependencies [[`23c08c7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23c08c7d7ad276035ffa3ef78d0fb00e1c717ddf)]:
  - @weapp-tailwindcss/postcss@1.0.10-alpha.1

## 4.1.4-alpha.1

### Patch Changes

- Updated dependencies [[`0d6564a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d6564aaaea588289dac5b1b784b1902105b297a)]:
  - @weapp-tailwindcss/postcss@1.0.10-alpha.0

## 4.1.4-alpha.0

### Patch Changes

- [`10aebb1`](https://github.com/sonofmagic/weapp-tailwindcss/commit/10aebb1a5ed73bac76c1370e44ea93cd820ed60c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add minify css

- [`899226d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/899226d71c5fd022e0f374192766a5ed4e9fa5d4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: build resolved css

## 4.1.3

### Patch Changes

- [`3113053`](https://github.com/sonofmagic/weapp-tailwindcss/commit/31130538a13098e2a1d29bbd331dc67a195689cf) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Fix: Support `Tailwindcss@4.1.1` and fix [#619](https://github.com/sonofmagic/weapp-tailwindcss/issues/619)

- Updated dependencies [[`3113053`](https://github.com/sonofmagic/weapp-tailwindcss/commit/31130538a13098e2a1d29bbd331dc67a195689cf)]:
  - @weapp-tailwindcss/postcss@1.0.9
  - @weapp-tailwindcss/mangle@1.0.4

## 4.1.2

### Patch Changes

- [`e8c4534`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e8c4534ab588eae1115dac15b529b7a122141316) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加 `cssRemoveProperty` 选项，默认值为 `true`，这是为了在 `tailwindcss` 中移除这种 css 节点:

  ```css
  @property --tw-content {
    syntax: "*";
    initial-value: "";
    inherits: false;
  }
  ```

  这种样式在小程序中，没有任何的意义。

- [`0b0bc70`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0b0bc70f4773f2225eb48d9956cbe63d0858ca48) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 修复在 tailwindcss@4 中由于 @layer 导致选择器优先级升高,高于就近编写的样式的问题

  更改 `weapp-tailwindcss/index.css` 的默认行为，以后小程序默认引入 `weapp-tailwindcss` 就不会产生 `@layer` ，假如开发者在小程序中使用 `@layer` 会导致当前文件的样式层级整体提升 `(n,0,0)`

  添加 `weapp-tailwindcss/with-layer.css` 用来和 `tailwindcss@4` 保持一致

- Updated dependencies [[`e8c4534`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e8c4534ab588eae1115dac15b529b7a122141316)]:
  - @weapp-tailwindcss/postcss@1.0.8

## 4.1.1

### Patch Changes

- [`b6de60f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b6de60f2bb7eb752435e9f9ca2f074276f9d0467) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: webpack4 插件编译错误问题

## 4.1.0

### Minor Changes

- [`3cc8835`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3cc88359d6ff68f7234b9316b9df554d188474df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support js ast cache

### Patch Changes

- [`d52a324`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d52a32406ff3945c5b0a11cc0131baf6b99aee5a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: improve NodePathWalker

- [`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- [`a6ebf16`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a6ebf16d67a23c8c919f2742d836bd50976171a7) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: NodePathWalker walkNode impl

- Updated dependencies [[`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9)]:
  - @weapp-tailwindcss/init@1.0.2
  - @weapp-tailwindcss/logger@1.0.1
  - @weapp-tailwindcss/mangle@1.0.3
  - @weapp-tailwindcss/postcss@1.0.7
  - @weapp-tailwindcss/shared@1.0.2

## 4.1.0-alpha.3

### Patch Changes

- [`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9)]:
  - @weapp-tailwindcss/init@1.0.2-alpha.0
  - @weapp-tailwindcss/logger@1.0.1-alpha.0
  - @weapp-tailwindcss/mangle@1.0.3-alpha.0
  - @weapp-tailwindcss/postcss@1.0.7-alpha.0
  - @weapp-tailwindcss/shared@1.0.2-alpha.0

## 4.1.0-alpha.2

### Patch Changes

- [`a6ebf16`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a6ebf16d67a23c8c919f2742d836bd50976171a7) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: NodePathWalker walkNode impl

## 4.1.0-alpha.1

### Patch Changes

- [`d52a324`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d52a32406ff3945c5b0a11cc0131baf6b99aee5a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: improve NodePathWalker

## 4.1.0-alpha.0

### Minor Changes

- [`3cc8835`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3cc88359d6ff68f7234b9316b9df554d188474df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support js ast cache

## 4.0.11

### Patch Changes

- [`ffa5bb0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ffa5bb0b5d349e5985aec36996a43bbbe9f0eae0) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: node walk improve

- Updated dependencies [[`ff9933a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ff9933ad06de7bf3333c1c63016920639a56b87a)]:
  - @weapp-tailwindcss/postcss@1.0.6

## 4.0.10

### Patch Changes

- [`5618019`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5618019c36bfabdef0cd4512f779127b83273db9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 添加 TailwindcssPatcherOptions 给更高程度的自定义策略

## 4.0.9

### Patch Changes

- [`a6765b3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a6765b38addd14eaa346a76069cc7c7ba2143a8e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: upgrade to tailwindcss-patch and support rpx unit

## 4.0.8

### Patch Changes

- [`a4532ab`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a4532ab34de62556e57ed350e15ca14e602b7f93) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 使用space-y-2后编译报错 #595

- Updated dependencies [[`a4532ab`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a4532ab34de62556e57ed350e15ca14e602b7f93)]:
  - @weapp-tailwindcss/postcss@1.0.5

## 4.0.7

### Patch Changes

- Updated dependencies [[`9e65534`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9e65534f035ee4e17a2dc0b891278cacb92d5a0b)]:
  - @weapp-tailwindcss/postcss@1.0.4

## 4.0.6

### Patch Changes

- [`d856f81`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d856f81dbe1de4e67feba4f8e76d0a5275e007f1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - perf: add patcher default filter

## 4.0.6-alpha.0

### Patch Changes

- [`d856f81`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d856f81dbe1de4e67feba4f8e76d0a5275e007f1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - perf: add patcher default filter

## 4.0.5

### Patch Changes

- [`11bae23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/11bae23fd3de7332fd06a980b6a418f4795f6bc9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump deps

- Updated dependencies [[`11bae23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/11bae23fd3de7332fd06a980b6a418f4795f6bc9)]:
  - @weapp-tailwindcss/mangle@1.0.2
  - @weapp-tailwindcss/postcss@1.0.3

## 4.0.4

### Patch Changes

- [`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 去除 ast-grep 支持，添加字符串字面量和模板字符串作用域扫描功能

- Updated dependencies [[`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61)]:
  - @weapp-tailwindcss/shared@1.0.1
  - @weapp-tailwindcss/init@1.0.1
  - @weapp-tailwindcss/mangle@1.0.1
  - @weapp-tailwindcss/postcss@1.0.3

## 4.0.4-alpha.0

### Patch Changes

- [`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 去除 ast-grep 支持，添加字符串字面量和模板字符串作用域扫描功能

- Updated dependencies [[`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61)]:
  - @weapp-tailwindcss/shared@1.0.1-alpha.0
  - @weapp-tailwindcss/init@1.0.1-alpha.0
  - @weapp-tailwindcss/mangle@1.0.1-alpha.0
  - @weapp-tailwindcss/postcss@1.0.3-alpha.0

## 4.0.3

### Patch Changes

- [`5b4f9cd`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5b4f9cdcfc3a6b0d5e9fdf8eb6e7ac27f3cb1cc9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- [`ffbf93d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ffbf93d0897a0921f8085c2c14621d706e92989a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: release

- [`c647204`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c6472045bcdbbaa84c85be642c1f42ab53b11486) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- [`6a2f78d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6a2f78d72d795d578cdcb1876310eef57fe463ca) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: get class set error

## 4.0.3-alpha.3

### Patch Changes

- [`c647204`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c6472045bcdbbaa84c85be642c1f42ab53b11486) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

## 4.0.3-alpha.2

### Patch Changes

- [`5b4f9cd`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5b4f9cdcfc3a6b0d5e9fdf8eb6e7ac27f3cb1cc9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

## 4.0.3-alpha.1

### Patch Changes

- [`ffbf93d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ffbf93d0897a0921f8085c2c14621d706e92989a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: release

## 4.0.3-alpha.0

### Patch Changes

- [`6a2f78d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6a2f78d72d795d578cdcb1876310eef57fe463ca) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: get class set error

## 4.0.2

### Patch Changes

- [`64c0189`](https://github.com/sonofmagic/weapp-tailwindcss/commit/64c018935732481ebe2f366e4136b4d3574dde57) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: improve `isAllowedClassName` preflight

- [`13b72d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/13b72d8fbd3aad6fb49a772fd09c36c70e5eda56) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add `resolve` option

- Updated dependencies [[`64c0189`](https://github.com/sonofmagic/weapp-tailwindcss/commit/64c018935732481ebe2f366e4136b4d3574dde57)]:
  - @weapp-tailwindcss/postcss@1.0.2

## 4.0.1

### Patch Changes

- [`41d7049`](https://github.com/sonofmagic/weapp-tailwindcss/commit/41d7049654f7d1fa1c52b3ae845e30e5fa994880) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: upgrade tailwindcss patch and set tailwindcss options

- Updated dependencies [[`ee34fb3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ee34fb34688a2bd11018ce5e4ea6d07a062b0b55)]:
  - @weapp-tailwindcss/postcss@1.0.1

## 4.0.0

### Major Changes

- [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875) Thanks [@sonofmagic](https://github.com/sonofmagic)! - ## Feature

  增加 `@weapp-tailwindcss/merge` 支持，这是 `weapp-tailwindcss` 版本的 `tailwindcss-merge` 和 `cva` 方法

  ## Breaking Changes
  1. 去除 `weapp-tailwindcss/postcss` (可直接安装使用 `@weapp-tailwindcss/postcss`)
  2. 增加 `weapp-tailwindcss/escape` 来取代 `weapp-tailwindcss/replace`
  3. 项目 monorepo 区分包

### Minor Changes

- [`de0e4d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/de0e4d8f38477e806df74b24926d280319ac8419) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add `ignoreTaggedTemplateExpressionIdentifiers` and `ignoreCallExpressionIdentifiers` options

### Patch Changes

- [`3da8643`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3da864338de73a304346fd47b4a91fa18d9f3163) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: loaderUtils.getOptions

- [`43f7ab8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/43f7ab82b047a067bf7d37d88ed861be7b0609d4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - refactor: remove @babel/generator

- [`21dc7a0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/21dc7a079c02e011961a0c9375d096432ee44768) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add @weapp-tailwindcss/merge as default ignoreCallExpressionIdentifiers options dep

- [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: rename export function

- [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change postcssPresetEnv default value

- [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- [`06921c8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/06921c86fc10f4649818e4dafb2597114cb4204c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 更改 cssChildCombinatorReplaceValue 默认值从 ['view'] -> ['view', 'text'] 为了更好的小程序开发体验

- Updated dependencies [[`d4bfcc7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d4bfcc7a25776eb9869bd934c05e3b49a3f4cc8b), [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875), [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d), [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b), [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68), [`1df699b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1df699bf82d66847cbc64cc8f294ef237e0470c5), [`6d20f1f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6d20f1f9a799cf350dcbbd861907f0ff70a68dfd), [`de0e4d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/de0e4d8f38477e806df74b24926d280319ac8419), [`d50d95d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d50d95d04e1c6b7c3ff32acc0d9894d3c0f06d22), [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8)]:
  - @weapp-tailwindcss/postcss@1.0.0
  - @weapp-tailwindcss/init@1.0.0
  - @weapp-tailwindcss/logger@1.0.0
  - @weapp-tailwindcss/mangle@1.0.0
  - @weapp-tailwindcss/shared@1.0.0

## 4.0.0-alpha.13

### Patch Changes

- [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change postcssPresetEnv default value

- Updated dependencies [[`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68)]:
  - @weapp-tailwindcss/postcss@1.0.0-alpha.8

## 4.0.0-alpha.12

### Patch Changes

- Updated dependencies [[`d4bfcc7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d4bfcc7a25776eb9869bd934c05e3b49a3f4cc8b)]:
  - @weapp-tailwindcss/postcss@1.0.0-alpha.7

## 4.0.0-alpha.11

### Patch Changes

- [`3da8643`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3da864338de73a304346fd47b4a91fa18d9f3163) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: loaderUtils.getOptions

## 4.0.0-alpha.10

### Patch Changes

- [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- Updated dependencies [[`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8)]:
  - @weapp-tailwindcss/init@1.0.0-alpha.5
  - @weapp-tailwindcss/logger@1.0.0-alpha.3
  - @weapp-tailwindcss/mangle@1.0.0-alpha.5
  - @weapp-tailwindcss/postcss@1.0.0-alpha.6
  - @weapp-tailwindcss/shared@1.0.0-alpha.4

## 4.0.0-alpha.9

### Patch Changes

- Updated dependencies [[`6d20f1f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6d20f1f9a799cf350dcbbd861907f0ff70a68dfd)]:
  - @weapp-tailwindcss/postcss@1.0.0-alpha.5

## 4.0.0-alpha.8

### Patch Changes

- [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: rename export function

- Updated dependencies [[`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b)]:
  - @weapp-tailwindcss/init@1.0.0-alpha.4
  - @weapp-tailwindcss/logger@1.0.0-alpha.2
  - @weapp-tailwindcss/mangle@1.0.0-alpha.4
  - @weapp-tailwindcss/postcss@1.0.0-alpha.4
  - @weapp-tailwindcss/shared@1.0.0-alpha.3

## 4.0.0-alpha.7

### Patch Changes

- [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d)]:
  - @weapp-tailwindcss/postcss@1.0.0-alpha.3
  - @weapp-tailwindcss/mangle@1.0.0-alpha.3
  - @weapp-tailwindcss/shared@1.0.0-alpha.2
  - @weapp-tailwindcss/init@1.0.0-alpha.3
  - @weapp-tailwindcss/logger@1.0.0-alpha.1

## 4.0.0-alpha.6

### Patch Changes

- [`06921c8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/06921c86fc10f4649818e4dafb2597114cb4204c) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 更改 cssChildCombinatorReplaceValue 默认值从 ['view'] -> ['view', 'text'] 为了更好的小程序开发体验

## 4.0.0-alpha.5

### Patch Changes

- [`43f7ab8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/43f7ab82b047a067bf7d37d88ed861be7b0609d4) Thanks [@sonofmagic](https://github.com/sonofmagic)! - refactor: remove @babel/generator

## 4.0.0-alpha.4

### Patch Changes

- Updated dependencies [[`1df699b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1df699bf82d66847cbc64cc8f294ef237e0470c5)]:
  - @weapp-tailwindcss/postcss@1.0.0-alpha.2
  - @weapp-tailwindcss/mangle@1.0.0-alpha.2

## 4.0.0-alpha.3

### Major Changes

- [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: monorepo changes

### Patch Changes

- Updated dependencies [[`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875)]:
  - @weapp-tailwindcss/init@1.0.0-alpha.2
  - @weapp-tailwindcss/logger@1.0.0-alpha.0
  - @weapp-tailwindcss/mangle@1.0.0-alpha.1
  - @weapp-tailwindcss/postcss@1.0.0-alpha.1
  - @weapp-tailwindcss/shared@1.0.0-alpha.1

## 3.8.0-alpha.2

### Patch Changes

- Updated dependencies [[`d50d95d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d50d95d04e1c6b7c3ff32acc0d9894d3c0f06d22)]:
  - @weapp-tailwindcss/shared@0.0.1-alpha.0
  - @weapp-tailwindcss/init@0.0.1-alpha.1
  - @weapp-tailwindcss/mangle@0.0.1-alpha.0
  - @weapp-tailwindcss/postcss@0.0.1-alpha.0

## 3.8.0-alpha.1

### Patch Changes

- [`21dc7a0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/21dc7a079c02e011961a0c9375d096432ee44768) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add @weapp-tailwindcss/merge as default ignoreCallExpressionIdentifiers options dep

## 3.8.0-alpha.0

### Minor Changes

- [`de0e4d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/de0e4d8f38477e806df74b24926d280319ac8419) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add `ignoreTaggedTemplateExpressionIdentifiers` and `ignoreCallExpressionIdentifiers` options

### Patch Changes

- Updated dependencies [[`de0e4d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/de0e4d8f38477e806df74b24926d280319ac8419)]:
  - @weapp-tailwindcss/init@0.0.1-alpha.0

## 3.7.0

### Minor Changes

- [`9e3891e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9e3891ec6b18519b75d850d9637f2ea57e3bab91) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: upgrade to tailwindcss-patch@5.x

### Patch Changes

- [`1c37dab`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1c37dab354da866565ee843419e3fdbef187630e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- [`b55f4d7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b55f4d75962031d26f665f60106ea2ed52e162bb) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持使用 weappTwIgnore 在js中标识无需转译的字面量

## 3.7.0-alpha.2

### Patch Changes

- [`b55f4d7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b55f4d75962031d26f665f60106ea2ed52e162bb) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持使用 weappTwIgnore 在js中标识无需转译的字面量

## 3.7.0-alpha.1

### Patch Changes

- [`1c37dab`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1c37dab354da866565ee843419e3fdbef187630e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 3.7.0-alpha.0

### Minor Changes

- [`9e3891e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9e3891ec6b18519b75d850d9637f2ea57e3bab91) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: upgrade to tailwindcss-patch@5.x

## 3.6.2

### Patch Changes

- [`8423d35`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8423d35c775c250730fc84b869cabe2525a01178) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: [Bug]: 将tailwind.config中的important选项设置为一个class选择器时，编译到微信小程序后wxss会报编译错误 #473

## 3.6.1

### Patch Changes

- [#471](https://github.com/sonofmagic/weapp-tailwindcss/pull/471) [`b60fe7f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b60fe7f338df7db87ab1c8fb705f1659d9df6afd) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: [#470](https://github.com/sonofmagic/weapp-tailwindcss/issues/470)

## 3.6.0

### Minor Changes

- [`0955492`](https://github.com/sonofmagic/weapp-tailwindcss/commit/095549299cefce15559578f28a6b1624b43fb1c9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - <br/>
  - feat: 升级依赖项，去除了 `nodejs@16` 的支持，需求的 `nodejs` 版本，升级到了 `^18.17.0 || >=20.5.0`
  - feat: 从 `weapp-tailwindcss@3.6.0` 版本开始移除 `@weapp-tailwindcss/cli` ，原先 `@weapp-tailwindcss/cli` 的项目，可以几乎 **0成本** 的迁移到 `weapp-vite`

## 3.5.3

### Patch Changes

- [`fef8375`](https://github.com/sonofmagic/weapp-tailwindcss/commit/fef8375ab825842b3beb5d30170891eb400da79d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加小红书 `xhsml` 支持
  feat: 添加 `weapp-tw init` 一键式初始化脚本

## 3.5.1

### Patch Changes

- [`9890f09`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9890f09a990682e10aabab7b8dc685a58d977fca) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Date: 2024-09-01
  - 重构 `wxml` 模板替换相关的实现

## 3.4.1-alpha.0

### Patch Changes

- 792f50c: chore: compact for `weapp-vite`
