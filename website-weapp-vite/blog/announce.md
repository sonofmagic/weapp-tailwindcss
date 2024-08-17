# 改善小程序开发体验的 `weapp-vite` 发布了！

大家好，我是 [`weapp-tailwindcss`](https://github.com/sonofmagic/weapp-tailwindcss) 的作者 [`ice breaker`](https://github.com/sonofmagic)

今天我发布了 `weapp-vite` 项目，作为自己对 `vite` 理解的一个阶段性总结。

## 什么是 `weapp-vite`?

`weapp-vite` 是一个 `vite` 的小程序版本的封装，你可以利用它，开箱即用的进行小程序开发。

它支持绝大部分 `vite` 的配置和插件系统，同时对小程序架构做了一些特殊的优化

有了它，能立马支持 `ts` / `postcss` / `sass` / `less` / `tailwindcss` 还能使用众多 `vite` 插件

## 诞生背景

### 开始吐槽

首先我要狠狠的吐槽一下：

嗯，是的，原生的小程序开发方式，令人十分不愉快！

然后跨端框架诸如 `uni-app` / `tarojs` 使用的是兼容 `vue` / `react` 等等 `web` 框架的写法，

再编译回小程序或者到多端，我觉得太重了，而且虽然开源，但我没仔细研究源代码，那对我来说就是黑盒（核心原因是我懒）。

`mpxjs` 思路很好，但是我就是想用最原生的写法，加上一些现代工具链的东西，加上自己定义的一套语法糖而已

并不想上什么框架，学习什么类似 `vue` 又不像 `vue` 新语法。

我就想要看着微信官方文档，简简单单的写一个小程序而已！！！

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

### 使用方式

打开微信开发者工具, 创建一个 `js`/`ts` 项目

![](../images/create-project.png)

> 假如你这个项目没有 `package.json`，在你的小程序目录下，使用 `npm init -y` 创建一个 `package.json`
> 假如你创建的是一个 `ts` 项目，你需要在 `vite.config.ts` 里的 `weapp.srcRoot` 配置项，指明使用的是 `'./miniprogram'` 目录，详见本页下方

然后执行：

```sh
npm i -D weapp-vite
# 执行初始化命令
npx weapp-vite init
```

于是就初始化成功了！然后再执行一下安装包的命令

```sh
npm i
```

这样微信开发小程序的智能提示(`types`)，就也被安装进来

## typescript / sass / less 等的默认支持

你可以直接使用 `typescript`，把 `js` 改成 `ts` 后缀即可，也可以通过安装 `sass` / `less`，并把 `index.wxss` 的后缀名改成相应的后缀来支持样式预处理器，比如 `scss` / `less` 。

### 开发命令

```sh
npm run dev
```

此时会启动 **1到多个** `fs.watcher` 对项目进行监听，发生更改就重新打包编译，并输出到 `dist` 目录

### 构建命令

```sh
npm run build
```

此时会启用 `vite` 自带的 `build` 模式，删除整个 `dist` 目录重新生成，并进行代码压缩

### 构建 npm 命令

```sh
npm run build-npm
```

使用这个指令，可以触发微信开发者工具的 构建 npm 命令，构建结果在 `dist/miniprogram_npm` 下

### 打开微信开发者工具命令

```sh
npm run open
```

使用这个命令直接打开微信开发者工具

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

## 尾言

目前这个项目还刚刚出生，还存在很多不足，不过我是打算以我维护 `weapp-tailwindcss` 的恒心，来长期维护这个项目的（目前 `weapp-tailwindcss` 已经维护了将近 `3` 年！）

笔者在此邀请感兴趣的朋友们，来贡献和帮助改进 `weapp-vite` 💚💚💚

以下有几个方式可以参与:

- 报告错误：如果您遇到任何错误或问题，请提`issue`并提供完善的错误信息和复现方式。
- 建议：有增强 `weapp-vite` 的想法吗？请提 `issue` 来分享您的建议。
- 文档：如果您对文档有更好的见解或者更棒的修辞方式，欢迎 `pr`。
- 代码：任何人的代码都不是完美的，我们欢迎你通过 `pr` 给代码提供更好的质量与活力。

[Github 项目地址](https://github.com/sonofmagic/weapp-tailwindcss/tree/main/packages/weapp-vite)
