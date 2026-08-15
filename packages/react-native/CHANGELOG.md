# @weapp-tailwindcss/react-native

## 0.2.2

### Patch Changes

- 🐛 **统一更新各发布包的 npm 描述与中英文 README，明确 `weapp-tailwindcss` 面向 Web、小程序、React Native、Lynx 与跨端框架的全端 Tailwind CSS 定位。公开包现在默认展示英文 README，并提供统一命名的简体中文入口，同时保留各子包的具体职责边界。** [#1079](https://github.com/sonofmagic/weapp-tailwindcss/pull/1079) by @sonofmagic
- 📦 **Dependencies** [`c2ba271`](https://github.com/sonofmagic/weapp-tailwindcss/commit/c2ba271ac62ba851c23549a8de1038a71bb868d6)
  → `weapp-tailwindcss@5.3.0`

## 0.2.1

### Patch Changes

- 🐛 **同步 React Native 包开发环境与工作区 React 版本，避免依赖升级后 Expo 示例解析到不同 peer 上下文而丢失 `className` 类型增强。** [`92ea656`](https://github.com/sonofmagic/weapp-tailwindcss/commit/92ea656d6bf211ac846a7c8af3919606d58be1ea) by @sonofmagic
- 📦 **Dependencies** [`3f3f3b3`](https://github.com/sonofmagic/weapp-tailwindcss/commit/3f3f3b3045d9aac099a359b514cd9f3b7cab1d3f)
  → `weapp-tailwindcss@5.2.5`

## 0.2.0

### Minor Changes

- ✨ **新增面向 React Native 与 Expo 的 Tailwind CSS v4 原生样式编译器、Babel 转换器、Metro 集成和运行时 helper。Expo Metro 自动生成 manifest/classSet，静态 className 使用 StyleSheet lookup，动态 className 使用带缓存的 tw()，并支持 source order、`!important`、平台/深色变体和 `env` 类型入口。** [#1020](https://github.com/sonofmagic/weapp-tailwindcss/pull/1020) by @sonofmagic

### Patch Changes

- 📦 **Dependencies** [`d28f70d`](https://github.com/sonofmagic/weapp-tailwindcss/commit/d28f70dbb581673416868a5bb9517e82e0e24c98)
  → `weapp-tailwindcss@5.2.3`
