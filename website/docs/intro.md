---
title: 简介
description: weapp-tailwindcss 使用 Tailwind CSS 4 为 Web、小程序、App WebView、React Native 与 Lynx 生成目标端产物。
keywords:
  - 简介
  - intro
  - weapp-tailwindcss
  - tailwindcss
  - 小程序
  - 微信小程序
  - uni-app
  - taro
  - mpx
---
# 简介

## 总览

`weapp-tailwindcss` 是 Tailwind CSS 4 的跨端编译与构建集成层。它根据目标端生成 Web CSS、小程序兼容 CSS、App WebView 样式，并为 React Native 与 Lynx 集成提供共享的候选类和 token 基础。

核心包支持 Vite、Webpack、Rspack、Gulp 和 Node.js。小程序构建还会同步转换模板与脚本中的已生成类名；React Native 和 Lynx 由对应平台包接入。

:::info
核心生成器先通过 Tailwind CSS 4 编译候选类，再按目标端处理选择器、CSS 能力和类名映射。JS/WXML 转换只处理生成器确认过的候选集合。
:::

## 环境要求

- 当前版本要求 Node.js `^22.18.0 || >=24.11.0`。
- 使用 HBuilderX 的 `uni-app` / `uni-app x` 项目要求 HBuilderX `>=5.11`。

## Why `weapp-tailwindcss`?

- ✅ 自动处理所有文件：以微信小程序为例，不但可以处理和转义 `wxml` / `wxss`，还能处理 `js` 和 `wxs` 产物
- ✅ 支持最原生的小程序开发，也支持许多框架如 `taro`、`uni-app`、`mpx` 等等..
- ✅ 提供多种使用方式，方便项目集成：包括 `webpack` / `vite` / `gulp` 插件和直接的 `nodejs api`
- ✅ 生态好，解决方案丰富，提供大量现成模板，可以利用许多 `tailwindcss` 现有的生态来构建小程序。
- ✅ 高效的解析和缓存机制，热更新响应时间快
- ✅ 贴合 `tailwindcss` 的设计思路，智能提示友好

## 快速开始 :rocket:

### 👉 [安装依赖](/docs/quick-start/install)

当前文档默认使用 `tailwindcss@4` 与 `weapp-tailwindcss` 当前版本。

### 👉 [各框架模板](/docs/community/templates)

如果你想直接对照可运行项目，可以优先查看模板项目。

### 👉 [Tailwind CSS 4 默认模式参考](/docs/tailwindcss/v4-reference)

这里有 CSS-first、`@source`、`@apply`、`@layer` 和 IntelliSense 的补充说明。
