# @weapp-tailwindcss/typography

## 1.0.0-next.1

### Major Changes

- 🚀 **新增 HBuilderX 直连演示矩阵，覆盖 uni-app Vite Vue 3 与 uni-app x 的 Tailwind CSS v3/v4 场景，并提供 `hbuilderx` preset。** [#882](https://github.com/sonofmagic/weapp-tailwindcss/pull/882) by @sonofmagic
  - 同时将已由 tsdown 打包进产物、且不需要消费者安装的实现依赖下移到 `devDependencies`。公开导出或运行期加载边界仍保留为正式依赖，例如 `tailwindcss-config` 的 `jiti`，以及 `@weapp-tailwindcss/shared` 对外导出的 `defu`、`get-value`、`set-value`。

## 0.2.8-next.0

### Patch Changes

- 🐛 **升级 ESM 化依赖后，将公开包的 Node.js 安装版本约束统一到 `^20.19.0 || >=22.12.0`，避免不支持稳定 ESM/CJS 混合加载的 Node.js 版本安装使用。** [#879](https://github.com/sonofmagic/weapp-tailwindcss/pull/879) by @github-actions

## 0.2.7

### Patch Changes

- 🐛 **升级 `tailwindcss-patch` 到 `9` 系列最新版本，并同步更新相关依赖。** [`38c11e7`](https://github.com/sonofmagic/weapp-tailwindcss/commit/38c11e78a0c1f31d7635a98c95fbfe624723c4c3) by @sonofmagic

## 0.2.7-alpha.0

### Patch Changes

- 🐛 **升级 `tailwindcss-patch` 到 `8.7.4-alpha.0`，同步消费最新的 alpha 版本依赖。** [#819](https://github.com/sonofmagic/weapp-tailwindcss/pull/819) by @sonofmagic

## 0.2.6

### Patch Changes

- [`a5f5c01`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a5f5c0187dc8d0d074ab81e00034f9cfad902ced) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 修复构建产物依赖 Node.js `url` 模块导致浏览器端编译失败的问题，去除 tsup 注入的 Node shim，保证包在 Vite 等 Web 环境下可正常使用。

## 0.2.5

### Patch Changes

- [`a8857e6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a8857e6e8cf196c273e5e56e5745e2de97cd308a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 依赖更新

## 0.2.5-alpha.0

### Patch Changes

- [`a8857e6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/a8857e6e8cf196c273e5e56e5745e2de97cd308a) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 依赖更新
