# weapp-style-injector

## 1.0.0

### Major Changes

- 🚀 **发布 `weapp-style-injector` 1.0.0，收口分包样式注入配置为 `rules`：可以用对象映射、tuple 或 `from`/`to` 对象直接描述“哪个样式入口会注入到哪些产物中”。** [`be1cdb0`](https://github.com/sonofmagic/weapp-tailwindcss/commit/be1cdb0e6a6ab898abad3fd2fcfcdde5b81e0d9c) by @sonofmagic
  - 这是破坏性变更：移除 `styleEntries`、`subPackages.imports`、预设插件 `subpackageImports` 等过长或偏内部的公开配置入口。

### Patch Changes

- 🐛 **在 `weapp-tailwindcss` 主配置中新增 `styleInjector`，默认关闭。启用后会内置复用 `weapp-style-injector` 的样式入口注入能力，并在 Vite/Webpack 中按 `appType` 自动选择 uni-app、Taro、Mpx 或通用预设；当主插件通过 `disabled: true` 或 `disabled: { plugin: true }` 关闭时，样式注入也会同步关闭。** [`747dcf3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/747dcf34a1cf77a14b859ee86f537ce2cd89bddd) by @sonofmagic
  - 同时修复 `@weapp-tailwindcss/postcss` 中 `Px2rpxOptions` 在 NodeNext 类型解析下无法正确导出的声明问题。
  - `weapp-tailwindcss` 直接复用 `weapp-style-injector` 的现有实现，避免在主包内重复维护样式注入逻辑，同时保持 `weapp-style-injector` 原有独立入口不变。

- 🐛 **收口 `weapp-style-injector` 的公开导出入口，移除未文档化的 `uni-app`、`taro`、`subpackage` 深入口，保留根入口、通用 Vite/Webpack 插件入口以及 uni-app/Taro 的 Vite/Webpack 预设入口。** [`2863217`](https://github.com/sonofmagic/weapp-tailwindcss/commit/28632172a1b4c63b94b4798ab7c3f3f1104eff8c) by @sonofmagic

- 🐛 **修复分包样式注入在 Webpack、Taro Vite 与 uni-app H5 产物中的边界处理，避免 H5 分包页面误生成小程序样式后缀并丢失页面原始样式；新增同一分包内多样式入口配置，可分别向 pages、components 与 `*.weapp.*`、`*.ali.*` 等平台源码文件注入不同入口；同时新增独立的 uni-app、MPX、Taro Webpack、Taro Vite 分包集成回归项目。** [`5997f42`](https://github.com/sonofmagic/weapp-tailwindcss/commit/5997f42672bdada25dcb15a77fc4f69ccd167668) by @sonofmagic

## 0.0.3

### Patch Changes

- 🐛 **修复 uni-app Vite 预设在 `generateBundle` 中直接写入 bundle 资产的问题，改为通过 `emitFile` 生成分包样式入口，以兼容 Vite 8/Rolldown。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic
- 📦 **Dependencies** [`73a7794`](https://github.com/sonofmagic/weapp-tailwindcss/commit/73a7794d50916d2189f22bfaa9e9ab9402b30df7)
  → `@weapp-tailwindcss/shared@2.0.0`

## 0.0.3-next.2

### Patch Changes

- 📦 **Dependencies** [`aaba811`](https://github.com/sonofmagic/weapp-tailwindcss/commit/aaba811cfc2ad003d3daf2cf290c9d8b770c6dfb)
  → `@weapp-tailwindcss/shared@2.0.0-next.1`

## 0.0.3-next.1

### Patch Changes

- 📦 **Dependencies** [`2d2acf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2d2acf29cfee02ffb32783c8bd3c5de8d9aab9df)
  → `@weapp-tailwindcss/shared@2.0.0-next.0`

## 0.0.3-next.0

### Patch Changes

- 🐛 **修复 uni-app Vite 预设在 `generateBundle` 中直接写入 bundle 资产的问题，改为通过 `emitFile` 生成分包样式入口，以兼容 Vite 8/Rolldown。** [#879](https://github.com/sonofmagic/weapp-tailwindcss/pull/879) by @github-actions

## 0.0.2

### Patch Changes

- 📦 **Dependencies** [`49e50d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/49e50d8bde7327d47e9ba649537092ea57bcdf16)
  → `@weapp-tailwindcss/shared@1.1.3`

## 0.0.2-alpha.1

### Patch Changes

- 📦 **Dependencies** [`cbead4c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/cbead4ced4b7cba116488d745d47bf826bc83859)
  → `@weapp-tailwindcss/shared@1.1.3-alpha.1`

## 0.0.2-alpha.0

### Patch Changes

- 📦 **Dependencies** [`49e50d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/49e50d8bde7327d47e9ba649537092ea57bcdf16)
  → `@weapp-tailwindcss/shared@1.1.3-alpha.0`

## 0.0.1

### Patch Changes

- 🐛 **提取常用字符串/数组工具到 shared，并在相关包中复用。** [`ccc0a33`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ccc0a330b5cd455665a0f2f2c3e8895b27a04b52) by @sonofmagic
- 📦 **Dependencies** [`ccc0a33`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ccc0a330b5cd455665a0f2f2c3e8895b27a04b52)
  → `@weapp-tailwindcss/shared@1.1.2`
