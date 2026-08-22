# @weapp-tailwindcss/cli

## 5.3.4

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.4

## 5.3.3

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.3

## 5.3.2

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.2

## 5.3.1

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.1

## 5.3.0

### Minor Changes

- ✨ **新增独立的 `@weapp-tailwindcss/cli` 包：默认提供与 Tailwind CSS CLI 对齐的 Web 构建、监听、优化、source map 与 `canonicalize` 能力，并支持通过 `--target weapp` 显式生成小程序兼容 CSS。CLI 命令不再由 `weapp-tailwindcss` 核心包发布。** [#1076](https://github.com/sonofmagic/weapp-tailwindcss/pull/1076) by @sonofmagic
  - 该包此前已经存在 `3.x` 和 `4.0.0-alpha.x` 的旧版原生小程序 Gulp CLI。本次使用 `5.x` 版本线发布新的 Tailwind CSS CLI 兼容实现，避免覆盖旧版本语义或让 npm `latest` 回退到 `0.x`。

### Patch Changes

- 🐛 **统一更新各发布包的 npm 描述与中英文 README，明确 `weapp-tailwindcss` 面向 Web、小程序、React Native、Lynx 与跨端框架的全端 Tailwind CSS 定位。公开包现在默认展示英文 README，并提供统一命名的简体中文入口，同时保留各子包的具体职责边界。** [#1079](https://github.com/sonofmagic/weapp-tailwindcss/pull/1079) by @sonofmagic
- 📦 **Dependencies** [`c2ba271`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c2ba271ac62ba851c23549a8de1038a71bb868d6)
  → `@weapp-tailwindcss/logger@2.0.2`, `weapp-tailwindcss@5.3.0`
