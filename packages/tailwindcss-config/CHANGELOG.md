# tailwindcss-config

## 2.0.0-next.2

### Major Changes

- 🚀 **新增 HBuilderX 直连演示矩阵，覆盖 uni-app Vite Vue 3 与 uni-app x 的 Tailwind CSS v3/v4 场景，并提供 `hbuilderx` preset。** [#882](https://github.com/sonofmagic/weapp-tailwindcss/pull/882) by @sonofmagic
  - 同时将已由 tsdown 打包进产物、且不需要消费者安装的实现依赖下移到 `devDependencies`。公开导出或运行期加载边界仍保留为正式依赖，例如 `tailwindcss-config` 的 `jiti`，以及 `@weapp-tailwindcss/shared` 对外导出的 `defu`、`get-value`、`set-value`。

### Patch Changes

- 📦 **Dependencies** [`2d2acf2`](https://github.com/sonofmagic/weapp-tailwindcss/commit/2d2acf29cfee02ffb32783c8bd3c5de8d9aab9df)
  → `@weapp-tailwindcss/shared@2.0.0-next.0`

## 1.1.6-next.1

### Patch Changes

- 🐛 **修复发布产物的 ESM 入口文件名与 `package.json` 导出声明不一致的问题，确保依赖已发布 `weapp-tailwindcss` 的 benchmark 工作区可以正确加载 Tailwind 配置工具包。** [#856](https://github.com/sonofmagic/weapp-tailwindcss/pull/856) by @github-actions

## 1.1.6-next.0

### Patch Changes

- 🐛 **修复 workspace 源码入口在 CommonJS 构建环境中加载时的 ESM 相对导入解析问题。** [#846](https://github.com/sonofmagic/weapp-tailwindcss/pull/846) by @sonofmagic

## 1.1.5

### Patch Changes

- 📦 **Dependencies** [`49e50d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/49e50d8bde7327d47e9ba649537092ea57bcdf16)
  → `@weapp-tailwindcss/shared@1.1.3`

## 1.1.5-alpha.1

### Patch Changes

- 📦 **Dependencies** [`cbead4c`](https://github.com/sonofmagic/weapp-tailwindcss/commit/cbead4ced4b7cba116488d745d47bf826bc83859)
  → `@weapp-tailwindcss/shared@1.1.3-alpha.1`

## 1.1.5-alpha.0

### Patch Changes

- 📦 **Dependencies** [`49e50d8`](https://github.com/sonofmagic/weapp-tailwindcss/commit/49e50d8bde7327d47e9ba649537092ea57bcdf16)
  → `@weapp-tailwindcss/shared@1.1.3-alpha.0`

## 1.1.4

### Patch Changes

- 📦 **Dependencies** [`ccc0a33`](https://github.com/sonofmagic/weapp-tailwindcss/commit/ccc0a330b5cd455665a0f2f2c3e8895b27a04b52)
  → `@weapp-tailwindcss/shared@1.1.2`

## 1.1.3

### Patch Changes

- Updated dependencies [[`1788e26`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1788e26153bafc865776d5a761c2e28dafff6918)]:
  - @weapp-tailwindcss/shared@1.1.1

## 1.1.2

### Patch Changes

- [`1be5402`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1be5402e56f68cf024d0a3eee1a6fdfa827767c6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 新增跨文件 JS 模块图，沿着 import 与 re-export 链路收集并转译类名，实现一次处理整条依赖链，同时允许调用方通过新增的 handler 选项主动开启。`tailwindcss-config` 也改为复用共享工具以保持一致。当本地未安装 `tailwindcss` 时，将提示一次警告并使用空实现兜底，避免直接抛错。

- Updated dependencies [[`9291bad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9291bad1821c72f05e64b010ea3da94293a34d42)]:
  - @weapp-tailwindcss/shared@1.1.0

## 1.1.2-alpha.0

### Patch Changes

- [`1be5402`](https://github.com/sonofmagic/weapp-tailwindcss/commit/1be5402e56f68cf024d0a3eee1a6fdfa827767c6) Thanks [@sonofmagic](https://github.com/sonofmagic)! - 新增跨文件 JS 模块图，沿着 import 与 re-export 链路收集并转译类名，实现一次处理整条依赖链，同时允许调用方通过新增的 handler 选项主动开启。`tailwindcss-config` 也改为复用共享工具以保持一致。当本地未安装 `tailwindcss` 时，将提示一次警告并使用空实现兜底，避免直接抛错。

- Updated dependencies [[`9291bad`](https://github.com/sonofmagic/weapp-tailwindcss/commit/9291bad1821c72f05e64b010ea3da94293a34d42)]:
  - @weapp-tailwindcss/shared@1.1.0-alpha.0

## 1.1.1

### Patch Changes

- [`c7892d6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c7892d699d798abe27c63d1345423a5ac147cc76) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore: 优化 css 生成

## 1.0.1

### Patch Changes

- [`3248d34`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3248d342d07372e0627e21dcdd528ad44d2b52be) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.0.1-alpha.0

### Patch Changes

- [`3248d34`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3248d342d07372e0627e21dcdd528ad44d2b52be) Thanks [@sonofmagic](https://github.com/sonofmagic)! - chore(deps): upgrade

## 1.0.0

### Major Changes

- [`406a9a6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/406a9a646051d497ae7ee5d50334a0a22bf8bbfe) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat!: change default return result

## 1.0.0-alpha.0

### Major Changes

- [`406a9a6`](https://github.com/sonofmagic/weapp-tailwindcss/commit/406a9a646051d497ae7ee5d50334a0a22bf8bbfe) Thanks [@sonofmagic](https://github.com/sonofmagic)! - feat!: change default return result
