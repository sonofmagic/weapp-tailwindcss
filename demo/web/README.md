# Web Vite Tailwind CSS Demos

这里放纯 Vite 8 的 Web 平台对比 demo，不使用 Taro、uni-app、`@tailwindcss/vite` 或 `@tailwindcss/postcss`。

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
