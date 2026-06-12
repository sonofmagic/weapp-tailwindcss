# Taro demo 多端脚本说明

本目录下所有 `taro-*` demo 默认继续以微信小程序和 H5 作为主要验证入口，同时补充 RN、Android、iOS 与 Harmony Hybrid 脚本，便于检查 `weapp-tailwindcss` 在 Taro 多端链路中的样式产物。

## 平台脚本

- `pnpm build:rn`：执行 `taro build --type rn`，生成 React Native 侧 bundle。
- `pnpm build:android`：执行 `taro build --type rn --platform android`，用于 Android 壳工程消费。
- `pnpm build:ios`：执行 `taro build --type rn --platform ios`，用于 iOS 壳工程消费。
- `pnpm build:harmony`：执行 `pnpm run build:harmony-hybrid`，作为鸿蒙 Hybrid 构建的直观别名。
- `pnpm build:harmony-hybrid`：执行 `taro build --type harmony-hybrid`，生成鸿蒙 Harmony Hybrid 的 H5 侧资源。
- 对应的 `dev:*` 脚本会在上述构建命令后追加 `--watch`。

Android 和 iOS 不是独立的 Taro 编译端，它们按 Taro 官方 RN 流程通过 `--type rn --platform android|ios` 区分 bundle。原生 APK、IPA 或鸿蒙应用包仍需在对应壳工程中使用 Android Studio、Xcode 或 DevEco Studio 完成。

## demo 边界

React demo 已补齐 Taro RN runner 与 RN runtime 依赖，可作为 RN、Android、iOS bundle 的主要验证入口。Vue demo 的小程序与 H5 入口继续保留 Vue 3 实现；RN 入口额外提供 `.rn.tsx` React 平台文件，因为当前 Taro RN Babel 预设只接受 React/Preact。

Harmony Hybrid 是 WebView 容器方案，样式目标按 H5/Web 产物处理；RN 原生 bundle 不运行 `weapp-tailwindcss` 的样式生成入口。

Taro 4.x 还提供 Harmony-CPP 原生方案，官方命令为 `taro build --type harmony_cpp`，并要求在 `config/index.ts` 中配置 `harmony.projectPath` 指向 DevEco Studio 创建的鸿蒙工程。当前 demo 只包含 Taro JS 工程，不包含鸿蒙壳工程，因此没有把 `harmony_cpp` 做成默认脚本；需要验证纯血鸿蒙时，应先补齐对应壳工程目录再接入 `@tarojs/plugin-platform-harmony-cpp`。

参考文档：

- https://docs.taro.zone/docs/react-native
- https://docs.taro.zone/docs/harmony/c-api
- https://docs.taro.zone/docs/harmony-hybrid/
