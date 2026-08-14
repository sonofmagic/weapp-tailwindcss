# @weapp-tailwindcss/react-native

> [English](./README.md) | 简体中文

面向 React Native 与 Expo 的 Tailwind CSS v4 编译器。它复用 `weapp-tailwindcss` 的源码扫描与候选生成，将 CSS 编译为可序列化的 React Native style manifest，不引入 NativeWind 或 `react-native-css` 运行时。

## 安装

```bash
pnpm add @weapp-tailwindcss/react-native tailwindcss
```

## Expo 与 Metro

```js
// metro.config.js
const { getDefaultConfig } = require('expo/metro-config')
const { withWeappTailwindcss } = require('@weapp-tailwindcss/react-native/metro')

const config = getDefaultConfig(__dirname)

module.exports = withWeappTailwindcss(config, {
  input: './global.css',
  sourceGlobs: ['./src/**/*.{js,jsx,ts,tsx}'],
})
```

Metro 会扫描源码、生成精确候选集合和 manifest，并把 Babel JSX transform 接入现有 Expo transformer。无需维护第二份 `classNameSet`。

## 运行模型

- 静态 `className` 编译为预生成的 StyleSheet lookup，不在 render 中调用 `tw()`。
- 动态 class 才通过 `tw(value)` 在运行时解析。
- 普通 inline `style` 覆盖 Tailwind class，`!important` class 覆盖 inline style。
- 不支持的 CSS 声明会记录在 manifest `warnings` 中，不会静默生成错误样式。

## 公开入口

包提供 `compiler`、`tailwind`、`babel`、`metro`、`runtime` 与中性类型入口 `env`。非 Expo 或定制 Metro 场景可以显式组合这些入口。

## 边界

本包生成 React Native 样式清单，不输出 Web CSS 或小程序 WXSS，也不把 NativeWind 或浏览器 CSS 运行时引入应用。

## 文档

完整接入说明见 [React Native / Expo 指南](https://tw.icebreaker.top/docs/quick-start/react-native-expo)。
