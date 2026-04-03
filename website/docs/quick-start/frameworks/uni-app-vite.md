---
title: uni-app cli vue3 vite
description: 创建完成后，快速上手中的准备工作都完成之后，就可以便捷的注册了：
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
# uni-app cli vue3 vite

:::warning
这是 `uni-app cli` 创建的项目的注册方式，如果你使用 `HbuilderX`，应该查看 [uni-app HbuilderX 使用方式](/docs/quick-start/frameworks/hbuilderx)
:::

## 注册插件

创建完成后，快速上手中的准备工作都完成之后，就可以便捷的注册了：

```js title="vite.config.[jt]s"
import { defineConfig } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import { UnifiedViteWeappTailwindcssPlugin as uvwt } from 'weapp-tailwindcss/vite';

export default defineConfig({
  // uni 是 uni-app 官方插件， uvtw 一定要放在 uni 后，对生成文件进行处理
  plugins: [uni(),uvwt()],
  css: {
    postcss: {
      plugins: [
        // require('tailwindcss')() 和 require('tailwindcss') 等价的，表示什么参数都不传，如果你想传入参数
        // require('tailwindcss')({} <- 这个是postcss插件参数)
        require('tailwindcss'),
        require('autoprefixer')
      ],
    },
  },
});

```

这里只列举了插件的注册，包括`postcss`配置完整的注册方式，参考配置项文件链接: <https://github.com/sonofmagic/uni-app-vite-vue3-tailwind-vscode-template>

## `tailwind.config` 扫描范围提醒

### 问题现象

如果你的 `uni-app` 项目把第三方插件或依赖放进了 `src/uni_modules`，同时又在 `tailwind.config` 中直接扫描整个 `src/**/*.{html,js,ts,jsx,tsx,vue}`，Tailwind v3 可能会把依赖源码里的正则表达式、README 示例文本误识别为 class，最终生成异常 CSS。

在小程序产物中，可能会看到类似：

```css
._ba-zA-Z_c__B {
  a-z-a--z:;
}
```

### 根因

这不是业务代码真的写了这样的类名，而是 Tailwind v3 的内容提取器误扫了 `src/uni_modules` 里的第三方源码或文档。

### 推荐配置

```ts title="tailwind.config.ts"
export default {
  content: [
    './index.html',
    './src/**/*.{html,js,ts,jsx,tsx,vue}',
    '!./src/uni_modules/**/*',
  ],
}
```

### 最佳实践

- `content` 只扫业务源码，不要无差别扫整个 `src`
- 默认排除 `uni_modules`、`node_modules`、`dist`、`unpackage`
- 如果必须包含某个 `uni_modules` 包，只精确包含其中真正承载模板类名的文件

## 创建项目参考

`uni-app vite` 版本是 `uni-app` 最新的升级，它使用 `vue3` 的语法。

你可以通过 `cli` 命令创建项目 ([参考官网文档](https://uniapp.dcloud.net.cn/quickstart-cli.html)):

- 创建以 javascript 开发的工程（如命令行创建失败，请直接访问 gitee 下载模板）

```bash
npx degit dcloudio/uni-preset-vue#vite my-vue3-project
```

- 创建以 typescript 开发的工程（如命令行创建失败，请直接访问 gitee 下载模板）

```bash
npx degit dcloudio/uni-preset-vue#vite-ts my-vue3-project
```

> gitee 地址见上方的 `参考官网文档` 链接，点击跳转到 uni-app 官网即可

## 视频演示

<iframe src="//player.bilibili.com/player.html?aid=326378691&bvid=BV14w411773C&cid=1409199088&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
