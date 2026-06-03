---
title: uni-app CLI Vue3 Vite
description: uni-app CLI Vue3 Vite 项目接入 weapp-tailwindcss@5，并同时说明 Tailwind CSS 3 和 4 的入口差异。
keywords:
  - 快速开始
  - 安装
  - 配置
  - uni-app
  - cli
  - vue3
  - vite
  - quick start
  - frameworks
  - uni app vite
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - taro
  - rax
---
# uni-app CLI Vue3 Vite

:::warning
这是 `uni-app cli` 创建的 Vue3 Vite 项目。如果你使用 `HBuilderX` 创建项目，请看 [uni-app HBuilderX 使用方式](/docs/quick-start/frameworks/hbuilderx)。
:::

## 选择 Tailwind 入口

| Tailwind 版本 | 安装 | CSS 入口 | 扫描配置 |
| --- | --- | --- | --- |
| 3.x | `pnpm add -D tailwindcss@3 weapp-tailwindcss` | `@tailwind base;` 等指令 | `tailwind.config.js` 的 `content` |
| 4.x | `pnpm add -D tailwindcss weapp-tailwindcss` | `@import "tailwindcss";` | CSS 入口里的 `@source` |

Tailwind CSS 生成由 `WeappTailwindcss` 接管，不要在小程序构建里再注册 `tailwindcss`、`@tailwindcss/postcss` 或 `@tailwindcss/vite`。

### Tailwind CSS 3.x

```css title="src/app.css"
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```ts title="tailwind.config.ts"
export default {
  content: [
    './index.html',
    './src/**/*.{html,js,ts,jsx,tsx,vue}',
    '!./src/uni_modules/**/*',
    '!./node_modules/**/*',
    '!./dist/**/*',
    '!./unpackage/**/*',
  ],
}
```

### Tailwind CSS 4.x

```css title="src/app.css"
@import "tailwindcss";
@source "./**/*.{html,js,ts,jsx,tsx,vue}";
@source not "./uni_modules";
@source not "../node_modules";
@source not "../dist";
@source not "../unpackage";
```

Tailwind 4 的入口请放在纯 `.css` 文件里。业务里仍然可以使用 Sass/Less，但不要把 `@import "tailwindcss"` 直接写进预处理入口。

## 注册插件

在 `vite.config.ts` 中把 `WeappTailwindcss` 放在 `uni()` 后面：

```ts title="vite.config.ts"
import uni from '@dcloudio/vite-plugin-uni'
import { defineConfig } from 'vite'
import { WeappTailwindcss } from 'weapp-tailwindcss/vite'

export default defineConfig({
  plugins: [
    uni(),
    WeappTailwindcss({
      rem2rpx: true,
    }),
  ],
})

```

常规 Vite 项目会自动识别被引入的 Tailwind CSS 入口。入口没有被框架引入、多入口、自动识别失败时，再手动配置 `cssEntries`：

```ts title="vite.config.ts"
import path from 'node:path'

WeappTailwindcss({
  rem2rpx: true,
  cssEntries: [
    path.resolve(__dirname, 'src/app.css'),
  ],
})
```

## 扫描范围提醒

### 问题现象

如果项目把第三方插件或依赖放进 `src/uni_modules`，同时扫描整个 `src`，Tailwind 可能会把依赖源码里的正则片段、README 示例或产物误识别为 class，最终生成异常 CSS。

在小程序产物中，可能会看到类似：

```css
._ba-zA-Z_c__B {
  a-z-a--z:;
}
```

### 根因

这不是业务代码真的写了这样的类名，而是扫描范围太宽，把第三方源码、文档或构建产物也纳入了提取范围。Tailwind 3 用 `content` 排除，Tailwind 4 用 `@source not` 排除。

### 最佳实践

- 扫描范围只覆盖业务源码，不要无差别扫整个 `src`
- 默认排除 `uni_modules`、`node_modules`、`dist`、`unpackage`
- 如果必须包含某个 `uni_modules` 包，只精确包含其中真正承载模板类名的文件

## 创建项目参考

可以通过 `cli` 命令创建项目，具体参数以 [uni-app 官网文档](https://uniapp.dcloud.net.cn/quickstart-cli.html) 为准：

- JavaScript 项目：

```bash
npx degit dcloudio/uni-preset-vue#vite my-vue3-project
```

- TypeScript 项目：

```bash
npx degit dcloudio/uni-preset-vue#vite-ts my-vue3-project
```

## 视频演示

<iframe src="//player.bilibili.com/player.html?aid=326378691&bvid=BV14w411773C&cid=1409199088&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
