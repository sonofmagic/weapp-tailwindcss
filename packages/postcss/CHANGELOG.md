# @weapp-tailwindcss/postcss

## 3.1.5

### Patch Changes

- 🐛 **在 `weapp-tailwindcss` 主配置中新增 `styleInjector`，默认关闭。启用后会内置复用 `weapp-style-injector` 的样式入口注入能力，并在 Vite/Webpack 中按 `appType` 自动选择 uni-app、Taro、Mpx 或通用预设；当主插件通过 `disabled: true` 或 `disabled: { plugin: true }` 关闭时，样式注入也会同步关闭。** [`747dcf3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/747dcf34a1cf77a14b859ee86f537ce2cd89bddd) by @sonofmagic
  - 同时修复 `@weapp-tailwindcss/postcss` 中 `Px2rpxOptions` 在 NodeNext 类型解析下无法正确导出的声明问题。
  - `weapp-tailwindcss` 直接复用 `weapp-style-injector` 的现有实现，避免在主包内重复维护样式注入逻辑，同时保持 `weapp-style-injector` 原有独立入口不变。

## 3.1.4

### Patch Changes

- 🐛 **修复 `@weapp-tailwindcss/postcss` 产物在 Vite/Vitest SSR 中可能被错误重写并触发 `Unexpected token ':'` 的问题，同时修正 `tailwindcss-config` 的源码导入扩展名，提升发布产物与测试链路稳定性。** [`0e08dac`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0e08dacbe3de03a83a5c7b675adffaf6d0e81e3f)

- 🐛 **抽出 Tailwind v4 `@apply` only CSS 的选择器收集与生成 CSS 过滤工具，并在 PostCSS generator 插件中复用当前 Root，避免为原始 CSS 再次解析。** [`4ea174c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4ea174c4e6c8518e4cd10476b8a0f5b8978cd9bc)
  - 同时复用已序列化的入口 CSS 字符串进行自动扫描判断，减少同一轮处理中的重复 `root.toString()`。

- 🐛 **修复 uni-app-vite 小程序端在 Tailwind CSS v4 场景下对 `@layer base` 的误判警告，提前清理 mini-program CSS 中的 cascade layer 语法，并补充对应回归测试。** [`8b98c43`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b98c4361680bcc51d192dbbdd126842c45d5db1)

