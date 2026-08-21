---
title: React Native / Expo 配置参考
description: React Native、Expo、Metro 与 @weapp-tailwindcss/react-native 的 Tailwind CSS 4 配置项和 manifest 运行模型。
keywords:
  - React Native
  - Expo
  - Metro
  - Babel
  - React Native manifest
  - Tailwind CSS 4
  - 配置项
  - React Native styles
  - manifest warnings
  - platform variants
---

# React Native / Expo 配置参考

本页说明 `@weapp-tailwindcss/react-native` 的 Metro、Babel 和 manifest 配置。接入流程见 [React Native / Expo 快速开始](../quick-start/react-native-expo)。

## 支持基线

- `@weapp-tailwindcss/react-native` `0.2.5`
- Expo `>=54`
- React `>=19`
- React Native `>=0.81`
- Tailwind CSS `4.x`
- Node.js `>=22.12.0`

本包生成 React Native style manifest，不输出 Web CSS 或小程序 WXSS，不引入 NativeWind 或 `react-native-css` runtime。

## 安装

```bash
pnpm add @weapp-tailwindcss/react-native
pnpm add -D tailwindcss
```

Expo 项目还需要 Expo SDK、React 和 React Native；非 Expo 项目保留现有 Metro、Babel 与 React Native 依赖。

## Metro 配置

```js title="metro.config.js"
const { getDefaultConfig } = require('expo/metro-config')
const { withWeappTailwindcss } = require('@weapp-tailwindcss/react-native/metro')

const config = getDefaultConfig(__dirname)

module.exports = withWeappTailwindcss(config, {
  input: './global.css',
  sourceGlobs: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
})
```

| 配置项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `projectRoot` | `string` | `process.cwd()` | 应用根目录；Metro 会从这里解析 React 与 React Native 单例。 |
| `input` | `string` | — | Tailwind CSS 入口，相对 `projectRoot` 解析；传入后会扫描并生成 manifest。 |
| `css` | `string` | `''` | 直接传入 CSS 字符串，适合测试或不使用 CSS 文件的场景。 |
| `manifest` | `NativeStyleManifest` | — | 直接使用已有 manifest，跳过 CSS 生成。 |
| `classSet` | `Iterable<string>` | — | 限定生成和 Babel 静态转换的候选集合。应来自真实 Tailwind 候选。 |
| `sourceGlobs` | `string[]` | 自动扫描 | 与 CSS `@source` 保持一致的源码范围。 |
| `watchFiles` | `string[]` | `[]` | 额外触发 manifest 刷新的文件或目录。 |

`manifest`、`input` 和 `css` 是三种输入模式，优先使用 `input`；不要同时维护第二份 `classSet`。Metro 会创建 virtual module、临时 manifest 文件和文件监听，并把 CSS 加入 `sourceExts`。

## CSS 入口与 Babel

```css title="global.css"
@import "tailwindcss";

@source "./app/**/*.{js,jsx,ts,tsx}";
@source "./src/**/*.{js,jsx,ts,tsx}";
```

Expo 使用标准 `babel-preset-expo` 即可。Metro 包装器会把 Babel JSX transform 接到现有 transformer；非 Expo 或定制 Metro 才显式使用 `@weapp-tailwindcss/react-native/babel`。

```ts title="native-env.d.ts"
import '@weapp-tailwindcss/react-native/env'
```

引入 `env` 后，React Native 常用组件会获得 `className` 类型增强。自定义组件需要自行接收并处理 `className` 与 `style`。

## 运行模型与 manifest

- 静态完整 `className` 编译为稳定的 StyleSheet lookup。
- 动态 class 使用 `tw(value)`，只解析生成的精确候选。
- `dark:`、`ios:`、`android:`、`native:` 由 Metro 注入的 `Platform.OS` 与 `Appearance` 环境选择。
- 普通 inline `style` 覆盖 Tailwind；`!important` Tailwind 规则覆盖 inline style。
- 不支持的 CSS 声明写入 `manifest.warnings`，不会静默传给 `StyleSheet.create`。

manifest 主要字段：`version`、`classSet`、`rules`、`styleSheet`、`styleEntries`、`staticLookup`、`variables` 和 `warnings`。CI 可以直接调用 `generateNativeStylesheet()` 检查 warnings 和代表性 class：

```ts
import { generateNativeStylesheet } from '@weapp-tailwindcss/react-native'

const manifest = await generateNativeStylesheet({
  projectRoot: process.cwd(),
  cssEntries: ['global.css'],
  sourceGlobs: ['./src/**/*.{js,jsx,ts,tsx}'],
})

if (manifest.warnings.length) {
  throw new Error(JSON.stringify(manifest.warnings))
}
```

## 边界与验证

- 不要注册 `@tailwindcss/vite` 或 `@tailwindcss/postcss` 生成第二份 Tailwind CSS。
- 浏览器 preflight、selector 状态和未知 CSS 属性不会自动降级为 RN style。
- Expo Web 只作为 smoke test；最终应在 Android/iOS 模拟器或真机验证布局、颜色模式和平台变体。

```bash
pnpm --filter @weapp-tailwindcss/react-native test
pnpm --filter @weapp-tailwindcss/react-native build
pnpm --filter @weapp-tailwindcss/example-react-native-expo build
pnpm e2e:react-native-compatibility
pnpm e2e:react-native:android
pnpm e2e:react-native:ios
```
