---
"weapp-tailwindcss": major
"@weapp-tailwindcss/postcss": major
"@weapp-tailwindcss/typography": major
"@weapp-tailwindcss/debug-uni-app-x": major
"@weapp-tailwindcss/logger": major
"@weapp-tailwindcss/shared": major
"tailwindcss-config": major
---

新增 HBuilderX 直连演示矩阵，覆盖 uni-app Vite Vue 3 与 uni-app x 的 Tailwind CSS v3/v4 场景，并提供 `hbuilderx` preset。

同时将已由 tsdown 打包进产物、且不需要消费者安装的实现依赖下移到 `devDependencies`。公开导出或运行期加载边界仍保留为正式依赖，例如 `tailwindcss-config` 的 `jiti`，以及 `@weapp-tailwindcss/shared` 对外导出的 `defu`、`get-value`、`set-value`。
