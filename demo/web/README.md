# Web Tailwind CSS Demos

这里放纯 Web 平台对比 demo，不使用 Taro、uni-app、`@tailwindcss/vite` 或 `@tailwindcss/postcss`。
默认不启用 Tailwind preflight，方便直接对比 web 与小程序产物差异。

- `react-vite-tailwindcss-v4`
- `vue-vite-tailwindcss-v4`
- `react-rsbuild-tailwindcss-v4`
- `vue-rsbuild-tailwindcss-v4`
- `react-webpack-tailwindcss-v4`
- `vue-webpack-tailwindcss-v4`

Vite demo 使用 `weapp-tailwindcss/vite`；Rsbuild demo 使用 `weapp-tailwindcss/rspack` 修补 Rspack loader 顺序并注册 `weapp-tailwindcss/webpack` 插件；Webpack demo 使用 `weapp-tailwindcss/webpack` 插件方案注册。

默认构建目标是 `web`：

```bash
pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v4 build
```

切换为小程序样式目标：

```bash
pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v4 build:weapp
```

验证 2 个 demo 的 `dev` 与 `dev:weapp`：

```bash
pnpm demo:web:compare
```

脚本会启动每个 demo 的 web/weapp 两个 dev server，用真实浏览器验证 web 目标关键样式，同时读取 weapp 目标的 dev CSS，检查小程序转义选择器、响应式选择器和任意值选择器是否正确生成；随后执行每个项目的 `build:web` 与 `build:weapp`。默认输出目录为 `demo/web/.compare-dev-weapp`。Rsbuild 使用 `weapp-tailwindcss/webpack` 时，当前 web target 不触发 Tailwind v4 生成 loader，脚本只强制它的 weapp CSS 与构建通过，并在报告中记录该差异。

验证 6 个 demo 的源码 HMR：

```bash
pnpm e2e:web:hmr
```
