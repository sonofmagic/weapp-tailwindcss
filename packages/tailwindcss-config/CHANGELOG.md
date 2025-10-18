# tailwindcss-config

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
