# @weapp-tailwindcss/react-native

## 0.2.8

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.6

## 0.2.7

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.5

## 0.2.6

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.4

## 0.2.5

### Patch Changes

- 收紧 React Native 样式编译边界，只生成平台明确支持的属性和条件变体，并补充比例值、百分比透明度、项目根目录及 CSS 入口类型支持，避免未知 CSS 属性或浏览器 selector 变体被误报为可用原生样式。

  稳定 Babel 静态 lookup 使用的 StyleSheet ID，避免 TSX 或 CSS HMR 改变规则顺序后串用其他 class 的样式；同时加入 Expo Web、Android、iOS 共用的 118 项兼容性报告、截图和独立 TSX/CSS HMR 门禁。

  Metro transformer 在未透传自定义 id 或 manifest 路径时也会按项目根目录等待异步样式生成完成，并通过跨进程 ready 标记同步 manifest 与 virtual module，避免构建速度较慢或 HMR 刷新时使用空 manifest 导致静态 className 未被转换。

  React Native 类型增强入口改为纯类型依赖，不再从 workspace 包目录额外加载另一份 React Native 运行时，避免 Metro bundle 与 Expo 原生二进制使用不同 patch 版本后出现原生模块注册表为空的问题。

  Android 与 iOS 的 Metro resolver 进一步把 `react`、`react-native` 及其子路径锚定到应用项目根目录，确保 linked workspace 包与原生二进制共用同一份 React Native runtime；Web 保留 Expo 原有的平台解析与 `react-native-web` 映射。

- Updated dependencies:
  - weapp-tailwindcss@5.3.3

## 0.2.4

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.2

## 0.2.3

### Patch Changes

- Updated dependencies:
  - weapp-tailwindcss@5.3.1

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
