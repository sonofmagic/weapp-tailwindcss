# `weapp-vite` 发布：重塑小程序开发体验！

大家好，我是 [`weapp-tailwindcss`](https://github.com/sonofmagic/weapp-tailwindcss) 的作者 [`ice breaker`](https://github.com/sonofmagic)

今天我发布了 `weapp-vite` 项目，作为自己对 `vite` 理解的一个阶段性总结。

## 什么是 `weapp-vite`?

`weapp-vite` 是对 `vite` 的封装，专为小程序开发设计。

它保留了 `vite` 的强大配置和插件系统，同时针对小程序的开发流程进行了优化，支持 `ts`、`postcss`、`sass`、`less` 等现代前端技术栈，让小程序开发更加高效、便捷。

## 诞生背景

### 开始吐槽

首先我要小小的吐槽一下：

嗯，是的，原生的小程序开发方式，令人十分不愉快！

然后跨端框架诸如 `uni-app` / `tarojs` 使用的是兼容 `vue` / `react` 等等 `web` 框架的写法，

再编译回小程序或者到多端，我觉得太重了，而且虽然开源，但我没仔细研究源代码，那对我来说就是黑盒（核心原因是我懒）。

`mpxjs` 思路很好，但是我就是想用最原生的写法，加上一些现代工具链的东西，加上自己定义的一套语法糖而已

并不想上什么框架，学习什么类似 `vue` 又不像 `vue` 新语法。

我就想要看着微信官方文档，简简单单的写一个小程序而已！

### 越来越大的差异化

现在原生小程序也越来越强，各个平台之间的差异，也越来越大了。

微信小程序又是搞 `skyline` 又是搞 `Donut` 的，虽然现在 `Bug` 很多，官方群里也不活跃，问问题也没啥人回答，

但是，起码人家是有实实在在的技术投入的好伐！其他大厂都在忙着裁员降本增效嘛？

这让我感觉微信小程序未来可期，所以我想就使用一些原生小程序的写法，跟着官方走。

然后利用编译插件，扩展功能，然后由微信的语法，转到其他的小程序平台这种随缘。

反正整体的思路，便是所见即所得，最轻量级的构建，同时也能够带有 `vite` 的插件系统。

### 好处

可以利用 `vite` 的生态的同时，方便后续编写插件进行增强，

也对里面的语法进行高度自定义，比如把微信的语法转换成支付宝的语法，这种类似的操作

于是 `weapp-vite` 诞生了

## 快速开始

### 创建与初始化

1. 在微信开发者工具中创建一个新的 `js`/`ts` 项目。

![](../images/create-project.png)

2. 确保项目根目录下有 `package.json`，若无则运行 `npm init -y`

> 假如你创建的是一个 `ts` 项目，你需要在 `vite.config.ts` 里的 `weapp.srcRoot` 配置项，指明使用的是 `'./miniprogram'` 目录，详见本页下方

3. 安装 weapp-vite 并执行初始化命令

```sh
npm i -D weapp-vite
# 执行初始化命令
npx weapp-vite init
```

于是就初始化成功了！然后再执行一下安装包的命令，去安装智能提示的类型定义

```sh
npm i
```

这样微信开发小程序的智能提示(`types`)，就也被安装进来

## 语言默认支持

你可以直接使用 `typescript`，把 `js` 改成 `ts` 后缀即可，也可以通过安装 `sass` / `less`，并把 `index.wxss` 的后缀名改成相应的后缀来支持样式预处理器，比如 `scss` / `less` 。

## 开发与构建

- 开发模式：使用 `npm run dev` 启动开发服务器，实时监听文件变化并自动编译。
- 构建模式：通过 `npm run build` 进行生产环境的构建，包括代码压缩等优化。
- 构建 npm：`npm run build-npm` 用于微信开发者工具中的 npm 构建，输出至 `dist/miniprogram_npm`。
- 打开微信开发者工具：`npm run open` 直接启动微信开发者工具，便捷调试。

## 配置项

配置项可以与 `vite` 通用，同时加入了 `weapp-vite` 的扩展:

`vite.config.ts`:

```ts
import { defineConfig } from 'weapp-vite/config'

export default defineConfig({
  // 其他的配置同
  weapp: {
    // 用来配置监听 app.json 所在的目录
    // 比如默认情况下 ts 创建的项目，app.json 所在为 './miniprogram'
    srcRoot: './miniprogram',
    // weapp-vite options
  },
})
```

你可以在 `defineConfig` 使用其他的 `vite` 插件，比如 `weapp-tailwindcss`

## 关于 `weapp-vite` 的承诺与展望

在过去的三年里，`weapp-tailwindcss` 不仅见证了小程序开发社区的蓬勃发展，也陪伴了无数开发者从初识到精通的旅程。这份历程教会了我耐心、细致与不懈追求。现在，我将这份恒心带入 `weapp-vite`，致力于打造一个更加高效、灵活且易于使用的小程序开发解决方案。

## 期待大家的加入

`weapp-vite` 刚刚起步，虽已初具雏形，但仍有许多待完善之处。我诚挚邀请各位开发者加入我们的行列，共同推动项目的成长：

- 报告错误：如果您遇到任何错误或问题，请提`issue`并提供完善的错误信息和复现方式。
- 建议：有增强 `weapp-vite` 的想法吗？请提 `issue` 来分享您的建议。
- 文档：如果您对文档有更好的见解或者更棒的修辞方式，欢迎 `pr`。
- 代码：任何人的代码都不是完美的，我们欢迎你通过 `pr` 给代码提供更好的质量与活力。

## 未来展望

展望未来，`weapp-vite` 将不断进化以适应小程序开发的最新趋势。我们将持续关注各平台小程序的更新迭代，确保 `weapp-vite` 能够无缝兼容并充分利用这些新特性。同时，我们也期待与广大开发者建立更加紧密的联系，听取大家的意见与建议，共同推动 `weapp-vite` 的发展与完善。

## 尾言

感谢每一位对 `weapp-tailwindcss` 及 `weapp-vite` 给予关注与支持的朋友。让我们携手并进，在小程序开发的道路上不断前行，共创辉煌！

[Github 项目地址](https://github.com/sonofmagic/weapp-tailwindcss/tree/main/packages/weapp-vite)
