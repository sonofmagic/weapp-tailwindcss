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

```js
// babel.config.js
module.exports = function (api) {
  api.cache(true)
  return {
    presets: ['babel-preset-expo'],
    plugins: [['@weapp-tailwindcss/react-native/babel', {
      classNameSet: ['flex', 'items-center', 'px-4'],
    }]],
  }
}
```

静态 `className` 必须来自 generator 生成的精确 `classNameSet`；动态值使用 `tw(value)`。现有 `style` 会保持在数组前侧，Tailwind style 追加在后侧。不支持的 CSS 声明会写入 manifest 的 `warnings`，不会静默产出错误的 RN style。

公开入口：`compiler`、`babel`、`metro`、`runtime` 与 `tailwind`。
