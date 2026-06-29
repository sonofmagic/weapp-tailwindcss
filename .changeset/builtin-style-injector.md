---
"weapp-tailwindcss": patch
"@weapp-tailwindcss/postcss": patch
"weapp-style-injector": patch
"@weapp-tailwindcss/style-injector-core": patch
---

在 `weapp-tailwindcss` 主配置中新增 `styleInjector`，默认关闭。启用后会内置复用 `weapp-style-injector` 的样式入口注入能力，并在 Vite/Webpack 中按 `appType` 自动选择 uni-app、Taro、Mpx 或通用预设；当主插件通过 `disabled: true` 或 `disabled: { plugin: true }` 关闭时，样式注入也会同步关闭。

同时修复 `@weapp-tailwindcss/postcss` 中 `Px2rpxOptions` 在 NodeNext 类型解析下无法正确导出的声明问题。

将 `weapp-style-injector` 的通用实现提炼到 `@weapp-tailwindcss/style-injector-core`，`weapp-style-injector` 保留原有入口作为兼容外壳，`weapp-tailwindcss` 复用共享实现以避免重复维护。
