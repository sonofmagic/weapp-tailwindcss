# @weapp-tailwindcss/reset

## 0.1.1-next.1

### Patch Changes

- 🐛 **升级 ESM 化依赖后，将公开包的 Node.js 安装版本约束统一到 `^20.19.0 || >=22.12.0`，避免不支持稳定 ESM/CJS 混合加载的 Node.js 版本安装使用。** [`01a0cb2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/01a0cb2f40b59e7989622f22635d0df832b439a1) by @sonofmagic

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
