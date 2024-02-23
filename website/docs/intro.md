# 简介

<!-- :::tip
自从 `2.3.3` 版本开始，我发布了一个额外的包叫 [`weapp-tailwindcss`](https://www.npmjs.com/package/weapp-tailwindcss),它和 [`weapp-tailwindcss-webpack-plugin`](https://www.npmjs.com/package/weapp-tailwindcss-webpack-plugin) 代码版本完全一致，且保持发布版本的同步。以后可以都去安装那个包(当然安装现在这个包也行)。为什么要这么做的原因，主要是因为 `weapp-tailwindcss-webpack-plugin` 这个名字，已经不适合现在这种，多插件并存的状态了，为了以后的发展改个名字。
::: -->

在小程序开发中，由于小程序本身有自己的一套 **独特的** 技术规范标准。这导致你无法使用`web`中很多的特性，你也无法 **直接** 使用像 `tailwindcss` 这种库。

而 `weapp-tailwindcss`, 就能让你，在小程序开发中使用 `tailwindcss` **大部分** 特性。

它支持目前上所有使用 `webpack` 和 `vite` 的主流多端小程序框架和使用 `webpack` / `gulp`的原生小程序打包方式。

你可以很容易在各个框架，或原生开发中集成 `tailwindcss`。

现在，就让我们开始使用吧！

> 本质上它是一个转义器。它负责把 `tailwindcss` 中，所采集的类名，以及生成的结果，转化成小程序中可以接受的方式。

## Why `weapp-tailwindcss`?

- 不但可以处理和转义 `wxml`/`wxss` , 还能处理 `js` 和 `wxs` 产物 (以微信小程序为例)
- 提供多种使用方式，方便项目集成，包括 `webpack`/`vite`/`gulp` 和 `nodejs api`
- 生态以及解决方案丰富，提供大量现成模板，可以利用许多 `tailwindcss` 现有的生态来构建小程序。
- 高效的解析和缓存机制，项目即使很大，热更新响应时间也是毫秒级
- 贴合 `tailwindcss` 的设计思路，智能提示友好

## 演示视频

<iframe src="//player.bilibili.com/player.html?aid=835925684&bvid=BV1fg4y1D7xx&cid=1398844948&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>

## 另外特别感谢 [舜岳同学](https://space.bilibili.com/475498258) 为 `weapp-tailwindcss` 制作的视频

<iframe src="//player.bilibili.com/player.html?aid=1850100366&bvid=BV1kp421Z7HL&cid=1428939742&p=1&autoplay=0" scrolling="no" border="0" frameborder="no" framespacing="0" allowfullscreen="true"> </iframe>
