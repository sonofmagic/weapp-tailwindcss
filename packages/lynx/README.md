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

`pluginLynxTailwindcss` 固定使用 `platform: 'lynx'`、`generator.target: 'web'` 与 Lynx 原生兼容输出。Tailwind v4 theme 变量会在构建期静态化，确保 `bg-sky-500`、`p-6`、`text-lg` 等标准 utility 能进入 Lynx 原生样式表；应用自行定义的动态 CSS 变量保持不变。

首版仅支持 ReactLynx + Rspeedy 与 Tailwind CSS v4；不覆盖 Rspeedy Web 输出、非 React Lynx 框架、Tailwind CSS v3 或 React Native 风格的运行时样式映射。

## iOS 视觉验收

仓库开发者可在已安装 LynxExplorer 的 iOS Simulator 中运行：

```bash
pnpm e2e:lynx:ios
```

命令会启动 Rspeedy、解析实际 bundle URL、将 URL 写入 Simulator pasteboard，并在截图后按生成的 `bg-sky-500` 颜色做像素断言。当前 LynxExplorer iOS 版本没有可用的 deep-link 回调，因此需在提示出现后手动将 URL 粘贴到首页、点击 Go，再回到终端按 Enter；其余截图、裁剪、像素分析和 dev server 清理均自动完成。
