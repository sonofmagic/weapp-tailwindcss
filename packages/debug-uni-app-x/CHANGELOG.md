# @weapp-tailwindcss/debug-uni-app-x

## 1.0.2

### Patch Changes

- 🐛 **升级核心 Babel 工具链到 Babel 8，并将 Node.js 最低版本提升到 `^22.18.0 || >=24.11.0`。相关包默认采用 ESM 语义，继续同时发布 ESM 与 CommonJS 入口；ESM 产物使用 `.js`，CommonJS 产物使用 `.cjs`，原有公开包名与子路径保持不变。同时收紧 tsdown 的依赖外置策略，避免 ESM 无条件内联可直接消费的依赖，并保证 CommonJS 不会同步加载 ESM-only 依赖。Webpack loader 与 CommonJS runtime 复用同一构建图，避免重复加载 Babel 8 等内联依赖；watch/serve 热更新复用解析缓存并采用轻量 AST 签名遍历，在完整语义约束允许时默认使用 OXC AST 快路径，并在普通 build、不支持的输入或运行时自动回退 Babel，避免冷构建同时加载双解析器。Webpack chunk 直接使用 compilation 产物图独立转译，原生 JS/WXS 才保留输出模块图关联，避免把 runtime bootstrap `require()` 误当作源码链接，降低 MPX、Taro Webpack 等链路的内存和插件处理耗时。Webpack 产物中的 harmony import 注释与 JSDoc import type 不再误触发模块图解析。** [#1004](https://github.com/sonofmagic/weapp-tailwindcss/pull/1004) by @sonofmagic

## 1.0.1

### Patch Changes

- 🐛 **修复调试产物目录被 Vite dev server 监听后反复触发热更新的问题，避免 uni-app x H5 调试时出现页面空白或 HMR 循环。** [`ead42b6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ead42b6650fc2b21c3d73033e63b22e2605a27aa) by @sonofmagic

## 1.0.0

### Major Changes

- 🚀 **新增 HBuilderX 直连演示矩阵，覆盖 uni-app Vite Vue 3 与 uni-app x 的 Tailwind CSS v3/v4 场景，并提供 `hbuilderx` preset。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic
  - 同时将已由 tsdown 打包进产物、且不需要消费者安装的实现依赖下移到 `devDependencies`。公开导出或运行期加载边界仍保留为正式依赖，例如 `tailwindcss-config` 的 `jiti`，以及 `@weapp-tailwindcss/shared` 对外导出的 `defu`、`get-value`、`set-value`。

## 1.0.0-next.0

### Major Changes

- 🚀 **新增 HBuilderX 直连演示矩阵，覆盖 uni-app Vite Vue 3 与 uni-app x 的 Tailwind CSS v3/v4 场景，并提供 `hbuilderx` preset。** [#882](https://github.com/sonofmagic/weapp-tailwindcss/pull/882) by @sonofmagic
  - 同时将已由 tsdown 打包进产物、且不需要消费者安装的实现依赖下移到 `devDependencies`。公开导出或运行期加载边界仍保留为正式依赖，例如 `tailwindcss-config` 的 `jiti`，以及 `@weapp-tailwindcss/shared` 对外导出的 `defu`、`get-value`、`set-value`。

## 0.0.4

### Patch Changes

- 🐛 **增强 `debug-uni-app-x` 的调试索引能力，并修复 `uni-app x` 场景下带查询参数模块的调试文件覆盖问题。** [`e415a93`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e415a933b3abaf1ff157553f55fabec3ea22eb07) by @sonofmagic
  - 保留模块 `id` 中的查询参数信息，避免 `App.uvue?vue&type=script...` 与 `App.uvue?vue&type=style...` 写入同一路径后互相覆盖。
  - 为每个阶段目录与 bundle 目录生成 `_meta.json`，记录调试文件相对路径、原始模块 `id`、阶段与类型。
  - 在调试输出根目录新增 `_manifest.json`，聚合 `pre/normal/post/bundle-*` 全部索引，方便后续工具消费与排查。
  - `enabled` 改为默认启用，并保留 `stages/include/exclude/skipPlatforms/onError` 配置。
  - 补充完整的中文 JSDoc 与 `tsd` 类型测试，固定公开导出类型契约。
  - 继续保证写盘失败不会中断构建。

## 0.0.4-alpha.0

### Patch Changes

- 🐛 **增强 `debug-uni-app-x` 的调试索引能力，并修复 `uni-app x` 场景下带查询参数模块的调试文件覆盖问题。** [`e415a93`](https://github.com/sonofmagic/weapp-tailwindcss/commit/e415a933b3abaf1ff157553f55fabec3ea22eb07) by @sonofmagic
  - 保留模块 `id` 中的查询参数信息，避免 `App.uvue?vue&type=script...` 与 `App.uvue?vue&type=style...` 写入同一路径后互相覆盖。
  - 为每个阶段目录与 bundle 目录生成 `_meta.json`，记录调试文件相对路径、原始模块 `id`、阶段与类型。
  - 在调试输出根目录新增 `_manifest.json`，聚合 `pre/normal/post/bundle-*` 全部索引，方便后续工具消费与排查。
  - `enabled` 改为默认启用，并保留 `stages/include/exclude/skipPlatforms/onError` 配置。
  - 补充完整的中文 JSDoc 与 `tsd` 类型测试，固定公开导出类型契约。
  - 继续保证写盘失败不会中断构建。

## 0.0.3

### Patch Changes

- [`367904b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/367904baa9985509b830ac2e7e2db12841f6dd37) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复 `HBuilderX` 构建安卓时插件调试输出包含空字节路径导致写入失败的问题。

## 0.0.2

### Patch Changes

- [`4ffb90b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/4ffb90bc754459d93929d2de3a843d46edc48f53) Thanks [@sonofmagic](https://github.com/sonofmagic)! - <br/>

  ## Features

  feat(postcss): 添加 `postcss-value-parser` 作为依赖，添加新的 `postcss` 插件 `postcss-remove-include-custom-properties`

  feat(weapp-tailwindcss): 计算模式增强，允许只限定某些特殊的 `custom-properties` 被计算，这样只在遇到不兼容的情况下，才需要开启这个配置

  比如 cssCalc: 设置为 `['--spacing']`, 那么就会把 `tailwindcss` 中的 `--spacing` 值进行计算，其他值则不进行计算

  ## Chore

  chore(deps): upgrade

## 0.0.1

### Patch Changes

- [`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 对 postcss-html-transform 进行二次封装

- [`16eb82b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/16eb82b988d039da8acba7b7df766d01b056e1d6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change default targetDir

## 0.0.1-alpha.0

### Patch Changes

- [`7419618`](https://github.com/sonofmagic/weapp-tailwindcss/commit/741961839510edafc39f2cebf91b8e8dc1cd8bd3) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat: 对 postcss-html-transform 进行二次封装

- [`16eb82b`](https://github.com/sonofmagic/weapp-tailwindcss/commit/16eb82b988d039da8acba7b7df766d01b056e1d6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: change default targetDir
