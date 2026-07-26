---
title: React Native / Expo
description: 使用 @weapp-tailwindcss/react-native 将 Tailwind CSS v4 编译为 React Native styles。
keywords:
  - React Native
  - Expo
  - Tailwind CSS v4
  - Metro
  - Babel
  - "@weapp-tailwindcss/react-native"
  - React 19
  - React Native 0.81
  - Expo SDK 54
  - Tailwind CSS
  - className
  - dark mode
---

# React Native / Expo

`@weapp-tailwindcss/react-native` 是独立的 React Native 编译器包。它复用 `weapp-tailwindcss` 的 Tailwind CSS v4 source 扫描和候选集合，将生成的原始 CSS 编译为内存中的 RN style manifest；运行时不依赖 NativeWind 或 `react-native-css`。

## 安装

```bash
pnpm add @weapp-tailwindcss/react-native
pnpm add -D tailwindcss
```

首个版本面向 Expo SDK 54+、React 19、React Native 0.81+。项目仍然使用 `pnpm` 和仓库要求的 Node 版本。

## CSS 入口

```css title="global.css"
@import "tailwindcss";

@source "./src/**/*.{js,jsx,ts,tsx}";
```

## Metro 与 Babel

```js title="metro.config.js"
const { getDefaultConfig } = require('expo/metro-config')
const { withWeappTailwindcss } = require('@weapp-tailwindcss/react-native/metro')

const config = getDefaultConfig(__dirname)

module.exports = withWeappTailwindcss(config, {
  input: './global.css',
  sourceGlobs: ['./src/**/*.{js,jsx,ts,tsx}'],
})
```

```js title="babel.config.js"
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
  }
}
```

Expo 只配置一次 Metro；它会把 source 扫描、manifest 生成和 Babel JSX transform 自动接起来，不再手写第二份 `classNameSet`。静态 `className="flex items-center"` 会编译为预生成的 StyleSheet lookup，不会在 render 中调用通用 `tw()`；动态 `className={condition ? "bg-red-500" : "bg-blue-500"}` 才会保留为受控的 `tw(...)` 调用。普通 inline `style` 覆盖 Tailwind class，`!important` class 覆盖 inline style。非 Expo 或定制 Metro 场景仍可显式使用 `@weapp-tailwindcss/react-native/babel`。

## 运行时与边界

Metro virtual module 会把 manifest、`Platform.OS` 和 `Appearance` 颜色模式注入 runtime，因此 `dark:`、`ios:`、`android:`、`native:` 变体可以按当前环境选择规则。编译器覆盖常用 layout、flex、spacing、sizing、colors、typography、border、radius、opacity、transform、shadow 和 arbitrary values；浏览器 preflight 默认忽略。不支持的 CSS 特性会产生中文 warning，可在 `manifest.warnings` 中检查。

类型增强从 `@weapp-tailwindcss/react-native/env` 引入；普通自定义组件只要接收 `className` 和 `style` 就可以复用同一套写法，不需要第三方组件 prop 映射。

```ts
import { tw } from '@weapp-tailwindcss/react-native/runtime'

const style = tw(condition ? 'bg-red-500' : 'bg-blue-500')
```

Tailwind 仍由 `weapp-tailwindcss` generator 生成，不要同时注册 `@tailwindcss/vite` 或 `@tailwindcss/postcss`。Expo Web 只建议作为 smoke test，Android/iOS 模拟器或真机才是首个版本的验收目标。

## 验证

```bash
pnpm --filter @weapp-tailwindcss/react-native test
pnpm --filter @weapp-tailwindcss/react-native build
pnpm --filter @weapp-tailwindcss/example-react-native-expo build
pnpm --filter @weapp-tailwindcss/example-react-native-expo test
```
