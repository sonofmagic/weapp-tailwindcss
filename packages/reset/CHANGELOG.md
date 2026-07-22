# @weapp-tailwindcss/reset

## 0.1.2

### Patch Changes

- 🐛 **升级核心 Babel 工具链到 Babel 8，并将 Node.js 最低版本提升到 `^22.18.0 || >=24.11.0`。相关包默认采用 ESM 语义，继续同时发布 ESM 与 CommonJS 入口；ESM 产物使用 `.js`，CommonJS 产物使用 `.cjs`，原有公开包名与子路径保持不变。同时收紧 tsdown 的依赖外置策略，避免 ESM 无条件内联可直接消费的依赖，并保证 CommonJS 不会同步加载 ESM-only 依赖。Webpack loader 与 CommonJS runtime 复用同一构建图，避免重复加载 Babel 8 等内联依赖；watch/serve 热更新复用解析缓存并采用轻量 AST 签名遍历，在完整语义约束允许时默认使用 OXC AST 快路径，并在普通 build、不支持的输入或运行时自动回退 Babel，避免冷构建同时加载双解析器。Webpack chunk 直接使用 compilation 产物图独立转译，原生 JS/WXS 才保留输出模块图关联，避免把 runtime bootstrap `require()` 误当作源码链接，降低 MPX、Taro Webpack 等链路的内存和插件处理耗时。Webpack 产物中的 harmony import 注释与 JSDoc import type 不再误触发模块图解析。** [#1004](https://github.com/sonofmagic/weapp-tailwindcss/pull/1004) by @sonofmagic

## 0.1.1

### Patch Changes

- 🐛 **升级 ESM 化依赖后，将公开包的 Node.js 安装版本约束统一到 `^20.19.0 || >=22.12.0`，避免不支持稳定 ESM/CJS 混合加载的 Node.js 版本安装使用。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

- 🐛 **修复 reset 插件声明类型，避免发布声明依赖 Tailwind CSS 内部散列路径。** [#890](https://github.com/sonofmagic/weapp-tailwindcss/pull/890) by @sonofmagic

## 0.1.1-next.1

### Patch Changes

- 🐛 **升级 ESM 化依赖后，将公开包的 Node.js 安装版本约束统一到 `^20.19.0 || >=22.12.0`，避免不支持稳定 ESM/CJS 混合加载的 Node.js 版本安装使用。** [#879](https://github.com/sonofmagic/weapp-tailwindcss/pull/879) by @github-actions

## 0.1.1-next.0

### Patch Changes

- 🐛 **修复 reset 插件声明类型，避免发布声明依赖 Tailwind CSS 内部散列路径。** [#853](https://github.com/sonofmagic/weapp-tailwindcss/pull/853) by @github-actions

## 0.1.0

### Minor Changes

- ✨ **新增 `@weapp-tailwindcss/reset` 静态样式资源包，提供可直接导入的跨端 reset CSS。** [`9db8b06`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9db8b063adc2a1a6bc8a1f2d6e1d7598dad156e8) by @sonofmagic
  - 支持 `uni-app` 与 `taro` 两套目录结构，导入路径保持一致。
  - 提供 `button-after.css`、`normalize.css`、`modern-normalize.css`、`eric-meyer.css`、`sanitize/*`、`tailwind.css`、`tailwind-compat.css`。
  - 新增独立 README、包级测试与官网文档入口，便于和 `weapp-tailwindcss/reset` 插件能力区分使用。

## 0.1.0-next.0

### Minor Changes

- ✨ **新增 `@weapp-tailwindcss/reset` 静态样式资源包，提供可直接导入的跨端 reset CSS。** [`9db8b06`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9db8b063adc2a1a6bc8a1f2d6e1d7598dad156e8) by @sonofmagic
  - 支持 `uni-app` 与 `taro` 两套目录结构，导入路径保持一致。
  - 提供 `button-after.css`、`normalize.css`、`modern-normalize.css`、`eric-meyer.css`、`sanitize/*`、`tailwind.css`、`tailwind-compat.css`。
  - 新增独立 README、包级测试与官网文档入口，便于和 `weapp-tailwindcss/reset` 插件能力区分使用。
