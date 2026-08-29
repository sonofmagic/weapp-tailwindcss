# @weapp-tailwindcss/lynx

## 0.3.7

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.4.1

## 0.3.6

### Patch Changes

- 将公开 npm 包的主页和相关文档入口迁移到新的 `https://tw.weapp.dev` 域名，并补齐缺失的包主页元数据。

- Updated dependencies:
  - weapp-tailwindcss@5.4.0

## 0.3.5

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.6

## 0.3.4

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.5

## 0.3.3

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.4

## 0.3.2

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.3

## 0.3.1

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.2

## 0.3.0

### Minor Changes

- 修复 ReactLynx/Rspeedy 多阶段 CSS loader 覆盖 Tailwind CSS 4 入口的问题，兼容 uni-app x 组件局部样式中的前置重要修饰符，并过滤小程序扫描中会生成非法 `:has()` 选择器的 `has-in`/`has-not-in` 变体；新增基于真实 CSS、encoder 与 iOS/Android runtime 报告的完整兼容性实验室。

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.1

## 0.2.1

### Patch Changes

- 🐛 **统一更新各发布包的 npm 描述与中英文 README，明确 `weapp-tailwindcss` 面向 Web、小程序、React Native、Lynx 与跨端框架的全端 Tailwind CSS 定位。公开包现在默认展示英文 README，并提供统一命名的简体中文入口，同时保留各子包的具体职责边界。** [#1079](https://github.com/sonofmagic/weapp-tailwindcss/pull/1079) by @sonofmagic
- 📦 **Dependencies** [`c2ba271`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c2ba271ac62ba851c23549a8de1038a71bb868d6)
  → `weapp-tailwindcss@5.3.0`

## 0.2.0

### Minor Changes

- ✨ **新增 ReactLynx 与 Rspeedy 的 Tailwind CSS v4 构建集成，保留原生 className，并在构建期静态化 Tailwind theme 变量，输出 Lynx 原生运行时可消费的 CSS。** [#1055](https://github.com/sonofmagic/weapp-tailwindcss/pull/1055) by @sonofmagic

### Patch Changes

- 📦 **Dependencies** [`13ee184`](https://github.com/sonofmagic/weapp-tailwindcss/commit/13ee18405356f092248c573f241c0e292cb01fb3)
  → `weapp-tailwindcss@5.2.13`
