# React Native + Expo

这是 `@weapp-tailwindcss/react-native` 的最小 Expo 示例，使用 Tailwind CSS v4 的 source 入口和 Metro virtual manifest。

```bash
pnpm --filter @weapp-tailwindcss/example-react-native-expo start
pnpm --filter @weapp-tailwindcss/example-react-native-expo android
pnpm --filter @weapp-tailwindcss/example-react-native-expo ios
```

示例中的 CSS 规则故意保持为 React Native 可映射的声明；不支持的 CSS 声明会由编译器报告 warning。
