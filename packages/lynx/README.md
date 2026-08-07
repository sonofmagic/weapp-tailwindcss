# @weapp-tailwindcss/lynx

ReactLynx + Rspeedy 的 Tailwind CSS v4 集成。它通过 Rspeedy 的 Rspack 生命周期调用 `weapp-tailwindcss` 生成 Lynx 可消费的普通 CSS，保留 ReactLynx 原生 `className`，不引入运行时样式表或 JSX 转换。

## 安装

```bash
pnpm add @weapp-tailwindcss/lynx tailwindcss
```

## 配置

```ts
// lynx.config.ts
import { defineConfig } from '@lynx-js/rspeedy'
import { pluginLynxTailwindcss } from '@weapp-tailwindcss/lynx'

export default defineConfig({
  plugins: [pluginLynxTailwindcss()],
})
```

在应用 CSS 入口中保留 Tailwind v4 标准入口，并用 `@source` 指向实际源码：

```css
@import "tailwindcss";
@source "./src";
```

`pluginLynxTailwindcss` 固定使用 `platform: 'lynx'` 与 `generator.target: 'web'`。首版仅支持 ReactLynx + Rspeedy 与 Tailwind CSS v4；不覆盖 Rspeedy Web 输出、非 React Lynx 框架、Tailwind CSS v3 或 React Native 风格的运行时样式映射。