- 🐛 **新增 Tailwind CSS 指令 AST 分析工具，并让生成 CSS 入口复用该分析能力，减少重复解析 CSS 字符串的开销。** [`90dc9ca`](https://github.com/sonofmagic/weapp-tailwindcss/commit/90dc9ca048fb28aa913033dc0bb80d06ce85d70c)

- 🐛 **将本地 CSS `@import` 的分析、拆分、清理和输出路径重写逻辑下沉到 `@weapp-tailwindcss/postcss`，并新增可复用的 PostCSS Root 级 API。** [`d789492`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7894923e84d8649065da5ec8ff29eaee26aa340)
  - `weapp-tailwindcss` 的 Tailwind v4 生成 CSS 管线现在会复用同一次 CSS AST 解析结果处理本地 import wrapper、纯 import shell 和 import 拆分，减少重复 `postcss.parse(css)` 开销。

- 🐛 **修复 Web 兼容模式下 Tailwind CSS v4 的渐变变量与 @property 处理，避免 H5 渐变失效，并补充 uni-app、taro、mpx、uni-app x 等场景的回归测试。** [`5540608`](https://github.com/sonofmagic/weapp-tailwindcss/commit/554060826b4e5f073a075f18f559f77b72d4fd0e)

- 🐛 **优化 PostCSS 生成器样式处理性能，复用 CSS source 扫描结果，减少重复 `root.toString()` 与重复解析 source entries 的开销；同时导出 source scan 工具并补齐覆盖率门禁与回归测试。** [`634ff3b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/634ff3b2a8c7e8f98cc58ddc92e27f7f081f3cbd)

- 🐛 **修复 Web 兼容模式下 Tailwind CSS v4 的 `@property` 初始值与现代颜色降级处理，确保开启 `webCompat` 后仍保留现代浏览器的最终展示效果，同时为旧 WebView 提供可用 fallback。** [`36b1822`](https://github.com/sonofmagic/weapp-tailwindcss/commit/36b182251090a980b1a60ff5752a301a3d0e0fc5)
- 📦 **Dependencies** [`0e08dac`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0e08dacbe3de03a83a5c7b675adffaf6d0e81e3f)
  → `tailwindcss-config@2.0.1`

## 3.1.3

### Patch Changes

- 🐛 **本次发布整理了从 `5.1.2` 之后的主要变更：修复 Tailwind v4 多 `cssEntries` 场景下的主样式误匹配与分包样式映射问题，补齐 Taro webpack5/Vite、Rspack、H5/web 兼容与平台环境支持，并同步修复主题过渡的首帧闪烁问题。** [`64faef4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/64faef437046ca1b3f438a2e55d101895500f7a5) by @sonofmagic

## 3.1.2

### Patch Changes

- 🐛 **新增 Web 端 Tailwind CSS v4 产物兼容降级配置，可通过 `generator.webCompat` 移除或降级 `@theme`、`@layer`、`@property`、现代颜色函数与相关 `@supports`，以适配更多 Android/iOS WebView 场景。** [`9ce2cd5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9ce2cd590ea2a373f4372d499a10ed8a2d333d0c) by @sonofmagic

## 3.1.1

### Patch Changes

- 🐛 **将 Tailwind 候选提取与源码扫描依赖从 `tailwindcss-patch` 收敛到 `@tailwindcss-mangle/engine`，减少 PostCSS 包的额外 patch/CLI 依赖。** [`ddcb7c8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddcb7c82d00a06be462c13b7d11d4367c1b1091e) by @sonofmagic

## 3.1.0

### Minor Changes

- ✨ **移除 `@weapp-tailwindcss/postcss` 中 Tailwind CSS v3 相关的版本探测、显式 `version` 配置、v3 fixture 与 benchmark 基线。** [`1dc7b97`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1dc7b9766df9ab218e1eedb0eec392e4d0a7f515) by @sonofmagic
  - PostCSS 生成插件现在固定按 Tailwind CSS v4 CSS-first 流程处理。仅包含 `@apply` 的局部 CSS 会在内部注入 Tailwind v4 `@reference` 上下文并跳过自动源码扫描，不再依赖旧的 v3/v4 分支判断。

- ✨ **移除 Tailwind CSS v3 兼容链路，后续生成、运行时与小程序 CSS 处理统一面向 Tailwind CSS v4。** [`d9be474`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d9be474f9f6f205a78f5057421e990a5004a6474) by @sonofmagic

## 3.0.8

### Patch Changes

- 🐛 **调整 Tailwind CSS v4 渐变工具类的小程序兼容策略，默认保留 `--tw-gradient-*` CSS 变量链路，覆盖 `background-image` 文档中的 linear、radial、conic、任意值、自定义属性、stop 颜色与位置等组合。** [`d3487a1`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d3487a1b669bb194cdbfa0cd7a412e970b01632d) by @sonofmagic
  - 新增 `cssOptions` 作为统一的 CSS 生成与兼容后处理微调配置入口，`cssPreflight`、`cssPreflightRange`、`cssChildCombinatorReplaceValue`、`cssPresetEnv`、`autoprefixer`、`atRules`、`injectAdditionalCssVarScope`、`cssSelectorReplacement`、`rem2rpx`、`px2rpx`、`unitsToPx`、`unitConversion`、`platform`、`cssRemoveHoverPseudoClass`、`cssRemoveProperty`、`cssCalc` 与 `tailwindcssV4GradientFallback` 等配置都可以放入该分组。顶层旧字段仍保留兼容并标记为 deprecated；其中 `cssOptions.tailwindcssV4GradientFallback` 显式设置为 `true` 时才追加旧版字面量组合兜底，避免默认产物膨胀并让 v4 渐变行为更接近 Tailwind 官方输出。

- 🐛 **修复 Tailwind CSS v4 渐变位置变量在小程序中的空 fallback 兼容问题。`--tw-gradient-from-position`、`--tw-gradient-via-position` 与 `--tw-gradient-to-position` 会统一输出为带逗号和空格的空 fallback，避免 `var(--tw-gradient-*-position,)` 或缺少 fallback 时导致渐变在微信小程序运行时渲染异常；显式 fallback 仍保持原样。** [`8501c4b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8501c4b2243da8cb0f6fe2d33b22acd84a17d108) by @sonofmagic

## 3.0.7

### Patch Changes

- 🐛 **修复 `:where(...)` 内嵌 `:is(...)` 或多分支 `:where(...)` 时小程序产物仍可能保留复杂伪类的问题，补充 Tailwind v4 preflight、space/divide、group/peer、child 与主题 class 选择器的单测和微信开发者工具 IDE 视觉回归。** [#918](https://github.com/sonofmagic/weapp-tailwindcss/pull/918) by @sonofmagic

- 🐛 **修复 `:where(.dark, .dark *)` 等多分支选择器展开后丢失通配符后代分支的问题，确保小程序端会生成对应的 `view` / `text` 后代选择器。** [#920](https://github.com/sonofmagic/weapp-tailwindcss/pull/920) by @sonofmagic
  - 修复 Taro demo 的 `dev:harmony` 脚本未显式开启 HMR timing 输出的问题，确保 Harmony 别名脚本与实际 watch 脚本行为一致。

- 🐛 **修复生成 CSS 裁剪时误删用户手写的小程序原生元素样式的问题，避免 Taro Webpack Tailwind CSS v4 等场景下 `view`、`text`、`button`、`input` 等标签规则被移除。** [`03fd4ec`](https://github.com/sonofmagic/weapp-tailwindcss/commit/03fd4ec44be77ff9cc755bfb6e7baa9025577e1f) by @sonofmagic

## 3.0.6

### Patch Changes

- 🐛 **将 `weapp-tailwindcss` 中生成型 PostCSS 插件、PostCSS 辅助扫描逻辑和 `css-macro/postcss` 转换入口迁入 `@weapp-tailwindcss/postcss`，主包保留兼容转发入口，方便后续统一维护 PostCSS 能力边界。** [#914](https://github.com/sonofmagic/weapp-tailwindcss/pull/914) by @sonofmagic

## 3.0.5

### Patch Changes

- 🐛 **修复小程序 CSS 产物中仅含注释或已被清空的 `@media` 块未被移除的问题，避免微信开发者工具在 WXSS 编译时报 `unexpected token }`。同时同步 watch-HMR 的 Taro React v4 H5 脚本断言和 issue33 性能预算覆盖逻辑。** [#912](https://github.com/sonofmagic/weapp-tailwindcss/pull/912) by @sonofmagic

## 3.0.4

### Patch Changes

- 🐛 **修复 Tailwind CSS v4.3 生成的 `var(--tw-*,)` 空 fallback 在微信开发者工具中解析异常的问题，确保 `rotate-y-90` 等 transform 工具类输出为小程序可识别的 `var(--tw-*, )`。** [`92c822e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/92c822eb29be8ad3571bb0a7fc27327e6defb19c) by @sonofmagic

## 3.0.3

### Patch Changes

- 🐛 **修复 uni-app x Tailwind CSS v4 场景下 `uvue.wxss` 默认 `border-width: medium` 覆盖 Tailwind preflight 后导致的异常黑边问题。** [`65f084b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/65f084ba30ad8a0b4c36ce46e567d2e1b1490b64) by @sonofmagic

- 🐛 **修复 Tailwind CSS v4 小程序样式输出：普通小程序端保留 `box-sizing`、`margin`、`padding`、`border` preflight reset，避免 Taro Vite 的 `app-origin` 样式重复注入主样式，并去重合并后的 hoisted preflight 声明。** [`4b2ed64`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4b2ed643d8b62f1c9e7a81c77a0e583444e6f9db) by @sonofmagic

## 3.0.2

### Patch Changes

- 🐛 **将 `@weapp-tailwindcss/postcss-calc` 从 submodule 迁入 `packages` 作为独立 monorepo 子包，并让 `@weapp-tailwindcss/postcss` 通过 workspace 直接消费，统一安装、测试和发布链路。** [`2f41ff5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2f41ff5c5861828b3cafe0a1248c7eecd690cfb7) by @sonofmagic

- 🐛 **修复 Tailwind CSS v4 的 `rounded-full` 在小程序端生成 `calc(infinity * 1px)` 后无法稳定生效的问题，统一归一化为小程序可解析的 `9999px`。** [`84c1c02`](https://github.com/sonofmagic/weapp-tailwindcss/commit/84c1c02b66eb4d329a889fd555dae4188e35a227) by @sonofmagic
- 📦 **Dependencies** [`2f41ff5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2f41ff5c5861828b3cafe0a1248c7eecd690cfb7)
  → `@weapp-tailwindcss/postcss-calc@1.0.1`

## 3.0.1

### Patch Changes

- 🐛 **修复小程序端生成样式中的 `:before` / `:after` 输出会被规范化为单冒号，以及 Tailwind preflight 中 `--tw-content: ''` 被错误合并到 `view,text,::after,::before` 基础选择器的问题，确保伪元素内容初始化只作用于 `::before` / `::after`，并补充分包入口样式快照覆盖。** [`206093e`](https://github.com/sonofmagic/weapp-tailwindcss/commit/206093e9878e6f4456bbd72f1a61856abc86fc88) by @sonofmagic

## 3.0.0

### Major Changes

- 🚀 **新增 HBuilderX 直连演示矩阵，覆盖 uni-app Vite Vue 3 与 uni-app x 的 Tailwind CSS v3/v4 场景，并提供 `hbuilderx` preset。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic
  - 同时将已由 tsdown 打包进产物、且不需要消费者安装的实现依赖下移到 `devDependencies`。公开导出或运行期加载边界仍保留为正式依赖，例如 `tailwindcss-config` 的 `jiti`，以及 `@weapp-tailwindcss/shared` 对外导出的 `defu`、`get-value`、`set-value`。

- 🚀 **整理 mini-program 的 PostCSS 处理链路，把重复的规则判定集中到 `packages/postcss` 内部，统一导出生成 CSS 清理能力，后续维护会更清晰。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

### Minor Changes

- ✨ **新增内置 `unitConversion` 配置，支持基于 `postcss-rule-unit-converter` 的任意样式单位转换，并可按 `weapp`、`h5`、`web`、`app` 等平台分别配置转换规则。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

### Patch Changes

- 🐛 **将小程序 CSS 清理、收尾与兼容处理集中到 `@weapp-tailwindcss/postcss`，主包仅保留兼容导出与构建器编排；同时把实验性的 Lightning CSS 样式处理迁移到 `@weapp-tailwindcss/experimental/lightningcss`。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **内置 `css-macro` 的 PostCSS 转换感应逻辑：当 Tailwind CSS v3 配置中注册 `weapp-tailwindcss/css-macro`，或 Tailwind CSS v4 入口 CSS 中声明 `@plugin "weapp-tailwindcss/css-macro"` 时，会自动启用条件编译注释转换，不再要求常规集成手动注册 `weapp-tailwindcss/css-macro/postcss`。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic
  - 同时在生成 CSS 裁剪阶段保留由 `css-macro` 产生的 `#ifdef` / `#ifndef` / `#endif` 注释，并同步更新文档与 demo 配置。

- 🐛 **升级 ESM 化依赖后，将公开包的 Node.js 安装版本约束统一到 `^20.19.0 || >=22.12.0`，避免不支持稳定 ESM/CJS 混合加载的 Node.js 版本安装使用。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复 Tailwind CSS v4 元素变量作用域选择器与小程序重置选择器不一致的问题，避免仅有边框等基础样式时小程序端和 Web 端表现偏离。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复小程序最终样式中可能残留 `color-mix`、`oklab`、`oklch`、`lab`、`lch` 与 `display-p3` 颜色函数的问题，能确定的颜色会降级为 `rgb`/`rgba`，避免输出小程序不支持的颜色语法。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复 Tailwind CSS v3/v4 在部分生成链路中把 `text-[55rpx]` 等任意值误判为颜色时，非主 CSS chunk 没有恢复为长度声明的问题。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复核心源码在严格 TypeScript 配置下的类型问题，并清理对应 ESLint 诊断。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复小程序 CSS 前缀清理后 `transition-property` 声明重复的问题，避免 Tailwind CSS v3 的 `.transition` 输出保留多条等价声明。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复 Tailwind CSS v4 小程序产物移除 `@property` 后可能丢失 `--tw-border-style` 默认值的问题，避免只有 `border` 工具类时小程序端无法得到和 Web 端一致的默认实线边框；同时按需补齐实际使用到的 v4 运行时默认变量，并合并等价的小程序元素作用域规则，避免输出重复 selector。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复 Tailwind CSS v4 小程序产物中透明度颜色可能保留 `color-mix(in oklab, ...)` 的问题，将 `text-white/10`、`bg-sky-500/75`、`bg-sky-500/(--alpha)` 等颜色透明度写法转换为小程序可用的 `rgba(...)` 输出；同时修复 v4 增量热更新追加样式时重复注入 preflight reset 的问题。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **调整内置 `autoprefixer` 默认选项，显式关闭小程序不需要的 `grid` 与 `@supports` 前缀分支，保留 `remove: true` 清理过时前缀，并继续允许用户传入 `autoprefixer` 选项覆盖默认值。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **收敛小程序 CSS 的 `-webkit-` 前缀输出，默认仅保留 `background-clip: text`、`mask-*`、`box-orient` 等小程序场景需要的兼容写法，并移除 `text-decoration`、`filter/backdrop-filter`、`transform/animation/transition` 等浏览器冗余前缀。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **现在 Tailwind CSS v3 和 v4 场景都会默认开启内置 `autoprefixer` 后处理，用于补齐小程序 WebView 所需的兼容前缀；如需关闭可继续传入 `autoprefixer: false`。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复 Tailwind CSS v4 生成模式下 colors 透明度变量在小程序样式兼容阶段被静态降级为不透明色的问题，并补充颜色工具类、`@theme` 自定义颜色与禁用默认颜色的回归覆盖。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复小程序样式转换中错误保留 `[data-theme=dark]` / `[data-mode="dark"]` 这类属性选择器的问题。web 目标继续保留 Tailwind CSS v4 data attribute dark variant，小程序目标会移除依赖属性选择器的无效规则，避免生成小程序不支持的选择器或让 dark 样式无条件生效。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复 Tailwind CSS v4 生成模式下 data attribute 版 `@custom-variant dark` 在小程序选择器兜底清理阶段丢失属性选择器的问题，并补充默认媒体查询、`.dark` 自定义选择器和 `[data-theme=dark]` 自定义选择器的回归覆盖。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic
- 📦 **Dependencies** [`73a7794`](https://github.com/sonofmagic/weapp-tailwindcss/commit/73a7794d50916d2189f22bfaa9e9ab9402b30df7)
  → `@weapp-tailwindcss/shared@2.0.0`

## 3.0.0-next.10

### Patch Changes

- 🐛 **修复 Tailwind CSS v4 元素变量作用域选择器与小程序重置选择器不一致的问题，避免仅有边框等基础样式时小程序端和 Web 端表现偏离。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复 Tailwind CSS v4 小程序产物移除 `@property` 后可能丢失 `--tw-border-style` 默认值的问题，避免只有 `border` 工具类时小程序端无法得到和 Web 端一致的默认实线边框；同时按需补齐实际使用到的 v4 运行时默认变量，并合并等价的小程序元素作用域规则，避免输出重复 selector。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

## 3.0.0-next.9

### Patch Changes

- 📦 **Dependencies** [`aaba811`](https://github.com/sonofmagic/weapp-tailwindcss/commit/aaba811cfc2ad003d3daf2cf290c9d8b770c6dfb)
  → `@weapp-tailwindcss/shared@2.0.0-next.1`

## 3.0.0-next.8

### Major Changes

- 🚀 **新增 HBuilderX 直连演示矩阵，覆盖 uni-app Vite Vue 3 与 uni-app x 的 Tailwind CSS v3/v4 场景，并提供 `hbuilderx` preset。** [#882](https://github.com/sonofmagic/weapp-tailwindcss/pull/882) by @sonofmagic
  - 同时将已由 tsdown 打包进产物、且不需要消费者安装的实现依赖下移到 `devDependencies`。公开导出或运行期加载边界仍保留为正式依赖，例如 `tailwindcss-config` 的 `jiti`，以及 `@weapp-tailwindcss/shared` 对外导出的 `defu`、`get-value`、`set-value`。

### Patch Changes

- 📦 **Dependencies** [`2d2acf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2d2acf29cfee02ffb32783c8bd3c5de8d9aab9df)
  → `@weapp-tailwindcss/shared@2.0.0-next.0`

## 3.0.0-next.7

### Minor Changes

- ✨ **新增内置 `unitConversion` 配置，支持基于 `postcss-rule-unit-converter` 的任意样式单位转换，并可按 `weapp`、`h5`、`web`、`app` 等平台分别配置转换规则。** [#879](https://github.com/sonofmagic/weapp-tailwindcss/pull/879) by @github-actions

### Patch Changes

- 🐛 **内置 `css-macro` 的 PostCSS 转换感应逻辑：当 Tailwind CSS v3 配置中注册 `weapp-tailwindcss/css-macro`，或 Tailwind CSS v4 入口 CSS 中声明 `@plugin "weapp-tailwindcss/css-macro"` 时，会自动启用条件编译注释转换，不再要求常规集成手动注册 `weapp-tailwindcss/css-macro/postcss`。** [#879](https://github.com/sonofmagic/weapp-tailwindcss/pull/879) by @github-actions
  - 同时在生成 CSS 裁剪阶段保留由 `css-macro` 产生的 `#ifdef` / `#ifndef` / `#endif` 注释，并同步更新文档与 demo 配置。

- 🐛 **升级 ESM 化依赖后，将公开包的 Node.js 安装版本约束统一到 `^20.19.0 || >=22.12.0`，避免不支持稳定 ESM/CJS 混合加载的 Node.js 版本安装使用。** [#879](https://github.com/sonofmagic/weapp-tailwindcss/pull/879) by @github-actions

## 3.0.0-next.6

### Major Changes

- 🚀 **整理 mini-program 的 PostCSS 处理链路，把重复的规则判定集中到 `packages/postcss` 内部，统一导出生成 CSS 清理能力，后续维护会更清晰。** [`fea6731`](https://github.com/sonofmagic/weapp-tailwindcss/commit/fea6731fdb12a570842343432a4d471fa75de257) by @sonofmagic

### Patch Changes

- 🐛 **将小程序 CSS 清理、收尾与兼容处理集中到 `@weapp-tailwindcss/postcss`，主包仅保留兼容导出与构建器编排；同时把实验性的 Lightning CSS 样式处理迁移到 `@weapp-tailwindcss/experimental/lightningcss`。** [`649d229`](https://github.com/sonofmagic/weapp-tailwindcss/commit/649d2296a164a301ec7d40de093d2e1ccb8e60f1) by @sonofmagic

- 🐛 **修复小程序 CSS 前缀清理后 `transition-property` 声明重复的问题，避免 Tailwind CSS v3 的 `.transition` 输出保留多条等价声明。** [`b9e28da`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b9e28da65561c495dcc430346a5565211329cfbe) by @sonofmagic

## 2.2.1-next.5

### Patch Changes

- 🐛 **调整内置 `autoprefixer` 默认选项，显式关闭小程序不需要的 `grid` 与 `@supports` 前缀分支，保留 `remove: true` 清理过时前缀，并继续允许用户传入 `autoprefixer` 选项覆盖默认值。** [#873](https://github.com/sonofmagic/weapp-tailwindcss/pull/873) by @sonofmagic

- 🐛 **收敛小程序 CSS 的 `-webkit-` 前缀输出，默认仅保留 `background-clip: text`、`mask-*`、`box-orient` 等小程序场景需要的兼容写法，并移除 `text-decoration`、`filter/backdrop-filter`、`transform/animation/transition` 等浏览器冗余前缀。** [#874](https://github.com/sonofmagic/weapp-tailwindcss/pull/874) by @github-actions

## 2.2.1-next.4

### Patch Changes

- 🐛 **现在 Tailwind CSS v3 和 v4 场景都会默认开启内置 `autoprefixer` 后处理，用于补齐小程序 WebView 所需的兼容前缀；如需关闭可继续传入 `autoprefixer: false`。** [#872](https://github.com/sonofmagic/weapp-tailwindcss/pull/872) by @github-actions

## 2.2.1-next.3

### Patch Changes

- 🐛 **修复小程序最终样式中可能残留 `color-mix`、`oklab`、`oklch`、`lab`、`lch` 与 `display-p3` 颜色函数的问题，能确定的颜色会降级为 `rgb`/`rgba`，避免输出小程序不支持的颜色语法。** [`f36f230`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f36f23092a2986b9960ebc34ee54bdb93072e882) by @sonofmagic

- 🐛 **修复 Tailwind CSS v4 小程序产物中透明度颜色可能保留 `color-mix(in oklab, ...)` 的问题，将 `text-white/10`、`bg-sky-500/75`、`bg-sky-500/(--alpha)` 等颜色透明度写法转换为小程序可用的 `rgba(...)` 输出；同时修复 v4 增量热更新追加样式时重复注入 preflight reset 的问题。** [`67896ab`](https://github.com/sonofmagic/weapp-tailwindcss/commit/67896ab30b06aaf16335257c5b5b3156a86c302b) by @sonofmagic

## 2.2.1-next.2

### Patch Changes

- 🐛 **修复核心源码在严格 TypeScript 配置下的类型问题，并清理对应 ESLint 诊断。** [#859](https://github.com/sonofmagic/weapp-tailwindcss/pull/859) by @sonofmagic

## 2.2.1-next.1

### Patch Changes

- 🐛 **修复 Tailwind CSS v3/v4 在部分生成链路中把 `text-[55rpx]` 等任意值误判为颜色时，非主 CSS chunk 没有恢复为长度声明的问题。** [#856](https://github.com/sonofmagic/weapp-tailwindcss/pull/856) by @github-actions

## 2.2.1-next.0

### Patch Changes

- 🐛 **修复 Tailwind CSS v4 生成模式下 colors 透明度变量在小程序样式兼容阶段被静态降级为不透明色的问题，并补充颜色工具类、`@theme` 自定义颜色与禁用默认颜色的回归覆盖。** [#852](https://github.com/sonofmagic/weapp-tailwindcss/pull/852) by @github-actions

- 🐛 **修复小程序样式转换中错误保留 `[data-theme=dark]` / `[data-mode="dark"]` 这类属性选择器的问题。web 目标继续保留 Tailwind CSS v4 data attribute dark variant，小程序目标会移除依赖属性选择器的无效规则，避免生成小程序不支持的选择器或让 dark 样式无条件生效。** [#852](https://github.com/sonofmagic/weapp-tailwindcss/pull/852) by @github-actions

- 🐛 **修复 Tailwind CSS v4 生成模式下 data attribute 版 `@custom-variant dark` 在小程序选择器兜底清理阶段丢失属性选择器的问题，并补充默认媒体查询、`.dark` 自定义选择器和 `[data-theme=dark]` 自定义选择器的回归覆盖。** [#852](https://github.com/sonofmagic/weapp-tailwindcss/pull/852) by @github-actions

## 2.2.0

### Minor Changes

- ✨ **新增 CSS 处理结果 LRU 缓存，对相同内容和配置的 CSS 直接返回缓存结果，跳过 PostCSS 处理流程。** [`e6d7e8c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e6d7e8c123545d279b434b0c237ea59a3f62a6fe) by @sonofmagic
  - 在 `createStyleHandler` 内部新增基于 LRU 的结果缓存（最大 256 条目），缓存键由选项指纹 + 内容探测信号 + 内容哈希组成。
  - 使用 FNV-1a 哈希算法计算内容哈希，开销极低（不依赖 crypto 模块）。
  - HMR 场景下相同 CSS 文件的重复处理直接命中缓存，端到端处理速度提升 18~55 倍。

- ✨ **新增 PostCSS 流水线按需裁剪能力，通过轻量级 CSS 内容探测自动跳过不必要的插件。** [`9a4a836`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9a4a836aa97c87b67cbb88bcd40b83f0bf1d52d6) by @sonofmagic
  - 新增 `content-probe` 模块，使用正则/字符串匹配快速探测 CSS 内容特征（现代颜色函数、preset-env 特征等）。
  - `createStylePipeline` 支持可选的 `FeatureSignal` 参数，根据信号按需跳过 `postcss-preset-env` 和 `color-functional-fallback` 插件。
  - `StyleProcessorCache` 将特征信号纳入缓存键计算，确保不同内容特征组合使用正确的处理器。
  - `createStyleHandler` 自动执行内容探测并传递信号，对外 API 签名不变，零配置即可获得优化。
  - 探测策略采用宽松匹配：宁可误报（多加载插件），不可漏报（遗漏需要的插件），确保处理结果等价。

### Patch Changes

- 🐛 **修复 `uni-app x` 的 `uvue/nvue` 样式目标会输出宿主不支持 CSS 的问题。** [`a835a94`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a835a94ae0780610dcb4da8439cdb8f5a44bb36c) by @sonofmagic
  - 在 `uvue` 目标下过滤非 class selector，避免继续输出 `space-x-*`、`space-y-*` 这类组合器选择器。
  - 在 `uvue` 目标下过滤不兼容声明，例如 `display: block`、`display: inline-flex`、`display: grid`、`grid-template-columns`、`gap`、`min-height: 100vh`。
  - 新增 `uniAppX.uvueUnsupported` 配置，支持 `error | warn | silent`，默认 `warn`。
  - 当策略为 `warn` 时，跳过不兼容 utility 并输出包含 class 名与来源文件的警告，避免 HBuilderX 因非法 CSS 直接报错。

- 🐛 **移除 Tailwind CSS v4 `bg-linear-to-*` 生成的 lab 渐变 `@supports` 检测块，避免小程序端保留无效的 `linear-gradient(in lab, red, red)` 兼容分支。** [`dc9791c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/dc9791cdebf812dba00877e5430606e275f7221f) by @sonofmagic
  - 保留基础 `--tw-gradient-position` 与 `background-image: linear-gradient(var(--tw-gradient-stops))` 产物，并补充 `bg-linear-to-r` 单测与 Taro Vite v4 端到端回归。

- 🐛 **将 `unitsToPx` 转换链路切换为基于 `postcss-rule-unit-converter` 的规则转换实现，移除对 `postcss-units-to-px` 的直接运行时依赖。** [`8d4131f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8d4131fc0832f9db9c631a1c7f2964094a77b8a6) by @sonofmagic
  - 保留 `unitMap`、`transform`、`transform: false`、`propList`、`selectorBlackList` 等兼容配置行为，并补充对应回归测试，确保多单位转 `px` 的默认输出不变。

- 🐛 **在 Tailwind CSS v4 场景下默认启用内置 autoprefixer 后处理，为小程序 CSS 补齐 `-webkit-background-clip: text` 等 WebView 兼容前缀，并新增 `autoprefixer: false` 配置用于显式关闭。** [`501a5c2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/501a5c250f5d96edb5dae72f082e745ec0dbe486) by @sonofmagic

## 2.2.0-alpha.1

### Patch Changes

- 🐛 **将 `unitsToPx` 转换链路切换为基于 `postcss-rule-unit-converter` 的规则转换实现，移除对 `postcss-units-to-px` 的直接运行时依赖。** [`8d4131f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8d4131fc0832f9db9c631a1c7f2964094a77b8a6) by @sonofmagic
  - 保留 `unitMap`、`transform`、`transform: false`、`propList`、`selectorBlackList` 等兼容配置行为，并补充对应回归测试，确保多单位转 `px` 的默认输出不变。

## 2.2.0-next.0

### Minor Changes

- ✨ **新增 CSS 处理结果 LRU 缓存，对相同内容和配置的 CSS 直接返回缓存结果，跳过 PostCSS 处理流程。** [`e6d7e8c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e6d7e8c123545d279b434b0c237ea59a3f62a6fe) by @sonofmagic
  - 在 `createStyleHandler` 内部新增基于 LRU 的结果缓存（最大 256 条目），缓存键由选项指纹 + 内容探测信号 + 内容哈希组成。
  - 使用 FNV-1a 哈希算法计算内容哈希，开销极低（不依赖 crypto 模块）。
  - HMR 场景下相同 CSS 文件的重复处理直接命中缓存，端到端处理速度提升 18~55 倍。

- ✨ **新增 PostCSS 流水线按需裁剪能力，通过轻量级 CSS 内容探测自动跳过不必要的插件。** [`9a4a836`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9a4a836aa97c87b67cbb88bcd40b83f0bf1d52d6) by @sonofmagic
  - 新增 `content-probe` 模块，使用正则/字符串匹配快速探测 CSS 内容特征（现代颜色函数、preset-env 特征等）。
  - `createStylePipeline` 支持可选的 `FeatureSignal` 参数，根据信号按需跳过 `postcss-preset-env` 和 `color-functional-fallback` 插件。
  - `StyleProcessorCache` 将特征信号纳入缓存键计算，确保不同内容特征组合使用正确的处理器。
  - `createStyleHandler` 自动执行内容探测并传递信号，对外 API 签名不变，零配置即可获得优化。
  - 探测策略采用宽松匹配：宁可误报（多加载插件），不可漏报（遗漏需要的插件），确保处理结果等价。

### Patch Changes

- 🐛 **修复 `uni-app x` 的 `uvue/nvue` 样式目标会输出宿主不支持 CSS 的问题。** [`a835a94`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a835a94ae0780610dcb4da8439cdb8f5a44bb36c) by @sonofmagic
  - 在 `uvue` 目标下过滤非 class selector，避免继续输出 `space-x-*`、`space-y-*` 这类组合器选择器。
  - 在 `uvue` 目标下过滤不兼容声明，例如 `display: block`、`display: inline-flex`、`display: grid`、`grid-template-columns`、`gap`、`min-height: 100vh`。
  - 新增 `uniAppX.uvueUnsupported` 配置，支持 `error | warn | silent`，默认 `warn`。
  - 当策略为 `warn` 时，跳过不兼容 utility 并输出包含 class 名与来源文件的警告，避免 HBuilderX 因非法 CSS 直接报错。

- 🐛 **在 Tailwind CSS v4 场景下默认启用内置 autoprefixer 后处理，为小程序 CSS 补齐 `-webkit-background-clip: text` 等 WebView 兼容前缀，并新增 `autoprefixer: false` 配置用于显式关闭。** [`501a5c2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/501a5c250f5d96edb5dae72f082e745ec0dbe486) by @sonofmagic

## 2.1.7

### Patch Changes

- 🐛 **修复 taro weapp 场景下 `app-origin.wxss` 仍可能残留 `:not(#n)` 占位选择器的问题，并补充 `#834` 的回归测试，确保最终输出不再包含 `@layer`、`:not(#\\#)` 与 `:not(#n)`。** [`7942ef4`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7942ef486a1990e113c0e54a665ceb278cfb7bce) by @sonofmagic

- 🐛 **修复 Taro Vite Tailwind CSS v4 构建时最终样式产物仍残留 `:not(#\#)` / `:not(#n)` 的问题。** [`f972c34`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f972c34fd64954ef15992d0a3d203300f1ccb2ed) by @sonofmagic
  - 同时为 Taro demo 的构建守卫增加对 `@tarojs/plugin-doctor` 原生检查的安全绕过，避免当前环境下其 Rust 模块 panic 导致 demo 无法完成真实构建验证。

## 2.1.6

### Patch Changes

- 🐛 **修复 Vite 集成在 dts 构建阶段替换 postcss 插件时触发的类型递归比较问题，避免 TS2321 与 TS2345 导致构建失败。** [`c8860fa`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c8860fa202e202833f2c503fd7ea53af824a76fe) by @sonofmagic
  - 同时升级部分依赖与工作区 catalog 版本（包括 postcss、fs-extra、storybook 等），并同步更新锁文件以保持依赖解析一致性。

- 🐛 **修复 `uni-app x / uvue` 下 `@tailwind base` 的伪元素选择器兼容问题：** [`577f2b7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/577f2b7a4ab20f9d819e5a8826a535a4895cf712) by @sonofmagic
  - 在 `uni-app x` 模式下移除 `::before`、`::after`、`:before`、`:after`、`::backdrop` 等 `uvue` 不支持的选择器，避免 `App.uvue` 保留 `@tailwind base` 时编译报错
  - 保留 `*` 上的 Tailwind CSS 变量初始化与有效基础规则，确保基础 reset 与 utility 依赖的 CSS 变量不回退
  - 补充 `uni-app x + @tailwind base + styleIsolationVersion=2` 的 regression test，并验证 issue #822 相关组件局部样式能力不回退

- 🐛 **修复 `uni-app x / uvue` 下 `@tailwind base` 的默认兼容行为，并同步稳定相关测试：** [`699dfe2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/699dfe21ddbb41dcb8f5e401800767a2098c3707) by @sonofmagic
  - 将 `uni-app x` 的 base 兼容后处理收敛到 `@weapp-tailwindcss/postcss`，不再由 `weapp-tailwindcss` 额外持有私有样式后处理
  - 在 `uni-app x` 模式下移除对 `view`、`text`、`*`、`::before`、`::after`、`:before`、`:after`、`::backdrop` 等全局 carrier selector 的依赖
  - 将 utility 运行所需的 `--tw-*` 默认变量按需下沉到具体 class selector，保证保留 `@tailwind base` 时仍可正常编译和运行
  - 更新 `uni-app x`、bundler、tailwindcss 全量大用例的回归断言与超时设置，避免在完整测试中因旧预期或默认超时导致误报失败

- 🐛 **性能优化：针对 CSS 选择器转换、JS 处理器、WXML 模板处理等热路径进行多项缓存与计算优化。** [`49e50d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/49e50d8bde7327d47e9ba649537092ea57bcdf16) by @sonofmagic
  - JS 处理器：复用 `resolveClassNameTransformWithResult` 返回的 `escapedValue` 避免重复 escape 计算；引入 `getReplacement` 缓存消除重复 `replaceWxml` 调用；移除 `escapeStringRegexp` + `new RegExp` 正则编译开销
  - `createJsHandler`：预构建默认 `defaults` 对象，无覆盖选项时跳过 `defuOverrideArray` 合并
  - WXML 模板：`templateReplacer` 支持复用模块级 tokenizer 实例；`createTemplateHandler` 预构建 attribute matcher 并传递给 `customTemplateHandler`
  - PostCSS fallback 选择器解析：为 `transform` 函数添加 selector 级别缓存，避免重复解析相同选择器
  - `splitCode`：为默认和 allowDoubleQuotes 两种模式分别添加结果缓存，预编译分割正则

- 🐛 **升级 `tailwindcss-patch` 到 `9` 系列最新版本，并同步更新相关依赖。** [`38c11e7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/38c11e78a0c1f31d7635a98c95fbfe624723c4c3) by @sonofmagic
- 📦 **Dependencies** [`49e50d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/49e50d8bde7327d47e9ba649537092ea57bcdf16)
  → `@weapp-tailwindcss/shared@1.1.3`

## 2.1.6-alpha.3

### Patch Changes

- 🐛 **修复 `uni-app x / uvue` 下 `@tailwind base` 的默认兼容行为，并同步稳定相关测试：** [`699dfe2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/699dfe21ddbb41dcb8f5e401800767a2098c3707) by @sonofmagic
  - 将 `uni-app x` 的 base 兼容后处理收敛到 `@weapp-tailwindcss/postcss`，不再由 `weapp-tailwindcss` 额外持有私有样式后处理
  - 在 `uni-app x` 模式下移除对 `view`、`text`、`*`、`::before`、`::after`、`:before`、`:after`、`::backdrop` 等全局 carrier selector 的依赖
  - 将 utility 运行所需的 `--tw-*` 默认变量按需下沉到具体 class selector，保证保留 `@tailwind base` 时仍可正常编译和运行
  - 更新 `uni-app x`、bundler、tailwindcss 全量大用例的回归断言与超时设置，避免在完整测试中因旧预期或默认超时导致误报失败

## 2.1.6-alpha.2

### Patch Changes

- 🐛 **修复 `uni-app x / uvue` 下 `@tailwind base` 的伪元素选择器兼容问题：** [`577f2b7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/577f2b7a4ab20f9d819e5a8826a535a4895cf712) by @sonofmagic
  - 在 `uni-app x` 模式下移除 `::before`、`::after`、`:before`、`:after`、`::backdrop` 等 `uvue` 不支持的选择器，避免 `App.uvue` 保留 `@tailwind base` 时编译报错
  - 保留 `*` 上的 Tailwind CSS 变量初始化与有效基础规则，确保基础 reset 与 utility 依赖的 CSS 变量不回退
  - 补充 `uni-app x + @tailwind base + styleIsolationVersion=2` 的 regression test，并验证 issue #822 相关组件局部样式能力不回退

## 2.1.6-alpha.1

### Patch Changes

- 🐛 **升级 `tailwindcss-patch` 到 `8.7.4-alpha.0`，同步消费最新的 alpha 版本依赖。** [#819](https://github.com/sonofmagic/weapp-tailwindcss/pull/819) by @sonofmagic
- 📦 **Dependencies** [`cbead4c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/cbead4ced4b7cba116488d745d47bf826bc83859)
  → `@weapp-tailwindcss/shared@1.1.3-alpha.1`

## 2.1.6-alpha.0

### Patch Changes

- 🐛 **修复 Vite 集成在 dts 构建阶段替换 postcss 插件时触发的类型递归比较问题，避免 TS2321 与 TS2345 导致构建失败。** [`c8860fa`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c8860fa202e202833f2c503fd7ea53af824a76fe) by @sonofmagic
  - 同时升级部分依赖与工作区 catalog 版本（包括 postcss、fs-extra、storybook 等），并同步更新锁文件以保持依赖解析一致性。

- 🐛 **性能优化：针对 CSS 选择器转换、JS 处理器、WXML 模板处理等热路径进行多项缓存与计算优化。** [`49e50d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/49e50d8bde7327d47e9ba649537092ea57bcdf16) by @sonofmagic
  - JS 处理器：复用 `resolveClassNameTransformWithResult` 返回的 `escapedValue` 避免重复 escape 计算；引入 `getReplacement` 缓存消除重复 `replaceWxml` 调用；移除 `escapeStringRegexp` + `new RegExp` 正则编译开销
  - `createJsHandler`：预构建默认 `defaults` 对象，无覆盖选项时跳过 `defuOverrideArray` 合并
  - WXML 模板：`templateReplacer` 支持复用模块级 tokenizer 实例；`createTemplateHandler` 预构建 attribute matcher 并传递给 `customTemplateHandler`
  - PostCSS fallback 选择器解析：为 `transform` 函数添加 selector 级别缓存，避免重复解析相同选择器
  - `splitCode`：为默认和 allowDoubleQuotes 两种模式分别添加结果缓存，预编译分割正则
- 📦 **Dependencies** [`49e50d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/49e50d8bde7327d47e9ba649537092ea57bcdf16)
  → `@weapp-tailwindcss/shared@1.1.3-alpha.0`

## 2.1.5

### Patch Changes

- 🐛 **提升热更新链路的稳定性与性能，并补齐真实 watch 回归保障：** [`7824e01`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7824e010f8f7e4a7a9ae6eedd707ff4a329d991b) by @sonofmagic
  - 优化运行时类名转译策略，修复 stale runtimeSet 场景下新增任意值类与小数类（如 `text-[23.43px]`、`space-y-2.5`）在 JS/WXML/Vue 中的漏转译问题。
  - 提炼并复用类名候选判定逻辑，减少重复实现，降低后续维护成本。
  - 增强 demo 级 watch 回归脚本（taro + uni-app），覆盖新增类热更新、输出变更检测与恢复校验。
  - 为 watch 回归增加本地构建预热与日志降噪能力（可选 `--quiet-sass`），减少无效噪音并提升排查效率。
  - 优化相关缓存与增量处理路径，缩短常见热更新阶段插件处理耗时。

- 🐛 **修复 Tailwind v4 `space-x-*` 在小程序端生成不兼容方向伪类导致的构建产物报错问题：** [`515aa47`](https://github.com/sonofmagic/weapp-tailwindcss/commit/515aa473159218d67ba8bc461ae7c95d573d3f80) by @sonofmagic
  - 在选择器转换阶段清理 `:-webkit-any(...)`、`:-moz-any(...)`、`:lang(...)` 相关分支，避免输出微信开发者工具不支持的选择器。
  - 对 `:not(...)` 包裹的方向条件保留主体选择器并移除条件；对纯方向分支选择器直接移除，避免产生无效 CSS。
  - 补充 `selectorParser` 回归测试，覆盖上述 RTL/language 伪类清理逻辑。

## 2.1.5-beta.0

### Patch Changes

- 🐛 **提升热更新链路的稳定性与性能，并补齐真实 watch 回归保障：** [`7824e01`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7824e010f8f7e4a7a9ae6eedd707ff4a329d991b) by @sonofmagic
  - 优化运行时类名转译策略，修复 stale runtimeSet 场景下新增任意值类与小数类（如 `text-[23.43px]`、`space-y-2.5`）在 JS/WXML/Vue 中的漏转译问题。
  - 提炼并复用类名候选判定逻辑，减少重复实现，降低后续维护成本。
  - 增强 demo 级 watch 回归脚本（taro + uni-app），覆盖新增类热更新、输出变更检测与恢复校验。
  - 为 watch 回归增加本地构建预热与日志降噪能力（可选 `--quiet-sass`），减少无效噪音并提升排查效率。
  - 优化相关缓存与增量处理路径，缩短常见热更新阶段插件处理耗时。

- 🐛 **修复 Tailwind v4 `space-x-*` 在小程序端生成不兼容方向伪类导致的构建产物报错问题：** [`515aa47`](https://github.com/sonofmagic/weapp-tailwindcss/commit/515aa473159218d67ba8bc461ae7c95d573d3f80) by @sonofmagic
  - 在选择器转换阶段清理 `:-webkit-any(...)`、`:-moz-any(...)`、`:lang(...)` 相关分支，避免输出微信开发者工具不支持的选择器。
  - 对 `:not(...)` 包裹的方向条件保留主体选择器并移除条件；对纯方向分支选择器直接移除，避免产生无效 CSS。
  - 补充 `selectorParser` 回归测试，覆盖上述 RTL/language 伪类清理逻辑。

## 2.1.4

### Patch Changes

- 🐛 **新增 unitsToPx 配置，支持将多种长度单位转换为 px，并在 uni-app-x 预设中透出该选项。** [`d20c0b7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d20c0b7db503c0b8e022101908ff520dc00ed2df) by @sonofmagic

## 2.1.4-alpha.0

### Patch Changes

- 🐛 **新增 unitsToPx 配置，支持将多种长度单位转换为 px，并在 uni-app-x 预设中透出该选项。** [`d20c0b7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d20c0b7db503c0b8e022101908ff520dc00ed2df) by @sonofmagic

## 2.1.3

### Patch Changes

- 🐛 **chore: 升级到 "@weapp-core/escape": "~7.0.0"** [`4bbda03`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4bbda03bc7f924bc7ef75291d27316309c827c58) by @sonofmagic

## 2.1.2

### Patch Changes

- 🐛 **chore: 降级 postcss-preset-env** [`becab46`](https://github.com/sonofmagic/weapp-tailwindcss/commit/becab46e7df4864feba2e708f67a3e3a08e341e0) by @sonofmagic

## 2.1.1

### Patch Changes

- 🐛 **修复 `cssCalc` 预计算时可能输出重复声明的问题，新增仅在启用 `cssCalc` 时生效的去重清理。** [`366027a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/366027a3a9831cbdcb609297c75596ade0f42ad5) by @sonofmagic
- 📦 **Dependencies** [`ccc0a33`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ccc0a330b5cd455665a0f2f2c3e8895b27a04b52)
  → `@weapp-tailwindcss/shared@1.1.2`

## 2.1.0

### Minor Changes

- [`19e9417`](https://github.com/sonofmagic/weapp-tailwindcss/commit/19e94172cd2b79b28b863a15e477136f269bbc3b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - - postcss 包的 px2rpx 链路全面切换为 postcss-pxtrans，移除对 postcss-pxtransform 的依赖
  - 升级 postcss-rem-to-responsive-pixel 到 7.0.0 版本

## 2.0.8

### Patch Changes

- [`07a0d5b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/07a0d5b8b27ebd52b4f9363f004f80d17c3d1f2e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 为 postcss 模块补充中文覆盖率用例，覆盖 html 转换、mp 预处理、兼容性工具与选择器解析的边界路径，确保源码分支全部被校验。

- [`8bd4842`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8bd4842871a96dadb2b85139ffded7f61c99ca01) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 优化样式处理器缓存：以 WeakMap 和引用缓存替换字符串指纹查找，减少 options 合并和管线复用的热路径开销，并复用选择器解析配置以降低分配。基准显示 v3/v4 主块和 rpx 处理吞吐均有明显提升。

- [`74ed4a3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/74ed4a324e528d67d5f4fc22d4cf704b0c246cb8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 tailwindcss v2/v3/v4 中任意 rpx 值被误判为颜色的问题，确保 text/border/bg/outline/ring 输出正确的尺寸样式；补充 Vitest bench 覆盖典型转换场景以跟踪性能。

## 2.0.7

### Patch Changes

- [`3ed3aa8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3ed3aa817a68dae544baf434316399cc78c15b99) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: upgrade "@weapp-core/escape": "~6.0.1"

## 2.0.6

### Patch Changes

- [`ce046d2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ce046d24bb1c843eb4682667f5b2584c3b49bdb5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: upgrade postcss-preset-env to 10.5.0

## 2.0.5

### Patch Changes

- [`c39cbfb`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c39cbfb1980befdaf3df250b2966794ddec01d1e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 抽取 tailwindcss v4 与 uni-app x 的特定兼容逻辑到独立 compat 模块，精简插件主体代码并方便后续维护。

## 2.0.4

### Patch Changes

- Updated dependencies [[`1788e26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1788e26153bafc865776d5a761c2e28dafff6918)]:
  - @weapp-tailwindcss/shared@1.1.1

## 2.0.3

### Patch Changes

- [`abcb4b5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/abcb4b5db5bf42b0363b6b318570cffe2991eb72) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix(postcss): 针对 rounded-full 等圆角类在部分构建链路下被计算成超大值（如 `3.40282e38px`）的问题，统一在后处理阶段将 `border-*-radius` 的不合理巨大像素值（含 `calc(infinity * 1px|rpx)` 与科学计数法）钳制为 `9999px`，以符合小程序规范。该修复覆盖 Tailwind v4 与 taro pxtransform 组合下的异常场景。

  https://github.com/sonofmagic/weapp-tailwindcss/issues/698

## 2.0.2

### Patch Changes

- [`aaff7b8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/aaff7b819b6aed74c473d677aeefcedd0fbd81be) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 默认启用 `color-functional-notation`，自动将 `rgb(... / ...)` 语法转换成兼容性更好的 `rgba(...)`。

- [`ad1ee06`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ad1ee0642dd3bd22fffb2bc448b8850341729443) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 tailwindcss v3 `border-blue-600/10` 这类 rgb 斜杠透明度语法仍输出为 `rgb()`，导致安卓无法解析的问题，强制降级为传统 `rgba()`。

## 2.0.1

### Patch Changes

- [`a35766d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a35766dec66b8d078c5795cfcc262e5a9b21e4f2) Thanks [@sonofmagic](https://github.com/sonofmagic)! - - 彻底移除 `jsAstTool` 相关配置、类型与测试，正式结束对 `ast-grep` 解析器的兼容。
  - 移除 `customRuleCallback` 配置与对应类型、默认值和测试，内置 PostCSS 处理逻辑不再暴露该扩展点。

## 2.0.0

### Major Changes

- [`dea2ecb`](https://github.com/sonofmagic/weapp-tailwindcss/commit/dea2ecba1a7232d10b60701664424dbde8a58141) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 优化处理流程, 重构 @weapp-tailwindcss/postcss

## 1.3.4

### Patch Changes

- [`cb7d4ed`](https://github.com/sonofmagic/weapp-tailwindcss/commit/cb7d4ed16826159bfaabbad1ae7571d94e9d5257) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.3.3

### Patch Changes

- Updated dependencies [[`9291bad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9291bad1821c72f05e64b010ea3da94293a34d42)]:
  - @weapp-tailwindcss/shared@1.1.0

## 1.3.3-alpha.0

### Patch Changes

- Updated dependencies [[`9291bad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9291bad1821c72f05e64b010ea3da94293a34d42)]:
  - @weapp-tailwindcss/shared@1.1.0-alpha.0

## 1.3.2

### Patch Changes

- [`b766f00`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b766f007d65d3383530452c1860907fa3dcfb00e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 通过缓存选择器解析器实例并复用兜底清理流程，优化 PostCSS 管线的运行性能。

## 1.3.2-alpha.0

### Patch Changes

- [`b766f00`](https://github.com/sonofmagic/weapp-tailwindcss/commit/b766f007d65d3383530452c1860907fa3dcfb00e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 通过缓存选择器解析器实例并复用兜底清理流程，优化 PostCSS 管线的运行性能。

## 1.3.1

### Patch Changes

- [`d028fb3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d028fb33297cfac6f2f9c233510f84c7850a8ae9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 优化 CSS 变量计算模式下的正则精确匹配

## 1.3.0

### Minor Changes

- [`4ffb90b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4ffb90bc754459d93929d2de3a843d46edc48f53) Thanks [@sonofmagic](https://github.com/sonofmagic)! - <br/>

  ## Features

  feat(postcss): 添加 `postcss-value-parser` 作为依赖，添加新的 `postcss` 插件 `postcss-remove-include-custom-properties`

  feat(weapp-tailwindcss): 计算模式增强，允许只限定某些特殊的 `custom-properties` 被计算，这样只在遇到不兼容的情况下，才需要开启这个配置

  比如 cssCalc: 设置为 `['--spacing']`, 那么就会把 `tailwindcss` 中的 `--spacing` 值进行计算，其他值则不进行计算

  ## Chore

  chore(deps): upgrade

## 1.2.2

### Patch Changes

- [`d9db976`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d9db9766f428147b01ba4e381549c54083f4fd5a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 在 cssCalc 计算模式下，默认不打开 custom-properties 功能

  > 此功能需要添加筛选 -- 项来精确赋予

## 1.2.1

### Patch Changes

- [`0d76388`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d763881fad85d20a926db89bc29ec9113cfc0b3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat(postcss): deps remove @csstools/postcss-is-pseudo-class

## 1.2.1-alpha.0

### Patch Changes

- [`0d76388`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d763881fad85d20a926db89bc29ec9113cfc0b3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat(postcss): deps remove @csstools/postcss-is-pseudo-class

## 1.2.0

### Minor Changes

- [`ce1150c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ce1150cd87f22736e59f17e5d8a7b61a1354d4cd) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加 postcss calc 和 pxtransform 支持

### Patch Changes

- [`59bdd20`](https://github.com/sonofmagic/weapp-tailwindcss/commit/59bdd205dcfc2d30a097c63d9451d08a3cfb1e73) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 默认开启 cssRemoveProperty, 因为 `@property` 会导致支付宝小程序直接挂掉

## 1.1.1

### Patch Changes

- [`7a33c9a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7a33c9afc8dfe1c32c76d0598e30753970a57146) Thanks [@sonofmagic](https://github.com/sonofmagic)! - ## Fix

  fix: 使用 rounded-full 单位时出现 infinity 问题，只在 taro 默认转化 rpx 情况下出现

  https://github.com/sonofmagic/weapp-tailwindcss/issues/695

  参考链接:

  https://github.com/tailwindlabs/tailwindcss/blob/77b3cb5318840925d8a75a11cc90552a93507ddc/packages/tailwindcss/src/utilities.ts#L2128

## 1.1.0

### Minor Changes

- [`a5d198f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a5d198ff0e8af52f218df98f3ce76a5dbfd8c691) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持 uni-app x 暗黑模式

### Patch Changes

- [`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 对 postcss-html-transform 进行二次封装

## 1.1.0-alpha.1

### Minor Changes

- [`a5d198f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a5d198ff0e8af52f218df98f3ce76a5dbfd8c691) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 支持 uni-app x 暗黑模式

## 1.0.22-alpha.0

### Patch Changes

- [`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 对 postcss-html-transform 进行二次封装

## 1.0.21

### Patch Changes

- [`c7892d6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c7892d699d798abe27c63d1345423a5ac147cc76) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 优化 css 生成

## 1.0.20

### Patch Changes

- [`6cae2c1`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6cae2c1471bfb7fdc182815ba95b566ad6f51dfa) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 优化 uni-app x 场景下的样式生成

## 1.0.19

### Patch Changes

- [`8e4f8ad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8e4f8ad3a5e7e5ba4fa4b0ef7d365e412d1d881e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css sourcemap

## 1.0.19-alpha.0

### Patch Changes

- [`8e4f8ad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8e4f8ad3a5e7e5ba4fa4b0ef7d365e412d1d881e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css sourcemap

## 1.0.18

### Patch Changes

- [`7927bf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7927bf25cfac2f8df90e91eaa2379ba45079499b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css always generate map for uni-app x

## 1.0.18-alpha.0

### Patch Changes

- [`7927bf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/7927bf25cfac2f8df90e91eaa2379ba45079499b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: css always generate map for uni-app x

## 1.0.17

### Patch Changes

- [`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1)]:
  - @weapp-tailwindcss/shared@1.0.3

## 1.0.17-alpha.0

### Patch Changes

- [`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`47f4813`](https://github.com/sonofmagic/weapp-tailwindcss/commit/47f4813c7f901e35d844f1935e14de89eeeb32a1)]:
  - @weapp-tailwindcss/shared@1.0.3-alpha.0

## 1.0.16

### Patch Changes

- [`f2c69d5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/f2c69d5bd8e1dc3d39eced8ff62b75e0c4ef3591) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 修复 `tailwindcss@4` 中，在和 `taro` 一起使用时，`space-x-<number>` 类名生成 `css` 不正确的问题

## 1.0.15

### Patch Changes

- [`2b0a754`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2b0a75493506d219d1b49474f3ce684d107fcbd1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: [#655](https://github.com/sonofmagic/weapp-tailwindcss/issues/655) 默认自动去除 `@layer` 在 `postcss-env-preset` 处理之前

## 1.0.14

### Patch Changes

- [`bf7e53c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bf7e53cfcd69c49c5cd99f7bf21ad0999a31b1d6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 优化 tailwindcss@4.1.10 的生成样式规则

## 1.0.13

### Patch Changes

- [`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add postcss-html-transform plugin

- [`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: injectAdditionalCssVarScope for tailwindcss@4

## 1.0.13-beta.1

### Patch Changes

- [`32f3b12`](https://github.com/sonofmagic/weapp-tailwindcss/commit/32f3b12eac220094e8cdcc5eba2a7dc0469a3e22) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: add postcss-html-transform plugin

## 1.0.13-beta.0

### Patch Changes

- [`ddae06d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ddae06d0c3004234526c2b98f092d76f76c829df) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: injectAdditionalCssVarScope for tailwindcss@4

## 1.0.12

### Patch Changes

- [`5d27de5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5d27de5a509da6984e77036da8a176e0570ba5c1) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 检测生成空的 atRule 节点时，移除空节点

## 1.0.11

### Patch Changes

- [`3cecfdc`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3cecfdccfcdfacd262fee571b0209e095b33838e) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 移除带有 `@supports` `color-mix` 的 css 节点, 修复
  - [#632](https://github.com/sonofmagic/weapp-tailwindcss/issues/632)
  - [#631](https://github.com/sonofmagic/weapp-tailwindcss/issues/631)

  > 但是这种行为会导致使用透明度 + css 变量的时候，被回滚到固定的颜色值，因为微信小程序不支持 `color-mix`，同时 `tailwindcss` 依赖 `color-mix` + `css var` 来进行颜色变量的计算。

## 1.0.10

### Patch Changes

- [`8b45542`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b4554295e9671fd740fa18a9f9a25a17613597b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: tailwindcss v4.1.2 vite plugin

- [`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support `tailwindcss@4.1.2`

- [`0d6564a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d6564aaaea588289dac5b1b784b1902105b297a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 优化 isTailwindcssV4ModernCheck 判断

- [`23c08c7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23c08c7d7ad276035ffa3ef78d0fb00e1c717ddf) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: isTailwindcssV4ModernCheck

## 1.0.10-alpha.3

### Patch Changes

- [`8b45542`](https://github.com/sonofmagic/weapp-tailwindcss/commit/8b4554295e9671fd740fa18a9f9a25a17613597b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: tailwindcss v4.1.2 vite plugin

## 1.0.10-alpha.2

### Patch Changes

- [`1140b23`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1140b23dd3475b5654576ff262b6f9b7de23b60d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: support `tailwindcss@4.1.2`

## 1.0.10-alpha.1

### Patch Changes

- [`23c08c7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/23c08c7d7ad276035ffa3ef78d0fb00e1c717ddf) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: isTailwindcssV4ModernCheck

## 1.0.10-alpha.0

### Patch Changes

- [`0d6564a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/0d6564aaaea588289dac5b1b784b1902105b297a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 优化 isTailwindcssV4ModernCheck 判断

## 1.0.9

### Patch Changes

- [`3113053`](https://github.com/sonofmagic/weapp-tailwindcss/commit/31130538a13098e2a1d29bbd331dc67a195689cf) Thanks [@sonofmagic](https://github.com/sonofmagic)! - Fix: Support `Tailwindcss@4.1.1` and fix [#619](https://github.com/sonofmagic/weapp-tailwindcss/issues/619)

## 1.0.8

### Patch Changes

- [`e8c4534`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e8c4534ab588eae1115dac15b529b7a122141316) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 添加 `cssRemoveProperty` 选项，默认值为 `true`，这是为了在 `tailwindcss` 中移除这种 css 节点:

  ```css
  @property --tw-content {
    syntax: '*';
    initial-value: '';
    inherits: false;
  }
  ```

  这种样式在小程序中，没有任何的意义。

## 1.0.7

### Patch Changes

- [`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9)]:
  - @weapp-tailwindcss/shared@1.0.2

## 1.0.7-alpha.0

### Patch Changes

- [`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`e0c37f5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e0c37f5f546b143341a75701a1907f876df38fa9)]:
  - @weapp-tailwindcss/shared@1.0.2-alpha.0

## 1.0.6

### Patch Changes

- [`ff9933a`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ff9933ad06de7bf3333c1c63016920639a56b87a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: tailwindcss@4 space-x-_ and space-y-_

## 1.0.5

### Patch Changes

- [`a4532ab`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a4532ab34de62556e57ed350e15ca14e602b7f93) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: 使用space-y-2后编译报错 #595

## 1.0.4

### Patch Changes

- [`9e65534`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9e65534f035ee4e17a2dc0b891278cacb92d5a0b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: @layer as :not(#n) and @weapp-tailwindcss/merge switcher

## 1.0.3

### Patch Changes

- Updated dependencies [[`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61)]:
  - @weapp-tailwindcss/shared@1.0.1

## 1.0.3-alpha.0

### Patch Changes

- Updated dependencies [[`bdbca26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bdbca268738ef033a5789e8a6713608c4d599b61)]:
  - @weapp-tailwindcss/shared@1.0.1-alpha.0

## 1.0.2

### Patch Changes

- [`64c0189`](https://github.com/sonofmagic/weapp-tailwindcss/commit/64c018935732481ebe2f366e4136b4d3574dde57) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: improve `isAllowedClassName` preflight

## 1.0.1

### Patch Changes

- [`ee34fb3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ee34fb34688a2bd11018ce5e4ea6d07a062b0b55) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: bg-gradient --tw-gradient-position in oklab

## 1.0.0

### Major Changes

- [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875) Thanks [@sonofmagic](https://github.com/sonofmagic)! - ## Feature

  增加 `@weapp-tailwindcss/merge` 支持，这是 `weapp-tailwindcss` 版本的 `tailwindcss-merge` 和 `cva` 方法

  ## Breaking Changes
  1. 去除 `weapp-tailwindcss/postcss` (可直接安装使用 `@weapp-tailwindcss/postcss`)
  2. 增加 `weapp-tailwindcss/escape` 来取代 `weapp-tailwindcss/replace`
  3. 项目 monorepo 区分包

### Patch Changes

- [`d4bfcc7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d4bfcc7a25776eb9869bd934c05e3b49a3f4cc8b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: remove attribute in :where pseudo

- [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: rename export function

- [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change postcssPresetEnv default value

- [`1df699b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1df699bf82d66847cbc64cc8f294ef237e0470c5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: fix types import intel

- [`6d20f1f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6d20f1f9a799cf350dcbbd861907f0ff70a68dfd) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: perfer postcss-preset-env instead of @csstools

- [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- Updated dependencies [[`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875), [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d), [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b), [`d50d95d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d50d95d04e1c6b7c3ff32acc0d9894d3c0f06d22), [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8)]:
  - @weapp-tailwindcss/shared@1.0.0

## 1.0.0-alpha.8

### Patch Changes

- [`1d689ef`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1d689efca6cf0de7e476b03b2be8d09284beae68) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change postcssPresetEnv default value

## 1.0.0-alpha.7

### Patch Changes

- [`d4bfcc7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d4bfcc7a25776eb9869bd934c05e3b49a3f4cc8b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - fix: remove attribute in :where pseudo

## 1.0.0-alpha.6

### Patch Changes

- [`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: bump version

- Updated dependencies [[`e745ba5`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e745ba5cd9e232c0b5b7053538beb0772240eab8)]:
  - @weapp-tailwindcss/shared@1.0.0-alpha.4

## 1.0.0-alpha.5

### Patch Changes

- [`6d20f1f`](https://github.com/sonofmagic/weapp-tailwindcss/commit/6d20f1f9a799cf350dcbbd861907f0ff70a68dfd) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: perfer postcss-preset-env instead of @csstools

## 1.0.0-alpha.4

### Patch Changes

- [`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: rename export function

- Updated dependencies [[`d7fa028`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d7fa02877ce74792687765766ff94ae3e30edf3b)]:
  - @weapp-tailwindcss/shared@1.0.0-alpha.3

## 1.0.0-alpha.3

### Patch Changes

- [`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

- Updated dependencies [[`2c51531`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2c515310f1fdfd15d11e2e35213c7e6bfcb55c3d)]:
  - @weapp-tailwindcss/shared@1.0.0-alpha.2

## 1.0.0-alpha.2

### Patch Changes

- [`1df699b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1df699bf82d66847cbc64cc8f294ef237e0470c5) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: fix types import intel

## 1.0.0-alpha.1

### Major Changes

- [`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: monorepo changes

### Patch Changes

- Updated dependencies [[`bafd149`](https://github.com/sonofmagic/weapp-tailwindcss/commit/bafd149f0510b30cbf95711223583055023e7875)]:
  - @weapp-tailwindcss/shared@1.0.0-alpha.1

## 0.0.1-alpha.0

### Patch Changes

- Updated dependencies [[`d50d95d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d50d95d04e1c6b7c3ff32acc0d9894d3c0f06d22)]:
  - @weapp-tailwindcss/shared@0.0.1-alpha.0
