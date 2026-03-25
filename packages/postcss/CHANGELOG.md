# @weapp-tailwindcss/postcss

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
    syntax: "*";
    initial-value: "";
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
