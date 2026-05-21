# Web Vite Tailwind CSS Demos

这里放纯 Vite 8 的 Web 平台对比 demo，不使用 Taro、uni-app、`@tailwindcss/vite` 或 `@tailwindcss/postcss`。
默认不启用 Tailwind preflight，方便直接对比 web 与小程序产物差异。

- `react-vite-tailwindcss-v3`
- `react-vite-tailwindcss-v4`
- `vue-vite-tailwindcss-v3`
- `vue-vite-tailwindcss-v4`

默认构建目标是 `web`：

```bash
pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v3 build
```

切换为小程序样式目标：

```bash
pnpm --filter @weapp-tailwindcss-demo/web-react-vite-tailwindcss-v3 build:weapp
```

对比 4 个 demo 的 `dev` 与 `dev:weapp` 页面效果：

```bash
pnpm demo:web:compare
```

脚本会启动每个 demo 的 web/weapp 两个 Vite dev server，用真实浏览器对比首屏截图和关键元素的 computed style。默认输出目录为 `demo/web/.compare-dev-weapp`。
