# Package Guidelines (`packages/react-native`)

## 适用范围

- 本文件适用于 React Native/Expo Tailwind 编译器包。

## 核心职责

- 将 Tailwind CSS v4 生成的 CSS 转为可序列化的 React Native style manifest。
- 提供 Babel、Metro 和运行时之间的最小连接层。

## 变更原则

- 不修改 `weapp-tailwindcss` 现有小程序转译语义。
- class 必须基于生成的精确 class 集合处理，禁止启发式生成未知 class。
- 不把构建产物写入 Expo/RN bundle 输出目录。
- 不引入 NativeWind 或 `react-native-css` 作为运行时依赖。

## 测试要求

- 编译器、运行时、Babel、Metro 行为均需有 Vitest 回归覆盖。
- 不支持的 CSS 属性必须有 warning 断言。

## 推荐验证命令

```bash
pnpm --filter @weapp-tailwindcss/react-native test
pnpm --filter @weapp-tailwindcss/react-native build
```

## 提交前检查

- 检查 exports、类型声明和 README 示例一致。
- 检查新包未改变核心小程序包的构建输出。
