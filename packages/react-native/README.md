# @weapp-tailwindcss/react-native

面向 React Native 与 Expo 的 Tailwind CSS v4 编译器。它复用 `weapp-tailwindcss` 的 source 扫描与候选生成，将原始 CSS 编译为可序列化的 React Native style manifest，不引入 NativeWind 或 `react-native-css` 运行时。

## Expo 配置

```bash
pnpm add @weapp-tailwindcss/react-native tailwindcss
```

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

Expo 只需要配置一次 Metro。Metro 会扫描 source、生成精确候选集合和 manifest，并自动把 Babel JSX transform 注入原有 Expo transformer；不需要再维护第二份 `classNameSet`。非 Expo 或定制 Metro 场景仍可显式使用 `@weapp-tailwindcss/react-native/babel`。

静态 `className` 会编译为预生成的 StyleSheet lookup，不在 render 中调用 `tw()`；动态值才使用 `tw(value)`。普通 inline `style` 覆盖 Tailwind class，`!important` class 覆盖 inline style。不支持的 CSS 声明会写入 manifest 的 `warnings`，不会静默产出错误的 RN style。

公开入口：`compiler`、`babel`、`metro`、`runtime`、`tailwind` 与中性类型入口 `env`。
